import {
  ExternalLink,
  Landmark,
  MapPin,
  TreePine,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { OitaPhotoBackground } from "@/components/layouts/oita-photo-background";

export function OitaCityIntroduction() {
  return (
    <section
      aria-labelledby="oita-city-heading"
      className="my-10 space-y-6 rounded-2xl border border-oita-pink-accent bg-oita-pink-light p-5 sm:p-8"
    >
      <div className="relative isolate overflow-hidden rounded-xl p-4 space-y-3">
        <OitaPhotoBackground photo="river-koinobori" />
        <p className="text-sm font-bold text-primary-accent">このまちのこと</p>
        <h2
          id="oita-city-heading"
          className="text-2xl font-bold text-mirai-text sm:text-3xl"
        >
          大分市って、どんなまち？
        </h2>
        <p className="text-sm leading-relaxed text-mirai-text-secondary sm:text-base">
          海も、川も、山も身近にある大分市。別府湾に面し、大分川・大野川が流れ、
          緑豊かな山々に囲まれています。大友宗麟の時代には海外との交流が盛んになり、
          府内のまちに歴史と文化が育まれました。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-white p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-mirai-text">
            <Image
              src="/illustrations/sazanka.svg"
              alt=""
              width={44}
              height={40}
              className="h-10 w-11 shrink-0"
            />
            市の花・さざんか
          </h3>
          <p className="text-sm leading-relaxed text-mirai-text-secondary">
            大分市の市花は「サザンカ」です。1973年（昭和48年）9月1日に制定されました。
            大分市への親しみを込めて、このサイトのシンボルとしてもこの花を使っています。
          </p>
          <Link
            href="https://www.city.oita.oita.jp/o001/shisejoho/annai/1118199188920.html"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent underline underline-offset-4"
          >
            市の花を詳しく知る（大分市公式）
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-mirai-text">
            <TreePine
              aria-hidden="true"
              className="size-6 shrink-0 text-primary-accent"
            />
            市の木・ホルトノキ
          </h3>
          <p className="text-sm leading-relaxed text-mirai-text-secondary">
            市木は「ホルトノキ」です。市花と同じ1973年9月1日に制定され、
            大分市の発展を象徴する木として選ばれています。
          </p>
          <Link
            href="https://www.city.oita.oita.jp/o001/shisejoho/annai/1118206495123.html"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent underline underline-offset-4"
          >
            市の木を詳しく知る（大分市公式）
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </div>
      </div>

      <div className="relative isolate overflow-hidden space-y-4 rounded-xl p-5">
        <OitaPhotoBackground photo="yumeiro-performance" />
        <h3 className="flex items-center gap-2 text-lg font-bold text-mirai-text">
          <MapPin
            aria-hidden="true"
            className="size-6 shrink-0 text-primary-accent"
          />
          大分市を楽しむ
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-semibold text-mirai-text">
              <Landmark aria-hidden="true" className="size-5 shrink-0" />
              自然と歴史に出会う
            </h4>
            <p className="text-sm leading-relaxed text-mirai-text-secondary">
              野生のニホンザルに出会える高崎山自然動物園、海の生きものを楽しめる
              「うみたまご」、まちなかで歴史を感じる府内城など、さまざまな見どころがあります。
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-semibold text-mirai-text">
              <Utensils aria-hidden="true" className="size-5 shrink-0" />
              大分ならではの味
            </h4>
            <p className="text-sm leading-relaxed text-mirai-text-secondary">
              佐賀関の関あじ・関さば、とり天や鶏めしなど、海と山の恵みを味わえるのも
              大分市の魅力です。
            </p>
          </div>
        </div>
        <Link
          href="https://www.oishiimati-oita.jp/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent underline underline-offset-4"
        >
          観光・グルメを探す（おおいた市観光ナビ）
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-mirai-text-secondary">
        大分市公式サイト・おおいた市観光ナビの情報をもとに紹介しています。
        施設の営業日・料金などは、各施設の最新情報をご確認ください。
        <Link
          href="https://www.city.oita.oita.jp/o029/shisejoho/annai/1269431035754.html"
          className="ml-1 font-semibold underline underline-offset-4"
        >
          大分市のあらまし（公式）
        </Link>
      </p>
    </section>
  );
}
