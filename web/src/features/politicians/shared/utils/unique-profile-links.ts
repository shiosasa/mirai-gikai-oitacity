export function uniqueProfileLinks(
  people: { id: string; name: string }[]
): Map<string, string> {
  const idsByName = new Map<string, Set<string>>();
  for (const person of people) {
    const ids = idsByName.get(person.name) ?? new Set<string>();
    ids.add(person.id);
    idsByName.set(person.name, ids);
  }
  const links = new Map<string, string>();
  for (const [name, ids] of idsByName) {
    if (ids.size === 1) {
      const id = ids.values().next().value;
      if (id) links.set(name, `/politicians/${id}`);
    }
  }
  return links;
}
