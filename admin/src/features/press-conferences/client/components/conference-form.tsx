"use client";

import type { Database } from "@mirai-gikai/supabase";
import { useRouter } from "next/navigation";
import {
  EditField,
  SelectField,
} from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import { conferenceInput } from "@/features/content-management/shared/utils/content-input";
import { saveConference } from "../../server/actions/save-conference";
import { statusOptions } from "../../shared/conference-options";

type Conference = Database["public"]["Tables"]["press_conferences"]["Row"];

export function ConferenceForm({ conference }: { conference?: Conference }) {
  const router = useRouter();
  return (
    <SaveForm
      label={
        conference ? "基本情報・公開状態を保存" : "下書きを作成して項目を追加"
      }
      confirmMessage="基本情報と公開状態を保存します。公開を選ぶと市長紹介・会見ページに掲載されます。既存のURL識別名を変えるとリンクが変わります。内容を確認しましたか？"
      save={async (data) => {
        const id = await saveConference(
          conference?.id ?? null,
          conferenceInput.parse(Object.fromEntries(data))
        );
        if (!conference) router.push(`/press-conferences/${id}/edit`);
      }}
    >
      <EditField
        name="title"
        label="会見タイトル"
        value={conference?.title}
        required
      />
      <EditField
        name="slug"
        label="URL識別名"
        value={conference?.slug}
        required
        hint="半角英小文字・数字・ハイフン。例：2026-11-03。既存の値を変えると公開URLが変わります。"
      />
      <EditField
        name="held_at"
        label="開催日"
        type="date"
        value={conference?.held_at}
        required
      />
      <EditField
        name="youtube_url"
        label="YouTube動画URL"
        type="url"
        value={conference?.youtube_url}
        hint="watch?v=、youtu.be、埋め込みURLに対応。/live/形式は動画を確認しwatch?v=形式に直してください。"
      />
      {conference ? (
        <SelectField
          name="status"
          label="公開状態"
          value={conference.status}
          options={statusOptions}
        />
      ) : (
        <input name="status" type="hidden" value="draft" />
      )}
      <p className="text-sm text-muted-foreground">
        発表・質疑と発言は、基本情報とは別に保存します。編集中は下書きにし、全項目の保存・確認後に公開してください。
      </p>
    </SaveForm>
  );
}
