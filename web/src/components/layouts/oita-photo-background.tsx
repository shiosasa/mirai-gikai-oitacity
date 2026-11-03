import Image from "next/image";

type OitaPhoto =
  | "river-koinobori"
  | "wisteria-bridge"
  | "shopping-arcade"
  | "station-rooster"
  | "sorin-statue";

export function OitaPhotoBackground({ photo }: { photo: OitaPhoto }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] bg-white"
    >
      <div className="absolute inset-y-0 right-0 w-2/3 sm:w-1/2">
        <Image
          src={`/img/oita/${photo}.webp`}
          alt=""
          fill
          sizes="(max-width: 640px) 65vw, 450px"
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white to-white/10" />
      </div>
    </div>
  );
}
