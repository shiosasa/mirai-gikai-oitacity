import { MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import {
  stanceLabels,
  stanceTextColors,
} from "@/features/interview-report/shared/constants";
import { NewPostBadge } from "@/features/new-posts/client/components/new-post-provider";
import { cn } from "@/lib/utils";
import type { TopicVoice } from "../../../shared/types";

export function TopicVoicesSection({
  articleId,
  voices,
}: {
  articleId: string;
  voices: TopicVoice[];
}) {
  if (voices.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 pt-4 space-y-3">
      <h4 className="flex items-center gap-1.5 text-sm font-bold text-mirai-text">
        <MessageSquareQuote className="size-4 text-oita-pink" />
        みんなの生の声
        <NewPostBadge contentType="bill_articles" contentId={articleId} />
      </h4>
      <ul className="space-y-3">
        {voices.map((voice) => (
          <li
            key={voice.reportId}
            className="rounded-lg border border-mirai-border bg-oita-pink-light/40 p-3 space-y-2"
          >
            {(voice.municipalityConnectionLabel ||
              voice.roleLabel ||
              voice.stance) && (
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-mirai-text-secondary">
                {voice.municipalityConnectionLabel && (
                  <span>{voice.municipalityConnectionLabel}</span>
                )}
                {voice.roleLabel && <span>{voice.roleLabel}</span>}
                {voice.stance && stanceLabels[voice.stance] && (
                  <span
                    className={cn(
                      "font-semibold",
                      stanceTextColors[voice.stance]
                    )}
                  >
                    {stanceLabels[voice.stance]}
                  </span>
                )}
              </p>
            )}
            <p className="text-sm leading-relaxed text-mirai-text line-clamp-4">
              {voice.summary}
            </p>
            <Link
              href={`/report/${voice.reportId}`}
              className="inline-block text-xs font-semibold text-oita-pink hover:underline"
            >
              インタビューレポートを読む →
            </Link>
            <NewPostBadge
              contentType="topic_voice"
              contentId={voice.reportId}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
