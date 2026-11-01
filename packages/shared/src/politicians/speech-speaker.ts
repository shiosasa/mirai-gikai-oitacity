type PoliticianName = { id: string; name: string };

type SpeakerMatch =
  | { kind: "matched"; id: string; label: string }
  | { kind: "unknown"; label: string | null };

function normalizeName(value: string): string {
  return value.normalize("NFKC").replace(/[\s　]/gu, "");
}

function attendanceValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(attendanceValues);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(attendanceValues);
  }
  return [];
}

function presentAttendees(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value)
    .filter(([key]) => ["chair", "vice_chair", "members"].includes(key))
    .flatMap(([, field]) => attendanceValues(field));
}

export function identifySpeechSpeaker(
  minutes: string,
  quote: string,
  politicians: PoliticianName[],
  attendees: unknown
): SpeakerMatch {
  const content = minutes.replace(/\r\n?/g, "\n");
  const excerpt = quote.replace(/\r\n?/g, "\n").trim();
  const position = excerpt ? content.indexOf(excerpt) : -1;
  if (position < 0 || content.indexOf(excerpt, position + 1) !== -1) {
    return { kind: "unknown", label: null };
  }

  const markers = [
    ...content.slice(0, position).matchAll(/^[ \t　]*[○◯]([^\r\n]*)/gmu),
  ];
  const raw = markers.at(-1)?.[1].trim();
  if (!raw) return { kind: "unknown", label: null };

  const parenthesized = /^([^\s　（(]+)[（(]([^）)]+)[）)]/u.exec(raw);
  const label = parenthesized
    ? `${parenthesized[1]}（${parenthesized[2]}）`
    : /^[^\s　]+/u.exec(raw)?.[0];
  if (!label) return { kind: "unknown", label: null };

  const normalizedLabel = normalizeName(label);
  const normalizedPerson = parenthesized ? normalizeName(parenthesized[2]) : "";
  const names = politicians.map((politician) => {
    const parts = politician.name.trim().split(/[\s　]+/u);
    return {
      ...politician,
      fullName: normalizeName(politician.name),
      surname: parts.length > 1 ? normalizeName(parts[0]) : null,
    };
  });
  const fullNameMatches = names.filter(
    (name) =>
      (normalizedPerson && normalizedPerson === name.fullName) ||
      normalizedLabel === `${name.fullName}議員` ||
      normalizedLabel === `${name.fullName}委員`
  );
  if (fullNameMatches.length === 1) {
    return { kind: "matched", id: fullNameMatches[0].id, label };
  }
  if (fullNameMatches.length > 1) return { kind: "unknown", label };

  const surnameMatches = names.filter(
    (name) =>
      name.surname &&
      [
        `${name.surname}委員`,
        `${name.surname}委員長`,
        `${name.surname}副委員長`,
        `${name.surname}議員`,
      ].includes(normalizedLabel)
  );
  if (surnameMatches.length !== 1) return { kind: "unknown", label };

  const attendeeNames = presentAttendees(attendees).map(normalizeName);
  const matched = surnameMatches[0];
  if (!attendeeNames.some((name) => name.includes(matched.fullName))) {
    return { kind: "unknown", label };
  }
  return { kind: "matched", id: matched.id, label };
}
