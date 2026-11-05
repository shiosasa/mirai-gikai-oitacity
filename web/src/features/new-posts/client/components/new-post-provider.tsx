"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type PublicationType,
  type RecentPublications,
  recentPublicationsSchema,
} from "../../shared/types";
import {
  getNewPublicationState,
  publicationKey,
} from "../../shared/utils/publication-window";

const NewPostContext = createContext<ReadonlySet<string>>(new Set());

type Snapshot = RecentPublications & { receivedAt: number };

export function NewPostProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [, setTick] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh shared metadata on client-side navigation.
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    async function refresh() {
      if (loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
        const response = await fetch("/api/recent-publications", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            `初回公開情報の取得に失敗しました (${response.status})`
          );
        }
        const result = recentPublicationsSchema.parse(await response.json());
        if (!controller.signal.aborted) {
          setSnapshot({ ...result, receivedAt: performance.now() });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("NEW表示を更新できませんでした:", error);
          setSnapshot(null);
        }
      } finally {
        loading = false;
      }
    }

    function onVisibilityChange() {
      setTick((value) => value + 1);
      void refresh();
    }

    void refresh();
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  const now = snapshot
    ? Date.parse(snapshot.now) + performance.now() - snapshot.receivedAt
    : 0;
  const { activeKeys, nextExpiry } = getNewPublicationState(
    snapshot?.publications ?? [],
    now
  );

  useEffect(() => {
    if (nextExpiry === null) return;
    const timeout = window.setTimeout(
      () => setTick((value) => value + 1),
      Math.max(1, nextExpiry - now)
    );
    return () => window.clearTimeout(timeout);
  }, [nextExpiry, now]);

  return (
    <NewPostContext.Provider value={activeKeys}>
      {children}
    </NewPostContext.Provider>
  );
}

export function NewPostBadge({
  contentType,
  contentId,
  relatedPublications = [],
}: {
  contentType: PublicationType;
  contentId: string | number | readonly (string | number)[];
  relatedPublications?: readonly {
    contentType: PublicationType;
    contentId: string | number;
  }[];
}) {
  const activeKeys = useContext(NewPostContext);
  const ids = typeof contentId === "object" ? contentId : [contentId];
  if (
    !ids.some((id) => activeKeys.has(publicationKey(contentType, id))) &&
    !relatedPublications.some((entry) =>
      activeKeys.has(publicationKey(entry.contentType, entry.contentId))
    )
  ) {
    return null;
  }
  const description =
    contentType === "topic_voice"
      ? "トピックス記事に初掲載されてから14日以内"
      : "サイトで初めて公開してから14日以内";

  return (
    <span
      className="mr-2 inline-flex shrink-0 items-center rounded-full bg-oita-pink-light px-2 py-0.5 align-middle text-xs font-bold leading-4 text-mirai-text"
      title={`${description}の投稿です`}
    >
      NEW<span className="sr-only">（{description}）</span>
    </span>
  );
}
