// AIインタビュー設定生成用に bills + bill_contents(normal) をエクスポートする
// 使い方: node --env-file=web/.env scripts/export-interview-data.mjs
import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(import.meta.dirname, "interview-work");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です");
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};

async function fetchJson(pathAndQuery) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers,
  });
  if (!res.ok) throw new Error(`${pathAndQuery}: ${res.status}`);
  return res.json();
}

fs.mkdirSync(path.join(WORK_DIR, "out"), { recursive: true });

const bills = await fetchJson(
  "bills?select=id,name,bill_contents(title,summary,content,difficulty_level)&order=created_at.asc"
);

const exported = bills.map((bill, index) => {
  const normal = (bill.bill_contents ?? []).find(
    (c) => c.difficulty_level === "normal"
  );
  return {
    seq: index + 1,
    bill_id: bill.id,
    bill_name: bill.name,
    title: normal?.title ?? "",
    summary: normal?.summary ?? "",
    content: normal?.content ?? "",
  };
});

fs.writeFileSync(
  path.join(WORK_DIR, "bills.json"),
  JSON.stringify(exported, null, 2)
);
console.log(`bills.json: ${exported.length} 件`);
for (const b of exported) {
  console.log(
    `${b.seq}. ${b.bill_name.slice(0, 30)} content:${b.content.length}字`
  );
}
