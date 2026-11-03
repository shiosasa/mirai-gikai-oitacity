import Image from "next/image";

export function CityHallPhoto() {
  return (
    <figure className="mx-auto mb-8 w-40 sm:w-48">
      <Image
        src="/img/oita/city-hall.webp"
        alt="青空の下に立つ大分市役所の庁舎"
        width={600}
        height={800}
        sizes="(max-width: 640px) 160px, 192px"
        className="h-auto w-full rounded-xl"
      />
      <figcaption className="mt-2 text-center text-xs text-mirai-text-secondary">
        大分市役所
      </figcaption>
    </figure>
  );
}
