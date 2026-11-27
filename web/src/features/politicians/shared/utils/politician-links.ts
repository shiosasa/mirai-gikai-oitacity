import { getHttpUrl } from "@/lib/utils/external-url";

export type PoliticianLinkPlatform =
  | "homepage"
  | "blog"
  | "note"
  | "x"
  | "instagram"
  | "facebook"
  | "youtube"
  | "line";

export type PoliticianSnsKey =
  | "x"
  | "instagram"
  | "facebook"
  | "youtube"
  | "note"
  | "line";

export type PoliticianSocialLinks = Partial<Record<PoliticianSnsKey, string>>;

export type PoliticianLinkItem = {
  platform: PoliticianLinkPlatform;
  label: string;
  shortLabel: string;
  url: string;
};

export const POLITICIAN_LINKS_FAIRNESS_NOTICE =
  "※公平性を保つため、全議員を対象に公開されている公式HP・SNS等を同じ基準で調査して掲載しています。未掲載でも地域活動や委員会活動など日々取り組まれています。掲載情報の追加・修正をご希望の議員様は運営までお知らせください。";

const PLATFORM_META: Record<
  PoliticianLinkPlatform,
  { label: string; shortLabel: string; order: number }
> = {
  homepage: { label: "公式HP", shortLabel: "HP", order: 0 },
  blog: { label: "ブログ", shortLabel: "ブログ", order: 1 },
  note: { label: "note", shortLabel: "note", order: 2 },
  x: { label: "X（旧Twitter）", shortLabel: "X", order: 3 },
  instagram: { label: "Instagram", shortLabel: "IG", order: 4 },
  facebook: { label: "Facebook", shortLabel: "FB", order: 5 },
  youtube: { label: "YouTube", shortLabel: "YT", order: 6 },
  line: { label: "LINE", shortLabel: "LINE", order: 7 },
};

const SNS_KEYS: readonly PoliticianSnsKey[] = [
  "x",
  "instagram",
  "facebook",
  "youtube",
  "note",
  "line",
];

function matchesHost(hostname: string, domains: string[]): boolean {
  const normalized = hostname.toLowerCase();
  return domains.some(
    (domain) => normalized === domain || normalized.endsWith(`.${domain}`)
  );
}

/**
 * URLのホスト名からプラットフォーム種別を自動判別する。
 * 既存の homepage カラムに X などの SNS URL が格納されているケースにも対応する。
 */
export function classifyPoliticianUrl(
  rawUrl: string,
  fallback: PoliticianLinkPlatform = "homepage"
): PoliticianLinkPlatform {
  const safeUrl = getHttpUrl(rawUrl);
  if (!safeUrl) return fallback;
  try {
    const { hostname } = new URL(safeUrl);
    if (matchesHost(hostname, ["x.com", "twitter.com"])) return "x";
    if (matchesHost(hostname, ["instagram.com"])) return "instagram";
    if (matchesHost(hostname, ["facebook.com", "fb.com"])) return "facebook";
    if (matchesHost(hostname, ["youtube.com", "youtu.be"])) return "youtube";
    if (matchesHost(hostname, ["note.com"])) return "note";
    if (matchesHost(hostname, ["line.me", "lin.ee"])) return "line";
    if (
      matchesHost(hostname, [
        "ameblo.jp",
        "blog.livedoor.jp",
        "hatenablog.com",
        "hatenablog.jp",
        "fc2.com",
        "exblog.jp",
        "seesaa.net",
        "jugem.jp",
        "goo.ne.jp",
      ])
    ) {
      return "blog";
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Supabase の sns_links (jsonb) を安全にパースする。
 */
export function parsePoliticianSnsLinks(raw: unknown): PoliticianSocialLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const result: PoliticianSocialLinks = {};
  for (const key of SNS_KEYS) {
    const value = Reflect.get(raw, key);
    if (typeof value !== "string") continue;
    const safeUrl = getHttpUrl(value);
    if (safeUrl) {
      result[key] = safeUrl;
    }
  }
  return result;
}

function normalizeUrlForDedup(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}${parsed.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * homepage, blog_url, sns_links を統合し、重複排除・種別判別・表示順ソートを行ったリンク一覧を返す。
 */
export function collectPoliticianLinks(input: {
  homepage?: string | null;
  blog_url?: string | null;
  sns_links?: unknown;
}): PoliticianLinkItem[] {
  const items: PoliticianLinkItem[] = [];
  const seenUrls = new Set<string>();

  const pushLink = (
    rawUrl: string | null | undefined,
    fallbackPlatform: PoliticianLinkPlatform
  ) => {
    const safeUrl = getHttpUrl(rawUrl);
    if (!safeUrl) return;
    const dedupKey = normalizeUrlForDedup(safeUrl);
    if (seenUrls.has(dedupKey)) return;
    seenUrls.add(dedupKey);

    const platform = classifyPoliticianUrl(safeUrl, fallbackPlatform);
    const meta = PLATFORM_META[platform];
    items.push({
      platform,
      label: meta.label,
      shortLabel: meta.shortLabel,
      url: safeUrl,
    });
  };

  pushLink(input.homepage, "homepage");
  pushLink(input.blog_url, "blog");

  const sns = parsePoliticianSnsLinks(input.sns_links);
  for (const key of SNS_KEYS) {
    pushLink(sns[key], key);
  }

  return items.sort(
    (a, b) => PLATFORM_META[a.platform].order - PLATFORM_META[b.platform].order
  );
}
