import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getHttpUrl } from "@/lib/utils/external-url";
import type { MayorProfile } from "../../shared/types/mayor";
import { MayorPolicyPillars } from "./mayor-policy-pillars";

type Props = {
  mayor: MayorProfile | null;
};

export function MayorDirectoryCard({ mayor }: Props) {
  const mayorName = mayor?.name?.trim();

  return (
    <Card className="rounded-md border-mirai-border bg-card shadow-none">
      <Link
        href="/politicians/mayor"
        aria-label={
          mayorName
            ? `${mayorName}のプロフィールを見る`
            : "市長プロフィールを見る"
        }
        className="block p-5 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:p-6"
      >
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <Avatar className="size-36 shrink-0 sm:size-48">
            <AvatarImage
              src={getHttpUrl(mayor?.image_url) ?? undefined}
              alt=""
            />
            <AvatarFallback className="bg-oita-pink-light text-2xl text-mirai-text">
              {mayorName?.slice(0, 1) ?? "市"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {mayor?.name_kana && (
              <p className="text-xs text-mirai-text-secondary">
                {mayor.name_kana}
              </p>
            )}
            <h3 className="mt-1 break-words text-xl font-bold text-mirai-text">
              {mayorName || "市長プロフィール"}
            </h3>
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-accent">
              プロフィールを見る
              <ArrowRight aria-hidden="true" className="size-4" />
            </p>
          </div>
        </div>
        <MayorPolicyPillars bio={mayor?.bio ?? null} />
      </Link>
    </Card>
  );
}
