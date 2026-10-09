import { formatMinutesContent } from "../../shared/utils/format-minutes-content";

/** 詳細議事録の本文を整形して表示する */
export function MinutesContent({ content }: { content: string }) {
  const lines = formatMinutesContent(content);

  return (
    <div className="text-mirai-text-secondary leading-relaxed">
      {lines.map((line, i) =>
        line.text === "" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 本文の行は固定で並べ替えがない
          <div key={i} className="h-4" />
        ) : (
          <p
            // biome-ignore lint/suspicious/noArrayIndexKey: 本文の行は固定で並べ替えがない
            key={i}
            className={
              line.isSpeaker ? "font-semibold text-mirai-text mt-4" : ""
            }
          >
            {line.text}
          </p>
        )
      )}
    </div>
  );
}
