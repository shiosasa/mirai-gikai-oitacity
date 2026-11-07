import {
  type HomepageContent,
  homepageDefaults,
} from "@mirai-gikai/shared/homepage/content";
import Image from "next/image";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";

export function Hero({
  content = homepageDefaults,
}: {
  content?: HomepageContent;
}) {
  return (
    <div className="relative w-full h-[80vh] min-h-[400px] md:h-[70vh]">
      <Image
        src={content.heroImage}
        unoptimized={content.heroImage.startsWith("https:")}
        alt={siteConfig.councilName}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-home-hero-base/85 via-home-hero-middle/60 to-home-hero-surface/25" />
      <div className="absolute bottom-[28vh] left-0 right-0 py-4">
        <Container>
          <div className="inline-flex items-center rounded-full border border-home-hero-border bg-home-hero-surface/80 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-home-hero-badge md:text-[11px]">
            {content.heroBadge}
          </div>
          <p className="mt-4 max-w-4xl font-bold text-2xl leading-[1.15] text-home-hero-title drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)] md:text-4xl md:leading-[1.1]">
            {content.heroTitle}
          </p>
          <p className="mt-2 text-lg font-semibold leading-relaxed text-home-hero-subtitle md:text-xl text-center">
            {content.heroSubtitle}
          </p>
        </Container>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-gentle">
        <div className="w-[1px] h-[34px] bg-home-hero-scroll/80" />
        <p className="mt-2 font-lexend text-[10px] leading-[20px] text-home-hero-scroll">
          Scroll
        </p>
      </div>
    </div>
  );
}
