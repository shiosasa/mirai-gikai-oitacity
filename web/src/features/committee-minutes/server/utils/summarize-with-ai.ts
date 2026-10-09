import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic();

export type SummaryAndDecisions = {
  summary: string;
  decisions: string;
};

export async function summarizeMeetingContent(
  content: string
): Promise<SummaryAndDecisions> {
  if (!content || content.trim().length === 0) {
    return { summary: "", decisions: "" };
  }

  try {
    const message = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `以下の議事録から、以下の2つを抽出してください。

【要約】
子どもや学生にも分かるように簡潔に要約してください。「いつ、どこで、だれが、なにを話して、どうなったか」という観点で、150文字程度でまとめてください。

【決定事項】
この議事録で決まったことや、決議された事項を箇条書きで列挙してください。例えば、「〇〇議案が可決」「〇〇について〇月に実施する」など。

議事録:
${content}

以下の形式で返してください：
【要約】
<要約文>

【決定事項】
<決定事項>`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const summaryMatch = responseText.match(
      /【要約】\n([\s\S]*?)(?=【決定事項】|$)/
    );
    const decisionsMatch = responseText.match(/【決定事項】\n([\s\S]*?)$/);

    const summary = summaryMatch ? summaryMatch[1].trim() : "";
    const decisions = decisionsMatch ? decisionsMatch[1].trim() : "";

    return { summary, decisions };
  } catch (error) {
    console.error("Failed to summarize content:", error);
    return {
      summary: content.substring(0, 150) + "...",
      decisions: "情報取得中...",
    };
  }
}
