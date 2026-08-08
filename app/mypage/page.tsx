import type { Metadata } from "next";
import { MyPagePortal } from "../_components/auth-portal";
import PageHero from "../_components/page-hero";

export const metadata: Metadata = {
  title: "내 정보",
  description: "덕영고등학교 총동문회 회원 정보 페이지입니다.",
};

export default function MyPage() {
  return <><PageHero eyebrow="MEMBER SERVICE" title="내 정보" description="가입한 동문회원 정보를 확인합니다." /><section className="auth-page shell"><MyPagePortal /></section></>;
}
