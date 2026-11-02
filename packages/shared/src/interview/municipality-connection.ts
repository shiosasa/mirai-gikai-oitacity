export const MUNICIPALITY_CONNECTIONS = [
  "resident",
  "connected",
  "other",
] as const;

export type MunicipalityConnection = (typeof MUNICIPALITY_CONNECTIONS)[number];

export const MUNICIPALITY_CONNECTION_LABELS: Record<
  MunicipalityConnection,
  string
> = {
  resident: "大分市在住",
  connected: "大分市にゆかり",
  other: "その他",
};

export function getMunicipalityConnectionLabel(
  connection: MunicipalityConnection | null | undefined
): string | null {
  return connection ? MUNICIPALITY_CONNECTION_LABELS[connection] : null;
}
