"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import {
  isInterviewPage,
  shouldShowDifficultySelector,
} from "@/lib/page-layout-utils";
import { HamburgerMenu } from "./hamburger-menu";

interface HeaderClientProps {
  difficultyLevel: DifficultyLevelEnum;
}

export function HeaderClient({ difficultyLevel }: HeaderClientProps) {
  const pathname = usePathname();
  const showDifficultySelector = shouldShowDifficultySelector(pathname);
  const showInterviewActions = isInterviewPage(pathname);

  return (
    <header className="px-3 fixed top-4 left-0 right-0 z-10 max-w-[1440px] mx-auto">
      <div className="rounded-2xl bg-white shadow-sm mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <div className="flex min-w-0 items-center">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-1 sm:gap-2"
              aria-label="ホーム"
            >
              <Image
                src="/illustrations/sazanka.svg"
                alt=""
                width={44}
                height={40}
                className="h-7 w-8 shrink-0 sm:h-10 sm:w-11"
              />
              {siteConfig.features.showTeamMiraiSection && (
                <Image
                  src="/img/logo.svg"
                  alt={siteConfig.siteName}
                  width={42}
                  height={36}
                />
              )}
              <div className="text-xs max-[360px]:text-[10px] sm:text-base font-bold leading-tight sm:whitespace-nowrap">
                {siteConfig.siteName}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex shrink-0 items-center space-x-1 sm:space-x-2"
            aria-label="補助ナビゲーション"
          >
            {showDifficultySelector && (
              <DifficultySelector currentLevel={difficultyLevel} />
            )}
            {showInterviewActions && <InterviewHeaderActions />}
            <Link
              href="/search"
              aria-label="検索"
              className="p-2 text-mirai-text-muted hover:text-mirai-text transition-colors"
            >
              <Search className="size-5" />
            </Link>
            <HamburgerMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
