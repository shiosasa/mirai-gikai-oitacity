"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteGeneralQuestionAction,
  toggleGeneralQuestionPublishAction,
} from "../../server/actions/general-question-actions";

export function GeneralQuestionRowActions({
  id,
  publishStatus,
  questionerName,
}: {
  id: string;
  publishStatus: string;
  questionerName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isPublished = publishStatus === "published";

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={isPublished ? "outline" : "default"}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleGeneralQuestionPublishAction(
              id,
              isPublished ? "draft" : "published"
            );
            router.refresh();
          })
        }
      >
        {isPublished ? "非公開にする" : "公開する"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={isPending}
        aria-label={`${questionerName}を削除`}
        onClick={() => {
          if (!window.confirm(`${questionerName}の一般質問を削除しますか？`)) {
            return;
          }
          startTransition(async () => {
            await deleteGeneralQuestionAction(id);
            router.refresh();
          });
        }}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
