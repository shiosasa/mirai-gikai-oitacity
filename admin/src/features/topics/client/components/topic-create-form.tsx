"use client";

import { useRouter } from "next/navigation";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import { createTopicContentAction } from "../../server/actions/save-topic-content";
import { getEmptyTopicValues } from "../../shared/utils/topic-edit";
import type { TopicSourceOption } from "../../shared/utils/topic-sources";
import { TopicEditFields } from "./topic-edit-fields";

export function TopicCreateForm({ sources }: { sources: TopicSourceOption[] }) {
  const router = useRouter();
  return (
    <SaveForm
      label="下書きの記事を追加"
      confirmMessage="記事と出典を確認しましたか？下書きとして追加します。この操作だけでは公開しません。"
      save={async (data) => {
        const id = await createTopicContentAction(data);
        router.push(`/topics/${id}/edit`);
      }}
    >
      <TopicEditFields initial={getEmptyTopicValues()} sources={sources} />
    </SaveForm>
  );
}
