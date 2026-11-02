-- AIインタビューのレポートを、トピックス記事の「みんなの生の声」として掲載するための採用フラグ。
-- NULL = 未採用、値あり = 管理者が採用した日時（記事上の並び順にも使う）。
-- 掲載条件は「採用済み AND is_public_by_user AND is_public_by_admin」。

begin;

alter table public.interview_report
  add column if not exists topic_voice_featured_at timestamptz;

comment on column public.interview_report.topic_voice_featured_at is
  'トピックス記事の「みんなの生の声」に採用した日時。NULLは未採用。本人の公開同意(is_public_by_user)と管理者公開(is_public_by_admin)が両方trueの場合のみ掲載する';

create index if not exists idx_interview_report_topic_voice_featured_at
  on public.interview_report(topic_voice_featured_at)
  where topic_voice_featured_at is not null;

commit;
