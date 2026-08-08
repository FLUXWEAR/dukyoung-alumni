import Link from "next/link";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="subpage-hero">
      <div className="shell">
        <p className="subpage-breadcrumb"><Link href="/">홈</Link><span>/</span>{title}</p>
        <span className="subpage-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
