import {
  type HomepageContent,
  homepageGuide,
} from "@mirai-gikai/shared/homepage/content";
import {
  ArrowRight,
  MessageSquare,
  Newspaper,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

const icons = {
  questions: MessageSquare,
  topics: Newspaper,
  committees: Users,
  politicians: User,
};

export function HomeCouncilHeading({ content }: { content: HomepageContent }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center rounded-full border border-oita-pink-accent bg-oita-pink-light px-3 py-1 text-[10px] font-bold text-oita-pink">
        {content.councilBadge}
      </span>
      <h2 className="text-2xl font-bold text-mirai-text md:text-3xl">
        {content.councilTitle}
      </h2>
    </div>
  );
}

export function HomeGuideBanner({
  content,
  kind,
  sessionSlug,
}: {
  content: HomepageContent;
  kind: keyof typeof icons;
  sessionSlug?: string;
}) {
  const guide = homepageGuide(content, kind, sessionSlug);
  const Icon = icons[kind];
  if (!guide.url) return null;
  return (
    <Link
      href={guide.url}
      className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-4 hover:border-primary transition-colors"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-mirai-text">{guide.title}</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-mirai-text-secondary">
            {guide.description}
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-mirai-text-muted shrink-0" />
    </Link>
  );
}
