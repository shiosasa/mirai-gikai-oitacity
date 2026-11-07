"use client";

import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { Suspense, useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { DifficultyLevelEnum } from "../../shared/types";
import { buildDifficultyUrl } from "../../shared/utils/build-difficulty-url";
import { parseDifficultyLevel } from "../../shared/utils/parse-difficulty-level";
import {
  saveScrollDistanceFromBottom,
  useRestoreScrollFromBottom,
} from "../hooks/use-scroll-from-bottom";

interface DifficultySelectorProps {
  currentLevel: DifficultyLevelEnum;
  label?: string;
  labelStyle?: CSSProperties;
  scrollToTop?: boolean;
  maintainScrollFromBottom?: boolean;
}

function PageDifficultySelector({
  label,
  labelStyle,
  scrollToTop,
  maintainScrollFromBottom,
}: DifficultySelectorProps) {
  const searchParams = useSearchParams();
  const selectedLevel = parseDifficultyLevel(searchParams.get("difficulty"));
  const [isChanging, setIsChanging] = useState(false);

  // ページロード時にスクロール位置を復元
  useRestoreScrollFromBottom(maintainScrollFromBottom ?? false);

  const handleToggle = (checked: boolean) => {
    const newLevel = checked ? "hard" : "normal";
    setIsChanging(true);
    if (scrollToTop) {
      // スクロール位置をトップに戻す
      window.scrollTo(0, 0);
    } else if (maintainScrollFromBottom) {
      // 画面下端からの距離を保存
      saveScrollDistanceFromBottom();
    }

    window.location.replace(buildDifficultyUrl(window.location.href, newLevel));
  };

  return (
    <DifficultyControl
      currentLevel={selectedLevel}
      label={label}
      labelStyle={labelStyle}
      disabled={isChanging}
      onToggle={handleToggle}
    />
  );
}

function DifficultyControl({
  currentLevel,
  label,
  labelStyle,
  disabled,
  onToggle,
}: Pick<DifficultySelectorProps, "currentLevel" | "label" | "labelStyle"> & {
  disabled: boolean;
  onToggle?: (checked: boolean) => void;
}) {
  const uniqueId = useId();
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold" style={labelStyle}>
        {label != null ? (
          label
        ) : (
          <span>
            <span className="hidden md:inline-block">説明をもっと</span>詳しく
          </span>
        )}
      </span>
      <Switch
        id={`${uniqueId}-difficulty-toggle`}
        checked={currentLevel === "hard"}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label="難易度を切り替え"
      />
    </div>
  );
}

export function DifficultySelector(props: DifficultySelectorProps) {
  return (
    <Suspense fallback={<DifficultyControl {...props} disabled />}>
      <PageDifficultySelector {...props} />
    </Suspense>
  );
}
