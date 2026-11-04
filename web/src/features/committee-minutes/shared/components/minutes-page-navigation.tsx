import { ArrowLeft, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  backHref: string;
  backLabel: string;
};

export function MinutesPageNavigation({ backHref, backLabel }: Props) {
  return (
    <nav
      aria-label="議事録を読み終えた後の移動"
      className="mt-8 flex flex-wrap justify-center gap-3 border-t border-mirai-border pt-6"
    >
      <Button asChild variant="outline">
        <Link href={backHref}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
      </Button>
      <Button asChild variant="outline">
        <a href="#minutes-page-top">
          <ArrowUp aria-hidden="true" className="size-4" />
          ページ上部へ
        </a>
      </Button>
    </nav>
  );
}
