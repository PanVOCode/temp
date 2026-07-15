export type FullscreenScrollDebug = {
  getCurrentIndex: () => number;
  getSlideIds: () => string[];
  isLocked: () => boolean;
  isGestureActive: () => boolean;
  getTransitionCount: () => number;
  resetTransitionCount: () => void;
  syncCurrent: () => void;
};

const SELECTORS =
  ".hero,.services,.c2,.process-step,.specs,.pgrid,.cta";
const DELTA_THRESHOLD = 40;
const STABLE_FRAMES = 12;
const GESTURE_QUIET_MS = 400;

export function initFullscreenScroll(): FullscreenScrollDebug {
  const getSlides = () =>
    Array.from(document.querySelectorAll<HTMLElement>(SELECTORS));
  const navH = () => document.getElementById("nav")?.offsetHeight ?? 64;
  const isMobile = () => window.innerWidth <= 900;

  let current = 0;
  let locked = false;
  let gestureActive = false;
  let gestureTimer: ReturnType<typeof setTimeout> | null = null;
  let transitionCount = 0;
  let targetScrollY: number | null = null;

  function touchGesture() {
    gestureActive = true;
    if (gestureTimer) clearTimeout(gestureTimer);
    gestureTimer = setTimeout(() => {
      gestureActive = false;
      gestureTimer = null;
    }, GESTURE_QUIET_MS);
  }

  function clearGesture() {
    if (gestureTimer) clearTimeout(gestureTimer);
    gestureActive = false;
    gestureTimer = null;
  }

  function slideTop(el: HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    return top - (el.classList.contains("hero") ? 0 : navH());
  }

  function syncCurrent() {
    const slides = getSlides();
    const scrollY = window.scrollY;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((el, i) => {
      const dist = Math.abs(scrollY - slideTop(el));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    current = best;
  }

  function waitScrollStable(read: () => number, onDone: () => void) {
    let last = read();
    let stable = 0;
    const tick = () => {
      const value = read();
      if (Math.abs(value - last) < 1) {
        stable++;
        if (stable >= STABLE_FRAMES) {
          onDone();
          return;
        }
      } else {
        stable = 0;
        last = value;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function releaseLock(target: EventTarget = window) {
    const unlock = () => {
      locked = false;
      targetScrollY = null;
      syncCurrent();
    };

    const settle = () => {
      waitScrollStable(
        () =>
          target instanceof HTMLElement
            ? target.scrollLeft
            : window.scrollY,
        unlock,
      );
    };

    const waitForTarget = () => {
      if (
        target === window &&
        targetScrollY !== null &&
        Math.abs(window.scrollY - targetScrollY) > 8
      ) {
        requestAnimationFrame(waitForTarget);
        return;
      }
      settle();
    };

    if (target === window && "onscrollend" in window) {
      window.addEventListener("scrollend", waitForTarget, { once: true });
      return;
    }

    if (target instanceof HTMLElement && "onscrollend" in target) {
      target.addEventListener("scrollend", settle, { once: true });
      return;
    }

    waitForTarget();
  }

  function scrollToIndex(index: number, alreadyLocked = false) {
    const slides = getSlides();
    const target = slides[index];
    if (!target) {
      if (alreadyLocked) locked = false;
      return false;
    }

    current = index;
    if (!alreadyLocked) locked = true;
    targetScrollY = slideTop(target);
    transitionCount++;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    releaseLock();
    return true;
  }

  function isInView(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const nav = navH();
    const vh = window.innerHeight;
    return rect.top < vh * 0.55 && rect.bottom > nav + vh * 0.35;
  }

  function performNavigate(dir: number): boolean {
    const slides = getSlides();
    const c2 = document.querySelector<HTMLElement>(".c2");
    const c2Idx = c2 ? slides.indexOf(c2) : -1;

    if (c2 && isInView(c2)) {
      const c2scroll = document.getElementById("c2scroll") as HTMLElement;
      const total = document.querySelectorAll(".c2-dot").length;
      const cur = Math.round(c2scroll.scrollLeft / c2scroll.clientWidth);
      const next = cur + dir;

      if (next >= 0 && next < total) {
        transitionCount++;
        (window as any).c2Go(next);
        releaseLock(c2scroll);
        return true;
      }

      const leaveIdx = c2Idx + dir;
      if (leaveIdx >= 0 && leaveIdx < slides.length) {
        return scrollToIndex(leaveIdx, true);
      }
      return false;
    }

    syncCurrent();
    const nextIdx = current + dir;
    if (nextIdx < 0 || nextIdx >= slides.length) return false;
    return scrollToIndex(nextIdx, true);
  }

  function handleNavigate(dir: number) {
    if (locked || gestureActive) return;
    locked = true;
    touchGesture();
    const moved = performNavigate(dir);
    if (!moved) {
      locked = false;
      clearGesture();
    }
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (isMobile()) return;
      e.preventDefault();
      if (locked || gestureActive) {
        touchGesture();
        return;
      }
      if (Math.abs(e.deltaY) < DELTA_THRESHOLD) return;
      handleNavigate(e.deltaY > 0 ? 1 : -1);
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
      if (locked || gestureActive) {
        touchGesture();
        return;
      }
      if (Math.abs(dy) < DELTA_THRESHOLD) return;
      handleNavigate(dy > 0 ? 1 : -1);
    },
    { passive: true },
  );

  window.addEventListener("keydown", (e) => {
    if (locked || gestureActive) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      handleNavigate(1);
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      handleNavigate(-1);
    }
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.getElementById(a.getAttribute("href")!.slice(1));
      if (!target) return;
      e.preventDefault();
      if (locked || gestureActive) return;
      const slides = getSlides();
      const idx = slides.indexOf(target);
      if (idx !== -1) scrollToIndex(idx);
      else {
        locked = true;
        targetScrollY = slideTop(target);
        transitionCount++;
        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
        releaseLock();
      }
    });
  });

  syncCurrent();

  const debug: FullscreenScrollDebug = {
    getCurrentIndex: () => current,
    getSlideIds: () =>
      getSlides().map((el) => el.id || el.className.split(" ")[0]),
    isLocked: () => locked,
    isGestureActive: () => gestureActive,
    getTransitionCount: () => transitionCount,
    resetTransitionCount: () => {
      transitionCount = 0;
    },
    syncCurrent,
  };

  (window as any).__fullscreenScroll = debug;
  return debug;
}
