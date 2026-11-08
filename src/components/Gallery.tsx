"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useShell } from "./Shell";

type Photo = { url: string; focus: string; width: number; height: number };

export default function Gallery({ photos, alt, status }: { photos: Photo[]; alt: string; status: string }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const { lockScroll } = useShell();
  const touch = useRef<number | null>(null);
  const n = photos.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    lockScroll(box);
    if (!box) return setZoom(false);
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [box, go, lockScroll]);

  if (!n) return <div className="gallery gallery--empty"><div className="card__noimg">Photos coming soon</div></div>;

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touch.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touch.current == null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touch.current = null;
    },
  };
  const p = photos[i];

  return (
    <div className="gallery">
      <div className="gallery__main" {...swipe}>
        {photos.map((ph, k) => (
          <Image
            key={ph.url}
            src={ph.url}
            alt={`${alt}, photo ${k + 1} of ${n}`}
            fill
            priority={k === 0}
            sizes="(max-width: 900px) 100vw, 60vw"
            className={k === i ? "is-active" : ""}
            style={{ objectFit: "cover", objectPosition: ph.focus }}
          />
        ))}
        {status !== "available" && <span className={`gallery__status gallery__status--${status}`}>{status === "sold" ? "Sold" : "Reserved"}</span>}
        <button className="gallery__expand" onClick={() => setBox(true)} aria-label="View photos full screen" data-cursor="view" data-cursor-label="Expand" />
        {n > 1 && (
          <>
            <button className="gallery__arrow gallery__arrow--prev" onClick={() => go(-1)} aria-label="Previous photo" data-cursor-ignore>←</button>
            <button className="gallery__arrow gallery__arrow--next" onClick={() => go(1)} aria-label="Next photo" data-cursor-ignore>→</button>
          </>
        )}
        <span className="gallery__count">{i + 1} / {n}</span>
      </div>
      {n > 1 && (
        <div className="gallery__thumbs">
          {photos.map((ph, k) => (
            <button key={ph.url} className={k === i ? "is-active" : ""} onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`}>
              <Image src={ph.url} alt="" fill sizes="120px" style={{ objectFit: "cover", objectPosition: ph.focus }} />
            </button>
          ))}
        </div>
      )}

      <div className={`lightbox ${box ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Photo viewer" aria-hidden={!box} {...swipe}>
        <button className="lightbox__close" onClick={() => setBox(false)} aria-label="Close">✕</button>
        {box && (
          <div
            className={`lightbox__stage ${zoom ? "is-zoom" : ""}`}
            onClick={() => setZoom((z) => !z)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--ox", ((e.clientX - r.left) / r.width) * 100 + "%");
              e.currentTarget.style.setProperty("--oy", ((e.clientY - r.top) / r.height) * 100 + "%");
            }}
          >
            <Image src={p.url} alt={alt} width={p.width} height={p.height} sizes="100vw" quality={90} />
          </div>
        )}
        {n > 1 && (
          <>
            <button className="lightbox__arrow lightbox__arrow--prev" onClick={() => go(-1)} aria-label="Previous photo">←</button>
            <button className="lightbox__arrow lightbox__arrow--next" onClick={() => go(1)} aria-label="Next photo">→</button>
          </>
        )}
        <span className="lightbox__count">{i + 1} / {n} · click to zoom</span>
      </div>
    </div>
  );
}
