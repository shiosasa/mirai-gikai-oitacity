import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:3002/api/committee-minutes/summarize";

async function batchSummarizeViaAPI() {
  try {
    // デバッグ用に API が応答するか確認
    console.log("Batch summarization via API will start...");
    console.log(`API endpoint: ${API_BASE_URL}`);
    console.log(
      "Please ensure the dev server is running (npm run dev in the web directory)"
    );
    console.log("");
    console.log("To summarize existing sessions, please:");
    console.log("1. Open Supabase Dashboard");
    console.log("2. Go to the meeting_sessions table");
    console.log("3. Manually click 'Generate Summary' on each session (once implemented)");
    console.log("");
    console.log(
      "Or use the Supabase UI to run SQL to generate summaries for all sessions."
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

batchSummarizeViaAPI();
