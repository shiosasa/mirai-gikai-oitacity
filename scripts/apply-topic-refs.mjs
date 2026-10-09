// scripts/topics-refs-work/out/article-*.json を bill_articles.source_refs に反映する
// 実行前に必ず生成内容のユーザー承認を得ること（AGENTS.md「AI生成コンテンツのDB更新ルール」）
// 使い方: node --env-file=web/.env scripts/apply-topic-refs.mjs
import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(import.meta.dirname, "topics-refs-work");
const OUT_DIR = path.join(WORK_DIR, "out");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です");
  process.exit(1);
}

const sessionsMeta = JSON.parse(
  fs.readFileSync(path.join(WORK_DIR, "sessions-meta.json"), "utf8")
);
const sessionById = new Map(sessionsMeta.map((s) => [s.session_id, s]));

// 表示用ラベル: 本会議「令和8年 第1回定例会 第8号（3月26日）」/ 委員会「総務常任委員会（3月24日）」
function buildSessionLabel(session) {
  const title = (session.session_title ?? "")
    .replace(/\s+/g, " ")
    .replace(/（\s*/g, "（")
    .replace(/\s*）/g, "）")
    .trim();
  if (session.meeting_type === "本会議") {
    const normalized = title.replace(/^(第\d+号)\s*(.+)$/, "$1（$2）");
    return `${session.meeting_title} ${normalized}`.trim();
  }
  return `${session.meeting_title}${title}`.trim();
}

const files = fs
  .readdirSync(OUT_DIR)
  .filter((f) => /^article-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

console.log(`${files.length} 件を反映します`);

let ok = 0;
let failed = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  const sourceRefs = data.refs.map((ref) => {
    const session = sessionById.get(ref.session_id);
    return {
      session_id: ref.session_id,
      meeting_id: session.meeting_id,
      meeting_type: session.meeting_type,
      meeting_title: session.meeting_title,
      session_label: buildSessionLabel(session),
      date: session.date,
      bill_number: ref.bill_number ?? null,
      bill_name: ref.bill_name ?? null,
      evidence_quote: ref.evidence_quote,
    };
  });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bill_articles?id=eq.${data.article_id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ source_refs: sourceRefs }),
    }
  );
  if (res.ok) {
    ok++;
    console.log(`bill_id=${data.bill_id} (${data.article_id}) OK refs=${sourceRefs.length}`);
  } else {
    failed++;
    console.error(
      `bill_id=${data.bill_id} FAILED: ${res.status} ${await res.text()}`
    );
  }
}
console.log(`完了: 成功 ${ok} / 失敗 ${failed}`);
