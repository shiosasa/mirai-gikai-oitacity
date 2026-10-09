# 議事録の要約・決定事項バッチ処理

このスクリプトは、既存の全会議セッション（meeting_sessions）から要約と決定事項を自動生成します。

## 実行方法

```bash
# プロジェクトルートから実行
node scripts/batch-summarize-sessions.mjs
```

## 環境変数

以下の環境変数が必要です（通常は `.env.local` で設定済み）：

- `SUPABASE_URL`: Supabase プロジェクトの URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase の Service Role キー

## 処理内容

1. `summary` が NULL のセッションをすべて取得
2. 各セッションの `content` から AI で要約と決定事項を生成
3. 生成された要約・決定事項を `meeting_sessions` テーブルに保存

## 注意点

- 処理時間：セッション数によってはかなり時間がかかります
- API 制限：Claude API の rate limit に達する可能性があります
- 費用：Claude API の使用料が発生します

## 処理後

処理完了後、ブラウザで `/committees` ページの委員会・本会議を開くと、要約と決定事項が表示されます。
