-- -------------------------------------------------------
-- proposals の badge に基づいて bill_articles の category を同期
-- -------------------------------------------------------

UPDATE bill_articles ba
SET category = CASE p.badge
  WHEN '子育て・教育' THEN 'childcare_education'::article_category_enum
  WHEN '安心・安全・防災' THEN 'safety_disaster'::article_category_enum
  WHEN 'まちづくり・暮らし' THEN 'community_living'::article_category_enum
  WHEN 'まちの仕組み・選挙' THEN 'governance_election'::article_category_enum
  ELSE ba.category
END,
updated_at = NOW()
FROM proposals p
WHERE ba.proposal_id = p.id;

