"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setTopicVoiceFeaturedAction } from "../../server/actions/set-topic-voice-featured";

export function TopicVoiceFeatureButton({
  reportId,
  featured,
  blocker,
}: {
  reportId: string;
  featured: boolean;
  blocker: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    const message = featured
      ? "この要約を記事の「生の声」から外しますか？"
      : "このインタビューの要約を記事の「生の声」として公開しますか？（サイト上の公開設定もオンになります）";
    if (!window.confirm(message)) return;
    setPending(true);
    try {
      const result = await setTopicVoiceFeaturedAction(reportId, !featured);
      if (!result.success) {
        toast.error(result.error ?? "更新できませんでした");
        return;
      }
      toast.success(featured ? "生の声から外しました" : "生の声に採用しました");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!featured && blocker) {
    return <p className="text-xs text-gray-500">{blocker}</p>;
  }

  return (
    <Button
      size="sm"
      variant={featured ? "outline" : "default"}
      onClick={handleClick}
      disabled={pending}
    >
      {pending
        ? "更新中…"
        : featured
          ? "掲載をやめる"
          : "この要約を生の声に採用"}
    </Button>
  );
}
