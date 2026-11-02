"use client";

import type { Database } from "@mirai-gikai/supabase";
import { EditField } from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import { proposalInput } from "@/features/content-management/shared/utils/content-input";
import { saveProposal } from "../../server/actions/save-minutes";

type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

export function ProposalForm({ meeting }: { meeting: Meeting }) {
  return (
    <SaveForm
      confirmMessage="市長提案理由には下書き状態がありません。原文と要約・出典の対応を確認済みですか？保存すると公開サイトに反映されます。"
      save={async (data) => {
        await saveProposal(
          meeting.id,
          proposalInput.parse(Object.fromEntries(data))
        );
      }}
    >
      <EditField
        name="mayor_proposal_text"
        label="公式原文"
        value={meeting.mayor_proposal_text}
        multiline
        hint="原文が空でない会議だけが公開対象です。原文そのものは市長紹介ページには表示しません。"
      />
      <EditField
        name="mayor_proposal_summary"
        label="市民向け要約"
        value={meeting.mayor_proposal_summary}
        multiline
        hint="プレーンテキストの改行で表示します。Markdown記号は使わないでください。"
      />
      <EditField
        name="mayor_proposal_source_url"
        label="公式原文のURL"
        type="url"
        value={meeting.mayor_proposal_source_url}
      />
    </SaveForm>
  );
}
