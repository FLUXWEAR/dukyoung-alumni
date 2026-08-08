import type { Metadata } from "next";
import PageHero from "../_components/page-hero";
import { departmentProfiles } from "../_data/departments";

export const metadata: Metadata = {
  title: "학과 소개",
  description: "덕영고등학교의 6개 특성화 학과를 소개합니다.",
};

export default function DepartmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="DUKYOUNG DEPARTMENTS"
        title="학과 소개"
        description="현재의 덕영을 만드는 6개 특성화 학과와 배움의 방향을 만나보세요."
      />
      <section className="subpage-section shell">
        <div className="department-page-heading">
          <div><span>6 DEPARTMENTS</span><h2>배움에서 현장으로,<br />각자의 길을 만드는 학과</h2></div>
          <p>학과 카드를 누르면 학과별 소개, 주요 배움 영역과 진로 방향을 별도 페이지에서 확인할 수 있습니다.</p>
        </div>
        <div className="department-card-grid">
          {departmentProfiles.map((department, index) => (
            <a className={`department-card tone-${department.tone}`} href={`/departments/${department.slug}`} key={department.slug}>
              <div className="department-card-top"><span>{String(index + 1).padStart(2, "0")}</span><em>{department.englishName}</em></div>
              <h2>{department.name}</h2>
              <strong>{department.tagline}</strong>
              <p>{department.summary}</p>
              <div>{department.learning.slice(0, 3).map((item) => <small key={item}>{item}</small>)}</div>
              <b>학과 자세히 보기 →</b>
            </a>
          ))}
        </div>
        <p className="department-source-note">학과 구성과 공식 소개 링크는 덕영고등학교 공식 홈페이지 기준입니다.</p>
      </section>
    </>
  );
}
