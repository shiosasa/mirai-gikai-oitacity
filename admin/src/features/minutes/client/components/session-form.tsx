"use client";

import type { Database } from "@mirai-gikai/supabase";
import { useRouter } from "next/navigation";
import { EditField } from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import {
  sessionInput,
  sessionMetadataInput,
} from "@/features/content-management/shared/utils/content-input";
import { saveSession } from "../../server/actions/save-minutes";
import { SessionMetadata } from "./session-metadata";

type Session = Database["public"]["Tables"]["meeting_sessions"]["Row"];

export function SessionForm({
  meetingId,
  session,
}: {
  meetingId: number;
  session?: Session;
}) {
  const router = useRouter();
  const metadata = sessionMetadataInput.safeParse({
    attendees: session?.attendees ?? null,
    bills: session?.bills ?? null,
  });
  if (!metadata.success) {
    return (
      <p role="alert" className="text-destructive">
        出席者・議案データの形式を確認できませんでした。既存情報を失わないよう編集を停止しています。データの形式を確認してください。
      </p>
    );
  }
  return (
    <SaveForm
      label={session ? "議事録を保存" : "開催日と議事録を追加"}
      confirmMessage="この議事録には下書き状態がありません。原文・発言者・数字・議案との対応を確認済みですか？保存すると公開サイトに反映されます。"
      save={async (data) => {
        const rawMetadata = data.get("metadata");
        if (typeof rawMetadata !== "string")
          throw new Error("出席者・議案を読み取れませんでした");
        const input = sessionInput.parse({
          ...Object.fromEntries(data),
          ...sessionMetadataInput.parse(JSON.parse(rawMetadata)),
        });
        const id = await saveSession(meetingId, session?.id ?? null, input);
        if (!session) router.push(`/minutes/${meetingId}/sessions/${id}`);
      }}
    >
      <EditField
        name="session_title"
        label="開催日の見出し"
        value={session?.session_title}
        required
      />
      <EditField
        name="date"
        label="開催日"
        type="date"
        value={session?.date}
        required
      />
      <EditField
        name="summary"
        label="やさしい要約"
        value={session?.summary}
        multiline
      />
      <EditField
        name="detailed_summary"
        label="詳細な要約"
        value={session?.detailed_summary}
        multiline
        hint="未登録なら、公開画面ではやさしい要約を残して準備中と表示します。"
      />
      <EditField
        name="decisions"
        label="決定事項"
        value={session?.decisions}
        multiline
      />
      <SessionMetadata initial={metadata.data} />
      <EditField
        name="content"
        label="詳細議事録（原文）"
        value={session?.content}
        multiline
        hint="原文の意味は変えず、段落などの整形に留めてください。空なら公開画面では更新中と表示されます。"
      />
    </SaveForm>
  );
}
