import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="brand"><span className="brand__rnn">RNN</span><span className="brand__motors">Motors</span></Link>
            <p>Luxury car sales, importation and chauffeured hire in Lavington, Nairobi. Cars for everyone.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/cars">Showroom</Link></li>
              <li><Link href="/import">Import a car</Link></li>
              <li><Link href="/hire">Car hire</Link></li>
              <li><Link href="/visit">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              {SITE.phones.map((p) => <li key={p.tel}><a href={`tel:${p.tel}`}>{p.label}</a></li>)}
              <li><a href={SITE.instagram} target="_blank" rel="noopener">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h4>Showroom</h4>
            <ul>
              <li>{SITE.address.line1}, Lavington</li>
              <li>Mon–Fri 9:00–17:00</li>
              <li>Sat 9:00–13:00</li>
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} RNN Motors</span>
          <a href={SITE.instagram} target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
