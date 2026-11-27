import { BookOpen, Globe, Share2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Politician } from "../../shared/types/politician";
import { calculateAge } from "../../shared/utils/calculate-age";
import { collectPoliticianLinks } from "../../shared/utils/politician-links";

type Props = {
  politician: Politician;
};

export function PoliticianDirectoryCard({ politician }: Props) {
  const age = calculateAge(politician.birth_date, new Date());
  const links = collectPoliticianLinks({
    homepage: politician.homepage,
    blog_url: politician.blog_url,
    sns_links: politician.sns_links,
  });
  const hasHomepage = links.some((link) => link.platform === "homepage");
  const hasBlog = links.some(
    (link) => link.platform === "blog" || link.platform === "note"
  );
  const hasSns = links.some(
    (link) =>
      link.platform !== "homepage" &&
      link.platform !== "blog" &&
      link.platform !== "note"
  );

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
          {links.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {hasHomepage && (
                <span
                  title="公式HP"
                  className="inline-flex items-center gap-1 rounded-full bg-oita-pink-light px-2 py-0.5 text-xs font-medium text-oita-pink"
                >
                  <Globe aria-hidden="true" className="size-3" />
                  HP
                </span>
              )}
              {hasBlog && (
                <span
                  title="ブログ・note"
                  className="inline-flex items-center gap-1 rounded-full bg-oita-pink-light px-2 py-0.5 text-xs font-medium text-oita-pink"
                >
                  <BookOpen aria-hidden="true" className="size-3" />
                  ブログ
                </span>
              )}
              {hasSns && (
                <span
                  title="SNS"
                  className="inline-flex items-center gap-1 rounded-full bg-oita-pink-light px-2 py-0.5 text-xs font-medium text-oita-pink"
                >
                  <Share2 aria-hidden="true" className="size-3" />
                  SNS
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
