import { ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";

export function PoliticiansBanner() {
  return (
    <Link
      href="/politicians"
      className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-4 hover:border-primary transition-colors"
    >
      <div className="flex items-start gap-3">
        <User className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-mirai-text">議員紹介</p>
          <p className="mt-0.5 text-sm text-mirai-text-secondary">
            {siteConfig.councilName}の議員を紹介します
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-mirai-text-muted shrink-0" />
    </Link>
  );
}
