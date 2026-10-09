// トピックス記事と議事録の裏付け照合用データをエクスポートする
// 使い方: node --env-file=web/.env scripts/export-topic-refs-data.mjs
import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(import.meta.dirname, "topics-refs-work");
const SESSIONS_DIR = path.join(WORK_DIR, "sessions");
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

fs.mkdirSync(SESSIONS_DIR, { recursive: true });
fs.mkdirSync(path.join(WORK_DIR, "out"), { recursive: true });

// 記事（proposals 本文つき）
const articles = await fetchJson(
  "bill_articles?select=id,bill_id,proposal_id,title,category,decision_date," +
    "proposals(title,summary1,summary2,summary3,gikaiDetail,reason,point1,point2,point3,impact,pro,con)" +
    "&order=bill_id.asc"
);
fs.writeFileSync(
  path.join(WORK_DIR, "articles.json"),
  JSON.stringify(articles, null, 2)
);
console.log(`articles.json: ${articles.length} 件`);

// 会議メタ
const meetings = await fetchJson("meetings?select=id,title,meeting_type,term");
const meetingById = new Map(meetings.map((m) => [m.id, m]));

// セッション（content は個別ファイルに分離）
const sessions = await fetchJson(
  "meeting_sessions?select=id,meeting_id,session_title,date,bills,content&order=id.asc"
);
const meta = sessions.map((s) => {
  const meeting = meetingById.get(s.meeting_id);
  if (s.content) {
    fs.writeFileSync(path.join(SESSIONS_DIR, `s${s.id}.txt`), s.content);
  }
  return {
    session_id: s.id,
    meeting_id: s.meeting_id,
    meeting_title: meeting?.title ?? "",
    meeting_type: meeting?.meeting_type ?? "",
    term: meeting?.term ?? "",
    session_title: s.session_title ?? "",
    date: s.date ?? "",
    content_file: s.content ? `sessions/s${s.id}.txt` : null,
    content_chars: s.content?.length ?? 0,
    bills: s.bills ?? [],
  };
});
fs.writeFileSync(
  path.join(WORK_DIR, "sessions-meta.json"),
  JSON.stringify(meta, null, 2)
);
console.log(`sessions-meta.json: ${meta.length} 件`);
console.log(
  `content合計: ${meta.reduce((a, m) => a + m.content_chars, 0)} 文字`
);
