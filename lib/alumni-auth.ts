import { getDatabase } from "../db";

export type MemberRole = "member" | "admin";

export type SafeMember = {
  id: string;
  name: string;
  email: string;
  graduationYear: string;
  department: string;
  directoryConsent: boolean;
  role: MemberRole;
  createdAt: string;
};

export type AlumniContentCategory = "notice" | "event";

export type AlumniContent = {
  id: string;
  category: AlumniContentCategory;
  title: string;
  body: string;
  eventDate: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type MemberRow = SafeMember & { passwordHash: string; passwordSalt: string };

export const INITIAL_ADMIN = {
  email: "admin@dukyoung-alumni.local",
  name: "총동문회 관리자",
} as const;

const SESSION_COOKIE = "dukyoung_alumni_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const PBKDF2_ITERATIONS = 150_000;
let initializePromise: Promise<void> | null = null;

function now() {
  return new Date().toISOString();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function bytesToBase64(bytes: Uint8Array) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
}

function base64ToBytes(value: string) {
  const text = atob(value);
  return Uint8Array.from(text, (character) => character.charCodeAt(0));
}

function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

async function passwordHash(password: string, salt: string) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: base64ToBytes(salt), iterations: PBKDF2_ITERATIONS }, material, 256);
  return bytesToBase64(new Uint8Array(bits));
}

async function createPasswordRecord(password: string) {
  const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
  return { passwordSalt: salt, passwordHash: await passwordHash(password, salt) };
}

async function getInitialAdministratorPassword() {
  const { env } = await import("cloudflare:workers");
  const password = (env as unknown as Record<string, unknown>).INITIAL_ADMIN_PASSWORD;
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("초기 관리자 비밀번호가 설정되지 않았습니다.");
  }
  return password;
}

function asSafeMember(row: MemberRow): SafeMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    graduationYear: row.graduationYear,
    department: row.department,
    directoryConsent: Boolean(row.directoryConsent),
    role: row.role as MemberRole,
    createdAt: row.createdAt,
  };
}

export async function ensureAlumniDatabase() {
  if (!initializePromise) {
    initializePromise = (async () => {
      const database = await getDatabase();
      await database.exec(`
        CREATE TABLE IF NOT EXISTS alumni_users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          graduation_year TEXT NOT NULL,
          department TEXT NOT NULL DEFAULT '',
          directory_consent INTEGER NOT NULL DEFAULT 0,
          role TEXT NOT NULL DEFAULT 'member',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS alumni_sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES alumni_users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS alumni_content (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL DEFAULT '',
          event_date TEXT,
          published INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS alumni_content_public_idx ON alumni_content(category, published, updated_at DESC);
        CREATE INDEX IF NOT EXISTS alumni_sessions_user_idx ON alumni_sessions(user_id, expires_at);
      `);

      const existingAdmin = await database.prepare("SELECT id FROM alumni_users WHERE email = ?").bind(INITIAL_ADMIN.email).first<{ id: string }>();
      if (!existingAdmin) {
        const credentials = await createPasswordRecord(await getInitialAdministratorPassword());
        await database.prepare(`INSERT INTO alumni_users (id, name, email, password_hash, password_salt, graduation_year, department, directory_consent, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind("initial-admin", INITIAL_ADMIN.name, INITIAL_ADMIN.email, credentials.passwordHash, credentials.passwordSalt, "관리자", "총동문회 사무국", 0, "admin", now()).run();
      }

      const contentCount = await database.prepare("SELECT COUNT(*) AS count FROM alumni_content").first<{ count: number }>();
      if (!contentCount || Number(contentCount.count) === 0) {
        const createdAt = now();
        const seedItems = [
          ["notice", "덕영고등학교 총동문회 홈페이지를 새롭게 준비합니다", "동문 소식과 행사, 사진, 자료를 한곳에서 나눌 수 있도록 홈페이지를 준비하고 있습니다.", null],
          ["notice", "2026년 하반기 총동문회 이사회 개최 안내", "하반기 이사회 일정과 장소는 회장단 협의 후 최종 공지합니다.", null],
          ["notice", "기수별 연락망 정비 및 동문 정보 확인 요청", "동문 정보는 본인이 직접 등록한 내용만 사용하며, 검색 공개 여부는 회원이 직접 선택할 수 있습니다.", null],
          ["event", "총동문회 임원회의", "토요일 오후 2시 · 모교 회의실", "2026-08-22"],
          ["event", "기수대표 간담회", "토요일 오후 4시 · 장소 추후 공지", "2026-09-12"],
          ["event", "2026 덕영 동문의 날", "토요일 오전 10시 · 모교 운동장", "2026-10-24"],
        ] as const;
        await database.batch(seedItems.map(([category, title, body, eventDate], index) => database.prepare(`INSERT INTO alumni_content (id, category, title, body, event_date, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(`seed-${index + 1}`, category, title, body, eventDate, 1, createdAt, createdAt)));
      }
    })();
  }
  return initializePromise;
}

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

function sessionCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_LIFETIME_SECONDS}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function getAuthenticatedMember(request: Request): Promise<SafeMember | null> {
  await ensureAlumniDatabase();
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await (await getDatabase()).prepare(`SELECT u.id, u.name, u.email, u.password_hash AS passwordHash, u.password_salt AS passwordSalt, u.graduation_year AS graduationYear, u.department, u.directory_consent AS directoryConsent, u.role, u.created_at AS createdAt FROM alumni_sessions s JOIN alumni_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`)
    .bind(tokenHash, now()).first<MemberRow>();
  return row ? asSafeMember({ ...row, directoryConsent: Boolean(row.directoryConsent), role: row.role as MemberRole }) : null;
}

export async function requireAdministrator(request: Request) {
  const member = await getAuthenticatedMember(request);
  if (!member || member.role !== "admin") throw new Error("관리자 권한이 필요합니다.");
  return member;
}

export async function registerAlumniMember(input: { name?: string; email?: string; password?: string; graduationYear?: string; department?: string; directoryConsent?: boolean }) {
  await ensureAlumniDatabase();
  const name = input.name?.trim() ?? "";
  const email = normalizeEmail(input.email ?? "");
  const password = input.password ?? "";
  if (name.length < 2) throw new Error("이름을 2자 이상 입력해주세요.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("이메일 주소를 확인해주세요.");
  if (password.length < 10) throw new Error("비밀번호는 영문·숫자 등을 포함해 10자 이상 입력해주세요.");
  if (!input.graduationYear?.trim()) throw new Error("졸업기수를 선택해주세요.");
  const credentials = await createPasswordRecord(password);
  const member: SafeMember = { id: crypto.randomUUID(), name, email, graduationYear: input.graduationYear.trim(), department: input.department?.trim() || "미입력", directoryConsent: Boolean(input.directoryConsent), role: "member", createdAt: now() };
  try {
    await (await getDatabase()).prepare(`INSERT INTO alumni_users (id, name, email, password_hash, password_salt, graduation_year, department, directory_consent, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(member.id, member.name, member.email, credentials.passwordHash, credentials.passwordSalt, member.graduationYear, member.department, member.directoryConsent ? 1 : 0, member.role, member.createdAt).run();
  } catch (error) {
    if (error instanceof Error && /unique/i.test(error.message)) throw new Error("이미 가입된 이메일입니다. 로그인해주세요.");
    throw error;
  }
  return member;
}

export async function authenticateAlumniMember(emailInput: string, password: string, request: Request) {
  await ensureAlumniDatabase();
  const email = normalizeEmail(emailInput);
  const row = await (await getDatabase()).prepare(`SELECT id, name, email, password_hash AS passwordHash, password_salt AS passwordSalt, graduation_year AS graduationYear, department, directory_consent AS directoryConsent, role, created_at AS createdAt FROM alumni_users WHERE email = ?`)
    .bind(email).first<MemberRow>();
  if (!row || !password) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  const expectedHash = await passwordHash(password, row.passwordSalt);
  if (expectedHash !== row.passwordHash) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_SECONDS * 1000).toISOString();
  await (await getDatabase()).prepare("DELETE FROM alumni_sessions WHERE user_id = ?").bind(row.id).run();
  await (await getDatabase()).prepare("INSERT INTO alumni_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(await sha256(token), row.id, expiresAt, now()).run();
  return { member: asSafeMember({ ...row, directoryConsent: Boolean(row.directoryConsent), role: row.role as MemberRole }), cookie: sessionCookie(token, request) };
}

export async function registerAdminManagedMember(input: { name?: string; email?: string; password?: string; graduationYear?: string; department?: string; role?: MemberRole; directoryConsent?: boolean }) {
  await ensureAlumniDatabase();
  const name = input.name?.trim() ?? "";
  const email = normalizeEmail(input.email ?? "");
  const password = input.password ?? "";
  const role: MemberRole = input.role === "admin" ? "admin" : "member";
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) throw new Error("이름, 이메일, 10자 이상 비밀번호를 모두 확인해주세요.");
  const credentials = await createPasswordRecord(password);
  const member: SafeMember = { id: crypto.randomUUID(), name, email, graduationYear: input.graduationYear?.trim() || "관리자 등록", department: input.department?.trim() || "미입력", directoryConsent: Boolean(input.directoryConsent), role, createdAt: now() };
  try {
    await (await getDatabase()).prepare(`INSERT INTO alumni_users (id, name, email, password_hash, password_salt, graduation_year, department, directory_consent, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(member.id, member.name, member.email, credentials.passwordHash, credentials.passwordSalt, member.graduationYear, member.department, member.directoryConsent ? 1 : 0, member.role, member.createdAt).run();
  } catch (error) {
    if (error instanceof Error && /unique/i.test(error.message)) throw new Error("이미 등록된 이메일입니다.");
    throw error;
  }
  return member;
}

export async function listMembers() {
  await ensureAlumniDatabase();
  const result = await (await getDatabase()).prepare(`SELECT id, name, email, graduation_year AS graduationYear, department, directory_consent AS directoryConsent, role, created_at AS createdAt FROM alumni_users ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, created_at DESC`).all<SafeMember>();
  return result.results.map((member) => ({ ...member, directoryConsent: Boolean(member.directoryConsent), role: member.role as MemberRole }));
}

export async function updateMember(id: string, input: Partial<Pick<SafeMember, "name" | "email" | "graduationYear" | "department" | "directoryConsent" | "role">> & { password?: string }, actor: SafeMember) {
  await ensureAlumniDatabase();
  const current = await (await getDatabase()).prepare(`SELECT id, name, email, graduation_year AS graduationYear, department, directory_consent AS directoryConsent, role, created_at AS createdAt FROM alumni_users WHERE id = ?`).bind(id).first<SafeMember>();
  if (!current) throw new Error("회원을 찾을 수 없습니다.");
  const nextRole: MemberRole = input.role === "admin" ? "admin" : input.role === "member" ? "member" : current.role as MemberRole;
  if (actor.id === id && nextRole !== "admin") throw new Error("현재 로그인한 관리자의 권한은 변경할 수 없습니다.");
  const nextEmail = input.email === undefined ? current.email : normalizeEmail(input.email);
  if (!/^\S+@\S+\.\S+$/.test(nextEmail)) throw new Error("이메일 주소를 확인해주세요.");
  if (input.password?.trim() && input.password.length < 10) throw new Error("새 비밀번호는 10자 이상 입력해주세요.");
  const credentials = input.password?.trim() ? await createPasswordRecord(input.password) : null;
  await (await getDatabase()).prepare(`UPDATE alumni_users SET name = ?, email = ?, graduation_year = ?, department = ?, directory_consent = ?, role = ? WHERE id = ?`)
    .bind(input.name?.trim() || current.name, nextEmail, input.graduationYear?.trim() || current.graduationYear, input.department?.trim() || current.department, input.directoryConsent === undefined ? Number(current.directoryConsent) : input.directoryConsent ? 1 : 0, nextRole, id).run();
  if (credentials) {
    await (await getDatabase()).prepare("UPDATE alumni_users SET password_hash = ?, password_salt = ? WHERE id = ?").bind(credentials.passwordHash, credentials.passwordSalt, id).run();
    await (await getDatabase()).prepare("DELETE FROM alumni_sessions WHERE user_id = ?").bind(id).run();
  }
}

export async function deleteMember(id: string, actor: SafeMember) {
  await ensureAlumniDatabase();
  if (id === actor.id) throw new Error("현재 로그인한 관리자 계정은 삭제할 수 없습니다.");
  await (await getDatabase()).prepare("DELETE FROM alumni_sessions WHERE user_id = ?").bind(id).run();
  const result = await (await getDatabase()).prepare("DELETE FROM alumni_users WHERE id = ?").bind(id).run();
  if (!result.meta.changes) throw new Error("회원을 찾을 수 없습니다.");
}

function asContent(row: AlumniContent & { published: number | boolean }) {
  return { ...row, category: row.category as AlumniContentCategory, published: Boolean(row.published) };
}

export async function listPublicContent(category?: string) {
  await ensureAlumniDatabase();
  const safeCategory = category === "event" ? "event" : "notice";
  const order = safeCategory === "event" ? "COALESCE(event_date, '9999-12-31') ASC, updated_at DESC" : "updated_at DESC";
  const result = await (await getDatabase()).prepare(`SELECT id, category, title, body, event_date AS eventDate, published, created_at AS createdAt, updated_at AS updatedAt FROM alumni_content WHERE category = ? AND published = 1 ORDER BY ${order}`).bind(safeCategory).all<AlumniContent & { published: number }>();
  return result.results.map(asContent);
}

export async function listAllContent() {
  await ensureAlumniDatabase();
  const result = await (await getDatabase()).prepare(`SELECT id, category, title, body, event_date AS eventDate, published, created_at AS createdAt, updated_at AS updatedAt FROM alumni_content ORDER BY CASE WHEN category = 'event' THEN 1 ELSE 0 END, updated_at DESC`).all<AlumniContent & { published: number }>();
  return result.results.map(asContent);
}

export async function createContent(input: { category?: string; title?: string; body?: string; eventDate?: string | null; published?: boolean }) {
  await ensureAlumniDatabase();
  const category: AlumniContentCategory = input.category === "event" ? "event" : "notice";
  const title = input.title?.trim() ?? "";
  const body = input.body?.trim() ?? "";
  if (title.length < 2) throw new Error("제목을 2자 이상 입력해주세요.");
  if (body.length < 2) throw new Error("내용을 2자 이상 입력해주세요.");
  if (category === "event" && !input.eventDate) throw new Error("행사 날짜를 선택해주세요.");
  const createdAt = now();
  const item: AlumniContent = { id: crypto.randomUUID(), category, title, body, eventDate: category === "event" ? input.eventDate ?? null : null, published: input.published !== false, createdAt, updatedAt: createdAt };
  await (await getDatabase()).prepare(`INSERT INTO alumni_content (id, category, title, body, event_date, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(item.id, item.category, item.title, item.body, item.eventDate, item.published ? 1 : 0, item.createdAt, item.updatedAt).run();
  return item;
}

export async function updateContent(id: string, input: Partial<Pick<AlumniContent, "category" | "title" | "body" | "eventDate" | "published">>) {
  await ensureAlumniDatabase();
  const current = await (await getDatabase()).prepare(`SELECT id, category, title, body, event_date AS eventDate, published, created_at AS createdAt, updated_at AS updatedAt FROM alumni_content WHERE id = ?`).bind(id).first<AlumniContent & { published: number }>();
  if (!current) throw new Error("게시물을 찾을 수 없습니다.");
  const category: AlumniContentCategory = input.category === "event" ? "event" : input.category === "notice" ? "notice" : current.category as AlumniContentCategory;
  const title = input.title === undefined ? current.title : input.title.trim();
  const body = input.body === undefined ? current.body : input.body.trim();
  const eventDate = category === "event" ? input.eventDate === undefined ? current.eventDate : input.eventDate : null;
  if (title.length < 2 || body.length < 2) throw new Error("제목과 내용을 2자 이상 입력해주세요.");
  if (category === "event" && !eventDate) throw new Error("행사 날짜를 선택해주세요.");
  await (await getDatabase()).prepare(`UPDATE alumni_content SET category = ?, title = ?, body = ?, event_date = ?, published = ?, updated_at = ? WHERE id = ?`)
    .bind(category, title, body, eventDate, input.published === undefined ? Number(current.published) : input.published ? 1 : 0, now(), id).run();
}

export async function deleteContent(id: string) {
  await ensureAlumniDatabase();
  const result = await (await getDatabase()).prepare("DELETE FROM alumni_content WHERE id = ?").bind(id).run();
  if (!result.meta.changes) throw new Error("게시물을 찾을 수 없습니다.");
}
