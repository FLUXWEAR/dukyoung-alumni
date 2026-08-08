import { deleteContent, requireAdministrator, updateContent } from "../../../../../lib/alumni-auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdministrator(request);
    const payload = await request.json() as Record<string, unknown>;
    await updateContent((await params).id, {
      category: payload.category === "event" || payload.category === "notice" ? payload.category : undefined,
      title: typeof payload.title === "string" ? payload.title : undefined,
      body: typeof payload.body === "string" ? payload.body : undefined,
      eventDate: typeof payload.eventDate === "string" ? payload.eventDate : payload.eventDate === null ? null : undefined,
      published: typeof payload.published === "boolean" ? payload.published : undefined,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "게시물을 수정하지 못했습니다." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await requireAdministrator(request);
    await deleteContent((await params).id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "게시물을 삭제하지 못했습니다." }, { status: 400 });
  }
}
