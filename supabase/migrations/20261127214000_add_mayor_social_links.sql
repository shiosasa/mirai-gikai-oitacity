-- 市長プロフィールの個人公式HP・ブログURL・SNSリンクを追加
alter table public.mayor_profile
  add column if not exists homepage text,
  add column if not exists blog_url text,
  add column if not exists sns_links jsonb;
