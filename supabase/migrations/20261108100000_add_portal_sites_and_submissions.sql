-- 全国の地方版みらい議会ポータル用テーブル作成
create table if not exists portal_sites (
  id text primary key,
  prefecture text not null,
  municipality text not null,
  site_name text not null,
  url text not null,
  author_name text not null,
  author_social_url text,
  description text not null,
  genres text[] not null default '{}',
  governance_type text not null default '市区',
  region text not null default '関東',
  is_official boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists portal_submissions (
  id uuid primary key default gen_random_uuid(),
  report_type text not null default 'new',
  prefecture text,
  municipality text,
  site_name text not null,
  url text,
  author_name text,
  author_social_url text,
  description text,
  genres text[] default '{}',
  governance_type text default '市区',
  region text default '関東',
  reporter_name text,
  reporter_contact text,
  broken_detail text,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- RLS有効化（ポリシーなし、Service Role経由で全アクセス）
alter table portal_sites enable row level security;
alter table portal_submissions enable row level security;

-- インデックス
create index if not exists idx_portal_sites_active_order on portal_sites(is_active, display_order);
create index if not exists idx_portal_submissions_status_created on portal_submissions(status, created_at desc);

-- 初期データ投入（30サイト）
insert into portal_sites (id, prefecture, municipality, site_name, url, author_name, author_social_url, description, genres, governance_type, region, is_official, display_order)
values
('hontai-official', '全国', '公式', 'みらい議会（公式）', 'https://gikai.team-mir.ai/', 'チームみらい', 'https://x.com/team_mir_ai', '本家本元。テクノロジーを活用して議会や政治を身近にする公式プラットフォーム。', ARRAY['Webアプリ','AI要約・チャット']::text[], '本家・全国', '全国', true, 0),
('zenkoku-portal', '全国', '全国', 'みらい議会＠全国地方議会', 'https://mirai-gikai-zenkoku.vercel.app/', 'Syogo-Suganoya', 'https://x.com/ssuga620282', '全国の地方議会で審議されている議案を日本地図などから探せる非公式ポータル。', ARRAY['Webアプリ']::text[], '本家・全国', '全国', false, 1),
('kanagawa-pref', '神奈川県', '神奈川県', 'みらい議会＠神奈川県', 'https://mirai-gikai-kanagawa-web.vercel.app/', 'GondowTakashi', 'https://x.com/GondowTakashi', '神奈川県議会の審議内容を分かりやすく届ける地方版みらい議会。', ARRAY['Webアプリ','AI要約・チャット']::text[], '都道府県', '関東', false, 2),
('nara-pref', '奈良県', '奈良県', 'みらい議会＠奈良県', 'https://mirai-gikai-nara-web.vercel.app/', '有志開発者', null, '奈良県議会の情報や議案をわかりやすく発信中。', ARRAY['Webアプリ']::text[], '都道府県', '近畿', false, 3),
('fukuoka-pref', '福岡県', '福岡県', 'みらい議会＠福岡県', 'https://t.co/qqswRe6FJS', 'みらい議会 福岡', 'https://x.com/m_gikai_fukuoka', '福岡県議会の議案・審議情報を市民目線で伝えるプラットフォーム。', ARRAY['Webアプリ','AI要約・チャット']::text[], '都道府県', '九州・沖縄', false, 4),
('tokorozawa-city', '埼玉県', '所沢市', 'みらい議会＠所沢市', 'https://mirai-gikai-tokorozawa.vercel.app/', '有志開発者', null, '所沢市議会の動きを届ける地域版みらい議会。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 5),
('kimitsu-city', '千葉県', '君津市', 'みらい議会＠君津市', 'https://mirai-gikai-kimitsu-web.vercel.app/', '大竹三太', 'https://instagram.com/michitakaotake', '君津市議会の議案解説や取り組みをわかりやすく。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 6),
('chuo-ward', '東京都', '中央区', 'みらい議会＠中央区', 'https://mirai-gikai.yukihoz.tokyo/', 'ninofku', 'https://x.com/ninofku', '東京都中央区議会を暮らしの目線で解説。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 7),
('shinjuku-ward', '東京都', '新宿区', 'みらい議会＠新宿区', 'https://miraigikai-shinjuku-web.vercel.app/', 'OchiK', 'https://github.com/OchiK', '新宿区議会の審議情報を身近に届けるサイト。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 8),
('setagaya-ward', '東京都', '世田谷区', 'シビックテック世田谷 みらい議会', 'https://civictech-setagaya.org/', 'シビックテック世田谷', 'https://x.com/DD_Setagaya', '世田谷区の地域課題と議会をつなぐシビックテック発の取り組み。', ARRAY['Webアプリ','データ分析']::text[], '市区', '関東', false, 9),
('ota-ward', '東京都', '大田区', 'みらい議会＠大田区', 'https://ota.aix.tokyo/', 'くにいまさ', 'https://x.com/kunii_masa17608', '大田区議会をやさしく伝える市民情報サイト。', ARRAY['Webアプリ','AI要約・チャット']::text[], '市区', '関東', false, 10),
('adachi-ward', '東京都', '足立区', 'みらい議会＠足立区', 'https://mirai-gikai-adachi-web.vercel.app/', 'みらいラボ', 'https://x.com/0909mirai_lab', '足立区議会の審議を市民の目線でやさしく整理。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 11),
('sumida-ward', '東京都', '墨田区', 'みらい議会＠墨田区', 'https://mirai-gikai-sumida.gorisan.info/', 'ごりさん', 'https://x.com/gorisan_it', '墨田区議会を身近にする地域特化サイト。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 12),
('tachikawa-city', '東京都', '立川市', 'みらい議会＠立川市', 'https://mirai-gikai-tachikawa-web.vercel.app/', 'みらい議会 立川', 'https://x.com/miraigikai_tckw', '立川市議会の情報・議案をやさしく伝えるサイト。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 13),
('kawasaki-city', '神奈川県', '川崎市', 'みらい議会＠川崎市', 'https://mirai-gikai-kawasaki-web.vercel.app/', 'GondowTakashi', 'https://x.com/GondowTakashi', '川崎市議会に特化した地域版みらい議会。', ARRAY['Webアプリ','AI要約・チャット']::text[], '市区', '関東', false, 14),
('sagamihara-city', '神奈川県', '相模原市', 'みらい議会＠相模原市', 'https://miraigikai-sagamihara.vercel.app/', 'tauon-neutrino-ai', 'https://github.com/tauon-neutrino-ai', '相模原市議会を暮らしの視点でわかりやすく。', ARRAY['Webアプリ']::text[], '市区', '関東', false, 15),
('hayama-town', '神奈川県', '葉山町', 'みらい議会＠葉山町', 'https://hayama-gikai-web.vercel.app/', 'Yasuaki_jp', 'https://x.com/Yasuaki_jp', '町村単位でも広がるみらい議会。葉山町議会の動きを身近に。', ARRAY['Webアプリ']::text[], '町村', '関東', false, 16),
('numazu-city', '静岡県', '沼津市', 'みらい沼津（みらい議会＠沼津市）', 'https://mirai-numazu.com/', 'せいいち', 'https://x.com/seiichi3141', '沼津市議会をわかりやすく、市民に身近に届けるプロジェクト。', ARRAY['Webアプリ']::text[], '市区', '中部', false, 17),
('kuwana-city', '三重県', '桑名市', 'みらい議会＠桑名市', 'https://mirai-gikai-kuwana-web.vercel.app/', 'C_P_Optimist', 'https://x.com/C_P_Optimist', '桑名市議会の議案や議論をやさしく伝えるサイト。', ARRAY['Webアプリ']::text[], '市区', '中部', false, 18),
('nagoya-city', '愛知県', '名古屋市', 'みらい議会＠名古屋市', 'https://mirai-gikai-nagoya.vercel.app/', 'Syogo-Suganoya', 'https://x.com/ssuga620282', '名古屋市議会を市民向けにやさしく解説。', ARRAY['Webアプリ']::text[], '市区', '中部', false, 19),
('kusatsu-city', '滋賀県', '草津市', 'みらい議会＠草津市', 'https://mirai-gikai-kusatsu.vercel.app/', 'YY_papa', 'https://x.com/YY_papa', '草津市議会を分かりやすく身近に。', ARRAY['Webアプリ']::text[], '市区', '近畿', false, 20),
('hirakata-city', '大阪府', '枚方市', 'みらい議会＠枚方市', 'https://mirai-gikai-hirakata-city-web-three.vercel.app/', 'ふーちゃんまる', 'https://x.com/huchanmaru', '枚方市議会の議案解説・市民情報プラットフォーム。', ARRAY['Webアプリ']::text[], '市区', '近畿', false, 21),
('akitakata-city', '広島県', '安芸高田市', 'みらい議会＠安芸高田市', 'https://mirai-gikai-akitakata-city-web.vercel.app/', 'ばくもん', 'https://x.com/bakumon0907', '安芸高田市議会の審議をやさしく整理して発信。', ARRAY['Webアプリ']::text[], '市区', '中国・四国', false, 22),
('fukuoka-city', '福岡県', '福岡市', 'みらい議会＠福岡市', 'https://mirai-gikai-fukuoka-city-web-6wib.vercel.app/', 'みらい議会 福岡', 'https://x.com/m_gikai_fukuoka', '福岡市議会の議案・市政をやさしく届けるプラットフォーム。', ARRAY['Webアプリ','AI要約・チャット']::text[], '市区', '九州・沖縄', false, 23),
('tagawa-city', '福岡県', '田川市', 'みらい議会＠田川市', 'https://tagawa-gikai.jp/', '有志開発者', null, '田川市議会の情報発信サイト。', ARRAY['Webアプリ']::text[], '市区', '九州・沖縄', false, 24),
('fukutsu-city', '福岡県', '福津市', 'みらい議会＠福津市', 'https://mirai-gikai-fukutsu.jp/', '有志開発者', null, '福津市議会の動きを市民へ。', ARRAY['Webアプリ']::text[], '市区', '九州・沖縄', false, 25),
('hirokawa-town', '福岡県', '広川町', 'みらい議会＠広川町', 'https://mirai-gikai-web-ashen.vercel.app/', '有志開発者', null, '広川町議会の情報をやさしく解説。', ARRAY['Webアプリ']::text[], '町村', '九州・沖縄', false, 26),
('onga-town', '福岡県', '遠賀町', 'みらい議会＠遠賀町', 'https://miraigikai.onga-mirai-tech.com/', 'OngaMiraiTech', 'https://x.com/OngaMiraiTech', '遠賀町議会の議論をテクノロジーで身近に。', ARRAY['Webアプリ']::text[], '町村', '九州・沖縄', false, 27),
('oita-city', '大分県', '大分市', 'みらいぎかいっち＠大分市', 'https://mirai-gikai-oitacity-web.vercel.app/', '「となりの政治」しおぱん', 'https://x.com/shiopan_222', '「おおいたん市議会っち何しよん？」暮らしの視点で市議会をやさしく伝える市民情報サイト。AI要約やインタビューも搭載。', ARRAY['Webアプリ','AI要約・チャット']::text[], '市区', '九州・沖縄', false, 28),
('ishigaki-city', '沖縄県', '石垣市', 'みらい議会＠石垣市', 'https://ishigaki-gikai-app-web-coral.vercel.app/', '福里 篤史', 'https://x.com/AtsushiFukuzato', '石垣市議会の情報・議案をやさしく届ける南の島の市民プラットフォーム。', ARRAY['Webアプリ']::text[], '市区', '九州・沖縄', false, 29)
on conflict (id) do nothing;
