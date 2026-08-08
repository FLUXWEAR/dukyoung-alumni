"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OfficialNoticeFeed from "./_components/official-notice-feed";
import { departmentProfiles } from "./_data/departments";

type InfoModal = {
  label: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  actionLabel?: string;
  action?: () => void;
};

const notices = [
  { category: "공지", title: "덕영고등학교 총동문회 홈페이지를 새롭게 준비합니다", date: "2026.08.05", body: "동문 소식과 행사, 사진, 자료를 한곳에서 나눌 수 있도록 홈페이지를 준비하고 있습니다. 공개 전 등록되는 일정과 연락처는 총동문회 확인을 거쳐 확정합니다.", pinned: true },
  { category: "공지", title: "2026년 하반기 총동문회 이사회 개최 안내", date: "2026.08.01", body: "하반기 이사회 일정과 장소는 회장단 협의 후 최종 공지합니다. 임원 및 기수대표께는 별도로 안내할 예정입니다.", pinned: true },
  { category: "동문", title: "기수별 연락망 정비 및 동문 정보 확인 요청", date: "2026.07.28", body: "동문 정보는 본인이 직접 등록한 내용만 사용하며, 검색 공개 여부는 회원이 직접 선택할 수 있습니다." },
  { category: "소식", title: "모교 발전기금 및 장학사업 참여 안내", date: "2026.07.21", body: "모교 발전기금과 장학사업 관련 공식 안내는 총동문회와 학교 확인 후 게시합니다." },
  { category: "경조", title: "동문 경조사 소식 접수 방법 안내", date: "2026.07.15", body: "경조사 소식은 당사자 또는 가족의 동의를 확인한 뒤 게시합니다. 개인정보가 포함된 내용은 공개 범위를 먼저 확인합니다." },
];

const events = [
  { day: "22", month: "8월", title: "총동문회 임원회의", detail: "토요일 오후 2시 · 모교 회의실", body: "참석 대상은 총동문회 임원 및 기수대표입니다. 세부 안건은 참석자에게 별도 안내합니다." },
  { day: "12", month: "9월", title: "기수대표 간담회", detail: "토요일 오후 4시 · 장소 추후 공지", body: "기수별 소식 공유와 연락망 정비를 위한 간담회입니다. 장소는 확정 후 공지합니다." },
  { day: "24", month: "10월", title: "2026 덕영 동문의 날", detail: "토요일 오전 10시 · 모교 운동장", body: "전 동문이 함께하는 모교 방문 행사입니다. 세부 프로그램과 참가 신청은 회장단 확인 후 공지합니다." },
];

const gallery = [
  { label: "2025 동문의 날", className: "gallery-one", caption: "기수와 세대를 넘어 함께했던 동문의 날 기록입니다." },
  { label: "모교 방문의 날", className: "gallery-two", caption: "달라진 교정과 후배들의 배움터를 둘러보는 모교 방문 행사입니다." },
  { label: "장학금 전달식", className: "gallery-three", caption: "후배들의 꿈을 응원하는 동문 장학사업의 기록입니다." },
];

type PublicContent = { title: string; body: string; eventDate: string | null; updatedAt: string };

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "공지" : date.toISOString().slice(0, 10).replaceAll("-", ".");
}

function eventCard(content: PublicContent) {
  const date = content.eventDate ? new Date(`${content.eventDate}T00:00:00`) : new Date();
  return {
    day: String(date.getDate()),
    month: `${date.getMonth() + 1}월`,
    title: content.title,
    detail: content.body,
    body: content.body,
  };
}

export default function Home() {
  const [searchMessage, setSearchMessage] = useState("");
  const [infoModal, setInfoModal] = useState<InfoModal | null>(null);
  const [boardPosts, setBoardPosts] = useState([
    "자유게시판 이용 안내",
    "기수별 소모임 등록 방법",
    "동문 소식 제보 안내",
  ]);
  const [managedNotices, setManagedNotices] = useState(notices);
  const [managedEvents, setManagedEvents] = useState(events);

  useEffect(() => {
    const loadManagedContent = async () => {
      try {
        const [noticeResponse, eventResponse] = await Promise.all([
          fetch("/api/content?category=notice"),
          fetch("/api/content?category=event"),
        ]);
        const noticeData = await noticeResponse.json() as { items?: PublicContent[] };
        const eventData = await eventResponse.json() as { items?: PublicContent[] };
        if (noticeResponse.ok && noticeData.items?.length) {
          setManagedNotices(noticeData.items.map((item) => ({ category: "공지", title: item.title, date: displayDate(item.updatedAt), body: item.body, pinned: false })));
        }
        if (eventResponse.ok && eventData.items?.length) {
          setManagedEvents(eventData.items.map(eventCard));
        }
      } catch {
        // Keep the initial content visible while the database starts or reconnects.
      }
    };
    void loadManagedContent();
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <>
      <section className="hero" id="top">
        <div className="hero-pattern" aria-hidden="true"></div>
        <div className="shell hero-content">
          <p className="eyebrow">1974년의 첫걸음, 이어지는 덕영의 이름</p>
          <h1>반가운 이름들이<br/>다시 만나는 곳</h1>
          <p className="hero-copy">세대와 기수를 넘어 서로의 안부를 묻고,<br/>모교와 동문의 내일을 함께 만들어갑니다.</p>
          <div className="hero-links"><Link href="/association">총동문회 소개 <span>→</span></Link><Link href="/register">동문회원 가입 <span>→</span></Link></div>
        </div>
        <div className="hero-word" aria-hidden="true">DUKYOUNG</div>
      </section>

      <section className="quick-links" aria-label="자주 찾는 메뉴">
        <div className="shell quick-grid">
          <button type="button" onClick={() => goTo("alumni")}><b>01</b><span><strong>동문 찾기</strong><small>공개에 동의한 동문만 찾기</small></span><em>→</em></button>
          <button type="button" onClick={() => goTo("events")}><b>02</b><span><strong>행사 신청</strong><small>총동문회 행사 확인 및 신청</small></span><em>→</em></button>
          <button type="button" onClick={() => goTo("fee")}><b>03</b><span><strong>동문회비 안내</strong><small>회비 납부와 사용내역 안내</small></span><em>→</em></button>
          <button type="button" onClick={() => setInfoModal({ label: "FAMILY NEWS", title: "경조사 소식 접수", paragraphs: ["경조사 소식은 당사자 또는 가족의 동의가 확인된 경우에만 게시합니다.", "총동문회 사무국 연락처가 확정되면 온라인 접수 기능을 연결합니다."], actionLabel: "자유게시판 보기", action: () => { setInfoModal(null); goTo("board"); } })}><b>04</b><span><strong>경조사 알림</strong><small>동문의 기쁜 일과 슬픈 일</small></span><em>→</em></button>
        </div>
      </section>

      <section className="association-section shell" id="association">
        <div className="association-copy"><span>ABOUT THE ASSOCIATION</span><h2>덕영의 인연을 잇고,<br/>함께 내일을 만듭니다.</h2><p>덕영고등학교 총동문회는 모교의 역사를 함께한 졸업생들이 서로의 소식을 나누고 후배들의 성장을 응원하는 동문 공동체입니다. 이 홈페이지는 공지, 행사, 경조사, 사진, 자료와 동문 간 연결을 한곳에서 제공하기 위해 준비했습니다.</p><a className="inline-primary-link" href="/association">총동문회 소개 전체보기 →</a></div>
        <div className="association-values"><article><b>01</b><h3>동문 연결</h3><p>기수와 세대를 넘어 안부와 소식을 나눕니다.</p></article><article><b>02</b><h3>모교 지원</h3><p>장학과 발전사업으로 후배들의 꿈을 응원합니다.</p></article><article><b>03</b><h3>기록 보존</h3><p>덕영의 역사와 동문 활동을 오래 남깁니다.</p></article></div>
      </section>

      <section className="school-section" id="school">
        <div className="shell">
          <div className="school-heading"><div><span>OUR ALMA MATER</span><h2>덕영고등학교를 소개합니다</h2></div><a href="https://dukyoung-h.goeyi.kr/dukyoung-h/main.do" target="_blank" rel="noreferrer">학교 공식 홈페이지 ↗</a></div>
          <div className="school-overview">
            <div className="school-emblem"><img src="/dukyoung-logo.png" alt="덕영고등학교 교표"/><strong>자율 · 성실 · 협동</strong><small>덕영고등학교 교훈</small></div>
            <div className="school-description"><h3>바른 인성과 창의력을 갖춘<br/>글로벌 인재를 키우는 학교</h3><p>덕영고등학교는 1973년 학교법인 덕영학원 인가와 1974년 용인상업고등학교 인가를 시작으로 정보·비즈니스 분야의 전문교육을 발전시켜 온 용인의 특성화고등학교입니다. 2019년 현재의 교명으로 변경했으며, 2026년 제50회 졸업생을 배출했습니다.</p><div className="school-facts"><span><b>1974</b>학교 인가·첫 입학</span><span><b>50회</b>2026년 졸업</span><span><b>18,810명</b>누적 졸업생</span><span><b>6개</b>특성화 학과</span></div></div>
          </div>
          <div className="department-list">{departmentProfiles.map((department) => <a href={`/departments/${department.slug}`} key={department.slug}>{department.name}</a>)}</div>
          <div className="school-symbols"><article><b>교목</b><strong>밤나무</strong><p>강인한 인성과 겸손, 풍요로운 결실을 상징합니다.</p></article><article><b>교화</b><strong>코스모스</strong><p>인내와 신념, 끊임없는 진취성과 번영을 상징합니다.</p></article><article><b>교육목표</b><strong>글로벌 인재 양성</strong><p>바른 인성과 창의력을 갖춘 창의융합 인재를 키웁니다.</p></article></div>
          <p className="source-note">덕영고등학교 공식 홈페이지 학교연혁·인사말·학교상징 기준 (2026년 확인)</p>
        </div>
      </section>

      <section className="official-home-section" id="school-notices">
        <div className="shell">
          <div className="section-heading"><div><span>OFFICIAL SCHOOL NEWS</span><h2>덕영고 공식 공지</h2></div><a href="/school-news">학교 소식 전체보기 <b>＋</b></a></div>
          <OfficialNoticeFeed limit={5} compact />
        </div>
      </section>

      <section className="content-section shell" id="news">
        <div className="board-block">
          <div className="section-heading"><div><span>ALUMNI NEWS</span><h2>동문회 소식</h2></div><button type="button" onClick={() => setInfoModal({ label: "ALUMNI NEWS", title: "동문회 소식 전체보기", paragraphs: managedNotices.map((notice) => `${notice.date}  ${notice.title}`) })}>전체보기 <b>＋</b></button></div>
          <div className="notice-list">{managedNotices.map((item) => <button type="button" className="notice-row" key={item.title} onClick={() => setInfoModal({ label: item.category, title: item.title, paragraphs: [item.body] })}><span className={item.pinned ? "badge pinned" : "badge"}>{item.category}</span><strong>{item.title}</strong><time dateTime={item.date.replaceAll(".", "-")}>{item.date}</time></button>)}</div>
        </div>
        <aside className="president-card"><span>OFFICIAL SCHOOL</span><h2>모교 소식도<br/>함께 확인하세요.</h2><p>현재 재학생의 교육활동, 학교 공지와 학과 정보는 덕영고등학교 공식 홈페이지에서 확인할 수 있습니다.</p><a href="https://dukyoung-h.goeyi.kr/dukyoung-h/main.do" target="_blank" rel="noreferrer">학교 홈페이지 바로가기 <b>↗</b></a><div className="signature">대표전화 031-329-4300</div></aside>
      </section>

      <section className="event-section" id="events"><div className="shell"><div className="section-heading light"><div><span>UPCOMING EVENTS</span><h2>다가오는 동문회 일정</h2></div><button type="button" onClick={() => setInfoModal({ label: "EVENT CALENDAR", title: "동문회 전체 일정", paragraphs: managedEvents.map((event) => `${event.month} ${event.day}일  ${event.title} · ${event.detail}`) })}>전체 일정 <b>＋</b></button></div><div className="event-grid">{managedEvents.map((event) => <button type="button" className="event-card" key={event.title} onClick={() => setInfoModal({ label: "EVENT", title: event.title, paragraphs: [event.detail, event.body], actionLabel: "참가 신청", action: () => setInfoModal({ label: "APPLICATION", title: "참가 신청 안내", paragraphs: ["현재 행사 참여 신청은 총동문회 관리자 확인 후 열립니다."] }) })}><div className="date"><b>{event.day}</b><span>{event.month}</span></div><div><h3>{event.title}</h3><p>{event.detail}</p></div><em>→</em></button>)}</div></div></section>

      <section className="gallery-section shell" id="gallery"><div className="section-heading"><div><span>PHOTO ARCHIVE</span><h2>사진으로 만나는 덕영</h2></div><button type="button" onClick={() => setInfoModal({ label: "PHOTO ARCHIVE", title: "동문회 사진 갤러리", paragraphs: gallery.map((photo) => `${photo.label} · ${photo.caption}`) })}>사진 더보기 <b>＋</b></button></div><div className="gallery-grid">{gallery.map((photo, index) => <button type="button" className={`gallery-card ${photo.className}`} key={photo.label} onClick={() => setInfoModal({ label: "PHOTO", title: photo.label, paragraphs: [photo.caption, "실제 행사 사진은 총동문회 제공 자료로 교체합니다."] })}><div className="photo-mark"><span>덕영</span><b>{index === 0 ? "한마음" : index === 1 ? "모교" : "동행"}</b></div><span className="photo-label"><strong>{photo.label}</strong><small>행사 사진 보기 →</small></span></button>)}</div></section>

      <section className="community-section" id="board"><div className="shell community-grid"><div className="community-board"><div className="section-heading"><div><span>COMMUNITY</span><h2>자유게시판</h2></div></div><div className="community-list">{boardPosts.map((post, index) => <button type="button" key={`${post}-${index}`} onClick={() => setInfoModal({ label: "FREE BOARD", title: post, paragraphs: ["동문회원이 소식과 의견을 나누는 게시판입니다. 개인정보와 타인의 연락처는 동의 없이 게시할 수 없습니다."] })}><span>{String(index + 1).padStart(2, "0")}</span><strong>{post}</strong><em>보기 →</em></button>)}</div><form className="board-write" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const title = String(data.get("title") || "").trim(); if (title) { setBoardPosts((posts) => [title, ...posts]); event.currentTarget.reset(); } }}><label htmlFor="board-title">새 글 제목</label><input id="board-title" name="title" placeholder="MVP 게시글 제목을 입력하세요" required/><button type="submit">글 등록</button></form><small>현재 브라우저에서만 보이는 기능 확인용 게시글이며 새로고침하면 초기화됩니다.</small></div><div className="archive-board" id="archive"><div className="section-heading"><div><span>DOWNLOADS</span><h2>자료실</h2></div></div><button type="button" onClick={() => setInfoModal({ label: "DOCUMENT", title: "총동문회 홈페이지 이용안내", paragraphs: ["공지·행사·게시판·갤러리 이용 기준과 개인정보 보호 원칙을 안내하는 자료입니다."] })}><strong>총동문회 홈페이지 이용안내</strong><span>보기 →</span></button><button type="button" onClick={() => setInfoModal({ label: "DOCUMENT", title: "동문 정보 변경 요청 안내", paragraphs: ["동문 정보는 본인이 직접 등록하고 수정합니다. 검색 공개 여부도 마이페이지에서 변경할 수 있습니다."] })}><strong>동문 정보 변경 요청 안내</strong><span>보기 →</span></button><button type="button" onClick={() => setInfoModal({ label: "DOCUMENT", title: "경조사 소식 접수 안내", paragraphs: ["당사자 또는 가족 동의를 확인한 경조사만 게시하며 공개 범위를 접수 단계에서 선택합니다."] })}><strong>경조사 소식 접수 안내</strong><span>보기 →</span></button></div></div></section>

      <section className="member-section" id="join"><div className="shell member-layout"><div className="member-intro"><span>MEMBERSHIP</span><h2>간편하게 가입하고,<br/>원할 때만 나를 알립니다.</h2><p>기존 졸업생 명단을 임의로 등록하지 않습니다. 동문이 직접 가입하고 공개 여부를 선택하는 방식으로 운영합니다.</p><Link href="/register" className="kakao-button"><b>k</b> 회원가입 페이지로 이동</Link><small>카카오 간편인증 연동으로 별도의 휴대폰 본인확인 비용 부담을 줄일 예정입니다.</small></div><ol className="member-steps"><li><b>1</b><div><strong>회원 정보 입력</strong><p>가입 페이지에서 필요한 동문 정보를 직접 등록합니다.</p></div></li><li><b>2</b><div><strong>동문 정보 직접 등록</strong><p>졸업기수와 이름 등 필요한 정보만 본인이 입력합니다.</p></div></li><li><b>3</b><div><strong>검색 공개 여부 선택</strong><p>동문 찾기 노출은 선택사항이며 언제든 변경할 수 있습니다.</p></div></li><li><b>4</b><div><strong>연결 요청으로 연락</strong><p>연락처를 공개하지 않고 상대방이 수락하면 연결됩니다.</p></div></li></ol></div></section>

      <section className="alumni-search" id="alumni"><div className="shell search-inner"><div><span>ALUMNI DIRECTORY</span><h2>그리운 동문을 찾고 계신가요?</h2><p>직접 가입하고 검색 공개에 동의한 동문만 확인할 수 있습니다.<br/>개인 연락처는 공개되지 않으며 연결 요청을 통해 연락합니다.</p></div><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setSearchMessage(`${data.get("classYear")} · ‘${data.get("alumniName")}’ 검색 결과: 현재 공개 등록된 동문이 없습니다.`); }}><label className="sr-only" htmlFor="class-year">졸업기수</label><select id="class-year" name="classYear" required defaultValue=""><option value="">졸업기수 선택</option><option>1회</option><option>2회</option><option>3회</option><option>기타</option></select><label className="sr-only" htmlFor="alumni-name">동문 이름</label><input id="alumni-name" name="alumniName" placeholder="이름을 입력하세요" required/><button type="submit">동문 찾기</button></form></div>{searchMessage && <div className="shell search-notice" role="status"><span>검색 결과</span>{searchMessage}<Link href="/register">회원가입</Link></div>}</section>

      <section className="fee-section" id="fee"><div className="shell fee-inner"><div><span>ALUMNI DUES</span><h2>동문회비 안내</h2><p>동문회비는 동문 교류 행사, 장학사업과 모교 발전 지원에 사용됩니다. 납부계좌와 금액, 사용내역은 총동문회 확인 후 투명하게 공개합니다.</p></div><div className="fee-status"><b>납부 정보 확인 중</b><p>회장단과 사무국의 최종 확인 전에는 임의의 계좌를 게시하지 않습니다.</p><button type="button" onClick={() => setInfoModal({ label: "ALUMNI DUES", title: "동문회비 문의", paragraphs: ["납부계좌·금액·연락처는 총동문회 사무국 확인 후 공개됩니다.", "확정 전 잘못된 송금을 막기 위해 현재는 계좌정보를 표시하지 않습니다."] })}>회비 안내 확인</button></div></div></section>

    {infoModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInfoModal(null); }}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title"><button type="button" className="modal-close" onClick={() => setInfoModal(null)} aria-label="창 닫기">×</button><span className="modal-kicker">{infoModal.label}</span><h2 id="info-modal-title">{infoModal.title}</h2><div className="info-modal-body">{infoModal.paragraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}{infoModal.bullets && <ul>{infoModal.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div>{infoModal.actionLabel && <button type="button" className="modal-action" onClick={infoModal.action}>{infoModal.actionLabel}</button>}</section></div>}
  </>;
}
