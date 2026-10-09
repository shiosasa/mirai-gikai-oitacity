import Image from "next/image";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";

export function Hero() {
  return (
    <div className="relative w-full h-[80vh] min-h-[400px] md:h-[70vh]">
      <Image
        src="/img/hero_background_pastel.png"
        alt={siteConfig.councilName}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#f7dfe8]/85 via-[#f9e8ee]/60 to-[#fffafc]/25" />
      <div className="absolute bottom-[28vh] left-0 right-0 py-4">
        <Container>
          <div className="inline-flex items-center rounded-full border border-[#f3bfd3] bg-[#fffafc]/80 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#8a496b] md:text-[11px]">
            大分の暮らしとつながる議会情報
          </div>
          <p className="mt-4 max-w-4xl font-bold text-2xl leading-[1.15] text-[#5a2d3f] drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)] md:text-4xl md:leading-[1.1]">
            「おおいたん市議会、いま何しよん？」
          </p>
          {/* ↓ ここに text-center を追加したよ！ */}
          <p className="mt-2 text-lg font-semibold leading-relaxed text-[#7f3d5a] md:text-xl text-center">
            むずかしい議会をわかりやすく。
          </p>
        </Container>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-gentle">
        <div className="w-[1px] h-[34px] bg-[#7a4f62]/80" />
        <p className="mt-2 font-lexend text-[10px] leading-[20px] text-[#7a4f62]">
          Scroll
        </p>
      </div>
    </div>
  );
}
