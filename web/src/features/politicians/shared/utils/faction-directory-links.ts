export const COUNCILLORS_DIRECTORY_HEADING_ID = "councillors-directory-heading";

export function getFactionDirectorySectionId(factionName: string): string {
  const encodedName = factionName
    .trim()
    .split("")
    .map((character) => character.charCodeAt(0).toString(16))
    .join("-");
  return `faction-${encodedName}`;
}

export function getFactionDirectoryLink(
  factionName: string,
  currentFactions: ReadonlySet<string>
): { href: string; isCurrent: boolean } {
  const normalizedName = factionName.trim();
  const isCurrent = currentFactions.has(normalizedName);
  const targetId = isCurrent
    ? getFactionDirectorySectionId(normalizedName)
    : COUNCILLORS_DIRECTORY_HEADING_ID;

  return { href: `/politicians#${targetId}`, isCurrent };
}
