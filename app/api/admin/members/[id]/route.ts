import { deleteMember, requireAdministrator, updateMember } from "../../../../../lib/alumni-auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const actor = await requireAdministrator(request);
    const payload = await request.json() as Record<string, unknown>;
    await updateMember((await params).id, {
      name: typeof payload.name === "string" ? payload.name : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      graduationYear: typeof payload.graduationYear === "string" ? payload.graduationYear : undefined,
      department: typeof payload.department === "string" ? payload.department : undefined,
      directoryConsent: typeof payload.directoryConsent === "boolean" ? payload.directoryConsent : undefined,
      role: payload.role === "admin" || payload.role === "member" ? payload.role : undefined,
      password: typeof payload.password === "string" ? payload.password : undefined,
    }, actor);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "회원 정보를 수정하지 못했습니다." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const actor = await requireAdministrator(request);
    await deleteMember((await params).id, actor);
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "회원을 삭제하지 못했습니다." }, { status: 400 });
  }
}
