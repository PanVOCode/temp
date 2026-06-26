document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});

// Hero image scale-in
(function () {
  const img = document.querySelector<HTMLImageElement>(".hero-float img");
  if (!img) return;
  const reveal = () => img.closest(".hero-float")?.classList.add("ready");
  if (img.complete && img.naturalWidth) reveal();
  else img.addEventListener("load", reveal);
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

// Full-page scroll hijack
(function () {
  const SELECTORS =
    ".hero,.services,.stats,.c2,.process-step,.specs,.pgrid,.cta";
  const DURATION = 550;
  const COOLDOWN = 750;
  let busy = false;

  const getSlides = () =>
    Array.from(document.querySelectorAll<HTMLElement>(SELECTORS));
  const navH = () => document.getElementById("nav")?.offsetHeight ?? 64;

  function smoothScrollTo(target: HTMLElement) {
    const start = window.scrollY;
    const offset = target.classList.contains("hero") ? 0 : navH();
    const end = target.getBoundingClientRect().top + start - offset;
    const diff = end - start;
    if (Math.abs(diff) < 2) {
      busy = false;
      return;
    }
    let t0: number | null = null;
    busy = true;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / DURATION, 1);
      window.scrollTo(0, start + diff * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
      else
        setTimeout(() => {
          busy = false;
        }, 50);
    };
    requestAnimationFrame(step);
    setTimeout(() => {
      busy = false;
    }, COOLDOWN);
  }

  function nearest() {
    const slides = getSlides();
    let best = 0,
      bestDist = Infinity;
    slides.forEach((el, i) => {
      const d = Math.abs(el.getBoundingClientRect().top);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  function go(dir: number) {
    if (busy) return;
    const slides = getSlides();
    const idx = nearest();
    const el = slides[idx];

    if (el?.classList.contains("c2")) {
      const c2scroll = document.getElementById("c2scroll") as HTMLElement;
      const total = document.querySelectorAll(".c2-dot").length;
      const cur = Math.round(c2scroll.scrollLeft / c2scroll.clientWidth);
      const next = cur + dir;
      if (next >= 0 && next < total) {
        (window as any).c2Go(next);
        busy = true;
        setTimeout(() => {
          busy = false;
        }, COOLDOWN);
        return;
      }
    }

    smoothScrollTo(slides[Math.min(Math.max(idx + dir, 0), slides.length - 1)]);
  }

  const isMobile = () => window.innerWidth <= 900;

  window.addEventListener(
    "wheel",
    (e) => {
      if (isMobile()) return;
      e.preventDefault();
      go(e.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  let touchY = 0;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchY = e.touches[0].clientY;
    },
    { passive: true },
  );
  window.addEventListener(
    "touchend",
    (e) => {
      if (isMobile()) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 30) go(dy > 0 ? 1 : -1);
    },
    { passive: true },
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      go(1);
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      go(-1);
    }
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.getElementById(a.getAttribute("href")!.slice(1));
      if (!target) return;
      e.preventDefault();
      const slides = getSlides();
      const idx = slides.indexOf(target);
      if (idx !== -1) go(idx - nearest());
      else smoothScrollTo(target);
    });
  });
})();

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
