import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap">
        <header className="page__head">
          <p className="eyebrow">404</p>
          <h1 className="h1">Page not found</h1>
          <p>This page or car isn&apos;t here anymore. It may have been sold.</p>
        </header>
        <div className="hero__cta">
          <Link className="btn btn--primary" href="/cars">Browse the showroom</Link>
          <Link className="btn btn--ghost" href="/">Go home</Link>
        </div>
      </div>
    </div>
  );
}
