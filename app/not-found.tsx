import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found shell">
      <span>404</span>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>주소를 다시 확인하거나 총동문회 첫 화면으로 이동해주세요.</p>
      <Link href="/">첫 화면으로 돌아가기</Link>
    </section>
  );
}
