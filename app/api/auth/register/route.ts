import { registerAlumniMember } from "../../../../lib/alumni-auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const member = await registerAlumniMember({
      name: typeof payload.name === "string" ? payload.name : "",
      email: typeof payload.email === "string" ? payload.email : "",
      password: typeof payload.password === "string" ? payload.password : "",
      graduationYear: typeof payload.graduationYear === "string" ? payload.graduationYear : "",
      department: typeof payload.department === "string" ? payload.department : "",
      directoryConsent: payload.directoryConsent === true,
    });
    return Response.json({ member }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "회원가입을 완료하지 못했습니다." }, { status: 400 });
  }
}
