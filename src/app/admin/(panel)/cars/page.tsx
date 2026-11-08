import Link from "next/link";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/format";
import InventoryTable, { type Row } from "./InventoryTable";

export const metadata = { title: "Inventory" };

export default async function CarsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; saved?: string }> }) {
  const sp = await searchParams;
  const cars = await db.car.findMany({
    include: { photos: { orderBy: { position: "asc" }, take: 1 }, _count: { select: { photos: true, enquiries: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const rows: Row[] = cars.map((c) => ({
    id: c.id, slug: c.slug, make: c.make, model: c.model, year: c.year, colour: c.colour, status: c.status,
    priceKes: c.priceKes, mileageKm: c.mileageKm, featured: c.featured, forHire: c.forHire,
    thumb: c.photos[0] ? mediaUrl(c.photos[0].key) : null, photos: c._count.photos, enquiries: c._count.enquiries,
    updatedAt: c.updatedAt.toISOString(),
  }));
  return (
    <>
      <header className="ahead">
        <div>
          <h1>Inventory</h1>
          <p>{cars.length} cars in total. Change status, feature cars on the home page, or open one to edit.</p>
        </div>
        <Link href="/admin/cars/new" className="btn btn--primary btn--sm">+ Add a car</Link>
      </header>
      {sp.saved && <div className="notice">✓ Saved {sp.saved}. Changes are live on the website.</div>}
      <InventoryTable rows={rows} initialStatus={sp.status ?? "all"} />
    </>
  );
}
