import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { LinkButton } from "./link-button";

export function About() {
  return (
    <div className="py-10">
      <div className="flex flex-col gap-4">
        {/* ヘッダー */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-[#2d231f]">
            みらいぎかいっちなんなん
          </h2>
          <p className="text-sm font-bold text-primary-accent">
            {siteConfig.siteName}とは
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold leading-[43.2px]">
              大分の暮らしと
              <br />
              議会の話を、やさしくつなぐ
            </h3>
            <p className="text-[15px] leading-[28px] text-black">
              {siteConfig.siteName}は、{siteConfig.siteDescription}
              。市民の暮らしと政治が近づくように、わかりやすく整えて発信していくけん。
            </p>
          </div>

          <details className="group rounded-xl border border-pink-300 bg-pink-100 p-4 text-sm text-[#404040]">
            <summary className="cursor-pointer list-none font-bold text-[#2d231f]">
              みらいぎかいっちの目的とポリシー（押したら見れるで！）
            </summary>
            <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 text-[13px] leading-relaxed">
              <p>
                このサイトは、大分市議会の審議内容をAIを通じて分かりやすくすることで、市民の皆さんにより身近に感じてもらうことを目的としています。
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>免責事項：</strong>
                  本サイトは政党チームみらいが運営しているものではありません。
                </li>
                <li>
                  <strong>運営について：</strong>
                  本サイトは「チームみらい」の活動理念に共感し、「チームみらい」開発の「みらい議会」をベースに作成・運営している非公式プラットフォームです。
                </li>
                <li>
                  <strong>情報の更新について：</strong>
                  大分市議会の公式議事録は次回議会の前日に公表されるため、掲載内容の反映には時間差があります。
                </li>
                <li>
                  <strong>対話の活用：</strong>
                  インタビュー内容は、市政への提言や公開データとして活用する場合があります。
                </li>
                <li>
                  <strong>情報の正確性：</strong>
                  AIを使って情報を整理しています。正確な情報は大分市議会の公式資料をご確認ください。
                </li>
              </ul>
            </div>
          </details>

          {/* もっと詳しく知るボタン */}
          {siteConfig.externalLinks.aboutNote && (
            <LinkButton
              href={siteConfig.externalLinks.aboutNote}
              icon={{
                src: "/icons/note-icon.png",
                alt: "note",
                width: 25,
                height: 25,
              }}
            >
              {siteConfig.siteName}とは
            </LinkButton>
          )}

          {/* 非公式運営時: 帰属・免責表記 */}
          {!siteConfig.features.showTeamMiraiSection && (
            <div className="flex flex-col gap-4 pt-2 border-t border-gray-200">
              <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-[#404040]">
                <p>
                  このサイトは「チームみらい」開発の「みらい議会」をベースに作成しています。
                </p>

                <div className="flex flex-col gap-4">
                  <LinkButton
                    href="https://team-mir.ai/"
                    icon={{
                      src: "/img/logo.svg",
                      alt: "",
                      width: 23,
                      height: 22,
                    }}
                  >
                    「チームみらい」について
                  </LinkButton>

                  <LinkButton
                    href="https://gikai.team-mir.ai/"
                    icon={{
                      src: "/icons/interview-icon-3.svg",
                      alt: "",
                      width: 18,
                      height: 17,
                    }}
                  >
                    本家「みらい議会」（国会版）を見に行く
                  </LinkButton>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-[13px] leading-relaxed text-[#404040]">
                <p>
                  このサイトは「チームみらい」の公式ではない、非公式のサイトです。
                  <br />
                  ご意見や不具合等がございましたら党公式への連絡ではなく、
                  <br />
                  開発者の　
                  <Link
                    href={siteConfig.operator.contactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    {siteConfig.operator.name}
                  </Link>
                  　にご連絡お願いします。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
