-- Keep person IDs and their speech relationships when an office holder changes.
alter table public.politicians add column is_current boolean not null default false;
update public.politicians set is_current = true where name <> '欠番';
create unique index politicians_current_number_key on public.politicians(number)
  where is_current;
create unique index mayor_profile_one_current_key on public.mayor_profile(is_current)
  where is_current;

create table public.office_terms (
  id bigint generated always as identity primary key,
  role text not null check (role in ('mayor', 'councillor')),
  politician_id uuid references public.politicians(id),
  mayor_id bigint references public.mayor_profile(id),
  started_on date,
  ended_on date,
  term_number integer check (term_number > 0),
  seat_number integer check (seat_number > 0),
  faction text,
  standing_committee text,
  special_committee text,
  source_url text,
  ended_source_url text,
  created_at timestamptz not null default now(),
  check ((role = 'mayor' and mayor_id is not null and politician_id is null)
    or (role = 'councillor' and politician_id is not null and mayor_id is null)),
  check (ended_on is null or started_on is null or ended_on >= started_on)
);
alter table public.office_terms enable row level security;
create unique index office_terms_current_mayor on public.office_terms(role)
  where role = 'mayor' and ended_on is null;
create unique index office_terms_current_councillor on public.office_terms(politician_id)
  where role = 'councillor' and ended_on is null;
create index office_terms_mayor_id on public.office_terms(mayor_id);
create index office_terms_politician_id on public.office_terms(politician_id);

insert into public.office_terms
  (role, politician_id, seat_number, faction, standing_committee, special_committee)
select 'councillor', id, number, faction, standing_committee, special_committee
from public.politicians where is_current;

insert into public.office_terms
  (role, mayor_id, started_on, ended_on, term_number)
select 'mayor', id, start_date, case when is_current then null else end_date end, term_number
from public.mayor_profile where is_current or end_date is not null;

create function public.sync_current_councillor_term() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  update public.office_terms set seat_number = new.number, faction = new.faction,
    standing_committee = new.standing_committee, special_committee = new.special_committee
  where politician_id = new.id and ended_on is null;
  return new;
end;
$$;
create trigger politicians_sync_current_term
after update of number, faction, standing_committee, special_committee on public.politicians
for each row when (new.is_current)
execute function public.sync_current_councillor_term();
revoke all on function public.sync_current_councillor_term() from public, anon, authenticated;

create function public.change_office_term(
  p_role text,
  p_person_id text,
  p_action text,
  p_expected_term bigint,
  p_started_on date,
  p_ended_on date,
  p_successor_id text,
  p_seat_number integer,
  p_term_number integer,
  p_source_url text
) returns bigint
language plpgsql
set search_path = public, pg_temp
as $$
declare
  active public.office_terms;
  new_term bigint;
  target_id text;
  target_name text;
  target_current boolean;
  snapshot record;
begin
  if p_role not in ('mayor', 'councillor') or
     p_action not in ('begin', 'retire', 'renew', 'replace', 'confirm-start') then
    raise exception 'Unsupported office operation';
  end if;
  -- Serialize switches and seat assignments, including first appointments.
  perform pg_advisory_xact_lock(611060900);
  if p_source_url is null or p_source_url !~ '^https?://' or length(p_source_url) > 2000 then
    raise exception 'Official source URL required';
  end if;
  if p_role = 'mayor' then
    select name, coalesce(is_current, false) into target_name, target_current
    from public.mayor_profile where id = p_person_id::bigint for update;
  else
    select name, is_current into target_name, target_current
    from public.politicians where id = p_person_id::uuid for update;
  end if;
  if not found or target_name is null or target_name = '欠番' then
    raise exception 'Person not found';
  end if;
  select * into active from public.office_terms
  where role = p_role and ended_on is null and
    (case when p_role = 'mayor' then mayor_id::text else politician_id::text end) = p_person_id
  for update;
  if active.id is distinct from p_expected_term or
     target_current is distinct from (active.id is not null) then
    raise exception 'Office state changed; reload before saving';
  end if;
  if p_action = 'begin' and active.id is not null then
    raise exception 'Person already holds office';
  elsif p_action <> 'begin' and active.id is null then
    raise exception 'No current term to close';
  end if;
  if p_action = 'confirm-start' then
    if active.started_on is not null or p_started_on is null or
      p_started_on > (now() at time zone 'Asia/Tokyo')::date then
      raise exception 'Only an unconfirmed appointment date can be confirmed';
    end if;
    if exists(select 1 from public.office_terms t where t.id <> active.id
      and (case when p_role = 'mayor' then t.role = 'mayor'
        else t.politician_id::text = p_person_id end)
      and (t.ended_on is null or t.ended_on >= p_started_on)) then
      raise exception 'Appointment overlaps a recorded term';
    end if;
    update public.office_terms set started_on = p_started_on, source_url = p_source_url
    where id = active.id;
    if p_role = 'mayor' then
      update public.mayor_profile set start_date = p_started_on where id = p_person_id::bigint;
    end if;
    return active.id;
  end if;
  if p_action <> 'begin' then
    if p_ended_on is null or p_ended_on > (now() at time zone 'Asia/Tokyo')::date
      or (active.started_on is not null and p_ended_on < active.started_on) then
      raise exception 'Invalid retirement date';
    end if;
    if p_role = 'councillor' then
      select * into snapshot from public.politicians where id = p_person_id::uuid;
      update public.office_terms set ended_on = p_ended_on, ended_source_url = p_source_url,
        seat_number = snapshot.number, faction = snapshot.faction,
        standing_committee = snapshot.standing_committee,
        special_committee = snapshot.special_committee
      where id = active.id;
      update public.politicians set is_current = false where id = p_person_id::uuid;
    else
      update public.office_terms set ended_on = p_ended_on, ended_source_url = p_source_url where id = active.id;
      update public.mayor_profile set is_current = false, end_date = p_ended_on
      where id = p_person_id::bigint;
    end if;
  end if;
  if p_action = 'retire' then
    return active.id;
  end if;
  if p_started_on is null or p_started_on > (now() at time zone 'Asia/Tokyo')::date
    or (p_action <> 'begin' and p_started_on <= p_ended_on)
    or p_term_number is null or p_term_number < 1 then
    raise exception 'Invalid appointment date or term number';
  end if;
  target_id := case when p_action = 'replace' then p_successor_id else p_person_id end;
  if target_id is null or (p_action = 'replace' and target_id = p_person_id) then
    raise exception 'Select a different successor';
  end if;
  if p_role = 'mayor' then
    select name, coalesce(is_current, false) into target_name, target_current
    from public.mayor_profile where id = target_id::bigint for update;
  else
    select name, is_current into target_name, target_current
    from public.politicians where id = target_id::uuid for update;
  end if;
  if not found or target_name is null or target_name = '欠番' or target_current then
    raise exception 'Successor not found or already current';
  end if;
  if exists (
    select 1 from public.office_terms t where
      (case when p_role = 'mayor' then t.role = 'mayor'
       else t.politician_id::text = target_id end)
      and (t.ended_on is null or t.ended_on >= p_started_on)
  ) then
    raise exception 'Appointment overlaps a recorded term';
  end if;
  if exists(select 1 from public.office_terms t where t.role = p_role
    and (case when p_role = 'mayor' then t.mayor_id::text else t.politician_id::text end) = target_id
    and t.term_number >= p_term_number) then
    raise exception 'Term number must be greater than previous recorded terms';
  end if;
  if p_role = 'mayor' then
    insert into public.office_terms(role, mayor_id, started_on, term_number, source_url)
    values ('mayor', target_id::bigint, p_started_on, p_term_number, p_source_url)
    returning id into new_term;
    update public.mayor_profile set is_current = true, start_date = p_started_on,
      end_date = null, term_number = p_term_number where id = target_id::bigint;
  else
    if p_seat_number is null or p_seat_number < 1 then
      raise exception 'Seat number required';
    end if;
    if exists(select 1 from public.office_terms t where t.role = 'councillor'
      and t.seat_number = p_seat_number and
      (t.ended_on is null or t.ended_on >= p_started_on)) then
      raise exception 'Seat overlaps a recorded term';
    end if;
    select * into snapshot from public.politicians where id = target_id::uuid;
    insert into public.office_terms(role, politician_id, started_on, term_number,
      seat_number, faction, standing_committee, special_committee, source_url)
    values ('councillor', target_id::uuid, p_started_on, p_term_number,
      p_seat_number, snapshot.faction, snapshot.standing_committee,
      snapshot.special_committee, p_source_url)
    returning id into new_term;
    update public.politicians set is_current = true, number = p_seat_number
    where id = target_id::uuid;
  end if;
  return new_term;
end;
$$;
revoke all on function public.change_office_term(text,text,text,bigint,date,date,text,integer,integer,text)
  from public, anon, authenticated;
grant execute on function public.change_office_term(text,text,text,bigint,date,date,text,integer,integer,text)
  to service_role;
