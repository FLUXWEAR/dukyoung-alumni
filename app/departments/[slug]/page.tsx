import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { departmentProfiles, getDepartment } from "../../_data/departments";

type DepartmentPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return departmentProfiles.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({ params }: DepartmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) return { title: "학과 소개" };
  return { title: department.name, description: department.summary };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) notFound();
  const currentIndex = departmentProfiles.findIndex((item) => item.slug === department.slug);
  const nextDepartment = departmentProfiles[(currentIndex + 1) % departmentProfiles.length];

  return (
    <>
      <section className={`department-hero tone-${department.tone}`}>
        <div className="shell">
          <p className="subpage-breadcrumb"><Link href="/">홈</Link><span>/</span><Link href="/departments">학과 소개</Link><span>/</span>{department.name}</p>
          <span>{department.englishName}</span>
          <h1>{department.name}</h1>
          <strong>{department.tagline}</strong>
          <p>{department.summary}</p>
        </div>
      </section>
      <section className="subpage-section shell department-detail-layout">
        <div className="department-detail-main">
          <section>
            <span>WHAT WE LEARN</span>
            <h2>주요 배움 영역</h2>
            <div className="learning-grid">{department.learning.map((item, index) => <article key={item}><b>{String(index + 1).padStart(2, "0")}</b><h3>{item}</h3><p>기초 개념부터 프로젝트와 실무 적용까지 단계적으로 경험합니다.</p></article>)}</div>
          </section>
          <section>
            <span>CAREER PATH</span>
            <h2>진로 방향</h2>
            <ul className="pathway-list">{department.pathways.map((pathway) => <li key={pathway}>{pathway}</li>)}</ul>
          </section>
          <section className="alumni-connection">
            <span>ALUMNI CONNECTION</span>
            <h2>선배와 후배를 잇습니다.</h2>
            <p>{department.alumniValue}</p>
          </section>
        </div>
        <aside className="department-side">
          <strong>공식 학과 자료</strong>
          <p>교육과정과 모집 정보는 학교의 최신 공식 자료를 함께 확인해주세요.</p>
          <a href={department.officialUrl} target="_blank" rel="noreferrer">덕영고 공식 학과 소개 ↗</a>
          <Link href="/departments">전체 학과 목록</Link>
        </aside>
      </section>
      <section className="next-department">
        <Link className="shell" href={`/departments/${nextDepartment.slug}`}>
          <span>다음 학과</span><strong>{nextDepartment.name}</strong><em>소개 보기 →</em>
        </Link>
      </section>
    </>
  );
}
