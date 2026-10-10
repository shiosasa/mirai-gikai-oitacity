# みらい議会ー大分市版

公開URL: （デプロイ後に更新）

## 大分市版の初回確認用デプロイ

- Vercel プロジェクト: `mirai-gikai-oitacity-wxga`
- Root Directory: `web`（ルート外の共有パッケージもビルドに含める）
- アップロード用ブランチ: `release/oita-v1`
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
