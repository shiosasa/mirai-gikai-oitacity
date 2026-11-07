begin;

lock table public.bill_articles, public.bills, public.meeting_sessions,
  public.committee_meetings, public.politician_speech_highlights,
  public.press_conferences, public.site_information, public.general_questions,
  public.meetings, public.interview_report in share row exclusive mode;

create table public.content_publications (
  content_type text not null check (content_type in (
    'bill_articles', 'bills', 'meeting_sessions', 'committee_meetings',
    'politician_speech_highlights', 'press_conferences', 'site_information',
    'general_questions', 'meetings', 'interview_report'
  )),
  content_id text not null,
  first_published_at timestamptz,
  is_public boolean not null,
  historical_date_unknown boolean not null default false,
  primary key (content_type, content_id),
  check (not historical_date_unknown or first_published_at is null)
);

alter table public.content_publications enable row level security;
grant select, insert, update on public.content_publications to service_role;

create index content_publications_recent
  on public.content_publications (first_published_at)
  where is_public and first_published_at is not null;

create function public.is_content_public(content_type text, content jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(case content_type
    when 'bill_articles' then content->>'publish_status' = 'published'
    when 'bills' then content->>'publish_status' = 'published'
    when 'committee_meetings' then content->>'publish_status' = 'published'
    when 'general_questions' then content->>'publish_status' = 'published'
    when 'press_conferences' then content->>'status' = 'published'
    when 'politician_speech_highlights' then (content->>'is_published')::boolean
    when 'site_information' then (content->>'is_published')::boolean
    when 'interview_report' then
      (content->>'is_public_by_admin')::boolean and
      (content->>'is_public_by_user')::boolean
    when 'meeting_sessions' then
      nullif(btrim(content->>'content'), '') is not null or
      nullif(btrim(content->>'summary'), '') is not null or
      nullif(btrim(content->>'detailed_summary'), '') is not null
    when 'meetings' then
      nullif(btrim(content->>'mayor_proposal_summary'), '') is not null or
      nullif(btrim(content->>'mayor_proposal_text'), '') is not null
    else false
  end, false);
$$;

-- Only the existing topic timestamp records an initial publication, rather than
-- a meeting date, submission date, last edit, or a date chosen for display.
do $$
declare
  source_table text;
begin
  foreach source_table in array array[
    'bill_articles', 'bills', 'meeting_sessions', 'committee_meetings',
    'politician_speech_highlights', 'press_conferences', 'site_information',
    'general_questions', 'meetings', 'interview_report'
  ] loop
    execute format($seed$
      insert into public.content_publications (
        content_type, content_id, first_published_at, is_public,
        historical_date_unknown
      )
      select %L, source.id::text, dates.first_published_at,
        public.is_content_public(%L, to_jsonb(source)),
        dates.first_published_at is null
      from public.%I source
      cross join lateral (
        select case
          when %L = 'bill_articles'
            then (to_jsonb(source)->>'first_published_at')::timestamptz
          when %L = 'site_information'
            and public.is_content_public(%L, to_jsonb(source))
            and (to_jsonb(source)->>'published_at')::timestamptz > now()
            then (to_jsonb(source)->>'published_at')::timestamptz
          else null
        end as first_published_at
      ) dates
    $seed$, source_table, source_table, source_table,
      source_table, source_table, source_table);
  end loop;
end;
$$;

create function public.record_content_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  content jsonb;
  visible boolean;
  publication_time timestamptz;
begin
  if tg_op = 'DELETE' then
    update public.content_publications
      set is_public = false,
        first_published_at = case
          when first_published_at > now() then null
          else first_published_at
        end
      where content_type = tg_table_name and content_id = old.id::text;
    return old;
  end if;

  content := to_jsonb(new);
  visible := public.is_content_public(tg_table_name, content);
  if visible then
    publication_time := case
      when tg_table_name = 'site_information'
        then greatest(now(), (content->>'published_at')::timestamptz)
      else now()
    end;
  end if;

  insert into public.content_publications as history (
    content_type, content_id, first_published_at, is_public
  ) values (tg_table_name, new.id::text, publication_time, visible)
  on conflict (content_type, content_id) do update set
    is_public = excluded.is_public,
    first_published_at = case
      when history.historical_date_unknown then null
      -- A future scheduled announcement has not yet been published.
      when history.first_published_at is null
        or history.first_published_at > now()
        then excluded.first_published_at
      else history.first_published_at
    end;
  return new;
end;
$$;

do $$
declare
  source_table text;
begin
  foreach source_table in array array[
    'bill_articles', 'bills', 'meeting_sessions', 'committee_meetings',
    'politician_speech_highlights', 'press_conferences', 'site_information',
    'general_questions', 'meetings', 'interview_report'
  ] loop
    execute format(
      'create trigger record_content_publication
       after insert or update or delete on public.%I
       for each row execute function public.record_content_publication()',
      source_table
    );
  end loop;
end;
$$;

commit;
