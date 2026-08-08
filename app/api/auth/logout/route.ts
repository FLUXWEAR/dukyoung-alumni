import { clearSessionCookie } from "../../../../lib/alumni-auth";

export async function POST(request: Request) {
  return new Response(null, { status: 204, headers: { "Set-Cookie": clearSessionCookie(request), "Cache-Control": "no-store" } });
}
