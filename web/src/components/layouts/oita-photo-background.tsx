import Image from "next/image";

type OitaPhoto =
  | "city-hall-wide"
  | "river-koinobori"
  | "wisteria-bridge"
  | "shopping-arcade-tree"
  | "station-rooster-landscape"
  | "yumeiro-performance"
  | "sorin-statue-banner";

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
      <div
        className={
          photo === "yumeiro-performance"
            ? "absolute inset-0"
            : photo === "sorin-statue-banner"
              ? "absolute inset-y-0 right-0 w-1/2"
              : "absolute inset-y-0 right-0 w-2/3 sm:w-1/2"
        }
      >
        <Image
          src={`/img/oita/${photo}.webp`}
          alt=""
          fill
          sizes={
            photo === "yumeiro-performance"
              ? "(max-width: 1024px) 100vw, 1000px"
              : photo === "sorin-statue-banner"
                ? "(max-width: 1024px) 50vw, 500px"
                : "(max-width: 640px) 65vw, 450px"
          }
          className={
            photo === "city-hall-wide" || photo === "shopping-arcade-tree"
              ? "object-contain object-right opacity-20"
              : photo === "sorin-statue-banner"
                ? "object-cover object-right-top opacity-40"
                : photo === "station-rooster-landscape"
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
