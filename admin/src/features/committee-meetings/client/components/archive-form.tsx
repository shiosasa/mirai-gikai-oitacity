"use client";

import type { Database } from "@mirai-gikai/supabase";
import {
  EditField,
  SelectField,
} from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import {
  archiveInput,
  archiveTopicInput,
} from "@/features/content-management/shared/utils/content-input";
import {
  saveArchive,
  saveArchiveTopic,
} from "../../server/actions/save-archive";

type Meeting = Database["public"]["Tables"]["committee_meetings"]["Row"];
type Topic = Database["public"]["Tables"]["committee_meeting_topics"]["Row"];

export function ArchiveForm({ meeting }: { meeting: Meeting }) {
  return (
    <SaveForm
      label="会議要約・公開状態を保存"
      confirmMessage="会議要約と公開状態を保存します。公開状態を選ぶとアーカイブに掲載されます。原文と要約を確認済みですか？"
      save={async (data) => {
        await saveArchive(
          meeting.id,
          archiveInput.parse(Object.fromEntries(data))
        );
      }}
    >
      <EditField
        name="summary"
        label="会議全体の要約"
        value={meeting.summary}
        multiline
      />
      <SelectField
        name="publish_status"
        label="公開状態"
        value={meeting.publish_status}
        options={[
          { value: "draft", label: "下書き" },
          { value: "published", label: "公開" },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        議題は下の各フォームで個別に保存します。全議題を確認してから公開してください。
      </p>
    </SaveForm>
  );
}

export function ArchiveTopicForm({ topic }: { topic: Topic }) {
  return (
    <SaveForm
      label="この議題を保存"
      confirmMessage="この議題だけを保存します。公開中ならすぐ反映されます。原文・発言者との対応を確認済みですか？"
      save={async (data) => {
        await saveArchiveTopic(
          topic.meeting_id,
          topic.id,
          archiveTopicInput.parse(Object.fromEntries(data))
        );
      }}
    >
      <EditField name="title" label="議題名" value={topic.title} required />
      <EditField
        name="summary"
        label="市民向け要約"
        value={topic.summary}
        multiline
      />
      <EditField
        name="discussion_summary"
        label="質疑の流れ"
        value={topic.discussion_summary}
        multiline
      />
      <p className="break-all text-sm text-muted-foreground">
        関連議案ID：{topic.bill_id ?? "未設定"} / 予算概要ID：
        {topic.budget_overview_id ?? "未設定"}
      </p>
      <p className="text-sm text-muted-foreground">
        出典発言範囲：{topic.start_voice_no ?? "未設定"} 〜{" "}
        {topic.end_voice_no ?? "未設定"}
        。連携・発言範囲の変更と原文取り込みは従来の運用で行います。
      </p>
    </SaveForm>
  );
}
