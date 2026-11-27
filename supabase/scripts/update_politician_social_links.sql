-- 大分市議会 全現職議員（43名）の公式HP・ブログ・SNSリンク 一括更新SQL
-- ※ 2026-11-27 時点の公開情報調査に基づく。確認できた本人運営リンクのみ設定し、未確認は NULL とする。
-- ※ 既存の homepage カラムに X 等の SNS URL が格納されていたケースを整理するため、全議員分を一括で上書き更新する。
-- ※ Supabase の SQL Editor にそのまま貼り付けて実行してください。

begin;

-- 1. 大津 將嘉（自由民主党）
update public.politicians
set homepage = 'https://otsumasayoshi.com/',
    blog_url = null,
    sns_links = '{"instagram":"https://www.instagram.com/otsu_masayoshi","facebook":"https://www.facebook.com/share/1BoUesRTKm/"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '大津將嘉';

-- 2. 平本 泉（自由民主党）
update public.politicians
set homepage = 'https://hiramoto-izumi.jp/',
    blog_url = null,
    sns_links = '{"facebook":"https://www.facebook.com/HiramotoIzumiOita"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '平本泉';

-- 4. 牧 貴宏（自由民主党）
update public.politicians
set homepage = 'https://maki-takahiro.com/',
    blog_url = 'https://ameblo.jp/maki-takahiro/',
    sns_links = '{"x":"https://x.com/makkytakahiro","instagram":"https://www.instagram.com/takahiromakky/","facebook":"https://www.facebook.com/%E7%89%A7%E3%81%9F%E3%81%8B%E3%81%B2%E3%82%8D-111725897395478/","youtube":"https://www.youtube.com/channel/UCNFH18mYVYAVk70KQZspbRA/","line":"https://line.me/R/ti/p/@111wgrug"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '牧貴宏';

-- 5. 進 義和（自由民主党）
update public.politicians
set homepage = 'https://shin-yoshikazu.com/',
    blog_url = null,
    sns_links = '{"facebook":"https://www.facebook.com/%E9%80%B2-%E3%82%88%E3%81%97%E3%81%8B%E3%81%9A-%E5%BE%8C%E6%8F%B4%E4%BC%9A%E4%BA%8B%E5%8B%99%E6%89%80-110917080708732"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '進義和';

-- 6. 長野 辰生（自由民主党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '長野辰生';

-- 7. 倉掛 賢裕（自由民主党）
update public.politicians
set homepage = 'https://kurakake-masahiro.com/',
    blog_url = null,
    sns_links = '{"instagram":"https://www.instagram.com/kurakake_masahiro/","facebook":"https://www.facebook.com/kurakakemasahiro","youtube":"https://www.youtube.com/@kurakakemasahiro","line":"https://lin.ee/VRyT7q5"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '倉掛賢裕';

-- 8. 田島 寛信（自由民主党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '田島寛信';

-- 9. 二宮 博（自由民主党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '二宮博';

-- 10. 藤田 敬治（自由民主党）
update public.politicians
set homepage = 'https://www.fujitakeiji.com/',
    blog_url = null,
    sns_links = '{"facebook":"https://www.facebook.com/oitafujitakeiji/"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '藤田敬治';

-- 11. 永松 弘基（自由民主党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '永松弘基';

-- 12. 板倉 永紀（自由民主党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '板倉永紀';

-- 13. 仲道 俊寿（自由民主党）
update public.politicians
set homepage = 'https://nakamichitoshihisa.jp/',
    blog_url = null,
    sns_links = '{"x":"https://x.com/toshihisanokai/","instagram":"https://www.instagram.com/toshihisanokai/","facebook":"https://www.facebook.com/toshihisanokai/","youtube":"https://www.youtube.com/channel/UCVRucYrJ4mifCgNgfI9ei3A","line":"https://lin.ee/iijbfyQ"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '仲道俊寿';

-- 14. 秦野 恭義（自由民主党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '秦野恭義';

-- 15. 直野 里子（地域政党おおいた。）
update public.politicians
set homepage = 'http://naonosatoko.com/',
    blog_url = null,
    sns_links = '{"instagram":"https://www.instagram.com/naonosatoko/","facebook":"https://www.facebook.com/profile.php?id=61568707886508"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '直野里子';

-- 16. 衛藤 延洋（地域政党おおいた。）
update public.politicians
set homepage = 'https://enyo-oita.jp/',
    blog_url = null,
    sns_links = '{"instagram":"https://www.instagram.com/etoenyo","facebook":"https://www.facebook.com/etoenyo/","youtube":"https://www.youtube.com/channel/UCQvNwJmVms288yF8cD1U5DQ"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '衛藤延洋';

-- 17. 斉藤 由美子（日本共産党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '斉藤由美子';

-- 18. 岩崎 貴博（日本共産党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '岩崎貴博';

-- 19. 高松 大樹（無所属）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '高松大樹';

-- 20. 成迫 研太（ネットワークみらい）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '成迫研太';

-- 21. 野上 恵子（ネットワークみらい）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '野上恵子';

-- 22. うつのみや 陽子（ネットワークみらい）
update public.politicians
set homepage = 'https://tomoniikiru.life/',
    blog_url = null,
    sns_links = '{"x":"https://x.com/bingo_yoko"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = 'うつのみや陽子';

-- 23. 馬見塚 剛（ネットワークみらい）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '馬見塚剛';

-- 24. 甲斐 高之（ネットワークみらい）
update public.politicians
set homepage = 'https://kai-takayuki.com/',
    blog_url = null,
    sns_links = '{"x":"https://x.com/yZiXbFd9dO031zs","instagram":"https://www.instagram.com/takayuki.kai.1800/","facebook":"https://www.facebook.com/takayuki.kai.1800","youtube":"https://www.youtube.com/channel/UC4O6QMOk3yP8PcJo0YnNT5A"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '甲斐高之';

-- 25. スカルリーパー・エイジ（ネットワークみらい）
update public.politicians
set homepage = null,
    blog_url = null,
    sns_links = '{"x":"https://x.com/skullaji"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = 'スカルリーパー・エイジ';

-- 26. 帆秋 誠悟（ネットワークみらい）
update public.politicians
set homepage = 'https://say-go.jp/',
    blog_url = null,
    sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '帆秋誠悟';

-- 27. 宮邉 和弘（ネットワークみらい）
update public.politicians
set homepage = 'https://miyabe-kazuhiro.com/',
    blog_url = null,
    sns_links = '{"instagram":"https://www.instagram.com/miya_bear_8341_yasashii_machi","facebook":"https://www.facebook.com/miyabe.kazuhiro/"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') in ('宮邉和弘', '宮辺和弘');

-- 28. 髙野 博幸（ネットワークみらい）
update public.politicians
set homepage = 'https://takano-oita.com/',
    blog_url = null,
    sns_links = '{"facebook":"https://www.facebook.com/profile.php?id=100007753834148"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') in ('髙野博幸', '高野博幸');

-- 29. 日小田 良二（ネットワークみらい）
update public.politicians
set homepage = 'https://www.hioda-ryoji.com/',
    blog_url = null,
    sns_links = '{"instagram":"https://www.instagram.com/hioda_ryoji","facebook":"https://www.facebook.com/profile.php?id=61568355960376"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '日小田良二';

-- 30. 岩川 義枝（Oita市民クラブ）
update public.politicians
set homepage = 'https://iwakawayoshie.jimdofree.com/',
    blog_url = null,
    sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '岩川義枝';

-- 31. 野尻 哲雄（Oita市民クラブ）
update public.politicians
set homepage = 'https://tetsuo-nojiri.com/',
    blog_url = null,
    sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '野尻哲雄';

-- 32. 吉川 直樹（新市民クラブ）
update public.politicians
set homepage = 'https://oita-politics.com/',
    blog_url = null,
    sns_links = '{"x":"https://x.com/OitaParliament","instagram":"https://www.instagram.com/oitaparliament/","youtube":"https://www.youtube.com/@OitaParliament","line":"https://lin.ee/WPCVYV88"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '吉川直樹';

-- 33. 阿部 邦彦（新市民クラブ）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '阿部邦彦';

-- 34. 堤 英貴（新市民クラブ）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '堤英貴';

-- 35. 堀 嘉徳（新市民クラブ）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '堀嘉徳';

-- 36. 大石 祥一（新市民クラブ）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '大石祥一';

-- 37. 仲家 孝治（新市民クラブ）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '仲家孝治';

-- 38. 高橋 弘巳（新市民クラブ）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '高橋弘巳';

-- 39. 安東 美奈子（公明党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '安東美奈子';

-- 40. 平田 友章（公明党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '平田友章';

-- 41. 橋本 敬広（公明党）
update public.politicians
set homepage = 'https://www.komei.or.jp/km/oita-hashimoto-takahiro/',
    blog_url = null,
    sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '橋本敬広';

-- 42. 川邉 浩子（公明党）
update public.politicians
set homepage = 'https://www.komei.or.jp/km/oita-kawabe-hiroko/',
    blog_url = null,
    sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') in ('川邉浩子', '川辺浩子');

-- 43. 国宗 浩（公明党）
update public.politicians
set homepage = null, blog_url = null, sns_links = null
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '国宗浩';

-- 44. 今山 裕之（公明党）
update public.politicians
set homepage = 'https://www.komei.or.jp/km/imayama/',
    blog_url = null,
    sns_links = '{"x":"https://x.com/H_Imayama","instagram":"https://www.instagram.com/imayama_hiroyuki"}'::jsonb
where is_current = true and regexp_replace(name, '\s+', '', 'g') = '今山裕之';

commit;
