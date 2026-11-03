export function isNavigationActive(pathname: string, href: string): boolean {
  if (href === "/minutes" && pathname.startsWith("/committee-meetings"))
    return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
