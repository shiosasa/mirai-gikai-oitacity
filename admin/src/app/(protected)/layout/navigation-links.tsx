"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { navigationGroups } from "@/features/dashboard/shared/navigation";
import { isNavigationActive } from "@/features/dashboard/shared/utils/navigation";
import { cn } from "@/lib/utils";

export function NavigationLinks() {
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  const links = (
    <nav aria-label="管理メニュー" className="space-y-5 p-4">
      {navigationGroups.map((group) => (
        <section key={group.label}>
          <h2 className="mb-1 px-3 text-xs font-semibold text-muted-foreground">
            {group.label}
          </h2>
          <ul className="space-y-1">
            {group.links.map(({ href, label, icon: Icon }) => {
              const active = isNavigationActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => mobileMenu.current?.removeAttribute("open")}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:block fixed inset-y-16 left-0 w-60 overflow-y-auto border-r bg-sidebar">
        {links}
      </aside>
      <details ref={mobileMenu} className="border-b bg-sidebar lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 p-4 text-sm font-medium">
          <Menu className="size-5" aria-hidden="true" />
          管理メニュー
        </summary>
        {links}
      </details>
    </>
  );
}
