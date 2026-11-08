import Link from "next/link";
import { db } from "@/lib/db";
import { ENQUIRY_STATUSES, ENQUIRY_TYPES, carName, timeAgo } from "@/lib/format";
import EnquiryActions from "./EnquiryActions";

export const metadata = { title: "Enquiries" };

const LABELS: Record<string, string> = {
  occasion: "Occasion", date: "Date", duration: "Duration", pickup: "Pick-up", viewingDate: "Viewing date",
  spec: "Spec", estimateKes: "Web estimate (KES)", currency: "Currency", price: "Price abroad", origin: "From", fuel: "Fuel", cc: "Engine (cc)", year: "Year",
};

export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string; type?: string }> }) {
  const sp = await searchParams;
  const status = sp.status && sp.status in ENQUIRY_STATUSES ? sp.status : undefined;
  const type = sp.type && sp.type in ENQUIRY_TYPES ? sp.type : undefined;
  const [list, counts] = await Promise.all([
    db.enquiry.findMany({
      where: { status, type },
      orderBy: { createdAt: "desc" },
      include: { car: { select: { id: true, make: true, model: true, slug: true } } },
      take: 200,
    }),
    db.enquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const c = (s: string) => counts.find((x) => x.status === s)?._count ?? 0;
  const total = counts.reduce((a, b) => a + b._count, 0);
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ status, type, ...o }).filter(([, v]) => v) as [string, string][]);
    return p.size ? `?${p}` : "";
  };

  return (
    <>
      <header className="ahead">
        <div>
          <h1>Enquiries</h1>
          <p>Everything sent through the website's forms: car enquiries, viewings, hire bookings and import quotes.</p>
        </div>
      </header>

      <div className="atoolbar atoolbar--bare">
        <div className="atabs">
          <Link href={`/admin/enquiries${q({ status: undefined })}`} className={!status ? "is-active" : ""}>All <span>{total}</span></Link>
          {Object.entries(ENQUIRY_STATUSES).map(([k, v]) => (
            <Link key={k} href={`/admin/enquiries${q({ status: k })}`} className={status === k ? "is-active" : ""}>{v} <span>{c(k)}</span></Link>
          ))}
        </div>
        <div className="atabs atabs--small">
          <Link href={`/admin/enquiries${q({ type: undefined })}`} className={!type ? "is-active" : ""}>Any type</Link>
          {Object.entries(ENQUIRY_TYPES).map(([k, v]) => (
            <Link key={k} href={`/admin/enquiries${q({ type: k })}`} className={type === k ? "is-active" : ""}>{v}</Link>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="enq-list">
          {list.map((e) => {
            let details: Record<string, unknown> = {};
            try { details = JSON.parse(e.details); } catch {}
            const entries = Object.entries(details).filter(([, v]) => v !== "" && v != null);
            const phone = e.phone.replace(/[^\d+]/g, "");
            const waNum = phone.startsWith("+") ? phone.slice(1) : phone.startsWith("0") ? "254" + phone.slice(1) : phone;
            return (
              <article key={e.id} className={`enq enq--${e.status}`}>
                <div className="enq__head">
                  <span className={`pill pill--${e.status}`}>{e.status}</span>
                  <span className="enq__type">{ENQUIRY_TYPES[e.type as keyof typeof ENQUIRY_TYPES] ?? e.type}</span>
                  <time title={e.createdAt.toLocaleString("en-GB")}>{timeAgo(e.createdAt)}</time>
                </div>
                <h3>{e.name}</h3>
                <div className="enq__contact">
                  <a href={`tel:${phone}`}>📞 {e.phone}</a>
                  <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener">WhatsApp ↗</a>
                  {e.email && <a href={`mailto:${e.email}`}>✉ {e.email}</a>}
                </div>
                {e.car && <p className="enq__car">Car: <Link href={`/admin/cars/${e.car.id}`}>{carName(e.car)}</Link> · <a href={`/cars/${e.car.slug}`} target="_blank" rel="noopener">view ↗</a></p>}
                {e.message && <p className="enq__msg">{e.message}</p>}
                {entries.length > 0 && (
                  <dl className="enq__details">
                    {entries.map(([k, v]) => (
                      <div key={k}><dt>{LABELS[k] ?? k}</dt><dd>{typeof v === "number" ? v.toLocaleString("en-KE") : String(v)}</dd></div>
                    ))}
                  </dl>
                )}
                <EnquiryActions id={e.id} status={e.status} />
              </article>
            );
          })}
        </div>
      ) : (
        <section className="apanel"><p className="empty">No enquiries here yet.</p></section>
      )}
    </>
  );
}
