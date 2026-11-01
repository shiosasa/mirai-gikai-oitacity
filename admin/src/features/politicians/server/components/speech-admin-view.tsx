import "server-only";
import { getPoliticianSpeechMode } from "@mirai-gikai/shared/politicians/speech-mode";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { env } from "@/lib/env";
import { SpeechManagerClient } from "../../client/components/speech-manager-client";
import { buildSpeechSessionOptions } from "../../shared/utils/speech-session-options";
import {
  findSpeechHighlightsForAdmin,
  findSpeechPoliticians,
  findSpeechSessions,
} from "../repositories/speech-highlight-repository";

export async function SpeechAdminView() {
  await requireAdmin();
  const mode = getPoliticianSpeechMode(process.env);
  if (mode !== "database") {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">議員の発言管理</h1>
        <p>発言管理は準備中です。DBの設定後に利用できます。</p>
        {mode === "preview" && (
          <p>公開ページには、掲載前の見本を表示しています。</p>
        )}
      </section>
    );
  }

  const [entries, politicians, rows] = await Promise.all([
    findSpeechHighlightsForAdmin(),
    findSpeechPoliticians(),
    findSpeechSessions(),
  ]);
  const { sessions, invalidIds } = buildSpeechSessionOptions(rows);
  if (invalidIds.length > 0) {
    console.warn("会議情報が不完全な議事録があります", { ids: invalidIds });
  }
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">議員の発言管理</h1>
      {invalidIds.length > 0 && (
        <p className="text-sm text-destructive">
          会議情報を確認できない議事録が{invalidIds.length}
          件あるため、選択肢に表示していません。
        </p>
      )}
      <SpeechManagerClient
        entries={entries}
        politicians={politicians}
        sessions={sessions}
        webUrl={env.webUrl}
      />
    </section>
  );
}
