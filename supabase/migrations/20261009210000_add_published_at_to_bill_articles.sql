ALTER TABLE public.bill_articles
ADD COLUMN IF NOT EXISTS published_at DATE;

UPDATE public.bill_articles AS article
SET published_at = TO_DATE(proposal.published_date, 'YYYY/MM/DD')
FROM public.proposals AS proposal
WHERE article.proposal_id = proposal.id
  AND article.published_at IS NULL
  AND proposal.published_date ~ '^[0-9]{4}/[0-9]{1,2}/[0-9]{1,2}$';

ALTER TABLE public.bill_articles
ALTER COLUMN published_at
SET DEFAULT ((NOW() AT TIME ZONE 'Asia/Tokyo')::DATE);

COMMENT ON COLUMN public.bill_articles.published_at IS
  'トピックス記事の公開日。既存記事は元データの公開日を引き継ぎ、新規記事は日本時間の当日を設定';
