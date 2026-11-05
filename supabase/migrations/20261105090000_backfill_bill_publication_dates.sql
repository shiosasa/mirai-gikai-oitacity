insert into public.content_publications as history (
  content_type,
  content_id,
  first_published_at,
  is_public,
  historical_date_unknown
)
select
  'bills',
  bill.id::text,
  bill.published_at,
  true,
  false
from public.bills as bill
where bill.source = 'meeting'
  and bill.publish_status = 'published'
  and bill.published_at is not null
on conflict (content_type, content_id) do update set
  first_published_at = excluded.first_published_at,
  is_public = true,
  historical_date_unknown = false
where history.first_published_at is null
  and history.historical_date_unknown;
