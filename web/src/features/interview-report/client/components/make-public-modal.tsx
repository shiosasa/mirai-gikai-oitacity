"use client";

import { ArrowRight, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config/site.config";
import { formatPolicyReviewPhrase } from "@/lib/utils/party-text";
import { InterviewPublicationDisclosure } from "./interview-publication-disclosure";

interface MakePublicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function MakePublicModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: MakePublicModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto py-9">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary-accent text-center leading-relaxed">
            インタビュー内容を
            <br />
            公開に切り替えますか？
          </DialogTitle>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4 mt-6">
            <InterviewPublicationDisclosure />
            <p className="text-sm text-black">
              非公開で提出した場合でも、ご意見は
              {siteConfig.managingParty
                ? `${formatPolicyReviewPhrase(siteConfig.managingParty, "での")}に`
                : "市政への提言などに"}
              活用させていただきます。
            </p>
          </div>
        </DialogDescription>

        <div className="space-y-3 mt-6">
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full"
          >
            <LockOpen className="mr-2 size-5" />
            {isSubmitting ? "変更中..." : "公開にする"}
            {!isSubmitting && <ArrowRight className="ml-2 size-5" />}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full text-gray-500"
          >
            非公開のまま戻る
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
