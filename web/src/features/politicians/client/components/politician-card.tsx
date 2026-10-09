"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Politician } from "@/features/politicians/shared/types/politician";

interface PoliticianCardProps {
  politician: Politician;
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
  return (
    <Card className="border border-mirai-border hover:border-primary transition-all duration-200 shadow-xs rounded-xl overflow-hidden bg-white">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-mirai-surface flex items-center justify-center shrink-0 border border-mirai-border">
          {politician.image_url ? (
            <Image
              src={politician.image_url}
              alt={politician.name}
              fill
              className="object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-mirai-text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-mirai-text-muted">
            {politician.name_kana}
          </p>
          <CardTitle className="text-lg font-bold text-mirai-text truncate">
            <Link
              href={`/politicians/${politician.id}`}
              className="hover:underline hover:text-primary transition-colors"
            >
              {politician.name}
            </Link>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {politician.faction && (
              <Badge
                variant="outline"
                className="text-xs border-primary/40 text-primary font-normal"
              >
                {politician.faction}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="text-xs bg-mirai-surface text-mirai-text font-normal"
            >
              {politician.election_count}期
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2 text-sm text-mirai-text-secondary">
        {politician.standing_committee && (
          <div className="text-xs text-mirai-text-muted">
            <span className="font-semibold text-mirai-text">常任委員会:</span>{" "}
            {politician.standing_committee}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
