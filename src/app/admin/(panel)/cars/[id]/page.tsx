import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ENQUIRY_TYPES, mediaUrl, timeAgo } from "@/lib/format";
import CarForm from "../CarForm";

export const metadata = { title: "Edit car" };

export default async function EditCar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await db.car.findUnique({
    where: { id },
    include: { photos: { orderBy: { position: "asc" } }, enquiries: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!car) notFound();
  const { photos, enquiries, createdAt: _c, updatedAt, soldAt: _s, ...rest } = car;
  return (
    <>
      <header className="ahead">
        <div>
          <Link href="/admin/cars" className="back">← Inventory</Link>
          <h1>{car.make} {car.model}</h1>
          <p>Last updated {timeAgo(updatedAt)}{enquiries.length ? ` · ${enquiries.length} enquir${enquiries.length === 1 ? "y" : "ies"}` : ""}</p>
        </div>
      </header>
      <CarForm car={{ ...rest, photos: photos.map((p) => ({ id: p.id, url: mediaUrl(p.key), focus: p.focus })) }} />
      {enquiries.length > 0 && (
        <section className="apanel">
          <div className="apanel__head"><h2>Enquiries about this car</h2><Link href="/admin/enquiries">All enquiries →</Link></div>
          <ul className="mini-list">
            {enquiries.map((e) => (
              <li key={e.id}>
                <span className={`pill pill--${e.status}`}>{e.status}</span>
                <div>
                  <strong>{e.name}</strong> · <a href={`tel:${e.phone}`}>{e.phone}</a>
                  <small>{ENQUIRY_TYPES[e.type as keyof typeof ENQUIRY_TYPES] ?? e.type}{e.message ? ` · “${e.message.slice(0, 80)}”` : ""}</small>
                </div>
                <time>{timeAgo(e.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
