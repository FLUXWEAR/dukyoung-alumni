"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MemberRole = "member" | "admin";
type Member = { id: string; name: string; loginId: string; graduationYear: string; department: string; directoryConsent: boolean; role: MemberRole; createdAt: string };
type ContentCategory = "notice" | "event";
type ContentItem = { id: string; category: ContentCategory; title: string; body: string; eventDate: string | null; published: boolean; createdAt: string; updatedAt: string };
type ApiResult<T> = T & { error?: string };

async function requestJson<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) }, credentials: "same-origin" });
  const data = await response.json().catch(() => ({})) as ApiResult<T>;
  if (!response.ok) throw new Error(data.error || "요청을 처리하지 못했습니다.");
  return data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function AuthNotice({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "error" | "success" }) {
  return <p className={`auth-notice ${tone}`} role="status">{children}</p>;
}

function useSession() {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const data = await requestJson<{ member: Member | null }>("/api/auth/session", { method: "GET" });
      setMember(data.member);
    } catch {
      setMember(null);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  return { member, ready, refresh };
}

export function LoginPortal() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage("");
    try {
      const data = await requestJson<{ member: Member }>("/api/auth/login", { method: "POST", body: JSON.stringify({ loginId: form.get("loginId"), password: form.get("password") }) });
      router.push(data.member.role === "admin" ? "/admin" : "/mypage");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="auth-card"><span className="auth-kicker">MEMBER LOGIN</span><h2>동문회원 로그인</h2><p>가입한 아이디와 비밀번호로 로그인해주세요.</p><form className="auth-form" onSubmit={submit}><label>아이디<input name="loginId" autoComplete="username" placeholder="예: dukyoung2026" minLength={4} maxLength={20} pattern="[A-Za-z0-9._-]+" required /></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요" required /></label><button type="submit" disabled={submitting}>{submitting ? "로그인 확인 중" : "로그인"}</button></form>{message && <AuthNotice tone="error">{message}</AuthNotice>}<p className="auth-link">아직 회원이 아니신가요? <Link href="/register">회원가입</Link></p></div>;
}

export function RegisterPortal() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("passwordConfirm") ?? "")) return setMessage("비밀번호 확인이 일치하지 않습니다.");
    if (!form.get("terms")) return setMessage("이용약관 및 개인정보 수집 안내에 동의해주세요.");
    setSubmitting(true);
    setMessage("");
    try {
      await requestJson<{ member: Member }>("/api/auth/register", { method: "POST", body: JSON.stringify({ name: form.get("name"), loginId: form.get("loginId"), password, graduationYear: form.get("graduationYear"), department: form.get("department"), directoryConsent: Boolean(form.get("directoryConsent")) }) });
      setMessage("회원가입이 완료되었습니다. 로그인해주세요.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "회원가입을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="auth-card auth-card-wide"><span className="auth-kicker">MEMBERSHIP</span><h2>동문회원 가입</h2><p>동문 정보를 직접 등록하고, 동문 찾기 공개 여부를 선택할 수 있습니다.</p><form className="auth-form auth-form-grid" onSubmit={submit}><label>이름<input name="name" autoComplete="name" placeholder="이름을 입력하세요" required /></label><label>아이디<input name="loginId" autoComplete="username" placeholder="영문·숫자 4~20자" minLength={4} maxLength={20} pattern="[A-Za-z0-9._-]+" required /></label><label>비밀번호<input name="password" type="password" autoComplete="new-password" placeholder="10자 이상 입력" minLength={10} required /></label><label>비밀번호 확인<input name="passwordConfirm" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력" minLength={10} required /></label><label>졸업기수<select name="graduationYear" defaultValue="" required><option value="" disabled>기수를 선택하세요</option><option>1회</option><option>2회</option><option>3회</option><option>4회</option><option>5회</option><option>기타</option></select></label><label>졸업 학과<input name="department" placeholder="예: 경영회계과 (선택)" /></label><label className="auth-check auth-wide"><input name="directoryConsent" type="checkbox" /> 동문 찾기 검색 공개에 동의합니다. (선택)</label><label className="auth-check auth-wide"><input name="terms" type="checkbox" required /> 이용약관 및 개인정보 수집·이용 안내에 동의합니다. (필수)</label><button className="auth-wide" type="submit" disabled={submitting}>{submitting ? "가입 처리 중" : "회원가입 완료"}</button></form>{message && <AuthNotice tone={message.includes("완료") ? "success" : "error"}>{message}</AuthNotice>}<p className="auth-link">이미 회원이신가요? <Link href="/login">로그인</Link></p></div>;
}

export function MyPagePortal() {
  const router = useRouter();
  const { member, ready } = useSession();
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); };
  if (!ready) return <div className="auth-card"><AuthNotice>회원 정보를 확인하고 있습니다.</AuthNotice></div>;
  if (!member) return <div className="auth-card"><h2>로그인이 필요합니다.</h2><p>내 정보를 확인하려면 먼저 로그인해주세요.</p><Link className="auth-inline-button" href="/login">로그인하기</Link></div>;
  return <div className="auth-card account-card"><span className="auth-kicker">MY PAGE</span><h2>{member.name} 님, 반갑습니다.</h2><p>등록한 동문회원 정보를 확인할 수 있습니다.</p><dl className="account-details"><div><dt>아이디</dt><dd>{member.loginId}</dd></div><div><dt>졸업기수</dt><dd>{member.graduationYear}</dd></div><div><dt>졸업 학과</dt><dd>{member.department}</dd></div><div><dt>동문 찾기 공개</dt><dd>{member.directoryConsent ? "공개" : "비공개"}</dd></div></dl><div className="account-actions">{member.role === "admin" && <Link href="/admin">관리자 페이지</Link>}<button type="button" onClick={logout}>로그아웃</button></div></div>;
}

type ContentForm = { category: ContentCategory; title: string; body: string; eventDate: string; published: boolean };
const blankContent: ContentForm = { category: "notice", title: "", body: "", eventDate: "", published: true };

export function AdminPortal() {
  const router = useRouter();
  const { member, ready } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [contentForm, setContentForm] = useState<ContentForm>(blankContent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ name: "", loginId: "", password: "", graduationYear: "관리자 등록", department: "", role: "member" as MemberRole });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [memberData, contentData] = await Promise.all([requestJson<{ members: Member[] }>("/api/admin/members", { method: "GET" }), requestJson<{ items: ContentItem[] }>("/api/admin/content", { method: "GET" })]);
      setMembers(memberData.members);
      setItems(contentData.items);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "관리자 자료를 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    if (member?.role !== "admin") return;
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [member, loadDashboard]);

  if (!ready) return <div className="auth-card"><AuthNotice>관리자 권한을 확인하고 있습니다.</AuthNotice></div>;
  if (member?.role !== "admin") return <div className="auth-card"><h2>관리자 권한이 필요합니다.</h2><p>관리자 계정으로 로그인한 뒤 다시 접속해주세요.</p><Link className="auth-inline-button" href="/login">로그인 페이지</Link></div>;

  const saveContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const url = editingId ? `/api/admin/content/${editingId}` : "/api/admin/content";
      await requestJson(url, { method: editingId ? "PATCH" : "POST", body: JSON.stringify({ ...contentForm, eventDate: contentForm.category === "event" ? contentForm.eventDate : null }) });
      setContentForm(blankContent); setEditingId(null); setMessage("게시물이 저장되었습니다."); await loadDashboard();
    } catch (error) { setMessage(error instanceof Error ? error.message : "게시물을 저장하지 못했습니다."); } finally { setLoading(false); }
  };

  const editContent = (item: ContentItem) => { setEditingId(item.id); setContentForm({ category: item.category, title: item.title, body: item.body, eventDate: item.eventDate ?? "", published: item.published }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const removeContent = async (id: string) => { if (!window.confirm("이 게시물을 삭제할까요?")) return; try { await requestJson(`/api/admin/content/${id}`, { method: "DELETE" }); setMessage("게시물을 삭제했습니다."); await loadDashboard(); } catch (error) { setMessage(error instanceof Error ? error.message : "게시물을 삭제하지 못했습니다."); } };
  const saveMember = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setMessage(""); try { await requestJson<{ member: Member }>("/api/admin/members", { method: "POST", body: JSON.stringify(memberForm) }); setMemberForm({ name: "", loginId: "", password: "", graduationYear: "관리자 등록", department: "", role: "member" }); setMessage("회원 계정을 생성했습니다."); await loadDashboard(); } catch (error) { setMessage(error instanceof Error ? error.message : "회원을 생성하지 못했습니다."); } finally { setLoading(false); } };
  const updateRole = async (target: Member, role: MemberRole) => { try { await requestJson(`/api/admin/members/${target.id}`, { method: "PATCH", body: JSON.stringify({ role }) }); setMessage("회원 권한을 수정했습니다."); await loadDashboard(); } catch (error) { setMessage(error instanceof Error ? error.message : "권한을 수정하지 못했습니다."); } };
  const removeMember = async (target: Member) => { if (!window.confirm(`${target.name} 회원을 삭제할까요?`)) return; try { await requestJson(`/api/admin/members/${target.id}`, { method: "DELETE" }); setMessage("회원을 삭제했습니다."); await loadDashboard(); } catch (error) { setMessage(error instanceof Error ? error.message : "회원을 삭제하지 못했습니다."); } };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); };

  return <div className="admin-panel"><div className="admin-head"><div><span className="auth-kicker">ADMIN CONTROL CENTER</span><h2>총동문회 운영 관리</h2><p>공지·행사·회원 계정을 생성, 수정, 삭제하고 공개 상태와 관리자 권한을 관리합니다.</p></div><button type="button" onClick={logout}>로그아웃</button></div><div className="admin-stats"><article><span>전체 계정</span><strong>{members.length}</strong></article><article><span>동문회원</span><strong>{members.filter((candidate) => candidate.role === "member").length}</strong></article><article><span>공개 게시물</span><strong>{items.filter((item) => item.published).length}</strong></article></div>{message && <AuthNotice tone={message.includes("저장") || message.includes("생성") || message.includes("수정") || message.includes("삭제") ? "success" : "error"}>{message}</AuthNotice>}<section className="admin-workspace"><div className="admin-section-heading"><span>01</span><div><h3>{editingId ? "게시물 수정" : "새 게시물 만들기"}</h3><p>등록한 내용은 총동문회 첫 화면의 소식·행사 영역에 즉시 반영됩니다.</p></div></div><form className="admin-editor" onSubmit={saveContent}><label>분류<select value={contentForm.category} onChange={(event) => setContentForm({ ...contentForm, category: event.target.value as ContentCategory, eventDate: event.target.value === "notice" ? "" : contentForm.eventDate })}><option value="notice">동문회 공지</option><option value="event">행사 일정</option></select></label><label>공개 상태<select value={contentForm.published ? "published" : "draft"} onChange={(event) => setContentForm({ ...contentForm, published: event.target.value === "published" })}><option value="published">즉시 공개</option><option value="draft">비공개 초안</option></select></label><label className="admin-full">제목<input value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} placeholder="게시물 제목을 입력하세요" required /></label>{contentForm.category === "event" && <label className="admin-full">행사 날짜<input type="date" value={contentForm.eventDate} onChange={(event) => setContentForm({ ...contentForm, eventDate: event.target.value })} required /></label>}<label className="admin-full">내용<textarea value={contentForm.body} onChange={(event) => setContentForm({ ...contentForm, body: event.target.value })} placeholder="상세 내용을 입력하세요" required /></label><div className="admin-editor-actions admin-full"><button type="submit" disabled={loading}>{editingId ? "수정 내용 저장" : "게시물 생성"}</button>{editingId && <button type="button" className="admin-secondary" onClick={() => { setEditingId(null); setContentForm(blankContent); }}>수정 취소</button>}</div></form></section><section className="admin-workspace"><div className="admin-section-heading"><span>02</span><div><h3>게시물 관리</h3><p>첫 화면에 노출되는 공지와 행사 일정을 직접 관리합니다.</p></div></div><div className="admin-content-list">{items.map((item) => <article key={item.id}><div><span className={`content-status ${item.published ? "published" : "draft"}`}>{item.published ? "공개" : "비공개"}</span><span className="content-category">{item.category === "event" ? "행사" : "공지"}</span><h4>{item.title}</h4><p>{item.body}</p>{item.eventDate && <small>{item.eventDate}</small>}</div><div className="content-actions"><button type="button" onClick={() => editContent(item)}>수정</button><button type="button" onClick={() => void removeContent(item.id)}>삭제</button></div></article>)}</div></section><section className="admin-workspace"><div className="admin-section-heading"><span>03</span><div><h3>회원 계정 생성</h3><p>관리자는 일반 회원 또는 추가 관리자 계정을 직접 만들 수 있습니다.</p></div></div><form className="admin-editor admin-member-create" onSubmit={saveMember}><label>이름<input value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} required /></label><label>권한<select value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value as MemberRole })}><option value="member">동문회원</option><option value="admin">관리자</option></select></label><label>아이디<input value={memberForm.loginId} onChange={(event) => setMemberForm({ ...memberForm, loginId: event.target.value })} placeholder="영문·숫자 4~20자" minLength={4} maxLength={20} pattern="[A-Za-z0-9._-]+" required /></label><label>초기 비밀번호<input type="password" minLength={10} value={memberForm.password} onChange={(event) => setMemberForm({ ...memberForm, password: event.target.value })} required /></label><label>졸업기수<input value={memberForm.graduationYear} onChange={(event) => setMemberForm({ ...memberForm, graduationYear: event.target.value })} /></label><label>학과<input value={memberForm.department} onChange={(event) => setMemberForm({ ...memberForm, department: event.target.value })} /></label><div className="admin-editor-actions admin-full"><button type="submit" disabled={loading}>회원 계정 생성</button></div></form></section><section className="admin-workspace"><div className="admin-section-heading"><span>04</span><div><h3>회원 및 권한 관리</h3><p>관리자 권한 변경과 회원 삭제를 할 수 있습니다.</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>이름</th><th>아이디</th><th>기수</th><th>학과</th><th>가입일</th><th>권한</th><th>관리</th></tr></thead><tbody>{members.map((candidate) => <tr key={candidate.id}><td>{candidate.name}</td><td>{candidate.loginId}</td><td>{candidate.graduationYear}</td><td>{candidate.department}</td><td>{formatDate(candidate.createdAt)}</td><td><select value={candidate.role} onChange={(event) => void updateRole(candidate, event.target.value as MemberRole)} disabled={candidate.id === member.id}><option value="member">회원</option><option value="admin">관리자</option></select></td><td><button type="button" className="table-delete" onClick={() => void removeMember(candidate)} disabled={candidate.id === member.id}>삭제</button></td></tr>)}</tbody></table></div></section></div>;
}
