-- bills に「由来」を持たせ、議案（議事録 meetings 由来）とトピックス（proposals 由来）の
-- AIインタビュー受け皿を区別する。
-- AIインタビュー関連テーブルはすべて bills.id を参照するため、テーブル自体は分けずに
-- source カラム＋ビューで住み分ける（docs/20261021_1800_全体共通ルールmaster-workflow.md）。

begin;

alter table public.bills
  add column if not exists source text not null default 'meeting'
    check (source in ('meeting', 'topic'));

comment on column public.bills.source is
  '由来。meeting=議事録(meetings)から作成した議案（/committees/bill-pickups に表示）、topic=トピックス(proposals)のAIインタビュー受け皿（議案一覧には出さない）';

-- proposals のタイトルと同名の bills はトピックス由来
update public.bills b
set source = 'topic'
where exists (
  select 1 from public.proposals p where p.title = b.name
);

-- トピックス記事 → AIインタビュー受け皿（bills）の明示的な紐付け。
-- これまではタイトル一致で推測していたため、タイトル変更でリンクが切れていた。
alter table public.bill_articles
  add column if not exists interview_bill_id uuid references public.bills(id) on delete set null;

comment on column public.bill_articles.interview_bill_id is
  'このトピックのAIインタビュー受け皿となる bills.id（source = topic の行）';

create index if not exists idx_bill_articles_interview_bill_id
  on public.bill_articles(interview_bill_id);

update public.bill_articles a
set interview_bill_id = b.id
from public.bills b
where b.source = 'topic'
  and b.name = a.title
  and a.interview_bill_id is null;

-- DB上でも別テーブルのように見分けられるビュー
create or replace view public.meeting_bills
with (security_invoker = true) as
select * from public.bills where source = 'meeting';

comment on view public.meeting_bills is
  '議案（議事録 meetings 由来）。/committees/bill-pickups の議案カード・議案詳細の元データ';

create or replace view public.topic_interview_bills
with (security_invoker = true) as
select * from public.bills where source = 'topic';

comment on view public.topic_interview_bills is
  'トピックス（proposals / bill_articles）のAIインタビュー受け皿。議案ではない';

revoke all on public.meeting_bills from anon, authenticated;
revoke all on public.topic_interview_bills from anon, authenticated;

commit;
