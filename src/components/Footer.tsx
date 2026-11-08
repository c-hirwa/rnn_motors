import Link from "next/link";
import { SITE, waLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__cta" data-reveal>
        <p className="eyebrow">Ready when you are</p>
        <a href={waLink("Hi RNN Motors, I'd like to book a viewing.")} target="_blank" rel="noopener" className="footer__big" data-magnetic>
          Book a viewing <span>→</span>
        </a>
      </div>
      <div className="footer__cols" data-reveal-group>
        <div>
          <h5>Showroom</h5>
          <p>{SITE.address.line1}<br />Lavington, Nairobi</p>
        </div>
        <div>
          <h5>Call</h5>
          <p>
            {SITE.phones.map((p) => (
              <span key={p.tel}><a href={`tel:${p.tel}`}>{p.label}</a><br /></span>
            ))}
          </p>
        </div>
        <div>
          <h5>Hours</h5>
          <p>Mon–Fri 9:00–17:00<br />Sat 9:00–13:00 · Sun closed</p>
        </div>
        <div>
          <h5>Explore</h5>
          <p>
            <Link href="/cars">Showroom</Link> · <Link href="/import">Import</Link> · <Link href="/hire">Hire</Link>
            <br />
            <a href={SITE.instagram} target="_blank" rel="noopener">Instagram ↗</a>
          </p>
        </div>
      </div>
      <div className="footer__word" aria-hidden="true">RNN MOTORS</div>
      <div className="footer__legal">
        <span>© {new Date().getFullYear()} RNN Motors. Cars for everyone.</span>
        <span><Link href="/admin">Staff login</Link></span>
      </div>
    </footer>
  );
}
