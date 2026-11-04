const LOCAL_WEB_URL = "http://localhost:3000";
const PRODUCTION_WEB_URL = "https://mirai-gikai-oitacity-web.vercel.app";

export function resolveWebUrl(
  configuredWebUrl: string | undefined,
  isVercel: boolean
): string {
  if (!isVercel) {
    return configuredWebUrl || LOCAL_WEB_URL;
  }

  if (!configuredWebUrl) {
    return PRODUCTION_WEB_URL;
  }

  const { hostname } = new URL(configuredWebUrl);
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  ) {
    return PRODUCTION_WEB_URL;
  }

  return configuredWebUrl;
}
