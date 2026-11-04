import { findRecentPublications } from "@/features/new-posts/server/repositories/publication-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await findRecentPublications(), {
    headers: { "Cache-Control": "no-store" },
  });
}
