export type FullscreenScrollDebug = {
  getCurrentIndex: () => number;
  getSlideIds: () => string[];
  isLocked: () => boolean;
  isGestureActive: () => boolean;
  getTransitionCount: () => number;
  resetTransitionCount: () => void;
  syncCurrent: () => void;
};

const SELECTORS = ".hero,.services,.c2,.process-step,.specs,.pgrid,.cta";
const DELTA_THRESHOLD = 40;
const STABLE_FRAMES = 12;
const WHEEL_STREAM_GAP_MS = 90;
const TRACKPAD_QUIET_MS = 140;

export function initFullscreenScroll(): FullscreenScrollDebug {
  const getSlides = () =>
    Array.from(document.querySelectorAll<HTMLElement>(SELECTORS));
  const navH = () => document.getElementById("nav")?.offsetHeight ?? 64;
  /** Phones + tablets: native page scroll. Desktop (≥1200px): section hijack. */
  const isTouchLayout = () => window.innerWidth <= 1199;

  let current = 0;
  let locked = false;
  let gestureActive = false;
  let gestureTimer: ReturnType<typeof setTimeout> | null = null;
  let wheelTransitionActive = false;
  let wheelDirection = 0;
  let wheelEventCount = 0;
  let lastWheelAt = 0;
  let continuousWheelStream = false;
  let transitionCount = 0;
  let targetScrollY: number | null = null;

  function clearGesture() {
    if (gestureTimer) clearTimeout(gestureTimer);
    gestureActive = false;
    gestureTimer = null;
    wheelEventCount = 0;
    continuousWheelStream = false;
  }

  function scheduleTrackpadQuietEnd() {
    if (gestureTimer) clearTimeout(gestureTimer);

    const remaining = TRACKPAD_QUIET_MS - (performance.now() - lastWheelAt);
    if (remaining <= 0) {
      clearGesture();
      return;
    }

    gestureActive = true;
    gestureTimer = setTimeout(scheduleTrackpadQuietEnd, remaining);
  }

  function beginWheelTransition(dir: number, now: number) {
    clearGesture();
    wheelTransitionActive = true;
    wheelDirection = dir;
    wheelEventCount = 1;
    lastWheelAt = now;
  }

  function noteWheelEvent(dir: number, now: number) {
    const sameStream =
      dir === wheelDirection && now - lastWheelAt <= WHEEL_STREAM_GAP_MS;

    if (sameStream) {
      wheelEventCount++;
      continuousWheelStream = wheelEventCount >= 2;
    }

    if (dir === wheelDirection) {
      lastWheelAt = now;
    }
  }

  function finishWheelTransition() {
    if (!wheelTransitionActive) return;
    wheelTransitionActive = false;

    if (continuousWheelStream) {
      scheduleTrackpadQuietEnd();
    } else {
      clearGesture();
    }
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
      finishWheelTransition();
    };

    const settle = () => {
      waitScrollStable(
        () =>
          target instanceof HTMLElement ? target.scrollLeft : window.scrollY,
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

  function handleNavigate(dir: number, source: "wheel" | "direct" = "direct") {
    if (locked) return;
    locked = true;
    if (source !== "wheel") {
      wheelTransitionActive = false;
      clearGesture();
    }
    const moved = performNavigate(dir);
    if (!moved) {
      locked = false;
      wheelTransitionActive = false;
      clearGesture();
    }
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (isTouchLayout()) return;

      const c2 = document.querySelector<HTMLElement>(".c2");
      const inCases = !!(c2 && isInView(c2));
      const horizontal =
        inCases && Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horizontal ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      e.preventDefault();

      const dir = delta > 0 ? 1 : -1;
      const now = performance.now();

      if (locked) {
        if (wheelTransitionActive) noteWheelEvent(dir, now);
        return;
      }

      if (gestureActive) {
        if (dir !== wheelDirection) {
          clearGesture();
        } else if (now - lastWheelAt > TRACKPAD_QUIET_MS) {
          clearGesture();
        } else {
          noteWheelEvent(dir, now);
          scheduleTrackpadQuietEnd();
          return;
        }
      }

      if (Math.abs(delta) < DELTA_THRESHOLD) return;
      beginWheelTransition(dir, now);
      handleNavigate(dir, "wheel");
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
      if (isTouchLayout()) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (locked) return;
      if (Math.abs(dy) < DELTA_THRESHOLD) return;
      handleNavigate(dy > 0 ? 1 : -1);
    },
    { passive: true },
  );

  window.addEventListener("keydown", (e) => {
    if (isTouchLayout() || locked) return;
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
      if (locked) return;
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
