import Image from "next/image";

type OitaPhoto =
  | "river-koinobori"
  | "wisteria-bridge"
  | "shopping-arcade"
  | "station-rooster"
  | "yumeiro-festival"
  | "sorin-statue";

export function OitaPhotoBackground({
  photo,
  tone = "white",
}: {
  photo: OitaPhoto;
  tone?: "white" | "pink";
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] ${
        tone === "pink"
          ? "bg-gradient-to-br from-oita-pink-light to-oita-pink-accent"
          : "bg-white"
      }`}
    >
      <div className="absolute inset-y-0 right-0 w-2/3 sm:w-1/2">
        <Image
          src={`/img/oita/${photo}.webp`}
          alt=""
          fill
          sizes="(max-width: 640px) 65vw, 450px"
          className={
            photo === "sorin-statue" ||
            photo === "station-rooster" ||
            photo === "yumeiro-festival"
              ? "object-contain object-right opacity-40"
              : "object-cover object-center opacity-20"
          }
        />
        <div
          className={
            tone === "pink"
              ? "absolute inset-0 bg-gradient-to-r from-oita-pink-light to-oita-pink-light/10"
              : "absolute inset-0 bg-gradient-to-r from-white to-white/10"
          }
        />
      </div>
    </div>
  );
}
