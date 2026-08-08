import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../_components/page-hero";

export const metadata: Metadata = {
  title: "총동문회 소개",
  description: "덕영고등학교 총동문회의 역할과 운영 방향을 소개합니다.",
};

export default function AssociationPage() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT THE ASSOCIATION"
        title="총동문회 소개"
        description="덕영의 이름으로 이어진 인연을 잇고, 모교와 후배들의 내일을 함께 응원합니다."
      />
      <section className="subpage-section shell association-detail">
        <div className="detail-lead">
          <span>OUR PURPOSE</span>
          <h2>덕영의 시간과 사람을<br />오래 이어가는 동문 공동체</h2>
          <p>덕영고등학교 총동문회는 졸업생들이 기수와 세대를 넘어 서로의 소식을 나누고, 모교의 성장과 후배들의 꿈을 함께 응원하기 위한 동문 공동체입니다.</p>
          <p>새 홈페이지는 공지와 행사, 경조사, 사진 기록, 자료와 동문 연결을 한곳에서 제공하는 공식 온라인 사랑방으로 운영할 예정입니다.</p>
        </div>
        <div className="purpose-grid">
          <article><b>01</b><h3>동문 연결</h3><p>직접 가입하고 공개에 동의한 동문끼리 안전하게 안부를 나눕니다.</p></article>
          <article><b>02</b><h3>모교 지원</h3><p>장학사업과 발전사업으로 재학생과 모교의 내일을 함께 응원합니다.</p></article>
          <article><b>03</b><h3>기록 보존</h3><p>행사, 사진, 동문 소식과 학교의 역사를 다음 세대에 남깁니다.</p></article>
          <article><b>04</b><h3>투명한 운영</h3><p>회비와 사업 내역은 총동문회 확인을 거쳐 정확하게 안내합니다.</p></article>
        </div>
      </section>
      <section className="subpage-band">
        <div className="shell greeting-panel">
          <span>GREETING</span>
          <h2>동문 여러분, 반갑습니다.</h2>
          <p>덕영의 이름으로 이어진 인연이 서로에게 든든한 힘이 되고, 모교와 후배들의 내일을 함께 응원할 수 있도록 총동문회가 가까이에서 소통하겠습니다.</p>
          <small>총동문회장 성명과 정식 인사말은 회장단 확인 후 게시합니다.</small>
        </div>
      </section>
      <section className="subpage-section shell next-links">
        <Link href="/school-news"><span>모교의 새 소식</span><strong>학교 소식 확인하기 →</strong></Link>
        <Link href="/departments"><span>현재의 덕영</span><strong>6개 학과 만나보기 →</strong></Link>
      </section>
    </>
  );
}
