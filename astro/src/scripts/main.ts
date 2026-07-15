import { initFullscreenScroll } from "./fullscreen-scroll";

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
  initFullscreenScroll();
});

// Smooth image reveal — hide until fully decoded, then fade in
(function () {
  const reveal = async (img: HTMLImageElement) => {
    try {
      await img.decode();
    } catch {
      /* decode failed — still show whatever loaded */
    }
    img.classList.add("is-loaded");
    img.closest(".hero-float")?.classList.add("ready");
  };

  document
    .querySelectorAll<HTMLImageElement>("img.img-smooth, .hero-float img")
    .forEach((img) => {
      if (img.complete && img.naturalWidth) void reveal(img);
      else img.addEventListener("load", () => void reveal(img), { once: true });
    });
})();

// Nav scroll state
const nav = document.getElementById("nav")!;
const hero = document.getElementById("hero");
function updateNav() {
  nav.classList.toggle(
    "on",
    window.scrollY > (hero ? hero.offsetHeight * 0.7 : 400),
  );
}
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

// Scroll reveal
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("vis");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.05 },
);
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

// Counter animation
const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      const target = parseInt(el.dataset.count!);
      const suffix = el.dataset.suffix ?? "";
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  },
  { threshold: 0.5 },
);
document
  .querySelectorAll("[data-count]")
  .forEach((el) => counterObs.observe(el));

// Parallax floats
const floats = [
  { el: document.getElementById("heroFloat"), speed: 0.07 },
  { el: document.getElementById("svcFloat"), speed: 0.09 },
];
let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      floats.forEach(({ el, speed }) => {
        if (el) el.style.transform = `translateY(${sy * speed * -0.4}px)`;
      });
      ticking = false;
    });
  },
  { passive: true },
);

// FAQ
document.querySelectorAll(".faq-q").forEach((q) => {
  q.addEventListener("click", () => {
    const item = q.closest(".faq-item")!;
    const was = item.classList.contains("open");
    document
      .querySelectorAll(".faq-item")
      .forEach((i) => i.classList.remove("open"));
    if (!was) item.classList.add("open");
  });
});

// Cases carousel
(function () {
  const scroll = document.getElementById("c2scroll") as HTMLElement;
  const bar = document.getElementById("c2bar") as HTMLElement;
  const dots = document.querySelectorAll<HTMLElement>(".c2-dot");
  if (!scroll) return;

  function updateUI() {
    const idx = Math.round(scroll.scrollLeft / scroll.clientWidth);
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    if (bar) bar.style.width = ((idx + 1) / dots.length) * 100 + "%";
  }

  scroll.addEventListener("scroll", updateUI, { passive: true });

  (window as any).c2Go = (idx: number) => {
    scroll.scrollTo({ left: idx * scroll.clientWidth, behavior: "smooth" });
  };

  let isDown = false,
    startX = 0,
    scrollLeft = 0;
  scroll.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - scroll.offsetLeft;
    scrollLeft = scroll.scrollLeft;
    scroll.style.cursor = "grabbing";
  });
  scroll.addEventListener("mouseleave", () => {
    isDown = false;
    scroll.style.cursor = "grab";
  });
  scroll.addEventListener("mouseup", () => {
    isDown = false;
    scroll.style.cursor = "grab";
  });
  scroll.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    scroll.scrollLeft = scrollLeft - (e.pageX - scroll.offsetLeft - startX);
  });
})();
