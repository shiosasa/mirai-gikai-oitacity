-- -------------------------------------------------------
-- GAS版「みらいぎかいっち」の記事テーブル
-- bill_articles: bills（議案）とは別に、GAS版の記事情報を管理
-- スプレッドシート列 A-R と対応
-- -------------------------------------------------------

-- カテゴリの ENUM 型（GAS版ガイドラインの4分類）
CREATE TYPE article_category_enum AS ENUM (
  'childcare_education',      -- 子育て・教育
  'safety_disaster',          -- 安心・安全・防災
  'community_living',         -- まちづくり・暮らし
  'governance_election'       -- まちの仕組み・選挙
);

-- 記事テーブル
CREATE TABLE bill_articles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bill_id UUID NOT NULL UNIQUE REFERENCES bills(id) ON DELETE CASCADE,

  -- A列: タイトル（スプレッドシート形式）
  -- [ステータス] + 【議案・条例名】 + キャッチコピー
  title TEXT NOT NULL,

  -- B列: ステータス、C列: CSS クラス
  status_label TEXT NOT NULL,
  status_class TEXT NOT NULL,

  -- D列: カテゴリ
  category article_category_enum NOT NULL,

  -- E-F-G列: 要約（3行）
  summary_line_1 TEXT NOT NULL,
  summary_line_2 TEXT NOT NULL,
  summary_line_3 TEXT NOT NULL,

  -- H列: 詳細（経緯や本質的な内容）
  details TEXT NOT NULL,

  -- I列: 理由（行政的背景・意図）
  reason TEXT NOT NULL,

  -- J-K-L列: ポイント（核心となる重要ポイント 3つ）
  point_1 TEXT NOT NULL,
  point_2 TEXT NOT NULL,
  point_3 TEXT NOT NULL,

  -- M列: 対象者（制度・決定の対象者）
  target_audience TEXT NOT NULL,

  -- N列: 賛成の声（大分弁のリアルな期待・肯定意見）
  positive_voice TEXT NOT NULL,

  -- O列: 慎重の声（大分弁のリアルな懸念・反対意見）
  cautious_voice TEXT NOT NULL,

  -- P-Q列: リンク情報
  link_label TEXT,
  link_url TEXT,

  -- R列: 議決日（YYYY/MM/DD 形式）
  decision_date DATE,

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_bill_articles_bill_id ON bill_articles(bill_id);
CREATE INDEX idx_bill_articles_category ON bill_articles(category);
CREATE INDEX idx_bill_articles_created_at ON bill_articles(created_at DESC);

-- updated_at のトリガー
CREATE TRIGGER update_bill_articles_updated_at
  BEFORE UPDATE ON bill_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS を有効化
ALTER TABLE bill_articles ENABLE ROW LEVEL SECURITY;

-- テーブルコメント
COMMENT ON TABLE bill_articles IS 'GAS版「みらいぎかいっち」の記事情報を管理するテーブル。bills（議案）と 1:1 で紐付く';
COMMENT ON COLUMN bill_articles.title IS '[ステータス] + 【議案・条例名】 + キャッチコピー';
COMMENT ON COLUMN bill_articles.category IS '記事分類：子育て・教育 / 安心・安全・防災 / まちづくり・暮らし / まちの仕組み・選挙';
COMMENT ON COLUMN bill_articles.details IS '経緯や本質的な内容。情報の深さを削らず正確に言語化';
COMMENT ON COLUMN bill_articles.reason IS '行政的な背景や経緯を含める';
COMMENT ON COLUMN bill_articles.positive_voice IS '大分弁を用いたリアルな期待・肯定意見（〜やな、〜やけん、〜よ、〜やけど等）';
COMMENT ON COLUMN bill_articles.cautious_voice IS '大分弁を用いたリアルな懸念・反対意見（〜やな、〜やけん、〜よ、〜やけど等）';
