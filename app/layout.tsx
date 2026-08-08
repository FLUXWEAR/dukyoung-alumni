import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "./_components/site-shell";

export const metadata: Metadata = {
  title: {
    default: "덕영고등학교 총동문회",
    template: "%s | 덕영고등학교 총동문회",
  },
  description: "덕영고등학교 동문 소식, 행사 일정, 사진과 동문 정보를 함께 나누는 총동문회 홈페이지입니다.",
  applicationName: "Dukyoung",
  authors: [{ name: "Dukyoung" }],
  creator: "Dukyoung",
  publisher: "Dukyoung",
  icons: { icon: "/dukyoung-logo.png", shortcut: "/dukyoung-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><SiteShell>{children}</SiteShell></body></html>;
}
