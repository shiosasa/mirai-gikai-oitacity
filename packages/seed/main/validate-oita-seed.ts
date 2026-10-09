const REQUIRED_TAGS = [
  "子育て・教育",
  "安心・安全・防災",
  "まちづくり・暮らし",
  "まちの仕組み・選挙",
] as const;

type OitaSeedData = {
  councilSessions: Array<{
    name: string;
    council_url?: string | null;
  }>;
  bills: Array<{ name: string; source_url?: string | null }>;
  tags: Array<{ label: string }>;
  politicians?: Array<{
    name: string;
    is_published?: boolean;
    profile_source_url?: string | null;
  }>;
};

function isOfficialOitaUrl(value: string | null | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.city.oita.oita.jp"
    );
  } catch {
    return false;
  }
}

export function validateOitaSeed(data: OitaSeedData): void {
  const legacyName = /(福岡|Fukuoka|川崎|Kawasaki)/i;

  if (data.councilSessions.length === 0) {
    throw new Error("大分市議会の公式日程を含む会期データがありません。");
  }

  for (const session of data.councilSessions) {
    if (legacyName.test(session.name) || !isOfficialOitaUrl(session.council_url)) {
      throw new Error(`大分市議会の公式ソースではない会期があります: ${session.name}`);
    }
  }

  for (const bill of data.bills) {
    if (legacyName.test(bill.name)) {
      throw new Error(`別地域の議案が含まれています: ${bill.name}`);
    }
    if (!isOfficialOitaUrl(bill.source_url)) {
      throw new Error(`大分市の公式出典URLがない議案があります: ${bill.name}`);
    }
  }

  const tags = new Set(data.tags.map((tag) => tag.label));
  const missingTags = REQUIRED_TAGS.filter((tag) => !tags.has(tag));
  if (missingTags.length > 0) {
    throw new Error(`必須カテゴリがありません: ${missingTags.join("、")}`);
  }

  for (const politician of data.politicians ?? []) {
    if (
      politician.is_published &&
      !isOfficialOitaUrl(politician.profile_source_url)
    ) {
      throw new Error(
        `公開議員プロフィールに公式ソースURLがありません: ${politician.name}`
      );
    }
  }
}