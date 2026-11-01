import { getHttpUrl } from "./external-url";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube-nocookie.com",
]);

export function extractYouTubeId(
  value: string | null | undefined
): string | null {
  const safeUrl = getHttpUrl(value);
  if (!safeUrl) return null;

  const url = new URL(safeUrl);
  const path = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;

  if (url.hostname === "youtu.be" && path.length === 1) {
    id = path[0];
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else if (path[0] === "embed" && path.length === 2) {
      id = path[1];
    }
  }

  return id && /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
}
