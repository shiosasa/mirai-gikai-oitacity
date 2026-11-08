import {
  type HomepageContent,
  homepageDefaults,
} from "@mirai-gikai/shared/homepage/content";
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

export function OitaCityIntroduction({
  content = homepageDefaults,
}: {
  content?: HomepageContent;
}) {
  return (
    <section
      aria-labelledby="oita-city-heading"
      className="my-10 space-y-6 rounded-2xl border border-oita-pink-accent bg-oita-pink-light p-5 sm:p-8"
    >
      <div className="relative isolate overflow-hidden rounded-xl p-4 space-y-3">
        <OitaPhotoBackground
          photo="river-koinobori"
          imageUrl={content.cityImage}
        />
        <p className="text-sm font-bold text-primary-accent">
          {content.cityBadge}
        </p>
        <h2
          id="oita-city-heading"
          className="text-balance text-xl font-bold text-mirai-text sm:text-3xl"
        >
          {content.cityTitle}
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-mirai-text-secondary sm:text-base">
          {content.cityDescription}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-white p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-mirai-text">
            <Image
              src={content.flowerImage}
              unoptimized={content.flowerImage.startsWith("https:")}
              alt=""
              width={44}
              height={40}
              className="h-10 w-11 shrink-0"
            />
            {content.flowerTitle}
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-mirai-text-secondary">
            {content.flowerDescription}
          </p>
          <Link
            href={content.flowerUrl}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent underline underline-offset-4"
          >
            {content.flowerLinkLabel}
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-mirai-text">
            <TreePine
              aria-hidden="true"
              className="size-6 shrink-0 text-primary-accent"
            />
            {content.treeTitle}
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-mirai-text-secondary">
            {content.treeDescription}
          </p>
          <Link
            href={content.treeUrl}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent underline underline-offset-4"
          >
            {content.treeLinkLabel}
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </div>
      </div>

      <div className="relative isolate overflow-hidden space-y-4 rounded-xl p-5">
        <OitaPhotoBackground
          photo="yumeiro-performance"
          imageUrl={content.tourismImage}
        />
        <h3 className="flex items-center gap-2 text-lg font-bold text-mirai-text">
          <MapPin
            aria-hidden="true"
            className="size-6 shrink-0 text-primary-accent"
          />
          {content.tourismTitle}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-semibold text-mirai-text">
              <Landmark aria-hidden="true" className="size-5 shrink-0" />
              {content.natureTitle}
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-mirai-text-secondary">
              {content.natureDescription}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-semibold text-mirai-text">
              <Utensils aria-hidden="true" className="size-5 shrink-0" />
              {content.foodTitle}
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-mirai-text-secondary">
              {content.foodDescription}
            </p>
          </div>
        </div>
        <Link
          href={content.tourismUrl}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent underline underline-offset-4"
        >
          {content.tourismLinkLabel}
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-mirai-text-secondary">
        大分市公式サイト・おおいた市観光ナビの情報をもとに紹介しています。
        施設の営業日・料金などは、各施設の最新情報をご確認ください。
        <Link
          href={content.citySourceUrl}
          className="ml-1 font-semibold underline underline-offset-4"
        >
          {content.citySourceLabel}
        </Link>
      </p>
    </section>
  );
}
