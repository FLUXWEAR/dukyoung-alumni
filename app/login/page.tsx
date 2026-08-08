import type { Metadata } from "next";
import { LoginPortal } from "../_components/auth-portal";
import PageHero from "../_components/page-hero";

export const metadata: Metadata = {
  title: "로그인",
  description: "덕영고등학교 총동문회 회원 로그인 페이지입니다.",
};

export default function LoginPage() {
  return <><PageHero eyebrow="MEMBER SERVICE" title="로그인" description="가입한 동문회원 계정으로 로그인해주세요." /><section className="auth-page shell"><LoginPortal /></section></>;
}
