-- Add source_refs column to bill_articles table
-- source_refs: トピックス記事の裏付けとなる会議・議案への参照
-- [{ session_id, meeting_id, meeting_type, meeting_title, session_label, date,
--    bill_number, bill_name, evidence_quote }]
alter table public.bill_articles
add column if not exists source_refs jsonb;

comment on column public.bill_articles.source_refs is 'トピックス記事の裏付けとなる会議・議案への参照（session_id/meeting_id/meeting_type/meeting_title/session_label/date/bill_number/bill_name/evidence_quote）';
