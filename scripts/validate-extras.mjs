// scripts/summaries-work/out-extras/*.json を検証する
// 形式: { id, attendees: { chair, vice_chair, members[], absent[], officials[] }, bills: [{ number, name, description, result }] }
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(import.meta.dirname, "summaries-work", "out-extras");
const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"));

const ids = new Set();
const errors = [];
let billCount = 0;
let noBills = 0;

for (const file of files) {
  const p = path.join(OUT_DIR, file);
  let d;
  try {
    d = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    errors.push(`${file}: JSON parse error: ${e.message}`);
    continue;
  }
  if (!Number.isInteger(d.id)) errors.push(`${file}: id が整数でない`);
  if (ids.has(d.id)) errors.push(`${file}: id 重複`);
  ids.add(d.id);

  const a = d.attendees;
  if (!a || typeof a !== "object") {
    errors.push(`${file}: attendees が無い`);
  } else {
    if (!Array.isArray(a.members) || a.members.length === 0)
      errors.push(`${file}: attendees.members が空`);
    if (!Array.isArray(a.absent)) errors.push(`${file}: attendees.absent が配列でない`);
    if (!Array.isArray(a.officials)) errors.push(`${file}: attendees.officials が配列でない`);
  }

  if (!Array.isArray(d.bills)) {
    errors.push(`${file}: bills が配列でない`);
  } else {
    if (d.bills.length === 0) noBills++;
    billCount += d.bills.length;
    for (const b of d.bills) {
      if (!b.name) errors.push(`${file}: bills に name 無し`);
      if (!("result" in b)) errors.push(`${file}: bills に result 無し`);
      if (!b.description) errors.push(`${file}: bills(${b.number ?? b.name}) に description 無し`);
    }
  }
}

const missing = [];
for (let i = 1; i <= 57; i++) if (!ids.has(i)) missing.push(i);

console.log(`files: ${files.length} unique ids: ${ids.size}`);
console.log(`missing ids: ${missing.length ? missing.join(",") : "none"}`);
console.log(`bills total: ${billCount} / 議案なしセッション: ${noBills}`);
console.log(`errors: ${errors.length ? "\n" + errors.join("\n") : "none"}`);
process.exit(errors.length ? 1 : 0);
