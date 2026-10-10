import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_noStore } from "next/cache";
import Image from "next/image";
import { formatDateJST } from "@/lib/utils/date";

export async function InformationSection() {
  unstable_noStore();
  const enabled = process.env.SITE_INFORMATION_ENABLED === "true";
  const entries = enabled ? await loadInformation() : null;
  return (
    <section aria-labelledby="information-heading" className="space-y-3">
      <h2
        id="information-heading"
        className="flex items-center gap-2 text-2xl font-bold text-mirai-text"
      >
        <Image
          src="/illustrations/sazanka.svg"
          alt=""
          width={44}
          height={40}
          className="h-10 w-11 shrink-0"
        />
        information
      </h2>
      <div
        className="h-32 overflow-y-auto rounded-xl border border-pink-300 bg-pink-100 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to focus and scroll this region.
        tabIndex={0}
        role="region"
        aria-label="新着・お知らせ（スクロールできます）"
      >
        {entries === null ? (
          <p className="text-sm text-mirai-text-muted">
            お知らせ欄は準備中です。
          </p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-mirai-text-muted">
            お知らせはまだありません。
          </p>
        ) : (
          <ul className="divide-y divide-mirai-border">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="space-y-2 py-3 first:pt-0 last:pb-0"
              >
                <time
                  dateTime={entry.published_at}
                  className="text-xs text-mirai-text-muted"
                >
                  {formatDateJST(entry.published_at)}
                </time>
                <h3 className="font-semibold text-mirai-text">{entry.title}</h3>
                {entry.body && (
                  <p className="whitespace-pre-wrap text-sm text-mirai-text-secondary">
                    {entry.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

async function loadInformation() {
  const { data, error } = await createAdminClient()
    .from("site_information")
    .select("id, title, body, published_at")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error)
    throw new Error(`お知らせを取得できませんでした: ${error.message}`);
  return data;
}
