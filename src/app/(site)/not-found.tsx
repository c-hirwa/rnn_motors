import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page page--404">
      <p className="eyebrow"><span className="line" /> 404</p>
      <h1 className="h1">Wrong <em>turn.</em></h1>
      <p className="page__lede">That page or car isn't here anymore. It may have been sold.</p>
      <div className="hero__cta">
        <Link className="btn btn--gold" href="/cars">Browse the showroom <span className="arrow">→</span></Link>
        <Link className="btn btn--ghost" href="/import">Import one instead</Link>
      </div>
    </section>
  );
}
