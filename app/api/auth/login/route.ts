import { authenticateAlumniMember } from "../../../../lib/alumni-auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const { member, cookie } = await authenticateAlumniMember(typeof payload.email === "string" ? payload.email : "", typeof payload.password === "string" ? payload.password : "", request);
    return new Response(JSON.stringify({ member }), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": cookie, "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "로그인할 수 없습니다." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
}
