# 引き継ぎドキュメント（2026-10-06）

大分市版「みらいぎかいっち」の開発引き継ぎ資料。別のAIアシスタント・開発者がこのリポジトリで作業を再開するための全情報。

## プロジェクト概要

- 大分市議会の市民向け情報サイト「みらいぎかいっち＠大分市」。完全に大分市専用として整理済み（福岡版の古いコードは削除済み）
- 旧システムは GAS + スプレッドシート（「みらいぎかいっち」）。本リポジトリ（Next.js + Supabase）へ移行中
- 運営者は非エンジニアの市民（しおぱんさん）。説明は専門用語を避けて丁寧に
- ブランチ: `oita-migration-and-features`（この worktree）。大分市版専用

## 現在の状態（2026-10-06 時点）

### 完了・動作確認済み

- トピックスページ `/topics`（18記事、裏付けリンク・ステータスバッジ・インタビュー導線）
- 委員会・本会議アーカイブ（要約・決定事項・出席者・議案バッジ、議事録整形）
- **AIインタビュー一式を実機確認済み**: LP → 同意・ニックネーム → 大分弁チャット → 要約 → レポート生成 → DB保存
  - 確認済みデータ: interview_sessions（nickname=しお）、interview_messages 28件、interview_report 1件
- ここまでのコードは全てコミット済み（`git log` の 2026-10-06 分6コミット参照）

### 本番環境の設定変更済み（再設定不要）

- 本番 Supabase（プロジェクト「みらいぎかいっち」ombopirqedzbhuqpsvkw）の **匿名サインインを有効化済み**
- Vercel AI Gateway: ユーザーのアカウント（shiopan, Hobby）で APIキー発行済み・**無料クレジット有効化済み**（カード未登録、月$5・対象モデル限定・レート制限あり）
- `AI_GATEWAY_API_KEY` はローカルの `web/.env` とルート `.env` に設定済み（gitignore対象。**本番デプロイ時は Vercel の環境変数にも設定が必要**）

## 起動方法

```bash
npm run dev --prefix web   # localhost:3002（web/.env は本番Supabase直結なので注意）
```

## 残タスク（優先度順）

1. **Vercel デプロイ準備**: Vercel CLI 未ログイン。環境変数（AI_GATEWAY_API_KEY, SUPABASE系, REVALIDATE_SECRET 等）の設定が必要。`.claude/skills/deploy` に手順あり
2. ~~裏付けの弱いトピックス記事7件~~ → **削除済み（2026-10-06、ユーザー指示）**。bill_id 5, 8, 9, 10, 11, 14, 18 を本番 `bill_articles` から削除（残り11記事）。復元用バックアップ: `scripts/topics-refs-work/deleted-articles-backup-20261006.json`。これら7議案の interview_configs・bill_contents は残存（トピックスからの導線が無くなっただけ。直URLではLPにアクセス可能）
3. **Supabase 型の再生成**: 生成型（packages/supabase/types）に大分版テーブル（meetings / bill_articles / proposals 等）が無く、**branch 全体で typecheck が失敗する**（既存問題）。`npx supabase gen types typescript --linked` 等で再生成を検討
4. TOPページ「詳しく」リンクの変更、「簡単な言葉に変換」第2段階（未着手）

## 既知の問題・注意点（ハマりどころ）

- **pre-commit フック（lint-staged → biome）が失敗する**: リポジトリ全体に改行コード（CRLF）由来の lint エラーが約900件あるため（Windows チェックアウト起因、今回の変更とは無関係）。コミットは `git commit --no-verify` で回避している。根本対応は改行正規化（.gitattributes 整備 + 一括フォーマット）
- **本番 Supabase への `supabase config push` を安易に実行しない**: リポジトリの `supabase/config.toml` は開発用の値（site_url=127.0.0.1 等）なので、丸ごと push すると本番 auth 設定9項目が壊れる。1項目だけ push したいときは、最小限の config.toml を一時フォルダに作り `--workdir` 指定で実行する
- **AI Gateway 無料枠はモデル制限あり**: `openai/gpt-5.2` は使える。`google/gemini-3-flash` は**使えない**（403）。モデルを追加・変更するときは無料枠対象か確認
- **OpenAI 系モデルの構造化出力は厳格**: Zod スキーマは「全フィールド必須（省略の代わりに `.nullable()`）」「全オブジェクトに `.strict()`」が必要。Gemini は緩いので Gemini で動いていたスキーマが OpenAI で 400 になる。検証方法: `zodSchema(x).jsonSchema` を再帰チェックし、全 object に `additionalProperties: false`、全プロパティが `required` に含まれることを確認
- **DB操作の規約**: `.claude/skills/db-access` 参照。本番への書き込みは必ずユーザー確認後
- 本番DBに反映済みのデータ（migration 3本、meeting_sessions 57件、interview_configs 18件+質問126問、bill_contents 18件、source_refs 52参照）の詳細は git log とスクリプト（scripts/ 配下）参照

## インタビューログの保存先（旧スプレッドシートの代わり）

- `interview_sessions` / `interview_messages` / `interview_report`（Supabase）
- 管理画面: `admin` の `/bills/{議案ID}/reports` で閲覧可能
