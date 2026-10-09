import { type NextRequest, NextResponse } from "next/server";
import { summarizeMeetingContent } from "@/features/committee-minutes/server/utils/summarize-with-ai";
import { createAdminClient } from "@mirai-gikai/supabase";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, content } = await request.json();

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "sessionId and content are required" },
        { status: 400 }
      );
    }

    const { summary, decisions } = await summarizeMeetingContent(content);

    const supabase = createAdminClient();
    const { error } = await (supabase.from("meeting_sessions") as any)
      .update({
        summary,
        decisions,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to update session:", error);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary, decisions });
  } catch (error) {
    console.error("Failed to summarize:", error);
    return NextResponse.json(
      { error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}
