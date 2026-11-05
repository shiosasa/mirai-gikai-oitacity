export function buildSearchFilter(
  columns: readonly string[],
  query: string
): string {
  const literal = query.trim().replace(/[\\%_]/g, "\\$&");
  const pattern = JSON.stringify(`%${literal}%`);
  return columns.map((column) => `${column}.ilike.${pattern}`).join(",");
}
