export type MayorPolicy = {
  motto: string | null;
  pillars: string[];
};

export function extractMayorPolicy(bio: string | null): MayorPolicy {
  if (!bio) return { motto: null, pillars: [] };

  const motto = bio.match(/「([^」]+)」を基本方針/)?.[1] ?? null;
  const pillarText = bio.match(
    /((?:「[^」]+」[、・と\s]*){5})の[5５五]つ[^。]*柱/
  )?.[1];
  const pillars = pillarText
    ? Array.from(pillarText.matchAll(/「([^」]+)」/g), (match) => match[1])
    : [];

  return { motto, pillars };
}
