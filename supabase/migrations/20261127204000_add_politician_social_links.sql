-- 議員のブログURLおよびSNSリンク（JSONB）を追加
alter table public.politicians
  add column if not exists blog_url text,
  add column if not exists sns_links jsonb;
