import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDatabase() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    throw new Error("동문회 데이터 저장소를 연결하지 못했습니다.");
  }
  return env.DB;
}

export async function getDb() {
  return drizzle(await getDatabase(), { schema });
}
