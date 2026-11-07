-- Run only against an isolated test database after applying the migration.
begin;
do $$
declare
  first_mayor bigint;
  next_mayor bigint;
  term_id bigint;
  next_term bigint;
  old_councillor uuid;
  new_councillor uuid;
  other_councillor uuid;
begin
  -- Test fixtures are deliberately not real people.
  insert into public.mayor_profile(name,is_current) values ('Test former mayor',false) returning id into first_mayor;
  insert into public.mayor_profile(name,is_current) values ('Test next mayor',false) returning id into next_mayor;
  -- Refuse execution against any database with a real current mayor.
  if exists(select 1 from public.mayor_profile where is_current) then
    raise exception 'Isolated test database required';
  end if;
  term_id := public.change_office_term('mayor',first_mayor::text,'begin',null,'2020-01-01',null,null,null,1,'https://example.com/official');
  begin
    perform public.change_office_term('mayor',next_mayor::text,'begin',null,'2020-01-01',null,null,null,1,'https://example.com/official');
    raise exception 'Expected overlapping appointment failure';
  exception when raise_exception then
    if sqlerrm = 'Expected overlapping appointment failure' then raise; end if;
  end;
  begin
    perform public.change_office_term('mayor',first_mayor::text,'replace',term_id,'2021-01-01','2021-01-01',next_mayor::text,null,1,'https://example.com/official');
    raise exception 'Expected same-day failure';
  exception when raise_exception then
    if sqlerrm = 'Expected same-day failure' then raise; end if;
  end;
  if not exists(select 1 from public.mayor_profile where id=first_mayor and is_current)
    or exists(select 1 from public.office_terms where id=term_id and ended_on is not null) then
    raise exception 'Failed replacement was not atomic';
  end if;
  next_term := public.change_office_term('mayor',first_mayor::text,'replace',term_id,'2021-01-02','2021-01-01',next_mayor::text,null,1,'https://example.com/official');
  if exists(select 1 from public.mayor_profile where id=first_mayor and is_current) then
    raise exception 'Former mayor remains current';
  end if;
  begin
    perform public.change_office_term('mayor',next_mayor::text,'retire',term_id,null,'2022-01-01',null,null,null,'https://example.com/official');
    raise exception 'Expected stale form failure';
  exception when raise_exception then
    if sqlerrm = 'Expected stale form failure' then raise; end if;
  end;
  next_term := public.change_office_term('mayor',next_mayor::text,'renew',next_term,'2022-01-02','2022-01-01',null,null,2,'https://example.com/official');
  perform public.change_office_term('mayor',next_mayor::text,'retire',next_term,null,'2023-01-01',null,null,null,'https://example.com/official');
  perform public.change_office_term('mayor',first_mayor::text,'begin',null,'2023-01-02',null,null,null,2,'https://example.com/official');
  if (select count(*) from public.office_terms where mayor_id=first_mayor) <> 2 then
    raise exception 'Returning mayor lost historical term';
  end if;

  insert into public.politicians(name,number,is_current) values ('Test former councillor',8001,false) returning id into old_councillor;
  insert into public.politicians(name,number,is_current) values ('Test next councillor',8001,false) returning id into new_councillor;
  insert into public.politicians(name,number,is_current) values ('Test other councillor',8002,false) returning id into other_councillor;
  term_id := public.change_office_term('councillor',old_councillor::text,'begin',null,'2020-01-01',null,null,8001,1,'https://example.com/official');
  perform public.change_office_term('councillor',other_councillor::text,'begin',null,'2020-01-01',null,null,8002,1,'https://example.com/official');
  begin
    perform public.change_office_term('councillor',old_councillor::text,'replace',term_id,'2021-01-02','2021-01-01',new_councillor::text,8002,1,'https://example.com/official');
    raise exception 'Expected occupied seat failure';
  exception when unique_violation or raise_exception then
    if sqlerrm = 'Expected occupied seat failure' then raise; end if;
  end;
  if not exists(select 1 from public.office_terms where id=term_id and ended_on is null) then
    raise exception 'Occupied seat failure retired outgoing councillor';
  end if;
  perform public.change_office_term('councillor',old_councillor::text,'replace',term_id,'2021-01-02','2021-01-01',new_councillor::text,8001,1,'https://example.com/official');
  if not exists(select 1 from public.politicians where id=old_councillor and not is_current)
    or not exists(select 1 from public.politicians where id=new_councillor and is_current) then
    raise exception 'Seat succession failed';
  end if;
  if not exists(select 1 from public.office_terms where politician_id=old_councillor and ended_on='2021-01-01') then
    raise exception 'Former councillor history missing';
  end if;
  update public.politicians set faction='Updated test faction' where id=new_councillor;
  if not exists(select 1 from public.office_terms where politician_id=new_councillor
    and ended_on is null and faction='Updated test faction') then
    raise exception 'Current profile metadata was not synchronized';
  end if;
  if exists(select 1 from public.office_terms where politician_id=old_councillor
    and faction='Updated test faction') then
    raise exception 'Former term was overwritten';
  end if;
  begin
    perform public.change_office_term('councillor',old_councillor::text,'begin',null,(current_date+10),null,null,8003,2,'https://example.com/official');
    raise exception 'Expected future-date failure';
  exception when raise_exception then
    if sqlerrm = 'Expected future-date failure' then raise; end if;
  end;
end;
$$;
rollback;
