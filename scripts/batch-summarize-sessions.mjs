import { createAdminClient } from "@mirai-gikai/supabase";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic();

async function summarizeContent(content) {
  if (!content || content.trim().length === 0) {
    return { summary: "", decisions: "" };
  }

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-1",
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

    const summaryMatch = responseText.match(/【要約】\n([\s\S]*?)(?=【決定事項】|$)/);
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

async function batchSummarizeSessions() {
  const supabase = createAdminClient();

  console.log("Fetching all meeting sessions...");
  const { data: sessions, error } = await supabase.from("meeting_sessions")
    .select("id, content, summary, decisions")
    .is("summary", null);

  if (error) {
    console.error("Failed to fetch sessions:", error);
    return;
  }

  console.log(`Found ${sessions?.length || 0} sessions without summary`);

  if (!sessions || sessions.length === 0) {
    console.log("All sessions already have summaries!");
    return;
  }

  for (let i = 0; i < (sessions?.length || 0); i++) {
    const session = sessions[i];
    console.log(
      `Processing session ${i + 1}/${sessions?.length} (ID: ${session.id})...`
    );

    if (!session.content) {
      console.log(`  Skipping: no content`);
      continue;
    }

    const { summary, decisions } = await summarizeContent(session.content);

    const { error: updateError } = await supabase.from("meeting_sessions")
      .update({ summary, decisions })
      .eq("id", session.id);

    if (updateError) {
      console.error(`  Error updating session ${session.id}:`, updateError);
    } else {
      console.log(`  ✓ Updated successfully`);
    }

    // Rate limiting: wait 1 second between API calls
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Batch processing completed!");
}

batchSummarizeSessions().catch(console.error);

