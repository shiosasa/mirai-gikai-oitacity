"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Globe, Mail, ExternalLink, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Politician } from "@/features/politicians/shared/types/politician";

interface PoliticianProfileProps {
  politician: Politician;
}

export function PoliticianProfile({ politician }: PoliticianProfileProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/politicians"
        className="inline-flex items-center gap-1 text-sm text-mirai-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        議員一覧へ戻る
      </Link>

      <div className="bg-white border border-mirai-border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-mirai-surface flex items-center justify-center shrink-0 border-2 border-primary/20">
            {politician.image_url ? (
              <Image
                src={politician.image_url}
                alt={politician.name}
                fill
                className="object-cover"
              />
            ) : (
              <User className="w-14 h-14 text-mirai-text-muted" />
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <p className="text-xs text-mirai-text-muted">
              {politician.name_kana}
            </p>
            <h1 className="text-2xl font-bold text-mirai-text">
              {politician.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {politician.faction && (
                <Badge
                  variant="outline"
                  className="border-primary/40 text-primary font-medium"
                >
                  {politician.faction}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="bg-mirai-surface text-mirai-text font-medium"
              >
                当選 {politician.election_count ?? 1} 期
              </Badge>
            </div>
          </div>
        </div>

        {/* 詳細情報グリッド */}
        <div className="space-y-4 pt-4 border-t border-mirai-border">
          {(politician.standing_committee || politician.special_committee) && (
            <div>
              <h3 className="text-xs font-semibold text-mirai-text-muted mb-2">
                所属委員会
              </h3>
              <div className="flex flex-wrap gap-2">
                {politician.standing_committee && (
                  <Badge
                    variant="outline"
                    className="bg-mirai-surface/50 border-mirai-border text-mirai-text"
                  >
                    {politician.standing_committee}
                  </Badge>
                )}
                {politician.special_committee && (
                  <Badge
                    variant="outline"
                    className="bg-mirai-surface/50 border-mirai-border text-mirai-text"
                  >
                    {politician.special_committee}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 連絡先・関連リンク */}
          <div>
            <h3 className="text-xs font-semibold text-mirai-text-muted mb-2">
              関連リンク・連絡先
            </h3>
            <div className="flex flex-wrap gap-3">
              {politician.homepage && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs"
                >
                  <a
                    href={politician.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    公式サイト
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
              {politician.contact && (
                <div className="flex items-center gap-1.5 text-xs text-mirai-text-secondary bg-mirai-surface px-3 py-1.5 rounded-md border border-mirai-border">
                  <Mail className="w-3.5 h-3.5 text-mirai-text-muted" />
                  <span className="font-mono">{politician.contact}</span>
                </div>
              )}
            </div>
          </div>

          {politician.address && (
            <div>
              <h3 className="text-xs font-semibold text-mirai-text-muted mb-2">
                住所
              </h3>
              <p className="text-sm text-mirai-text">{politician.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
