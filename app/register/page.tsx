import type { Metadata } from "next";
import { RegisterPortal } from "../_components/auth-portal";
import PageHero from "../_components/page-hero";

export const metadata: Metadata = {
  title: "회원가입",
  description: "덕영고등학교 총동문회 동문회원 가입 페이지입니다.",
};

export default function RegisterPage() {
  return <><PageHero eyebrow="MEMBER SERVICE" title="회원가입" description="동문 정보를 직접 등록하고 총동문회 온라인 공간에 참여하세요." /><section className="auth-page shell"><RegisterPortal /></section></>;
}
