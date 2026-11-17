"use client";

import { SaveForm } from "@/features/content-management/client/components/save-form";
import { saveTopicContentAction } from "../../server/actions/save-topic-content";
import type { TopicEditInput } from "../../shared/utils/topic-edit";
import type { TopicSourceOption } from "../../shared/utils/topic-sources";
import { TopicEditFields } from "./topic-edit-fields";

export function TopicEditForm({
  initial,
  sources,
}: {
  initial: TopicEditInput;
  sources: TopicSourceOption[];
}) {
  return (
    <SaveForm
      key={initial.expected_updated_at}
      save={saveTopicContentAction}
      confirmMessage="記事の内容を保存します。公開中の記事は公開サイトにも反映されます。内容・出典を確認しましたか？"
      label="記事の内容を保存する"
    >
      <TopicEditFields initial={initial} sources={sources} />
    </SaveForm>
  );
}
