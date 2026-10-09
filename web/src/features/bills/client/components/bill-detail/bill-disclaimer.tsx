import { LinkButton } from "@/components/top/link-button";
import { siteConfig } from "@/config/site.config";

export function BillDisclaimer() {
  return (
    <div className="space-y-6 pt-4 pb-10">
      <LinkButton
        href="/faq"
        icon={{
          src: "/icons/question-bubble.svg",
          alt: "note",
          width: 22,
          height: 22,
        }}
      >
        よくある質問
      </LinkButton>
    </div>
  );
}
