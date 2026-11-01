import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Politician } from "../../shared/types/politician";
import { calculateAge } from "../../shared/utils/calculate-age";

type Props = {
  politician: Politician;
};

export function PoliticianDirectoryCard({ politician }: Props) {
  const age = calculateAge(politician.birth_date, new Date());

  return (
    <Card className="h-full rounded-md border-mirai-border bg-card shadow-none">
      <Link
        href={`/politicians/${politician.id}`}
        className="flex h-full gap-4 p-4 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Avatar className="size-16 shrink-0">
          <AvatarImage src={politician.image_url ?? undefined} alt="" />
          <AvatarFallback className="bg-oita-pink-light text-oita-pink">
            {politician.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs text-mirai-text-muted">
            {politician.name_kana}
          </p>
          <h4 className="mt-1 break-words font-bold text-mirai-text">
            {politician.name}
          </h4>
          <p className="mt-2 text-sm text-mirai-text-secondary">
            {politician.number != null ? `議席${politician.number}番・` : ""}
            当選{politician.election_count ?? 1}回
          </p>
          {age !== null && (
            <p className="mt-1 text-sm text-mirai-text-secondary">
              年齢：{age}歳
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
