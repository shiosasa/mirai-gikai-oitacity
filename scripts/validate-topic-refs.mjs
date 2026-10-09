// scripts/topics-refs-work/out/article-*.json を検証する
// - article_id / bill_id が articles.json と一致するか
// - session_id が sessions-meta.json に実在するか
// - bill_number / bill_name がそのセッションの bills に実在するか
// - evidence_quote が議事録ファイルに逐語で存在するか
// - 中国語漢字の混入がないか
// 使い方: node scripts/validate-topic-refs.mjs
import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(import.meta.dirname, "topics-refs-work");
const OUT_DIR = path.join(WORK_DIR, "out");

const articles = JSON.parse(
  fs.readFileSync(path.join(WORK_DIR, "articles.json"), "utf8")
);
const sessionsMeta = JSON.parse(
  fs.readFileSync(path.join(WORK_DIR, "sessions-meta.json"), "utf8")
);
const sessionById = new Map(sessionsMeta.map((s) => [s.session_id, s]));
const articleByBillId = new Map(articles.map((a) => [a.bill_id, a]));

// 日本語には現れない中国語簡体字・繁体字の代表例
const CHINESE_CHARS = /[议务该过报说乐东车门问长场运动员実発対]/u;
// ↑「実発対」等は日本語なので除外し、簡体字のみに絞る
const CHINESE_ONLY = /[议务该过报说乐东车门问长场运]/u;

let errors = 0;
let warnings = 0;

const files = fs
  .readdirSync(OUT_DIR)
  .filter((f) => /^article-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

console.log(`${files.length} / ${articles.length} 件の出力ファイル`);
if (files.length < articles.length) {
  const have = new Set(files.map((f) => parseInt(f.match(/\d+/)[0])));
  const missing = articles
    .map((a) => a.bill_id)
    .filter((id) => !have.has(id));
  console.error(`❌ 不足: bill_id ${missing.join(", ")}`);
  errors++;
}

const contentCache = new Map();
function sessionContent(sessionId) {
  if (!contentCache.has(sessionId)) {
    const file = path.join(WORK_DIR, "sessions", `s${sessionId}.txt`);
    contentCache.set(
      sessionId,
      fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null
    );
  }
  return contentCache.get(sessionId);
}

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  const prefix = `[${file}]`;
  const article = articleByBillId.get(data.bill_id);

  if (!article) {
    console.error(`${prefix} ❌ bill_id=${data.bill_id} が articles.json にない`);
    errors++;
    continue;
  }
  if (article.id !== data.article_id) {
    console.error(`${prefix} ❌ article_id 不一致（期待: ${article.id}）`);
    errors++;
  }
  if (typeof data.verified !== "boolean") {
    console.error(`${prefix} ❌ verified が boolean でない`);
    errors++;
  }
  if (!Array.isArray(data.refs)) {
    console.error(`${prefix} ❌ refs が配列でない`);
    errors++;
    continue;
  }
  if (data.verified && data.refs.length === 0) {
    console.error(`${prefix} ❌ verified=true なのに refs が空`);
    errors++;
  }

  for (const [i, ref] of data.refs.entries()) {
    const session = sessionById.get(ref.session_id);
    if (!session) {
      console.error(`${prefix} ❌ refs[${i}] session_id=${ref.session_id} が実在しない`);
      errors++;
      continue;
    }
    if (ref.bill_number || ref.bill_name) {
      const hit = (session.bills ?? []).some(
        (b) =>
          (!ref.bill_number || b.number === ref.bill_number) &&
          (!ref.bill_name || b.name === ref.bill_name)
      );
      if (!hit) {
        console.error(
          `${prefix} ❌ refs[${i}] 議案「${ref.bill_number ?? ""} ${ref.bill_name ?? ""}」が session ${ref.session_id} の bills に無い`
        );
        errors++;
      }
    }
    if (!ref.evidence_quote || ref.evidence_quote.length < 20) {
      console.error(`${prefix} ❌ refs[${i}] evidence_quote が短すぎる/無い`);
      errors++;
    } else {
      const content = sessionContent(ref.session_id);
      if (!content) {
        console.error(`${prefix} ❌ refs[${i}] session ${ref.session_id} の議事録ファイルが無い`);
        errors++;
      } else if (!content.includes(ref.evidence_quote)) {
        console.error(
          `${prefix} ❌ refs[${i}] evidence_quote が議事録に逐語一致しない: 「${ref.evidence_quote.slice(0, 40)}…」`
        );
        errors++;
      }
      if (CHINESE_ONLY.test(ref.evidence_quote ?? "") || CHINESE_ONLY.test(ref.note ?? "")) {
        console.warn(`${prefix} ⚠ refs[${i}] に中国語漢字らしき文字`);
        warnings++;
      }
    }
  }

  const refSummary = data.refs
    .map((r) => {
      const s = sessionById.get(r.session_id);
      return `${s?.meeting_title ?? "?"}(${r.session_id})${r.bill_number ? " " + r.bill_number : ""}`;
    })
    .join(" / ");
  console.log(
    `${prefix} verified=${data.verified} confidence=${data.confidence} refs=${data.refs.length}: ${refSummary}`
  );
}

console.log(`\n検証完了: エラー ${errors} / 警告 ${warnings}`);
process.exit(errors > 0 ? 1 : 0);
