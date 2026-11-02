"use client";

import { ArrowRight } from "lucide-react";
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

interface InterviewPublicConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (isPublic: boolean) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function InterviewPublicConsentModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  submitError,
}: InterviewPublicConsentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto py-9">
        <DialogHeader>
          <p className="text-center text-primary-accent font-bold">
            あと少しです！
          </p>
          <DialogTitle className="text-[22px] font-bold text-center">
            公開設定
          </DialogTitle>
          <div className="h-[1px] bg-mirai-gradient mt-4" />
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-6 mt-6">
            <h3 className="text-lg font-bold text-primary-accent text-center leading-relaxed">
              インタビュー内容の公開を
              <br />
              許可しますか
            </h3>

            <InterviewPublicationDisclosure />

            <p className="text-sm text-black">
              非公開で提出した場合でも、ご意見は
              {formatPolicyReviewPhrase(siteConfig.managingParty)}
              に活用させていただきます。
            </p>
          </div>
        </DialogDescription>

        <div className="space-y-3 mt-6">
          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}
          <Button
            onClick={() => onSubmit(true)}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "送信中..." : "公開を許可して提出する"}
            {!isSubmitting && <ArrowRight className="ml-2 size-5" />}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onSubmit(false)}
            disabled={isSubmitting}
            className="w-full text-gray-500"
          >
            非公開で提出する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
