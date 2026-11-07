# みらい議会ー大分市版

公開URL: https://mirai-gikai-oitacity-web.vercel.app/

メインバーのサイト名の左には、information欄と同じ大分市の市花・さざんかのイラストを表示します。
TOPページ下部には大分市の自然・歴史、市花・市木、観光・食を紹介する欄があります。
紹介文の出典は大分市公式サイトとおおいた市観光ナビで、各公式ページへのリンクも掲載しています。
大分市紹介・トピックス・本会議/委員会・市長/議員紹介には、撮影提供された大分の写真を
淡い装飾背景として使用します。宗麟像は頭側を残してタイトル枠の右半分を高さいっぱいに埋め、にわとり像は上下を切り抜いた5:3の横長構図で表示し、
装飾写真には個別の説明書きを付けません。市役所写真は市長プロフィールページのタイトル枠内に、
庁舎中心の横長構図・ピンク基調の淡い装飾背景（不透明度20%）として配置します。独立写真は配置しません。
一覧ページの写真付き見出しはピンク基調を保ち、議案ピックアップには藤と石橋を使用します。
本会議・委員会の商店街写真はクリスマスツリー全体を残した横長構図とし、
PCの見出し内では上下を切らず、不透明度20%の淡い背景として表示します。
携帯サイズではピンク基調のタイトル枠全体に写真を広げ、枠に合わせて周辺を切り抜きます。
PCでは各写真の右寄せ配置を維持し、TOPの写真配置は変更しません。
トピックスでは見出し・説明・カテゴリ絞り込みを同じ写真付きタイトル枠にまとめています。
TOPの「大分市を楽しむ」には、夢色音楽祭の歌唱風景を枠全体の淡い背景として使用します。TOPの背景色は変更しません。
Web用画像は`web/public/img/oita/`に配置し、元写真を残したまま切り抜き・WebP化・
位置情報等のメタデータ除去を行っています。原則として人物や撮影者の影を避けた範囲を使用し、
夢色音楽祭は提供者の確認に基づき歌唱風景を使用します。
写真を記事・議員本人の画像と混同させないよう本文カードやインタビューには配置しません。

**次回の作業は、まず [公開版の場所と引き継ぎ（テキスト）](./docs/20261010_1455_大分市版公開と引き継ぎ.txt) を読んでください。**
公開した完成版の保存先は `C:\Users\詩織\mirai-gikai-oita-approved-preview` です。
名前が似ている別フォルダーや `release/oita-v1` の古いコミットを完成版として使わないでください。

## 大分市版の初回確認用デプロイ

- Vercel プロジェクト: `mirai-gikai-oitacity-wxga`
- Root Directory: `web`（ルート外の共有パッケージもビルドに含める）
- 承認済み画面の確認用ブランチ: `fix/oita-approved-preview`
  （PR のベースは `release/oita-v1`）。
- 完成画面の元は `mirai-gikai-oita-search-categories` の保存済み作業内容。
  `release/oita-v1` だけでは途中の保存版になるため、完成版として扱わない。
- Vercel の Build Command は `pnpm run build --turbopack` を使用する。
- 初回は **Preview Deployment** を作成し、Vercel Authentication を有効にしたまま確認する。
  確認が済むまで Production への昇格や認証保護の解除を行わない。
- Preview に `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、
  `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` を登録する。
  接続先は大分市用の Supabase プロジェクトで確認し、他地域の設定を流用しない。
- `SUPABASE_SERVICE_ROLE_KEY` は **Secret**、
  公開用の `NEXT_PUBLIC_SUPABASE_ANON_KEY` は **Config** として登録する。
  Supabase の Publishable key を後者に、Secret key を前者に使用できる。
- Next.js 15 のページでは `params` と `searchParams` を Promise として受け取り、
  `await` してから使用する。型チェックを無効化せずビルドを検証する。
- 大分市用の `bill_articles`、`meeting_sessions`、`bill_contents` と
  記事カテゴリの型は実際の DB スキーマに合わせる。
  `bill_contents` の追加解説項目は任意であり、未登録でも表示できるようにする。
- 2026年10月10日、ユーザー承認後にお知らせ用マイグレーションのみ適用し、
  `SITE_INFORMATION_ENABLED=true` で一般公開済み。
  `TOPIC_PUBLICATION_ENABLED` とトピックス公開管理用マイグレーションは未有効・未適用。
- 2026年10月10日付で information へ掲載済みの承認済みお知らせ:
  「お引越ししました。『みらいぎかいっち』本家バージョンに生まれ変わりました！」
  日付は実際の一般公開日を日本時間で記録済み。次回重複して登録しない。

## 注意事項

- このプロジェクトは「チームみらい」が開発・運営している「みらい議会」をForkして開発したものとなります。
- **非公式**ですので、ここでの不具合や気になる点についての問い合わせは
  党公式ではなく開発担当者にご連絡ください。

## 公開画面のレイアウト

- 固定ヘッダーを使う画面では、共通の `MainLayout` がスマートフォン・PCともに
  上部96pxを確保します（ヘッダーの上余白16px＋高さ64px＋本文との間隔16px）。
- 各ページではヘッダー分の余白を重ねて追加せず、本文固有の余白だけを設定します。
  全画面のチャットも、この96pxを除いた高さを使用します。
- トピックスの「議決日」は、実際の議決日が登録されている場合だけ表示します。
  委員会報告・実証結果の報告を議決扱いにせず、サイト公開日とは区別します。

### 投稿の NEW 表示

- トピックス・議案（ピックアップを含む）・本会議/委員会の議事録・一般質問・
  議員の発言・市長会見・市長の提案理由・お知らせ・公開AIインタビューレポートに
  共通の NEW バッジを表示します。
- 期間は**初回公開から14日間（336時間）**です。本文の編集、要約の追加、
  非公開からの再公開では延長しません。ページを開いたままでも期限で消えます。
- `content_publications` が公開履歴を保持します。DBトリガーで記録するため、
  管理画面と承認後のデータ投入のどちらにも適用されます。
  会議開催日、議案提出日、`created_at`、`updated_at` は公開日の代用にしません。
- 既存トピックスの `first_published_at` は引き継ぎます。初回公開日が不明な
  既存投稿は日時を空のまま保持し、編集・再公開しても NEW にしません。
  以前の公開履歴が不明な既存下書きも、初回公開と推測してNEWにはしません。
  予約済みお知らせは予約日時から計算し、公開前の予約変更・取り消しに追従します。
- 公開レポートは本人の公開同意と管理者の承認が両方そろった時点を記録します。
  「みんなの生の声」への追加掲載や編集でNEW期間を延長しません。
- 予算概要・事務事業評価など大分市版で未使用のFork由来機能、プロフィールや
  利用規約などの固定情報、統計・評価データの個々の行は今回の対象外です。
- 共通プロバイダーが新着メタデータを一括取得します。APIはキャッシュせず、
  画面遷移・タブ復帰・表示中の1分ごとに更新し、端末の時計ではなくサーバー時刻を基準にします。
  取得失敗はエラーを記録し、不確かな NEW は表示しません。
- **導入順序**: ユーザー承認後、大分市DBへ
  `20261103120000_track_content_first_publication.sql` を適用してからWebをデプロイします。
  本番DBの接続先・適用方法はDBアクセス規約に従います。コードのPR作成だけで本番には反映されません。
- 回帰テスト:
  `pnpm --filter web test src/features/new-posts` と
  `pnpm --filter admin test src/features/publications`。
  DBトリガーは既存のPGlite（実PostgreSQL）で隔離検証し、本番には接続しません。
- ローカルfixtureを既存の記事カードで表示した画面例:
  [PC](./docs/screenshots/new-posts-desktop.png) /
  [スマートフォン](./docs/screenshots/new-posts-mobile.png)。
  1100px・390pxの実CSS幅でNEWの表示/非表示、公開日の1行表示、横はみ出しがないことを確認しています。

## 他地方議会向けForkガイド

- 他の市議会・県議会等のバージョンを作成したい場合は、
  以下のドキュメントを参考にすると早いと思います
  [fork手順](docs/kawasaki/20260304_1000_別地域向けfork手順.md)

---

# みらい議会

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/team-mirai-volunteer/mirai-gikai)
[![codecov](https://codecov.io/gh/team-mirai/mirai-gikai/branch/develop/graph/badge.svg)](https://codecov.io/gh/team-mirai/mirai-gikai)

## セットアップ

Node.js 24.x を使用してください。web / admin の `engines.node` と
GitHub Actions も 24 系に統一しています。
Vercel の Settings → Build and Deployment → Node.js Version も
24.x に設定し、依存関係の更新後は再デプロイしてください。

```bash
# Supabaseの起動
npx supabase start

# 環境変数の設定（必要に応じて.envの内容を変更してください）
cp .env.example .env

# パッケージインストール
pnpm install

# SupabaseのDB初期化, 開発用シードデータのセットアップ
pnpm db:reset

# サーバー起動
pnpm dev
```

## マイグレーション

```bash
# マイグレーションファイル生成
npx supabase migration new マイグレーション名

# マイグレーション実行 & 型ファイル更新
pnpm db:migrate
```

## Adminユーザーの作成

1. Supabase Studio上で Authentication > Add User からユーザーを作成
2. Supabase Studio上で以下のSQLを実行

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = '<1で作成したユーザーのemail>';
```

> [!NOTE]
> 開発環境では、seedデータによって、`email: admin@example.com, password: admin123456` のAdminユーザーが作成されます。

## 本番デプロイ

[公開デプロイ手順書](docs/fukuoka/20260330_1500_公開デプロイ手順書.md) を参照してください。
