"use client";

import type { Database } from "@mirai-gikai/supabase";
import { useRouter } from "next/navigation";
import {
  EditField,
  SelectField,
} from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import { meetingInput } from "@/features/content-management/shared/utils/content-input";
import { saveMeeting } from "../../server/actions/save-minutes";

type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

export function MeetingForm({ meeting }: { meeting?: Meeting }) {
  const router = useRouter();
  return (
    <SaveForm
      confirmMessage="会議の基本情報を保存します。公開サイトにも反映されます。よろしいですか？"
      label={meeting ? "基本情報を保存" : "会議を追加"}
      save={async (data) => {
        const id = await saveMeeting(
          meeting?.id ?? null,
          meetingInput.parse(Object.fromEntries(data))
        );
        if (!meeting) router.push(`/minutes/${id}`);
      }}
    >
      <EditField name="title" label="会議名" value={meeting?.title} required />
      <EditField
        name="term"
        label="会期"
        value={meeting?.term}
        required
        hint="例：令和8年第4回定例会。議案・出席者のリンクの対応にも使います。"
      />
      <EditField
        name="date"
        label="会議日"
        type="date"
        value={meeting?.date}
        required
      />
      <SelectField
        name="meeting_type"
        label="区分"
        value={meeting?.meeting_type ?? "本会議"}
        options={[
          { value: "本会議", label: "本会議" },
          { value: "委員会", label: "委員会" },
        ]}
      />
    </SaveForm>
  );
}
