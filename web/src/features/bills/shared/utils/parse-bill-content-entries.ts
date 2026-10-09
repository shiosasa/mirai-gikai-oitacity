export type SourcedBillEntry = {
  text: string;
  sourceUrl: string | null;
};

export type BillContentUpdate = SourcedBillEntry & {
  date: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseBillContentEntries(value: unknown): SourcedBillEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.text !== "string") return [];
    return [
      {
        text: entry.text,
        sourceUrl:
          typeof entry.source_url === "string" ? entry.source_url : null,
      },
    ];
  });
}

export function parseBillContentUpdates(value: unknown): BillContentUpdate[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.date !== "string" ||
      typeof entry.text !== "string"
    ) {
      return [];
    }
    return [
      {
        date: entry.date,
        text: entry.text,
        sourceUrl:
          typeof entry.source_url === "string" ? entry.source_url : null,
      },
    ];
  });
}
