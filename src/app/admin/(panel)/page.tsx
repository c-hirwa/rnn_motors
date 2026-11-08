import Link from "next/link";
import { db } from "@/lib/db";
import { ENQUIRY_TYPES, carName, kes, mediaUrl, timeAgo } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const since = new Date(Date.now() - 30 * 86400_000);
  const [byStatus, soldMonth, newEnq, recent, cars, stockValue] = await Promise.all([
    db.car.groupBy({ by: ["status"], _count: true }),
    db.car.count({ where: { status: "sold", soldAt: { gte: since } } }),
    db.enquiry.count({ where: { status: "new" } }),
    db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { car: { select: { make: true, model: true, slug: true } } } }),
    db.car.findMany({ where: { status: { in: ["available", "reserved", "draft"] } }, include: { photos: { orderBy: { position: "asc" } }, _count: { select: { enquiries: true } } }, orderBy: { updatedAt: "desc" } }),
    db.car.aggregate({ where: { status: { in: ["available", "reserved"] } }, _sum: { priceKes: true }, _count: { priceKes: true } }),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;

  const needsWork = cars
    .map((c) => {
      const issues: string[] = [];
      if (!c.priceKes) issues.push("no price");
      if (c.mileageKm == null) issues.push("no mileage");
      if (c.photos.length < 3) issues.push(`${c.photos.length} photo${c.photos.length === 1 ? "" : "s"}`);
      if (!c.year) issues.push("no year");
      return { c, issues };
    })
    .filter((x) => x.issues.length)
    .slice(0, 8);

  const popular = [...cars].sort((a, b) => b._count.enquiries - a._count.enquiries).filter((c) => c._count.enquiries).slice(0, 5);

  return (
    <>
      <header className="ahead">
        <div>
          <h1>Dashboard</h1>
          <p>What's on the floor and who's asking about it.</p>
        </div>
        <Link href="/admin/cars/new" className="btn btn--gold btn--sm">+ Add a car</Link>
      </header>

      <div className="stats">
        <Link href="/admin/cars?status=available" className="stat-card"><small>Available</small><strong>{count("available")}</strong></Link>
        <Link href="/admin/cars?status=reserved" className="stat-card"><small>Reserved</small><strong>{count("reserved")}</strong></Link>
        <Link href="/admin/cars?status=sold" className="stat-card"><small>Sold (30 days)</small><strong>{soldMonth}</strong></Link>
        <Link href="/admin/enquiries?status=new" className={`stat-card ${newEnq ? "stat-card--hot" : ""}`}><small>New enquiries</small><strong>{newEnq}</strong></Link>
        <div className="stat-card stat-card--wide">
          <small>Listed stock value</small>
          <strong>{stockValue._sum.priceKes ? kes(stockValue._sum.priceKes) : "—"}</strong>
          <em>{stockValue._count.priceKes} of {count("available") + count("reserved")} cars have a price</em>
        </div>
      </div>

      <div className="acols">
        <section className="apanel">
          <div className="apanel__head"><h2>Latest enquiries</h2><Link href="/admin/enquiries">View all →</Link></div>
          {recent.length ? (
            <ul className="mini-list">
              {recent.map((e) => (
                <li key={e.id}>
                  <span className={`pill pill--${e.status}`}>{e.status}</span>
                  <div>
                    <strong>{e.name}</strong> · <a href={`tel:${e.phone}`}>{e.phone}</a>
                    <small>{ENQUIRY_TYPES[e.type as keyof typeof ENQUIRY_TYPES] ?? e.type}{e.car ? ` · ${carName(e.car)}` : ""}</small>
                  </div>
                  <time>{timeAgo(e.createdAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No enquiries yet. They'll appear here when people use the forms on the site.</p>
          )}
        </section>

        <section className="apanel">
          <div className="apanel__head"><h2>Listings to finish</h2><Link href="/admin/cars">Inventory →</Link></div>
          {needsWork.length ? (
            <ul className="mini-list">
              {needsWork.map(({ c, issues }) => (
                <li key={c.id}>
                  {c.photos[0] ? <img src={mediaUrl(c.photos[0].key)} alt="" className="thumb" /> : <span className="thumb" />}
                  <div>
                    <Link href={`/admin/cars/${c.id}`}><strong>{carName(c)}</strong></Link>
                    <small className="warn-text">Missing: {issues.join(", ")}</small>
                  </div>
                  <Link href={`/admin/cars/${c.id}`} className="abtn">Edit</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Every listing has a price, mileage and at least 3 photos.</p>
          )}
        </section>
      </div>

      {popular.length > 0 && (
        <section className="apanel">
          <div className="apanel__head"><h2>Most enquired about</h2></div>
          <ul className="mini-list">
            {popular.map((c) => (
              <li key={c.id}>
                {c.photos[0] ? <img src={mediaUrl(c.photos[0].key)} alt="" className="thumb" /> : <span className="thumb" />}
                <div><Link href={`/admin/cars/${c.id}`}><strong>{carName(c)}</strong></Link></div>
                <span className="count">{c._count.enquiries} enquir{c._count.enquiries === 1 ? "y" : "ies"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
