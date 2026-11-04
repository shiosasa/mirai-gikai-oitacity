import { ChevronDown, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { formatDateJST } from "@/lib/utils/date";
import { getHttpUrl } from "@/lib/utils/external-url";
import { extractYouTubeId } from "@/lib/utils/extract-youtube-id";
import type { MayorConference } from "../../shared/types/mayor";
import { getMayorConferenceItems } from "../../shared/utils/get-mayor-conference-items";
import { getMayorConferenceMaterials } from "../../shared/utils/get-mayor-conference-materials";

type Props = {
  conferences: MayorConference[];
};

export function MayorConferenceArchive({ conferences }: Props) {
  return (
    <section id="press-conferences" aria-labelledby="press-conferences-heading">
      <div className="border-l-4 border-oita-pink pl-3">
        <h2
          id="press-conferences-heading"
          className="text-xl font-bold text-mirai-text"
        >
          記者会見アーカイブ
        </h2>
        <p className="mt-2 text-sm leading-6 text-mirai-text-secondary">
          市長の記者会見を、開催日の新しい順に紹介します。
        </p>
      </div>
      {conferences.length === 0 ? (
        <p className="mt-4 rounded-lg border border-mirai-border bg-card p-5 text-sm text-mirai-text-secondary">
          公開できる記者会見は準備中です。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {conferences.map((conference) => {
            const youtubeId = extractYouTubeId(conference.youtube_url);
            const materials = getMayorConferenceMaterials(
              conference.press_conference_items
            );
            const announcements = getMayorConferenceItems(
              conference.press_conference_items,
              "announcement"
            );
            const questions = getMayorConferenceItems(
              conference.press_conference_items,
              "qa"
            );

            return (
              <li key={conference.id}>
                <details className="group rounded-lg border border-mirai-border bg-card">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                    <span className="min-w-0">
                      <span className="block text-xs text-mirai-text-secondary">
                        {formatDateJST(conference.held_at)} 開催
                        {conference.status === "draft" && "・下書き"}
                      </span>
                      <span className="mt-1 block font-bold text-mirai-text">
                        {conference.title}
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 shrink-0 text-mirai-text-secondary transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="space-y-4 border-t border-mirai-border px-5 py-5">
                    <div className="space-y-4">
                      {[
                        { heading: "発表事項の要約", items: announcements },
                        { heading: "記者との質疑の要約", items: questions },
                      ].map(({ heading, items }) => (
                        <section key={heading}>
                          <h3 className="text-sm font-bold text-mirai-text">
                            {heading}
                          </h3>
                          {items.length === 0 ? (
                            <p className="mt-2 text-sm text-mirai-text-secondary">
                              要約は準備中です。
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-3">
                              {items.map((item) => (
                                <li key={item.id}>
                                  <h4 className="text-sm font-semibold text-mirai-text">
                                    {item.title}
                                  </h4>
                                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-mirai-text-secondary">
                                    {item.summary || "要約は準備中です。"}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      ))}
                    </div>
                    {youtubeId ? (
                      <>
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                          title={`${conference.title}の動画`}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          className="aspect-video w-full rounded-md"
                        />
                        <a
                          href={`https://www.youtube.com/watch?v=${youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
                        >
                          YouTubeで動画を見る
                          <ExternalLink aria-hidden="true" className="size-4" />
                        </a>
                      </>
                    ) : (
                      <p className="text-sm text-mirai-text-secondary">
                        {conference.youtube_url
                          ? "動画のURLを確認できません。"
                          : "動画は準備中です。"}
                      </p>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-mirai-text">
                        配付資料
                      </h3>
                      {materials.length === 0 ? (
                        <p className="mt-2 text-sm text-mirai-text-secondary">
                          資料は登録されていません。
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {materials.map((material) => {
                            const url = getHttpUrl(material.material_url);
                            return (
                              <li key={material.id}>
                                {url ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
                                  >
                                    <FileText
                                      aria-hidden="true"
                                      className="size-4 shrink-0"
                                    />
                                    {material.title}（PDF）
                                    <ExternalLink
                                      aria-hidden="true"
                                      className="size-4 shrink-0"
                                    />
                                  </a>
                                ) : (
                                  <p className="text-sm text-mirai-text-secondary">
                                    {material.title}：資料URLを確認できません。
                                  </p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    {conference.status === "published" &&
                      conference.press_conference_items.length > 0 && (
                        <Link
                          href={`/press-conferences/${encodeURIComponent(conference.slug)}`}
                          className="inline-block text-sm font-semibold text-primary-accent hover:underline"
                        >
                          会見の内容を読む
                        </Link>
                      )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
