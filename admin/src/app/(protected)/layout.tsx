import { Home, User } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { LogoutButton } from "@/features/auth/client/components/logout-button";
import { getCurrentAdmin } from "@/features/auth/server/lib/auth-server";
import { NavigationLinks } from "./layout/navigation-links";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentAdmin();
  return (
    <div className="min-h-dvh bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-sm sm:text-lg font-semibold">
                  {siteConfig.siteName} 管理画面
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{admin?.email}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <NavigationLinks />
      <div className="lg:ml-60 px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Main content */}
        <main className="mx-auto max-w-7xl min-w-0">{children}</main>
      </div>
    </div>
  );
}
