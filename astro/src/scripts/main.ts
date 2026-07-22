import { initFullscreenScroll } from "./fullscreen-scroll";

// Mark JS as available before any hide-for-animation CSS applies meaningfully
document.documentElement.classList.add("js");

function boot() {
  document.body.classList.add("loaded");
  initFullscreenScroll();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

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
      else {
        img.addEventListener("load", () => void reveal(img), { once: true });
        img.addEventListener("error", () => reveal(img), { once: true });
        // Safari: decode/load can stall — force-show after timeout
        window.setTimeout(() => {
          if (!img.classList.contains("is-loaded")) void reveal(img);
        }, 2500);
      }
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
function showReveal(el: Element) {
  el.classList.add("vis");
}

const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        showReveal(e.target);
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => {
  const rect = el.getBoundingClientRect();
  // Safari often skips IO callback for already-visible nodes on load
  if (rect.bottom > 0 && rect.top < window.innerHeight) {
    showReveal(el);
  } else {
    revealObs.observe(el);
  }
});

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
    const next = Math.max(0, Math.min(dots.length - 1, idx));
    scroll.scrollTo({ left: next * scroll.clientWidth, behavior: "smooth" });
  };

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartIndex = 0;
  let gestureAxis: "x" | "y" | null = null;

  scroll.addEventListener(
    "touchstart",
    (e) => {
      if (window.innerWidth > 767 || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartIndex = Math.round(scroll.scrollLeft / scroll.clientWidth);
      gestureAxis = null;
    },
    { passive: true },
  );

  scroll.addEventListener(
    "touchmove",
    (e) => {
      if (window.innerWidth > 767 || e.touches.length !== 1 || gestureAxis) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      gestureAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    },
    { passive: true },
  );

  scroll.addEventListener(
    "touchend",
    (e) => {
      if (window.innerWidth > 767 || e.changedTouches.length !== 1) return;

      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      const isHorizontal =
        gestureAxis === "x" ||
        (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy));
      gestureAxis = null;
      if (!isHorizontal) return;

      const direction = dx > 0 ? 1 : -1;
      (window as any).c2Go(touchStartIndex + direction);
    },
    { passive: true },
  );

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
