// scripts/summaries-work/out/*.json を meeting_sessions.summary / decisions に反映する
// 実行前に必ず生成内容のユーザー承認を得ること（AGENTS.md「AI生成コンテンツのDB更新ルール」）
// 使い方: web/.env の SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を読み込んで実行
//   node --env-file=web/.env scripts/apply-summaries.mjs
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(import.meta.dirname, "summaries-work", "out");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です");
  process.exit(1);
}

const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"));
console.log(`${files.length} 件を反映します`);

let ok = 0;
let failed = 0;
for (const file of files.sort((a, b) => parseInt(a) - parseInt(b))) {
  const { id, summary, decisions } = JSON.parse(
    fs.readFileSync(path.join(OUT_DIR, file), "utf8")
  );
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/meeting_sessions?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ summary, decisions }),
    }
  );
  if (res.ok) {
    ok++;
    console.log(`id=${id} OK`);
  } else {
    failed++;
    console.error(`id=${id} FAILED: ${res.status} ${await res.text()}`);
  }
}
console.log(`完了: 成功 ${ok} / 失敗 ${failed}`);
