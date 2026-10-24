begin;

alter table public.bill_articles
  add column publish_status text not null default 'published'
    check (publish_status in ('draft', 'published')),
  add column first_published_at timestamptz;

update public.bill_articles a
set first_published_at = coalesce(
  p.published_date::timestamp at time zone 'Asia/Tokyo',
  a.created_at
)
from public.proposals p
where p.id = a.bill_id;

alter table public.bill_articles
  alter column publish_status set default 'draft';
alter table public.bill_articles enable row level security;

create function public.record_topic_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.publish_status = 'published' and new.first_published_at is null then
    new.first_published_at := now();
    update public.proposals
    set published_date = (new.first_published_at at time zone 'Asia/Tokyo')::date
    where id = new.bill_id;
    if not found then
      raise exception 'Topic proposal does not exist';
    end if;
  end if;
  return new;
end;
$$;

create trigger record_topic_publication
before insert or update of publish_status on public.bill_articles
for each row execute function public.record_topic_publication();

commit;
