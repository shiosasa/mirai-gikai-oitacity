// scripts/interview-work/out/config-*.json を interview_configs / interview_questions に反映し、
// あわせて bill_contents の summary / content を proposals 由来のテキストで更新する
// 実行前に必ず生成内容のユーザー承認を得ること（AGENTS.md「AI生成コンテンツのDB更新ルール」）
// 使い方: node --env-file=web/.env scripts/apply-interview-configs.mjs
import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(import.meta.dirname, "interview-work");
const OUT_DIR = path.join(WORK_DIR, "out");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です");
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function rest(method, pathAndQuery, body, prefer) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    method,
    headers: prefer ? { ...headers, Prefer: prefer } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${pathAndQuery}: ${res.status} ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const input = JSON.parse(
  fs.readFileSync(path.join(WORK_DIR, "input.json"), "utf8")
);
const inputBySeq = new Map(input.map((b) => [b.seq, b]));

// proposals 由来のテキストから bill_contents 用の本文を組み立てる
function buildBillContent(src) {
  const sections = [];
  if (src.detail) sections.push(`## 取り組みの詳細\n${src.detail}`);
  if (src.reason) sections.push(`## 背景・理由\n${src.reason}`);
  const points = [src.point1, src.point2, src.point3].filter(Boolean);
  if (points.length > 0) {
    sections.push(
      `## 重要ポイント\n${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
    );
  }
  if (src.impact) sections.push(`## 主に影響を受ける人・対象者\n${src.impact}`);
  return sections.join("\n\n");
}

function buildBillSummary(src) {
  return [src.summary1, src.summary2, src.summary3].filter(Boolean).join("\n");
}

const files = fs
  .readdirSync(OUT_DIR)
  .filter((f) => /^config-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

console.log(`${files.length} 件を反映します`);

let ok = 0;
let failed = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  const src = inputBySeq.get(data.seq);
  try {
    // 既に公開中の設定がある場合はスキップ（二重投入防止）
    const existing = await rest(
      "GET",
      `interview_configs?select=id&bill_id=eq.${data.bill_uuid}&status=eq.public`
    );
    if (existing.length > 0) {
      console.log(`seq=${data.seq} SKIP（既に公開中の設定あり）`);
      continue;
    }

    const [config] = await rest(
      "POST",
      "interview_configs",
      {
        bill_id: data.bill_uuid,
        name: data.name,
        status: "public",
        mode: "loop",
        themes: data.themes,
        knowledge_source: null,
        chat_model: null,
        estimated_duration: data.estimated_duration ?? 10,
      },
      "return=representation"
    );

    await rest(
      "POST",
      "interview_questions",
      data.questions.map((q) => ({
        interview_config_id: config.id,
        question: q.question,
        question_order: q.question_order,
        follow_up_guide: q.follow_up_guide ?? null,
        quick_replies: q.quick_replies ?? null,
      })),
      "return=minimal"
    );

    // bill_contents（normal）の summary / content を更新
    await rest(
      "PATCH",
      `bill_contents?bill_id=eq.${data.bill_uuid}&difficulty_level=eq.normal`,
      {
        summary: buildBillSummary(src),
        content: buildBillContent(src),
      },
      "return=minimal"
    );

    ok++;
    console.log(
      `seq=${data.seq} OK config=${config.id} questions=${data.questions.length}`
    );
  } catch (err) {
    failed++;
    console.error(`seq=${data.seq} FAILED: ${err.message}`);
  }
}
console.log(`完了: 成功 ${ok} / 失敗 ${failed}`);
