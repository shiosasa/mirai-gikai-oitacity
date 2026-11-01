import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { ReactElement } from "react";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { LongPressSection } from "@/features/bills/client/components/bill-detail/long-press-section";
import { DifficultyInfoCard } from "@/features/bills/server/components/bill-detail/difficulty-info-card";
import { rehypeEmbedYouTube } from "./rehype-embed-youtube";
import { rehypeExternalLinks } from "./rehype-external-links";
import { rehypeInjectElement } from "./rehype-inject-element";
import { rehypeWrapSections } from "./rehype-wrap-sections";

// rehypeSanitizeのスキーマをカスタマイズ
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), "target", "rel"],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // カスタム要素を許可
    "LongPressSection",
    "DifficultyInfoCard",
  ],
};

export interface ParseMarkdownOptions {
  /** 最後のH2の前に「説明の詳しさ」切り替えカードを挿入する（デフォルト: true） */
  injectDifficultyCard?: boolean;
  /** 「長押しでAIに質問」カードを挿入するH2の位置（1-indexed、デフォルト: 3） */
  longPressTargetH2Index?: number;
}

/**
 * MarkdownテキストをReact Elementに変換
 * @param markdown - Markdown形式のテキスト
 * @param options - 挿入するカスタム要素の設定
 * @returns React Element（部分水和対応）
 */
export async function parseMarkdown(
  markdown: string,
  options: ParseMarkdownOptions = {}
): Promise<ReactElement> {
  const { injectDifficultyCard = true, longPressTargetH2Index = 3 } = options;
  // Markdown → mdast（remarkBreaksでソフト改行をbreak nodeに変換）
  const remarkProcessor = unified().use(remarkParse).use(remarkBreaks);
  const parsed = remarkProcessor.parse(markdown);
  const mdast = (await remarkProcessor.run(parsed)) as typeof parsed;

  // mdast → hast（rehypeプラグイン適用）
  const hast = await unified()
    .use(remarkRehype)
    .use(rehypeWrapSections)
    .use(rehypeInjectElement, {
      injections: [
        {
          targetH2Index: longPressTargetH2Index,
          tagName: "LongPressSection",
        },
        ...(injectDifficultyCard
          ? [{ targetH2Index: -1, tagName: "DifficultyInfoCard" }]
          : []),
      ],
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeExternalLinks)
    .use(rehypeEmbedYouTube)
    .run(mdast);

  // hast → React Element（部分水和）
  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components: {
      LongPressSection, // Client Componentとして水和
      DifficultyInfoCard, // Client Componentとして水和
    },
  });
}
