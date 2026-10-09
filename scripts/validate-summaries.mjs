// 生成された要約JSON（scripts/summaries-work/out/*.json）の一括検証
// チェック内容: JSON妥当性 / ID 1-57 の網羅 / summary・decisions の存在 /
// summary の長さ / 中国語簡体字の混入 / 二重エスケープされた改行
import fs from "node:fs";
import path from "node:path";

const dir = path.join(import.meta.dirname, "summaries-work", "out");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const ids = new Set();
const errs = [];
// 日本語常用漢字と重複しない簡体字のみ
const badChars = /[议务该办预题过发实际产变华绍线组织运动员龙丽剑广严肃录]/;

for (const f of files) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    ids.add(j.id);
    if (typeof j.summary !== "string" || !j.summary)
      errs.push(`${f}: summary missing`);
    if (typeof j.decisions !== "string" || !j.decisions)
      errs.push(`${f}: decisions missing`);
    if (j.summary && j.summary.length > 260)
      errs.push(`${f}: summary too long (${j.summary.length})`);
    if (badChars.test(j.summary + j.decisions))
      errs.push(`${f}: possible Chinese char`);
    if ((j.summary + j.decisions).includes("\\n"))
      errs.push(`${f}: literal backslash-n in string`);
  } catch (e) {
    errs.push(`${f}: INVALID JSON: ${e.message}`);
  }
}

const missing = [];
for (let i = 1; i <= 57; i++) if (!ids.has(i)) missing.push(i);

console.log("files:", files.length, "unique ids:", ids.size);
console.log("missing ids:", missing.join(",") || "none");
console.log("errors:", errs.length ? "\n" + errs.join("\n") : "none");

const lens = files.map((f) => {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  return j.summary.length;
});
console.log(
  "summary len min/max/avg:",
  Math.min(...lens),
  Math.max(...lens),
  Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)
);
