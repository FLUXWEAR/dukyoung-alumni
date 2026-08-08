import type { Metadata } from "next";
import { AdminPortal } from "../_components/auth-portal";
import PageHero from "../_components/page-hero";

export const metadata: Metadata = {
  title: "관리자",
  description: "덕영고등학교 총동문회 관리자 페이지입니다.",
};

export default function AdminPage() {
  return <><PageHero eyebrow="ADMINISTRATION" title="관리자 페이지" description="총동문회 회원 현황과 로컬 MVP 데이터를 확인합니다." /><section className="auth-page shell"><AdminPortal /></section></>;
}
