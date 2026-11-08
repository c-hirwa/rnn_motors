"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CATEGORIES, CONDITIONS, STATUSES, slugify } from "@/lib/format";
import { saveCar, type CarFormState } from "../../actions";

export type CarInput = {
  id?: string; slug?: string; make: string; model: string; year: number | null; category: string; body: string;
  colour: string; interior: string | null; engine: string | null; power: string | null; transmission: string | null;
  drive: string | null; fuel: string | null; mileageKm: number | null; condition: string | null; priceKes: number | null;
  status: string; featured: boolean; forHire: boolean; description: string; features: string;
  photos: { id: string; url: string; focus: string }[];
};

type Item =
  | { kind: "existing"; id: string; url: string; focus: string }
  | { kind: "new"; uid: string; file: File; url: string; focus: string };

const BODIES = ["Luxury saloon", "Executive saloon", "Luxury SUV", "Performance SUV", "Sport SUV", "Coupé SUV", "4×4 SUV", "Coupé", "Convertible", "Performance pickup", "Pickup", "Executive van", "Hatchback"];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Plug-in hybrid", "Electric"];
const DRIVES = ["AWD", "4×4", "4MATIC", "xDrive", "quattro", "RWD", "FWD"];
const GEARBOXES = ["Automatic", "Manual", "8-speed automatic", "9-speed automatic", "Dual-clutch"];

const money = (v: string) => {
  const d = v.replace(/[^\d]/g, "").slice(0, 12);
  return d ? Number(d).toLocaleString("en-KE") : "";
};

export default function CarForm({ car }: { car?: CarInput }) {
  const [state, action, pending] = useActionState<CarFormState, FormData>(saveCar, null);
  const [items, setItems] = useState<Item[]>(() => (car?.photos ?? []).map((p) => ({ kind: "existing" as const, ...p })));
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);
  const [price, setPrice] = useState(car?.priceKes ? car.priceKes.toLocaleString("en-KE") : "");
  const [mileage, setMileage] = useState(car?.mileageKm != null ? car.mileageKm.toLocaleString("en-KE") : "");
  const [make, setMake] = useState(car?.make ?? "");
  const [model, setModel] = useState(car?.model ?? "");
  const [year, setYear] = useState(car?.year ? String(car.year) : "");
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (k: string) => state?.fieldErrors?.[k];

  // Revoke object URLs when unmounting.
  useEffect(() => () => items.forEach((i) => i.kind === "new" && URL.revokeObjectURL(i.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty || pending) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", h);
    return () => removeEventListener("beforeunload", h);
  }, [dirty, pending]);

  useEffect(() => {
    if (state?.error) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state]);

  const addFiles = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setItems((cur) => [
      ...cur,
      ...imgs.map((file) => ({ kind: "new" as const, uid: Math.random().toString(36).slice(2), file, url: URL.createObjectURL(file), focus: "50% 50%" })),
    ]);
    setDirty(true);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((cur) => {
      const n = [...cur];
      const [x] = n.splice(from, 1);
      n.splice(to, 0, x);
      return n;
    });
    setDirty(true);
  };
  const remove = (i: number) => {
    setItems((cur) => {
      const x = cur[i];
      if (x.kind === "new") URL.revokeObjectURL(x.url);
      return cur.filter((_, k) => k !== i);
    });
    setFocusIdx(null);
    setDirty(true);
  };
  const setFocus = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    setItems((cur) => cur.map((it, k) => (k === i ? { ...it, focus: `${x}% ${y}%` } : it)));
    setDirty(true);
  };

  /** Attach photo order + new files, then hand to the server action. */
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    // Submit manually (not via form action) so fields keep their values if validation fails.
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete("newPhotos");
    let n = 0;
    const order = items.map((it) => {
      if (it.kind === "existing") return { kind: "existing", id: it.id, focus: it.focus };
      fd.append("newPhotos", it.file);
      return { kind: "new", index: n++, focus: it.focus };
    });
    fd.set("photoOrder", JSON.stringify(order));
    fd.set("priceKes", price);
    fd.set("mileageKm", mileage);
    setDirty(false);
    startTransition(() => action(fd));
  };

  const autoSlug = slugify([year, make, model].filter(Boolean).join(" "));

  return (
    <form ref={formRef} onSubmit={submit} className="carform" onChange={() => setDirty(true)}>
      {car?.id && <input type="hidden" name="id" value={car.id} />}
      {state?.error && <div className="notice notice--error" role="alert">{state.error}</div>}

      <div className="carform__grid">
        <div className="carform__main">
          <section className="apanel">
            <h2>Photos</h2>
            <p className="hint">Drag to reorder; the first photo is the cover. Click a photo to set its focal point (what stays in frame when cropped).</p>
            <div
              className={`dropzone ${dropping ? "is-over" : ""}`}
              onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setDropping(true); } }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setDropping(false); addFiles(e.dataTransfer.files); } }}
            >
              <div className="photos">
                {items.map((it, i) => (
                  <div
                    key={it.kind === "existing" ? it.id : it.uid}
                    className={`photo ${drag === i ? "is-drag" : ""} ${focusIdx === i ? "is-focus" : ""}`}
                    draggable
                    onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={(e) => { if (drag !== null) { e.preventDefault(); if (drag !== i) { move(drag, i); setDrag(i); } } }}
                    onDragEnd={() => setDrag(null)}
                  >
                    <div className="photo__img" onClick={(e) => { setFocusIdx(i); setFocus(i, e); }}>
                      <img src={it.url} alt="" style={{ objectPosition: it.focus }} draggable={false} />
                      <span className="photo__dot" style={{ left: it.focus.split(" ")[0], top: it.focus.split(" ")[1] }} />
                    </div>
                    {i === 0 && <span className="photo__cover">Cover</span>}
                    {it.kind === "new" && <span className="photo__new">New</span>}
                    <div className="photo__bar">
                      <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move left">←</button>
                      <button type="button" onClick={() => move(i, 0)} disabled={i === 0} title="Make cover">★</button>
                      <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label="Move right">→</button>
                      <button type="button" className="danger" onClick={() => remove(i)} aria-label="Remove photo">✕</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="photo photo--add" onClick={() => fileRef.current?.click()}>
                  <span>+</span>
                  Add photos
                  <small>or drop them here</small>
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            <p className="hint">JPG, PNG or WebP up to 15 MB each. Photos are resized and compressed automatically.</p>
          </section>

          <section className="apanel">
            <h2>The car</h2>
            <div className="fgrid">
              <Field label="Make" error={err("make")}><input name="make" list="makes" required value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Mercedes-Benz" /></Field>
              <Field label="Model" error={err("model")}><input name="model" required value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. G 63" /></Field>
              <Field label="Year" error={err("year")}><input name="year" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))} placeholder="2023" /></Field>
              <Field label="Category" error={err("category")}>
                <select name="category" defaultValue={car?.category ?? "executive"}>
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Body" error={err("body")}><input name="body" list="bodies" required defaultValue={car?.body} placeholder="Luxury SUV" /></Field>
              <Field label="Exterior colour" error={err("colour")}><input name="colour" required defaultValue={car?.colour} placeholder="Obsidian Black" /></Field>
              <Field label="Interior"><input name="interior" defaultValue={car?.interior ?? ""} placeholder="Tan Nappa leather" /></Field>
              <Field label="Condition">
                <select name="condition" defaultValue={car?.condition ?? ""}>
                  <option value="">Not specified</option>
                  {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
          </section>

          <section className="apanel">
            <h2>Specifications</h2>
            <div className="fgrid">
              <Field label="Engine"><input name="engine" defaultValue={car?.engine ?? ""} placeholder="4.0L twin-turbo V8" /></Field>
              <Field label="Power"><input name="power" defaultValue={car?.power ?? ""} placeholder="542 hp" /></Field>
              <Field label="Transmission"><input name="transmission" list="gearboxes" defaultValue={car?.transmission ?? ""} placeholder="Automatic" /></Field>
              <Field label="Drivetrain"><input name="drive" list="drives" defaultValue={car?.drive ?? ""} placeholder="AWD" /></Field>
              <Field label="Fuel"><input name="fuel" list="fuels" defaultValue={car?.fuel ?? ""} placeholder="Petrol" /></Field>
              <Field label="Mileage (km)" error={err("mileageKm")}>
                <input inputMode="numeric" value={mileage} onChange={(e) => setMileage(money(e.target.value))} placeholder="Leave blank if unknown" />
              </Field>
            </div>
          </section>

          <section className="apanel">
            <h2>Description</h2>
            <Field label="Write-up (shown on the car's page)" error={err("description")}>
              <textarea name="description" rows={5} defaultValue={car?.description} placeholder="What makes this car special, its history, condition…" />
            </Field>
            <Field label="Highlights (one per line)" error={err("features")}>
              <textarea name="features" rows={6} defaultValue={car?.features} placeholder={"Panoramic roof\nBurmester sound\n360° camera"} />
            </Field>
          </section>
        </div>

        <aside className="carform__side">
          <section className="apanel carform__sticky">
            <h2>Listing</h2>
            <Field label="Status" error={err("status")}>
              <select name="status" defaultValue={car?.status ?? "available"}>
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <p className="hint">Drafts are hidden from the website. Sold cars are hidden from the showroom but their page stays up.</p>
            <Field label="Price (KES)" error={err("priceKes")}>
              <div className="prefix"><span>KES</span><input inputMode="numeric" value={price} onChange={(e) => setPrice(money(e.target.value))} placeholder="Blank = Price on request" /></div>
            </Field>
            <label className="toggle">
              <input type="checkbox" name="featured" defaultChecked={car?.featured} />
              <span><strong>Featured</strong><small>Show in the home page hero and Signature Collection</small></span>
            </label>
            <label className="toggle">
              <input type="checkbox" name="forHire" defaultChecked={car?.forHire} />
              <span><strong>Available for hire</strong><small>Appears in the hire booking builder</small></span>
            </label>
            <Field label="Web address" error={err("slug")}>
              <div className="prefix"><span>/cars/</span><input name="slug" defaultValue={car?.slug} placeholder={car?.slug ?? autoSlug} /></div>
            </Field>
            <div className="carform__actions">
              <button className="btn btn--gold btn--block" disabled={pending}>{pending ? "Saving…" : car?.id ? "Save changes" : "Add to inventory"}</button>
              <Link href="/admin/cars" className="btn btn--ghost btn--block">Cancel</Link>
              {car?.slug && car.status !== "draft" && <a className="link" href={`/cars/${car.slug}`} target="_blank" rel="noopener">View on website ↗</a>}
            </div>
          </section>
        </aside>
      </div>

      <datalist id="makes">{["Aston Martin", "Audi", "Bentley", "BMW", "Ford", "Land Rover", "Lexus", "Mercedes-AMG", "Mercedes-Benz", "Mercedes-Maybach", "Porsche", "Range Rover", "Rolls-Royce", "Toyota"].map((m) => <option key={m} value={m} />)}</datalist>
      <datalist id="bodies">{BODIES.map((m) => <option key={m} value={m} />)}</datalist>
      <datalist id="fuels">{FUELS.map((m) => <option key={m} value={m} />)}</datalist>
      <datalist id="drives">{DRIVES.map((m) => <option key={m} value={m} />)}</datalist>
      <datalist id="gearboxes">{GEARBOXES.map((m) => <option key={m} value={m} />)}</datalist>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={`ffield ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <em>{error}</em>}
    </label>
  );
}
