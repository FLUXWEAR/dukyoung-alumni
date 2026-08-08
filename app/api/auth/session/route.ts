import { getAuthenticatedMember } from "../../../../lib/alumni-auth";

export async function GET(request: Request) {
  const member = await getAuthenticatedMember(request);
  return Response.json({ member }, { headers: { "Cache-Control": "no-store" } });
}
