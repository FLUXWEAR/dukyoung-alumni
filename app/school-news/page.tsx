import type { Metadata } from "next";
import PageHero from "../_components/page-hero";
import SchoolNewsTabs from "../_components/school-news-tabs";
import { OFFICIAL_NOTICE_LIST_URL } from "../../lib/dukyoung-notices";

export const metadata: Metadata = {
  title: "학교 소식",
  description: "덕영고등학교 공식 홈페이지 공지사항을 연결해 최신 소식을 확인합니다.",
};

export default function SchoolNewsPage() {
  return (
    <>
      <PageHero
        eyebrow="OFFICIAL SCHOOL NEWS"
        title="학교 소식"
        description="덕영고등학교 공식 홈페이지의 공지사항을 연결해 한곳에서 확인합니다."
      />
      <section className="subpage-section shell school-news-layout">
        <div className="school-news-intro">
          <span>LIVE CONNECTION</span>
          <h2>공식 공지와<br />자동으로 이어집니다.</h2>
          <p>학교가 새 공지를 올리면 공식 RSS를 통해 이 페이지에도 반영됩니다. 원문은 항상 덕영고등학교 공식 홈페이지에서 열립니다.</p>
          <ul>
            <li>5분 간격 자동 확인</li>
            <li>제목·등록일·공식 원문 연결</li>
            <li>학교 서버 연결 실패 시 공식 목록 안내</li>
          </ul>
          <a href={OFFICIAL_NOTICE_LIST_URL} target="_blank" rel="noreferrer">덕영고 공식 공지사항 ↗</a>
        </div>
        <SchoolNewsTabs />
      </section>
      <section className="source-guidance">
        <div className="shell">
          <strong>출처 안내</strong>
          <p>이 페이지는 덕영고등학교 공식 홈페이지의 공개 RSS를 읽어 목록을 제공합니다. 글의 내용과 첨부파일은 공식 원문을 기준으로 확인해주세요.</p>
        </div>
      </section>
    </>
  );
}
