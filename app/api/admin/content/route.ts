import { createContent, listAllContent, requireAdministrator } from "../../../../lib/alumni-auth";

export async function GET(request: Request) {
  try {
    await requireAdministrator(request);
    return Response.json({ items: await listAllContent() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "게시물 목록을 불러오지 못했습니다." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdministrator(request);
    const payload = await request.json() as Record<string, unknown>;
    const item = await createContent({
      category: typeof payload.category === "string" ? payload.category : "notice",
      title: typeof payload.title === "string" ? payload.title : "",
      body: typeof payload.body === "string" ? payload.body : "",
      eventDate: typeof payload.eventDate === "string" ? payload.eventDate : null,
      published: payload.published !== false,
    });
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "게시물을 생성하지 못했습니다." }, { status: 400 });
  }
}
