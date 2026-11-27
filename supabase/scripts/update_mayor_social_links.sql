-- 現職大分市長の個人公式HP・ブログ・SNSリンク更新SQL
-- ※ official_url（大分市公式サイトの市長室）は維持し、個人発信拠点を登録します。
-- ※ Supabase の SQL Editor にそのまま貼り付けて実行してください。

begin;

update public.mayor_profile
set homepage = 'https://www.adachishinya.com/',
    blog_url = 'https://ameblo.jp/adachishinya/',
    sns_links = '{"x":"https://twitter.com/shinya8484","facebook":"https://www.facebook.com/profile.php?id=100064520329470"}'::jsonb
where is_current = true
  and regexp_replace(coalesce(name, ''), '\s+', '', 'g') = '足立信也';

commit;
