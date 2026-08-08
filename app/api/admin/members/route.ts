import { listMembers, registerAdminManagedMember, requireAdministrator } from "../../../../lib/alumni-auth";

export async function GET(request: Request) {
  try {
    await requireAdministrator(request);
    return Response.json({ members: await listMembers() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "회원 목록을 불러오지 못했습니다." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdministrator(request);
    const payload = await request.json() as Record<string, unknown>;
    const member = await registerAdminManagedMember({
      name: typeof payload.name === "string" ? payload.name : "",
      loginId: typeof payload.loginId === "string" ? payload.loginId : "",
      password: typeof payload.password === "string" ? payload.password : "",
      graduationYear: typeof payload.graduationYear === "string" ? payload.graduationYear : "",
      department: typeof payload.department === "string" ? payload.department : "",
      directoryConsent: payload.directoryConsent === true,
      role: payload.role === "admin" ? "admin" : "member",
    });
    return Response.json({ member }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "회원을 생성하지 못했습니다." }, { status: 400 });
  }
}
