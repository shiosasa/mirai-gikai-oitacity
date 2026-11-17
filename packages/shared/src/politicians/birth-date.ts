const japaneseEras = [
  {
    name: "明治",
    yearOffset: 1867,
    startsOn: [1868, 9, 8],
    endsOn: [1912, 7, 29],
  },
  {
    name: "大正",
    yearOffset: 1911,
    startsOn: [1912, 7, 30],
    endsOn: [1926, 12, 24],
  },
  {
    name: "昭和",
    yearOffset: 1925,
    startsOn: [1926, 12, 25],
    endsOn: [1989, 1, 7],
  },
  {
    name: "平成",
    yearOffset: 1988,
    startsOn: [1989, 1, 8],
    endsOn: [2019, 4, 30],
  },
  { name: "令和", yearOffset: 2018, startsOn: [2019, 5, 1], endsOn: null },
] as const;

function getDateKey([year, month, day]: readonly [number, number, number]) {
  return year * 10_000 + month * 100 + day;
}

export function parsePoliticianBirthDate(
  birthDate: string | null
): { year: number; month: number; day: number } | null {
  if (!birthDate) return null;

  const normalized = birthDate.normalize("NFKC").replace(/\s/g, "");
  const eraMatch =
    /^(明治|大正|昭和|平成|令和)(元|\d+)年(\d{1,2})月(\d{1,2})日$/.exec(
      normalized
    );

  let year: number;
  let month: number;
  let day: number;

  if (eraMatch) {
    const era = japaneseEras.find(({ name }) => name === eraMatch[1]);
    if (!era) return null;

    year = era.yearOffset + (eraMatch[2] === "元" ? 1 : Number(eraMatch[2]));
    month = Number(eraMatch[3]);
    day = Number(eraMatch[4]);

    const dateKey = year * 10_000 + month * 100 + day;
    if (
      dateKey < getDateKey(era.startsOn) ||
      (era.endsOn !== null && dateKey > getDateKey(era.endsOn))
    ) {
      return null;
    }
  } else {
    const normalizedGregorianDate = normalized.replace(
      /\((?:明治|大正|昭和|平成|令和)(?:元|\d+)年\)/g,
      ""
    );
    const match =
      /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(normalizedGregorianDate) ??
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(normalizedGregorianDate);

    if (!match) return null;
    [year, month, day] = match.slice(1).map(Number);
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  if (
    year < 1 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}
