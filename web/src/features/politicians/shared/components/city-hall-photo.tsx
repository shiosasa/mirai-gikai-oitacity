import Image from "next/image";

export function CityHallPhoto() {
  return (
    <figure className="ml-auto mt-6 w-24 sm:w-28">
      <Image
        src="/img/oita/city-hall.webp"
        alt="青空の下に立つ大分市役所の庁舎"
        width={600}
        height={800}
        sizes="(max-width: 640px) 96px, 112px"
        loading="lazy"
        className="h-auto w-full rounded-xl"
      />
      <figcaption className="mt-2 text-center text-xs text-mirai-text-secondary">
        大分市役所
      </figcaption>
    </figure>
  );
}
