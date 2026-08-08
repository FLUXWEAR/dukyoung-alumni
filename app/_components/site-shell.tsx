"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type SignedInMember = { name: string; role: "member" | "admin" };

const navItems = [
  { label: "총동문회 소개", href: "/association" },
  { label: "학교 소식", href: "/school-news" },
  { label: "학과 소개", href: "/departments" },
  { label: "행사 안내", href: "/#events" },
  { label: "사진 기록", href: "/#gallery" },
  { label: "자유게시판", href: "/#board" },
  { label: "자료실", href: "/#archive" },
  { label: "동문 찾기", href: "/#alumni" },
];

const searchDestinations = [
  { words: "총동문회 소개 인사말 역사", href: "/association" },
  { words: "학교 소식 공지 알림 가정통신문", href: "/school-news" },
  { words: "학과 경영회계 보건간호 빅데이터 그래픽 인공지능 정보보안", href: "/departments" },
  { words: "행사 일정 신청", href: "/#events" },
  { words: "사진 갤러리 기록", href: "/#gallery" },
  { words: "자유게시판 글쓰기", href: "/#board" },
  { words: "자료실 양식", href: "/#archive" },
  { words: "회원가입 동문 찾기 검색", href: "/register" },
];

type ShellModal = { label: string; title: string; paragraphs: string[] } | null;

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [currentMember, setCurrentMember] = useState<SignedInMember | null>(null);
  const [modal, setModal] = useState<ShellModal>(null);

  const closeNavigation = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModal(null);
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    let active = true;
    const syncMember = async () => {
      try {
        const response = await fetch("/api/auth/session", { credentials: "same-origin" });
        const data = await response.json() as { member: SignedInMember | null };
        if (active) setCurrentMember(data.member);
      } catch {
        if (active) setCurrentMember(null);
      }
    };
    window.addEventListener("storage", syncMember);
    void syncMember();
    return () => {
      active = false;
      window.removeEventListener("storage", syncMember);
    };
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchMessage("검색어를 입력해주세요.");
      return;
    }
    const match = searchDestinations.find((destination) =>
      trimmed.split(/\s+/).some((word) => word.length > 1 && destination.words.includes(word)),
    );
    if (!match) {
      setSearchMessage(`‘${trimmed}’에 대한 검색 결과가 없습니다.`);
      return;
    }
    setSearchMessage(`‘${trimmed}’ 관련 페이지로 이동합니다.`);
    closeNavigation();
    router.push(match.href);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setCurrentMember(null);
    router.push("/");
  };

  return (
    <>
      <a className="skip-link" href="#main-content">본문 바로가기</a>
      <div className="utility">
        <div className="shell utility-inner">
          <span>덕영인과 모교를 잇는 온라인 사랑방</span>
          <div>
            {currentMember ? <>
              <Link href={currentMember.role === "admin" ? "/admin" : "/mypage"} onClick={closeNavigation}>{currentMember.name} 님</Link>
              {currentMember.role === "admin" && <Link href="/admin" onClick={closeNavigation}>관리자</Link>}
              <button type="button" onClick={() => void logout()}>로그아웃</button>
            </> : <>
              <Link href="/login" onClick={closeNavigation}>로그인</Link>
              <Link href="/register" onClick={closeNavigation}>회원가입</Link>
            </>}
            <a href="https://dukyoung-h.goeyi.kr/dukyoung-h/main.do" target="_blank" rel="noreferrer">모교 홈페이지 ↗</a>
          </div>
        </div>
      </div>

      <header>
        <div className="shell brand-row">
          <Link className="brand brand-button" href="/" onClick={closeNavigation} aria-label="덕영고등학교 총동문회 홈">
            <img className="school-logo-img" src="/dukyoung-logo.png" alt="덕영고등학교 로고" />
            <span><strong>덕영고등학교 총동문회</strong><small>DUKYOUNG HIGH SCHOOL ALUMNI ASSOCIATION</small></span>
          </Link>
          <div className="header-actions">
            <button type="button" onClick={() => { setSearchOpen((value) => !value); setMenuOpen(false); }} className="search-button" aria-label={searchOpen ? "검색 닫기" : "검색 열기"} aria-expanded={searchOpen} aria-controls="site-search-panel">⌕</button>
            <button type="button" onClick={() => { setMenuOpen((value) => !value); setSearchOpen(false); }} className="menu-button" aria-label={menuOpen ? "전체 메뉴 닫기" : "전체 메뉴 열기"} aria-expanded={menuOpen} aria-controls="main-navigation"><i /><i /><i /></button>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel" id="site-search-panel">
            <form className="shell" onSubmit={submitSearch}>
              <label htmlFor="global-site-search">통합검색</label>
              <input id="global-site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 학교 소식, 빅데이터과, 동문 찾기" autoFocus />
              <button type="submit">검색</button>
            </form>
            {searchMessage && <p className="shell site-search-status" role="status">{searchMessage}</p>}
          </div>
        )}
        <nav className={menuOpen ? "open" : ""} aria-label="주요 메뉴" id="main-navigation">
          <div className="shell nav-inner">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeNavigation} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>
            ))}
          </div>
        </nav>
      </header>

      <main id="main-content">{children}</main>

      <footer id="contact">
        <div className="shell footer-top">
          <div className="footer-brand"><img className="footer-logo-img" src="/dukyoung-logo.png" alt="덕영고등학교 로고" /><strong>덕영고등학교 총동문회</strong></div>
          <div className="footer-links">
            <button type="button" onClick={() => setModal({ label: "PRIVACY", title: "개인정보처리방침", paragraphs: ["동문 정보는 본인이 직접 제공하고 공개에 동의한 범위에서만 사용합니다.", "개인 연락처는 검색 결과에 공개하지 않습니다."] })}>개인정보처리방침</button>
            <button type="button" onClick={() => setModal({ label: "TERMS", title: "이용약관", paragraphs: ["타인의 개인정보를 동의 없이 게시할 수 없습니다.", "운영 세칙은 총동문회 확인 후 확정합니다."] })}>이용약관</button>
            <a href="https://dukyoung-h.goeyi.kr/dukyoung-h/main.do" target="_blank" rel="noreferrer">모교 홈페이지 ↗</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <p>경기도 용인시 처인구 고림로74번길 15 (덕영고등학교)<br />학교 대표전화 031-329-4300 · 총동문회 사무국 연락처는 확정 후 안내</p>
          <p>Copyright © Dukyoung High School Alumni Association. All rights reserved.</p>
        </div>
      </footer>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="shell-modal-title">
            <button type="button" className="modal-close" onClick={() => setModal(null)} aria-label="창 닫기">×</button>
            <span className="modal-kicker">{modal.label}</span>
            <h2 id="shell-modal-title">{modal.title}</h2>
            <div className="info-modal-body">{modal.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>
        </div>
      )}
    </>
  );
}
