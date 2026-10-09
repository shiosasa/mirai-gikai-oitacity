// scripts/interview-work/out/config-*.json を検証する
// 使い方: node scripts/validate-interview-configs.mjs
import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(import.meta.dirname, "interview-work");
const OUT_DIR = path.join(WORK_DIR, "out");

const input = JSON.parse(
  fs.readFileSync(path.join(WORK_DIR, "input.json"), "utf8")
);
const inputBySeq = new Map(input.map((b) => [b.seq, b]));

// 日本語には現れない中国語簡体字の代表例
const CHINESE_ONLY = /[议务该过报说乐东车门问长场运]/u;

let errors = 0;
let warnings = 0;

const files = fs
  .readdirSync(OUT_DIR)
  .filter((f) => /^config-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

console.log(`${files.length} / ${input.length} 件の出力ファイル`);
if (files.length < input.length) {
  const have = new Set(files.map((f) => parseInt(f.match(/\d+/)[0])));
  console.error(
    `❌ 不足: seq ${input.map((b) => b.seq).filter((s) => !have.has(s)).join(", ")}`
  );
  errors++;
}

function checkChinese(prefix, label, text) {
  if (text && CHINESE_ONLY.test(text)) {
    console.warn(`${prefix} ⚠ ${label} に中国語漢字らしき文字: ${text.slice(0, 40)}`);
    warnings++;
  }
}

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  const prefix = `[${file}]`;
  const src = inputBySeq.get(data.seq);

  if (!src) {
    console.error(`${prefix} ❌ seq=${data.seq} が input.json にない`);
    errors++;
    continue;
  }
  if (data.bill_uuid !== src.bill_uuid) {
    console.error(`${prefix} ❌ bill_uuid 不一致（期待: ${src.bill_uuid}）`);
    errors++;
  }
  if (!data.name || data.name.length < 5) {
    console.error(`${prefix} ❌ name が短すぎる/無い`);
    errors++;
  }
  if (!Array.isArray(data.themes) || data.themes.length < 3 || data.themes.length > 5) {
    console.error(`${prefix} ❌ themes が3〜5個でない（${data.themes?.length}）`);
    errors++;
  }
  if (!Array.isArray(data.questions) || data.questions.length < 5 || data.questions.length > 8) {
    console.error(`${prefix} ❌ questions が5〜8個でない（${data.questions?.length}）`);
    errors++;
    continue;
  }
  for (const [i, q] of data.questions.entries()) {
    if (q.question_order !== i + 1) {
      console.error(`${prefix} ❌ questions[${i}] question_order が連番でない`);
      errors++;
    }
    if (!q.question || q.question.length < 10) {
      console.error(`${prefix} ❌ questions[${i}] question が短すぎる`);
      errors++;
    }
    if (q.quick_replies != null) {
      if (!Array.isArray(q.quick_replies) || q.quick_replies.length < 2 || q.quick_replies.length > 5) {
        console.error(`${prefix} ❌ questions[${i}] quick_replies が2〜5個でない`);
        errors++;
      }
    }
    checkChinese(prefix, `questions[${i}].question`, q.question);
    checkChinese(prefix, `questions[${i}].follow_up_guide`, q.follow_up_guide ?? "");
    for (const r of q.quick_replies ?? []) checkChinese(prefix, `questions[${i}].quick_replies`, r);
  }
  for (const t of data.themes ?? []) checkChinese(prefix, "themes", t);
  checkChinese(prefix, "name", data.name);
  if (CHINESE_ONLY.test(JSON.stringify(data))) {
    // 上の個別チェックで検出済みのはずだが念のため全体も見る
  }
  if (/県民/.test(JSON.stringify(data))) {
    console.warn(`${prefix} ⚠ 「県民」が含まれている（大分市なので「市民」が正）`);
    warnings++;
  }

  console.log(
    `${prefix} ${data.name} | themes=${data.themes.length} questions=${data.questions.length}`
  );
}

console.log(`\n検証完了: エラー ${errors} / 警告 ${warnings}`);
process.exit(errors > 0 ? 1 : 0);
