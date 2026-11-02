"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";

function CheckListItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Image
        src="/icons/check-circle.svg"
        alt=""
        width={20}
        height={20}
        className="flex-shrink-0 mt-1"
      />
      <p className="text-sm font-medium leading-relaxed">{children}</p>
    </div>
  );
}

export function InterviewPublicationDisclosure() {
  return (
    <div className="space-y-4">
      <CheckListItem>
        公開を許可すると、今後{siteConfig.siteName}
        にあなたの意見の要約や市とのつながり・賛否などが掲載されることがあります。
      </CheckListItem>
      <CheckListItem>
        会話ログは入力した内容を含めて全文公開されます。記事に採用される前でも、URLを知っている人が閲覧できます。
      </CheckListItem>
      <CheckListItem>
        氏名や住所など、個人を特定できる情報が含まれる場合は、非公開をお選びください。
      </CheckListItem>
    </div>
  );
}
