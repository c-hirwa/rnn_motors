/* =========================================================
   RNN MOTORS — interactions
   ========================================================= */
(() => {
  const D = window.RNN;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const IMG = (f) => `assets/cars/${f}`;
  const wa = (text) => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`;
  const nameOf = (c) => `${c.make} ${c.model}`;
  const catLabel = { exotic: "Exotic & Luxury", executive: "Executive & Performance", utility: "Premium Utility" };

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (reduced) document.documentElement.classList.add("reduced");

  /* ---------- storage (best-effort) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- toast ---------- */
  const toastEl = $("[data-toast]");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  };

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  const lockScroll = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    document.body.style.overflow = on ? "hidden" : "";
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    document.body.classList.remove("menu-open");
    $(".burger").setAttribute("aria-expanded", "false");
    lockScroll(false);
    scrollTo(el);
  });

  /* =========================================================
     PRELOADER
     ========================================================= */
  const loader = $(".loader");
  const count = $(".loader__count");
  const heroImg = $(".hero__slide img");

  const finishLoader = () => {
    document.body.classList.remove("is-loading");
    if (!hasGSAP || reduced) { loader.remove(); startHero(); return; }
    const tl = gsap.timeline();
    tl.to(".loader__mark span", { yPercent: -110, duration: .5, stagger: .05, ease: "power3.in" })
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: .85, ease: "expo.inOut" }, "-=.25")
      .add(startHero, "-=.5")
      .add(() => loader.remove());
  };

  // safety net: never leave visitors stuck behind the loader (e.g. if rAF is throttled)
  setTimeout(() => {
    if (!document.body.contains(loader)) return;
    loader.remove(); document.body.classList.remove("is-loading");
    if (!started) startHero();
  }, 6000);

  if (hasGSAP && !reduced) {
    gsap.set(loader, { clipPath: "inset(0 0 0% 0)" });
    gsap.fromTo(".loader__mark span", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .08, ease: "expo.out", delay: .1 });
    const prog = { v: 0 };
    let imgReady = heroImg.complete;
    heroImg.addEventListener("load", () => (imgReady = true), { once: true });
    const minTime = gsap.to(prog, {
      v: 100, duration: 1.4, ease: "power2.inOut",
      onUpdate: () => {
        const v = imgReady ? prog.v : Math.min(prog.v, 86);
        count.textContent = String(Math.round(v)).padStart(3, "0");
        gsap.set(".loader__line i", { scaleX: v / 100 });
      },
      onComplete: () => {
        const go = () => { count.textContent = "100"; gsap.set(".loader__line i", { scaleX: 1 }); setTimeout(finishLoader, 180); };
        if (imgReady) go();
        else { heroImg.addEventListener("load", go, { once: true }); setTimeout(go, 3500); }
      }
    });
  } else {
    window.addEventListener("load", finishLoader);
    setTimeout(() => document.body.contains(loader) && finishLoader(), 2500);
  }

  /* =========================================================
     HERO SLIDESHOW
     ========================================================= */
  const hero = $(".hero");
  const slides = $$(".hero__slide");
  const dots = $$(".hero__dots button");
  const hTitle = $("[data-hero-title]"), hSub = $("[data-hero-sub]"), hIdx = $("[data-hero-index]");
  const DUR = 7000;
  let cur = 0, timer = null, started = false, remaining = DUR, tStart = 0;

  // Lazy images in hero: load after first
  slides.slice(1).forEach((s) => { const i = $("img", s); i.loading = "eager"; });

  const showSlide = (n) => {
    slides[cur].classList.remove("is-active");
    dots.forEach((d, i) => { d.classList.toggle("is-done", i < n); d.classList.remove("is-active"); });
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add("is-active");
    void dots[cur].offsetWidth; // restart CSS animation
    dots[cur].classList.add("is-active");
    const s = slides[cur];
    if (hasGSAP && !reduced) {
      gsap.to([hTitle, hSub], { opacity: 0, y: -10, duration: .3, onComplete: () => {
        hTitle.textContent = s.dataset.title; hSub.textContent = s.dataset.sub;
        gsap.fromTo([hTitle, hSub], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6, stagger: .06, ease: "power3.out" });
      }});
    } else { hTitle.textContent = s.dataset.title; hSub.textContent = s.dataset.sub; }
    hIdx.textContent = String(cur + 1).padStart(2, "0");
    remaining = DUR; schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!started || hero.classList.contains("is-paused")) return;
    tStart = Date.now();
    timer = setTimeout(() => showSlide(cur + 1), remaining);
  };
  hero.style.setProperty("--dur", DUR / 1000 + "s");
  dots.forEach((d, i) => d.addEventListener("click", () => i !== cur && showSlide(i)));

  // pause when hero not visible
  new IntersectionObserver(([e]) => {
    if (!started) return;
    if (e.isIntersecting) { hero.classList.remove("is-paused"); schedule(); }
    else { hero.classList.add("is-paused"); clearTimeout(timer); remaining = Math.max(400, remaining - (Date.now() - tStart)); }
  }, { threshold: .15 }).observe(hero);

  function startHero() {
    started = true;
    dots[0].classList.add("is-active");
    schedule();
    if (!hasGSAP || reduced) return;
    gsap.from(".hero__title .split", { yPercent: 110, opacity: 0, rotate: 3, duration: 1.3, stagger: .1, ease: "expo.out" });
    gsap.from([".hero__eyebrow", ".hero__lede", ".hero__cta", ".hero__caption", ".hero__dots", ".hero__scroll", ".nav"], {
      y: 24, opacity: 0, duration: 1.1, stagger: .08, ease: "expo.out", delay: .3, clearProps: "transform,opacity"
    });
  }

  // hero parallax: scroll + mouse
  if (hasGSAP && !reduced) {
    gsap.to(".hero__slides", { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    if (fine) {
      const qx = gsap.quickTo(".hero__slides", "x", { duration: 1.2, ease: "power3" });
      const qy = gsap.quickTo(".hero__slides", "y", { duration: 1.2, ease: "power3" });
      hero.addEventListener("mousemove", (e) => {
        qx((e.clientX / innerWidth - .5) * -24);
        qy((e.clientY / innerHeight - .5) * -16);
      });
    }
  }

  /* =========================================================
     NAV
     ========================================================= */
  const nav = $(".nav");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > innerHeight * .8 && !document.body.classList.contains("menu-open"));
    lastY = y;
    $(".wa-float").classList.toggle("is-on", y > innerHeight * .6);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["showroom", "import", "hire", "visit"].forEach((id) => navIO.observe($("#" + id)));

  $(".burger").addEventListener("click", (e) => {
    const open = document.body.classList.toggle("menu-open");
    e.currentTarget.setAttribute("aria-expanded", open);
    $(".menu").setAttribute("aria-hidden", !open);
    lockScroll(open);
    if (open && hasGSAP && !reduced) gsap.from(".menu__links a", { y: 60, opacity: 0, duration: .9, stagger: .07, ease: "expo.out", delay: .25 });
  });

  /* =========================================================
     CURSOR + MAGNETIC
     ========================================================= */
  if (fine && !reduced) {
    document.body.classList.add("has-cursor");
    const cur = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest("[data-cursor=view]");
      const hov = e.target.closest("a,button,input,select,label,.service");
      cur.classList.toggle("is-view", !!view && !e.target.closest(".card__heart"));
      cur.classList.toggle("is-hover", !view && !!hov);
      const lbl = view && view.dataset.cursorLabel;
      $(".cursor__label").textContent = lbl || "View";
    });
    document.addEventListener("mouseleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cur.classList.remove("is-hidden"));
    $$("iframe").forEach((f) => { f.addEventListener("mouseenter", () => cur.classList.add("is-hidden")); f.addEventListener("mouseleave", () => cur.classList.remove("is-hidden")); });

    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .3, y = (e.clientY - r.top - r.height / 2) * .4;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)"; el.style.transform = ""; setTimeout(() => (el.style.transition = ""), 600); });
    });
  }

  /* =========================================================
     INTRO — word-by-word scroll reveal + counters
     ========================================================= */
  const introText = $("[data-words]");
  const wrapWords = (el) => {
    const out = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((t) => out.push(t.trim() ? `<span class="w">${t}</span>` : t));
      else out.push(`<span class="w">${n.outerHTML}</span>`);
    });
    el.innerHTML = out.join("");
  };
  wrapWords(introText);
  if (hasGSAP && !reduced) {
    gsap.to($$(".w", introText), {
      opacity: 1, stagger: .05, ease: "none",
      scrollTrigger: { trigger: introText, start: "top 80%", end: "bottom 45%", scrub: true }
    });
  } else $$(".w", introText).forEach((w) => (w.style.opacity = 1));

  $("[data-count-cars]").dataset.count = D.cars.length;
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    if (!to) return;
    if (!hasGSAP || reduced) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* =========================================================
     SHORTLIST
     ========================================================= */
  let shortlist = store.get("rnn-shortlist", []).filter((id) => D.cars.some((c) => c.id === id));
  const heartSVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>`;

  const syncShortlist = () => {
    store.set("rnn-shortlist", shortlist);
    const n = shortlist.length;
    const c = $("[data-shortlist-count]");
    c.textContent = n; c.classList.toggle("has", n > 0);
    $$(".card__heart").forEach((h) => { const on = shortlist.includes(h.dataset.id); h.classList.toggle("is-on", on); h.setAttribute("aria-pressed", on); });
    const mh = $("[data-m-heart]");
    if (mh.dataset.id) mh.textContent = shortlist.includes(mh.dataset.id) ? "♥ In your shortlist" : "♡ Add to shortlist";
    // drawer
    const list = $("[data-drawer-list]");
    list.innerHTML = shortlist.map((id) => {
      const car = D.cars.find((x) => x.id === id);
      return `<li><img src="${IMG(car.img)}" alt=""><div><small>${car.make}</small><strong>${car.model}</strong></div><button data-remove="${id}" aria-label="Remove ${nameOf(car)}">Remove</button></li>`;
    }).join("");
    $("[data-drawer]").classList.toggle("is-empty", !n);
    $("[data-drawer-empty]").hidden = !!n;
    $("[data-drawer-wa]").href = wa(`Hi RNN Motors, I'm interested in these cars from your showroom:\n${shortlist.map((id, i) => `${i + 1}. ${nameOf(D.cars.find((c) => c.id === id))}`).join("\n")}\n\nCould you share prices and availability?`);
  };
  const toggleHeart = (id) => {
    const car = D.cars.find((c) => c.id === id);
    if (shortlist.includes(id)) { shortlist = shortlist.filter((x) => x !== id); toast(`Removed ${car.model}`); }
    else {
      shortlist.push(id); toast(`♥ ${car.model} added to shortlist`);
      const b = $(".shortlist-btn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    }
    syncShortlist();
  };

  const drawer = $("[data-drawer]");
  const openDrawer = (on) => { drawer.classList.toggle("is-open", on); drawer.setAttribute("aria-hidden", !on); lockScroll(on); };
  $("[data-open-shortlist]").addEventListener("click", () => openDrawer(true));
  $$("[data-close-drawer]").forEach((b) => b.addEventListener("click", () => openDrawer(false)));
  $("[data-drawer-list]").addEventListener("click", (e) => { const r = e.target.closest("[data-remove]"); if (r) toggleHeart(r.dataset.remove); });
  $("[data-drawer-list]").setAttribute("data-lenis-prevent", "");

  /* =========================================================
     SHOWROOM GRID
     ========================================================= */
  const grid = $("[data-grid]");
  grid.innerHTML = D.cars.map((c, i) => `
    <article class="card reveal-card" data-id="${c.id}" data-cat="${c.cat}" data-cursor="view" data-cursor-label="Details"
      data-q="${(c.make + " " + c.model + " " + c.colour + " " + c.body + " " + (c.year || "") + " " + catLabel[c.cat]).toLowerCase()}">
      <div class="card__media"><img src="${IMG(c.img)}" alt="${c.colour} ${nameOf(c)}" loading="lazy" style="object-position:${c.pos}"></div>
      <div class="card__glare"></div>
      <span class="card__tag">${c.year || "Signature"}</span>
      ${c.hire ? `<span class="card__tag card__tag--hire">Also for hire</span>` : ""}
      <button class="card__heart" data-id="${c.id}" aria-label="Add ${nameOf(c)} to shortlist" aria-pressed="false">${heartSVG}</button>
      <button class="card__open" data-open="${c.id}" aria-label="View details for ${nameOf(c)}"></button>
      <div class="card__body">
        <div class="card__make">${c.make}</div>
        <h3 class="card__model">${c.model}</h3>
        <div class="card__meta"><span>${c.body}</span><span>${c.colour}</span>${c.power !== "On request" ? `<span>${c.power}</span>` : ""}</div>
      </div>
    </article>`).join("");

  // counts
  const counts = { all: D.cars.length };
  D.cars.forEach((c) => (counts[c.cat] = (counts[c.cat] || 0) + 1));
  $$("[data-filter-count]").forEach((s) => (s.textContent = counts[s.dataset.filterCount] || 0));

  // filter pill
  const pill = $(".filters__pill");
  const movePill = () => {
    const a = $(".chip.is-active");
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  addEventListener("resize", movePill);
  document.fonts?.ready.then(movePill); movePill();

  let filter = "all", query = "";
  const applyFilter = () => {
    const cards = $$(".card", grid);
    const match = (c) => (filter === "all" || c.dataset.cat === filter) && (!query || query.split(/\s+/).every((q) => c.dataset.q.includes(q)));
    const show = cards.filter(match);
    const go = () => {
      cards.forEach((c) => c.classList.toggle("is-out", !match(c)));
      $("[data-empty]").hidden = show.length > 0;
      if (hasGSAP && !reduced) gsap.fromTo(show, { opacity: 0, y: 40, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .8, stagger: .05, ease: "expo.out", clearProps: "transform" });
      if (hasGSAP) ScrollTrigger.refresh();
    };
    if (hasGSAP && !reduced) gsap.to(cards.filter((c) => !c.classList.contains("is-out")), { opacity: 0, y: 20, duration: .25, stagger: .015, onComplete: go });
    else go();
  };
  $$(".chip").forEach((ch) => ch.addEventListener("click", () => {
    if (ch.classList.contains("is-active")) return;
    $$(".chip").forEach((c) => c.classList.remove("is-active"));
    ch.classList.add("is-active"); movePill();
    filter = ch.dataset.filter; applyFilter();
  }));
  let qT;
  $("[data-search]").addEventListener("input", (e) => {
    clearTimeout(qT);
    qT = setTimeout(() => { query = e.target.value.trim().toLowerCase(); applyFilter(); }, 220);
  });

  // tilt + glare
  if (fine && !reduced) {
    grid.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".card"); if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transition = "transform .15s ease-out";
      card.style.transform = `perspective(1100px) rotateY(${(px - .5) * 9}deg) rotateX(${(.5 - py) * 7}deg) translateY(-6px)`;
      card.style.setProperty("--mx", px * 100 + "%"); card.style.setProperty("--my", py * 100 + "%");
    });
    grid.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".card");
      if (card && !card.contains(e.relatedTarget)) { card.style.transition = ""; card.style.transform = ""; }
    });
  }

  grid.addEventListener("click", (e) => {
    const h = e.target.closest(".card__heart");
    if (h) { e.stopPropagation(); toggleHeart(h.dataset.id); return; }
    const o = e.target.closest("[data-open]");
    if (o) openModal(o.dataset.open);
  });

  /* =========================================================
     MODAL
     ========================================================= */
  const modal = $("[data-modal]");
  const media = $(".modal__media");
  let mIndex = 0, lastFocus = null;
  $(".modal__panel").setAttribute("data-lenis-prevent", "");

  const fillModal = (car) => {
    const img = $("[data-m-img]");
    img.src = IMG(car.img); img.alt = `${car.colour} ${nameOf(car)}`; img.style.objectPosition = car.pos;
    $("[data-m-cat]").textContent = `${car.make} · ${catLabel[car.cat]}`;
    $("[data-m-title]").textContent = car.model;
    $("[data-m-year]").textContent = [car.year, car.body, car.colour].filter(Boolean).join("  ·  ");
    $("[data-m-blurb]").textContent = car.blurb;
    const specs = [["Engine", car.engine], ["Power", car.power], ["Drivetrain", car.drive], ["Fuel", car.fuel], ["Body", car.body], ["Colour", car.colour]];
    $("[data-m-specs]").innerHTML = specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $("[data-m-wa]").href = wa(`Hi RNN Motors, I'm interested in the ${car.year ? car.year + " " : ""}${nameOf(car)} (${car.colour}) on your website. Is it still available?`);
    const mh = $("[data-m-heart]"); mh.dataset.id = car.id;
    mh.textContent = shortlist.includes(car.id) ? "♥ In your shortlist" : "♡ Add to shortlist";
  };
  function openModal(id) {
    mIndex = D.cars.findIndex((c) => c.id === id);
    fillModal(D.cars[mIndex]);
    lastFocus = document.activeElement;
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
    lockScroll(true);
    setTimeout(() => $(".modal__close").focus(), 50);
    if (hasGSAP && !reduced) gsap.fromTo(".modal__body > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .04, ease: "expo.out", delay: .15 });
  }
  const closeModal = () => {
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
    media.classList.remove("is-zoom"); lockScroll(false);
    lastFocus && lastFocus.focus({ preventScroll: true });
  };
  const stepModal = (d) => {
    mIndex = (mIndex + d + D.cars.length) % D.cars.length;
    if (hasGSAP && !reduced) {
      gsap.to([".modal__media img", ".modal__body > *"], { opacity: 0, duration: .2, onComplete: () => {
        fillModal(D.cars[mIndex]);
        gsap.fromTo(".modal__media img", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: .8, ease: "expo.out", clearProps: "transform" });
        gsap.fromTo(".modal__body > *", { opacity: 0, x: d * 24 }, { opacity: 1, x: 0, duration: .6, stagger: .03, ease: "expo.out" });
      }});
    } else fillModal(D.cars[mIndex]);
  };
  $$("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
  $("[data-m-prev]").addEventListener("click", () => stepModal(-1));
  $("[data-m-next]").addEventListener("click", () => stepModal(1));
  $("[data-m-heart]").addEventListener("click", (e) => toggleHeart(e.currentTarget.dataset.id));
  addEventListener("keydown", (e) => {
    if (modal.classList.contains("is-open")) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") stepModal(1);
      if (e.key === "ArrowLeft") stepModal(-1);
    } else if (drawer.classList.contains("is-open") && e.key === "Escape") openDrawer(false);
    else if (document.body.classList.contains("menu-open") && e.key === "Escape") $(".burger").click();
  });
  // zoom
  media.addEventListener("click", () => media.classList.toggle("is-zoom"));
  media.addEventListener("mousemove", (e) => {
    const r = media.getBoundingClientRect();
    $("img", media).style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });
  if (fine) { media.addEventListener("mouseenter", () => media.classList.add("is-zoom")); media.addEventListener("mouseleave", () => media.classList.remove("is-zoom")); $(".modal__zoomhint").textContent = "Hover to zoom"; }
  else $(".modal__zoomhint").textContent = "Tap to zoom";

  syncShortlist();

  /* =========================================================
     SIGNATURE — horizontal scroll
     ========================================================= */
  const sigCars = D.cars.filter((c) => c.signature);
  const track = $("[data-signature-track]");
  track.innerHTML = sigCars.map((c, i) => `
    <article class="sig" data-open-sig="${c.id}" data-cursor="view" data-cursor-label="Open">
      <img src="${IMG(c.img)}" alt="${c.colour} ${nameOf(c)}" loading="lazy" style="object-position:${c.pos}">
      <span class="sig__num">0${i + 1}</span>
      <div class="sig__body"><small>${c.make}</small><h3>${c.model}</h3><p>${c.blurb}</p></div>
    </article>`).join("");
  track.addEventListener("click", (e) => { const s = e.target.closest("[data-open-sig]"); if (s) openModal(s.dataset.openSig); });

  if (hasGSAP && !reduced) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: ".signature__pin", pin: true, scrub: 1, start: "top top",
          end: () => "+=" + dist(), invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (st) => gsap.set(".signature__progress i", { scaleX: st.progress })
        }
      });
      $$(".sig img", track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none",
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
      gsap.to(".signature__intro", { opacity: .15, ease: "none",
        scrollTrigger: { trigger: ".signature__pin", start: "top top", end: () => "+=" + innerWidth * .5, scrub: true } });
    });
  }

  /* =========================================================
     SERVICES — floating image follows cursor
     ========================================================= */
  const float = $(".services__float"), floatImg = $("img", float);
  if (fine) {
    let fx = 0, fy = 0, tx = 0, ty = 0, on = false;
    const fl = () => { fx += (tx - fx) * .14; fy += (ty - fy) * .14; float.style.left = fx + "px"; float.style.top = fy + "px"; if (on) requestAnimationFrame(fl); };
    $$(".service").forEach((s) => {
      s.addEventListener("mouseenter", (e) => {
        floatImg.src = s.dataset.img; tx = fx = e.clientX; ty = fy = e.clientY;
        float.classList.add("is-on"); if (!on) { on = true; fl(); }
      });
      s.addEventListener("mousemove", (e) => { tx = e.clientX + 40; ty = e.clientY; });
      s.addEventListener("mouseleave", () => { float.classList.remove("is-on"); on = false; });
    });
  }

  /* =========================================================
     IMPORT — steps + estimator
     ========================================================= */
  const steps = $$("[data-steps] li");
  if (hasGSAP && !reduced && innerWidth > 1100) {
    gsap.to(".steps__line b", { scaleX: 1, ease: "none",
      scrollTrigger: { trigger: "[data-steps]", start: "top 75%", end: "bottom 45%", scrub: true,
        onUpdate: (st) => steps.forEach((li, i) => li.classList.toggle("is-lit", st.progress >= i / steps.length + .02)) } });
  } else {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-lit")), { threshold: .6 });
    steps.forEach((s) => io.observe(s));
  }

  const RATES = { USD: 129.3, GBP: 172, EUR: 151, AED: 35.2, JPY: 0.86 };
  const FREIGHT_USD = { japan: 1800, uk: 2600, uae: 1500, europe: 2900 };
  const CLEARING_KES = 180000;
  const est = { origin: "japan", fuel: "petrol" };
  const priceIn = $("#est-price"), curSel = $("#est-cur"), ccIn = $("#est-cc"), yrIn = $("#est-year");
  yrIn.max = new Date().getFullYear();
  const fmt = (n) => Math.round(n).toLocaleString("en-KE");
  const totalEl = $("[data-total]");
  let shownTotal = 0;

  const setRangeFill = (r) => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");

  const calc = () => {
    const raw = +priceIn.value.replace(/[^\d.]/g, "") || 0;
    const fx = RATES[curSel.value];
    const fob = raw * fx;
    const freight = FREIGHT_USD[est.origin] * RATES.USD;
    const insurance = fob * 0.015;
    const cif = fob + freight + insurance;
    const cc = +ccIn.value;
    let excRate;
    if (est.fuel === "electric") excRate = .10;
    else if (((est.fuel === "petrol" || est.fuel === "hybrid") && cc > 3000) || (est.fuel === "diesel" && cc > 2500)) excRate = .35;
    else if (cc > 1500) excRate = .25;
    else excRate = .20;
    const id = cif * .25;
    const ed = (cif + id) * excRate;
    const vat = (cif + id + ed) * .16;
    const idf = cif * .025, rdl = cif * .02;
    const total = cif + id + ed + vat + idf + rdl + CLEARING_KES;

    const rows = [
      ["Car price", fob, "#eee8dc", `${curSel.value} ${fmt(raw)}`],
      ["Freight & insurance", freight + insurance, "#7d776d", est.origin.toUpperCase() === "UAE" ? "from UAE" : "from " + est.origin[0].toUpperCase() + est.origin.slice(1)],
      ["Import duty", id, "#d4b67a", "25%"],
      ["Excise duty", ed, "#b8975a", Math.round(excRate * 100) + "%"],
      ["VAT", vat, "#8a6f3e", "16%"],
      ["IDF & RDL levies", idf + rdl, "#5e4c2b", "4.5%"],
      ["Clearing, port & registration", CLEARING_KES, "#3d3b37", "est."]
    ];
    $("[data-bar]").innerHTML = rows.map(([, v, c]) => `<i style="flex-grow:${v};background:${c}"></i>`).join("");
    $("[data-breakdown]").innerHTML = rows.map(([k, v, c, note]) => `<li><i style="background:${c}"></i><span>${k}<small>${note}</small></span><span>${fmt(v)}</span></li>`).join("")
      + `<li><i></i><span><small style="margin:0">1 ${curSel.value} ≈ KES ${RATES[curSel.value]} (indicative)</small></span><span></span></li>`;

    if (hasGSAP && !reduced) {
      const o = { v: shownTotal };
      gsap.to(o, { v: total, duration: .9, ease: "power3.out", overwrite: true, onUpdate: () => (totalEl.textContent = fmt(o.v)) });
    } else totalEl.textContent = fmt(total);
    shownTotal = total;

    const yr = +yrIn.value;
    $("[data-year-out]").textContent = yr;
    $("[data-cc-out]").textContent = fmt(cc) + " cc";
    $("[data-year-warn]").hidden = new Date().getFullYear() - yr <= 8;
    $("[data-cc-field]").classList.toggle("is-disabled", est.fuel === "electric");
    setRangeFill(ccIn); setRangeFill(yrIn);

    $("[data-est-wa]").href = wa(`Hi RNN Motors, I'd like a firm import quote.\n• Car price: ${curSel.value} ${fmt(raw)}\n• Shipping from: ${est.origin.toUpperCase()}\n• ${est.fuel[0].toUpperCase() + est.fuel.slice(1)}${est.fuel !== "electric" ? ", " + fmt(cc) + " cc" : ""}\n• Year: ${yr}\nYour website estimate came to about KES ${fmt(total)}.`);
  };
  priceIn.addEventListener("input", () => {
    const pos = priceIn.value.length - priceIn.selectionStart;
    const digits = priceIn.value.replace(/[^\d]/g, "").slice(0, 12);
    priceIn.value = digits ? (+digits).toLocaleString("en-US") : "";
    priceIn.setSelectionRange(priceIn.value.length - pos, priceIn.value.length - pos);
    calc();
  });
  curSel.addEventListener("change", () => {
    const typical = { USD: 85000, GBP: 68000, EUR: 78000, AED: 310000, JPY: 12500000 };
    priceIn.value = typical[curSel.value].toLocaleString("en-US");
    calc();
  });
  [ccIn, yrIn].forEach((r) => r.addEventListener("input", calc));
  $$("[data-seg]").forEach((seg) => seg.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", seg).forEach((x) => x.classList.toggle("is-active", x === b));
    est[seg.dataset.seg] = b.dataset.v; calc();
  }));
  calc();

  $("[data-sourcing]").innerHTML = D.sourcing.map((s) => `<a href="${wa(`Hi RNN Motors, can you import a ${s} for me? I'd like to discuss spec and budget.`)}" target="_blank" rel="noopener">${s} ↗</a>`).join("");

  /* =========================================================
     HIRE CONFIGURATOR
     ========================================================= */
  const fleetCars = D.cars.filter((c) => c.hire);
  const fleet = $("[data-fleet]");
  const hire = { occasion: "Wedding", car: fleetCars[0] };
  fleet.innerHTML = fleetCars.map((c, i) => `
    <button class="fleet__car ${i === 0 ? "is-active" : ""}" data-car="${c.id}" aria-pressed="${i === 0}">
      <img src="${IMG(c.img)}" alt="" loading="lazy" style="object-position:${c.pos}">
      <span><small>${c.make}</small>${c.model}</span>
    </button>`).join("");
  const suggest = { "Wedding": "bentley-flying-spur", "Airport transfer": "mercedes-s500", "Corporate event": "mercedes-vito", "Upcountry trip": "toyota-prado", "Special occasion": "mercedes-g63" };
  const dateIn = $("[data-hire-date]");
  const today = new Date(); today.setDate(today.getDate() + 1);
  dateIn.min = new Date().toISOString().slice(0, 10);
  dateIn.value = today.toISOString().slice(0, 10);

  const renderTicket = (animate) => {
    const c = hire.car, img = $("[data-ticket-img]");
    const swap = () => { img.src = IMG(c.img); img.style.objectPosition = c.pos; img.alt = nameOf(c); };
    if (animate && hasGSAP && !reduced) gsap.to(img, { opacity: 0, duration: .2, onComplete: () => { swap(); gsap.to(img, { opacity: 1, duration: .5 }); } });
    else swap();
    $("[data-ticket-car]").textContent = nameOf(c);
    const d = dateIn.value ? new Date(dateIn.value + "T12:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Date to confirm";
    const pickup = $("[data-hire-pickup]").value.trim();
    const dur = $("[data-hire-duration]").value;
    const name = $("[data-hire-name]").value.trim();
    $("[data-ticket-line]").textContent = `${hire.occasion} · ${d} · ${dur}${pickup ? " · from " + pickup : ""}`;
    $("[data-hire-wa]").href = wa(`Hi RNN Motors, I'd like to hire the ${nameOf(c)} with a chauffeur.\n• Occasion: ${hire.occasion}\n• Date: ${d}\n• Duration: ${dur}\n• Pick-up: ${pickup || "To confirm"}${name ? "\n• Name: " + name : ""}\n\nIs it available, and what's the rate?`);
  };
  const pickCar = (id, animate = true) => {
    hire.car = fleetCars.find((c) => c.id === id) || fleetCars[0];
    $$(".fleet__car", fleet).forEach((b) => { const on = b.dataset.car === hire.car.id; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
    renderTicket(animate);
  };
  fleet.addEventListener("click", (e) => { const b = e.target.closest(".fleet__car"); if (b) pickCar(b.dataset.car); });
  $("[data-occasions]").addEventListener("click", (e) => {
    const b = e.target.closest(".occ"); if (!b) return;
    $$(".occ").forEach((o) => o.classList.toggle("is-active", o === b));
    hire.occasion = b.dataset.v;
    pickCar(suggest[hire.occasion]);
    toast(`Suggested: ${nameOf(hire.car)}`);
  });
  $$("[data-hire-date],[data-hire-pickup],[data-hire-duration],[data-hire-name]").forEach((el) => el.addEventListener("input", () => renderTicket(false)));
  pickCar(fleetCars[0].id, false);

  if (hasGSAP && !reduced) gsap.to(".hire__bg img", { yPercent: -16, ease: "none", scrollTrigger: { trigger: ".hire", start: "top bottom", end: "bottom top", scrub: true } });

  /* =========================================================
     VISIT — live open status (Nairobi time)
     ========================================================= */
  const HOURS = { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 13], 0: null };
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fmtH = (h) => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
  const nairobiNow = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Nairobi", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), h: +p.hour, m: +p.minute };
  };
  const updateOpen = () => {
    const { day, h, m } = nairobiNow();
    const t = h + m / 60, hrs = HOURS[day];
    const open = hrs && t >= hrs[0] && t < hrs[1];
    $$("[data-open-dot]").forEach((d) => { d.classList.toggle("is-open", !!open); d.classList.toggle("is-closed", !open); });
    $$("[data-hours] li").forEach((li) => li.classList.toggle("is-today", +li.dataset.day === day));
    let title, sub;
    if (open) {
      const left = hrs[1] * 60 - (h * 60 + m);
      title = "Open now";
      sub = `Closes at ${fmtH(hrs[1])} · ${Math.floor(left / 60) ? Math.floor(left / 60) + "h " : ""}${left % 60}m left`;
    } else {
      title = "Closed right now";
      if (hrs && t < hrs[0]) sub = `Opens today at ${fmtH(hrs[0])}`;
      else {
        let d = (day + 1) % 7; while (!HOURS[d]) d = (d + 1) % 7;
        sub = `Opens ${d === (day + 1) % 7 ? "tomorrow" : DAYS[d]} at ${fmtH(HOURS[d][0])} · WhatsApp us anytime`;
      }
    }
    $("[data-open-title]").textContent = title;
    $("[data-open-sub]").textContent = sub;
  };
  updateOpen(); setInterval(updateOpen, 30000);

  /* =========================================================
     GENERIC REVEALS
     ========================================================= */
  $("[data-year]").textContent = new Date().getFullYear();

  if (hasGSAP && !reduced) {
    $$(".section-head").forEach((h) => {
      gsap.from(h.children, { y: 60, opacity: 0, duration: 1.2, stagger: .12, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
    });
    ScrollTrigger.batch(".reveal-card", {
      start: "top 92%", once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.2, stagger: .1, ease: "expo.out", clearProps: "transform" })
    });
    gsap.set(".reveal-card", { opacity: 0 });
    [".toolbar", ".estimator", ".sourcing", ".booking__step", ".ticket", ".open-now", ".visit__block", ".visit__map", ".footer__cta", ".footer__cols > *", ".service", ".intro__stats > div"].forEach((sel) => {
      ScrollTrigger.batch(sel, { start: "top 90%", once: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: "expo.out", clearProps: "transform" }) });
      gsap.set(sel, { opacity: 0 });
    });
    gsap.from(".footer__word", { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top 70%", end: "bottom bottom", scrub: true } });

    addEventListener("load", () => ScrollTrigger.refresh());
  }
})();
