# みらい議会ー大分市版

公開URL: https://mirai-gikai-oitacity-wxga.vercel.app/

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

## 他地方議会向けForkガイド

- 他の市議会・県議会等のバージョンを作成したい場合は、
  以下のドキュメントを参考にすると早いと思います
  [fork手順](docs/kawasaki/20260304_1000_別地域向けfork手順.md)

---

# みらい議会

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/team-mirai-volunteer/mirai-gikai)
[![codecov](https://codecov.io/gh/team-mirai/mirai-gikai/branch/develop/graph/badge.svg)](https://codecov.io/gh/team-mirai/mirai-gikai)

## セットアップ

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
