"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setTopicPublication } from "../../server/actions/set-topic-publication";
import type { TopicPublicationStatus } from "../../shared/utils/topic-publication";

export function TopicPublicationButton({
  id,
  status,
}: {
  id: string;
  status: TopicPublicationStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    const nextStatus = status === "draft" ? "published" : "draft";
    const message =
      nextStatus === "published"
        ? "この記事をサイトに公開しますか？初回公開時には今日の日付が記録されます。"
        : "この記事を下書きに戻し、サイトから非公開にしますか？";
    if (!window.confirm(message)) return;
    setPending(true);
    try {
      await setTopicPublication(id, nextStatus);
      toast.success(
        nextStatus === "published" ? "公開しました" : "下書きに戻しました"
      );
      router.refresh();
    } catch (error) {
      console.error("Topic publication failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "公開状態を更新できませんでした"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
      {pending ? "更新中…" : status === "draft" ? "公開する" : "下書きに戻す"}
    </Button>
  );
}
