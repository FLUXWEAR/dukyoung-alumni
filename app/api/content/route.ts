import { listPublicContent } from "../../../lib/alumni-auth";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category") ?? undefined;
    const items = await listPublicContent(category);
    return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "게시물을 불러오지 못했습니다." }, { status: 500 });
  }
}
