import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateSpeechQuote } from "../packages/shared/src/politicians/speech-quote.ts";
import { identifySpeechSpeaker } from "../packages/shared/src/politicians/speech-speaker.ts";

export function parseArguments(args) {
  let samplePath;
  let write = false;
  for (const arg of args) {
    if (arg === "--write" && !write) {
      write = true;
    } else if (arg.startsWith("--file=") && !samplePath) {
      samplePath = arg.slice("--file=".length);
      if (!samplePath) throw new Error("--file に見本のJSONファイルを指定してください");
    } else {
      throw new Error("指定できる引数は --file=<JSONファイル> と --write です");
    }
  }
  if (!samplePath) throw new Error("--file に見本のJSONファイルを指定してください");
  return { samplePath, write };
}

function requireSamples(samples) {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error("見本のJSONに1件以上のデータを指定してください");
  }
}

function normalizeName(name) {
  return name.normalize("NFKC").replace(/[\s　]/gu, "");
}

export function validateSamples(samples, politicians, sessions) {
  requireSamples(samples);
  const ids = new Set();
  for (const sample of samples) {
    if (ids.has(sample.id)) throw new Error(`見本のIDが重複しています: ${sample.id}`);
    ids.add(sample.id);
    const politician = politicians.find((row) => row.id === sample.politician_id);
    const session = sessions.find((row) => row.id === sample.meeting_session_id);
    if (
      !politician ||
      normalizeName(politician.name) !== normalizeName(sample.politician_name)
    ) {
      throw new Error(`見本の議員を確認できません: ${sample.id}`);
    }
    if (
      !session ||
      session.meeting_id !== sample.meeting_id ||
      session.date !== sample.meeting_date ||
      session.meetings?.id !== sample.meeting_id ||
      session.meetings?.title !== sample.meeting_title ||
      session.meetings?.meeting_type !== sample.meeting_type
    ) {
      throw new Error(`見本の出典を確認できません: ${sample.id}`);
    }
    const quoteError = validateSpeechQuote(session.content, sample.quote);
    if (quoteError) throw new Error(`${sample.id}: ${quoteError}`);
    const speaker = identifySpeechSpeaker(
      session.content,
      sample.quote,
      politicians,
      session.attendees
    );
    if (speaker.kind !== "matched" || speaker.id !== sample.politician_id) {
      throw new Error(`見本の発言者を確認できません: ${sample.id}`);
    }
  }
}

function requireApprovedSamples(samples) {
  requireSamples(samples);
  if (samples.some((sample) => sample.approved !== true)) {
    throw new Error("未承認の見本が含まれています。内容の承認後に登録してください");
  }
}

export function planSampleInserts(samples, existing) {
  requireApprovedSamples(samples);
  return samples.flatMap((sample) => {
    const current = existing.find((row) => row.id === sample.id);
    if (current) {
      if (
        current.politician_id !== sample.politician_id ||
        current.meeting_session_id !== sample.meeting_session_id ||
        current.title !== sample.title ||
        current.quote !== sample.quote ||
        current.context !== sample.context
      ) {
        throw new Error(`編集済みの見本を上書きしません: ${sample.id}`);
      }
      return [];
    }
    return [
      {
        id: sample.id,
        politician_id: sample.politician_id,
        meeting_session_id: sample.meeting_session_id,
        title: sample.title,
        quote: sample.quote,
        context: sample.context,
        is_published: false,
      },
    ];
  });
}

async function main() {
  const { samplePath, write } = parseArguments(process.argv.slice(2));
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
  }
  const base = new URL(SUPABASE_URL);
  if (base.protocol !== "https:") throw new Error("本番DBにはHTTPSを使用してください");
  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const samples = JSON.parse(await readFile(samplePath, "utf8"));
  requireSamples(samples);
  if (write) requireApprovedSamples(samples);

  async function request(table, params, options = {}) {
    const url = new URL(`/rest/v1/${table}`, base);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    if (!response.ok) {
      throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  const sessionIds = [...new Set(samples.map((sample) => sample.meeting_session_id))];
  const [cityBills, politicians, sessions] = await Promise.all([
    request("bills", { select: "name", name: "like.*大分市*", limit: "1" }),
    request("politicians", { select: "id,name", name: "neq.欠番", limit: "1000" }),
    request("meeting_sessions", {
      select: "id,meeting_id,date,content,attendees,meetings(id,title,meeting_type)",
      id: `in.(${sessionIds.join(",")})`,
    }),
  ]);
  if (!cityBills.some((row) => row.name?.includes("大分市"))) {
    throw new Error("大分市版のDBであることを確認できません");
  }
  validateSamples(samples, politicians, sessions);
  console.log(`見本 ${samples.length} 件の議員・引用・出典を確認しました。`);

  if (!write) {
    console.log("確認のみ完了しました。DBへの書き込みは行っていません。");
    return;
  }

  const ids = samples.map((sample) => sample.id).join(",");
  const existing = await request("politician_speech_highlights", {
    select: "id,politician_id,meeting_session_id,title,quote,context,is_published",
    id: `in.(${ids})`,
  });
  const pending = planSampleInserts(samples, existing);
  if (pending.length > 0) {
    await request(
      "politician_speech_highlights",
      { on_conflict: "id", select: "id" },
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=representation",
        },
        body: JSON.stringify(pending),
      }
    );
  }
  const saved = await request("politician_speech_highlights", {
    select: "id,politician_id,meeting_session_id,title,quote,context,is_published",
    id: `in.(${ids})`,
  });
  if (planSampleInserts(samples, saved).length !== 0) {
    throw new Error("見本の登録結果を確認できませんでした");
  }
  console.log(
    `見本 ${samples.length} 件を確認しました。新規 ${pending.length} 件は下書きです。`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
