/* @ds-bundle: {"format":3,"namespace":"DesignSystem_019dcb","components":[],"sourceHashes":{"design-canvas.jsx":"bd8746af6e58","ui_kits/website/Chrome.jsx":"7219d09de9ae","ui_kits/website/Hero.jsx":"af8183baabbe","ui_kits/website/Modals.jsx":"fd30c26dc37b","ui_kits/website/Sections.jsx":"4f8b19ee82f2"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_019dcb = window.DesignSystem_019dcb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// design-canvas.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Exports (to window): DesignCanvas, DCSection, DCArtboard, DCPostIt.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>
//
// Artboards are static design frames, not scroll regions — never use
// height: 100% + overflow: auto/scroll on inner elements; size each artboard
// to fit its content (explicit pixel height, or let it grow).
/* END USAGE */

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Chrome.jsx
try { (() => {
// ATPM chrome: Nav, Ticker, CTA, Footer

function Nav() {
  const [open, setOpen] = React.useState(false);
  const links = [['О компании', '#about'], ['Процесс', '#process'], ['Контакты', '#contact']];
  return /*#__PURE__*/React.createElement("header", {
    className: "atpm-nav",
    id: "atpm-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atpm-nav-inner cx"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#hero",
    className: "atpm-logo",
    "aria-label": "\u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atpm-logo-dot",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "atpm-logo-mark"
  }, "\u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428")), /*#__PURE__*/React.createElement("nav", {
    className: "atpm-nav-links",
    "aria-label": "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F"
  }, links.map(([l, h]) => /*#__PURE__*/React.createElement("a", {
    href: h,
    className: "atpm-nav-link",
    key: h
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "atpm-nav-right"
  }, /*#__PURE__*/React.createElement("button", {
    className: "atpm-nav-phone",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      font: 'inherit'
    },
    onClick: () => window.__openPhone()
  }, "+7 (991) 097-90-59"), /*#__PURE__*/React.createElement("button", {
    className: "btn-atpm atpm-nav-cta",
    onClick: () => window.__openPhone()
  }, /*#__PURE__*/React.createElement("span", null, "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C"), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "atpm-nav-burger",
    "aria-label": "\u041C\u0435\u043D\u044E",
    "aria-expanded": open,
    onClick: () => setOpen(!open)
  }, /*#__PURE__*/React.createElement("span", {
    className: "burger-line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "burger-line"
  })))), open && /*#__PURE__*/React.createElement("div", {
    className: "atpm-nav-mobile"
  }, links.map(([l, h]) => /*#__PURE__*/React.createElement("a", {
    href: h,
    key: h,
    onClick: () => setOpen(false)
  }, l))));
}
function Ticker() {
  const items = ['ПРОЕКТИРОВАНИЕ ПРЕСС-ФОРМ', 'ПРОИЗВОДСТВО ПРЕСС-ФОРМ', 'МЕЛКО- И КРУПНОСЕРИЙНОЕ ЛИТЬЁ', 'МЕТАЛЛООБРАБОТКА', 'РАЗРАБОТКА КД ПО ЕСКД', 'АДДИТИВНЫЕ ТЕХНОЛОГИИ', 'DMLS · SLM · FDM', 'СРОКИ — НЕДЕЛИ, НЕ МЕСЯЦЫ', 'ДЕШЕВЛЕ КИТАЯ', 'ВЛАДИМИР · РОССИЯ'];
  const all = [...items, ...items];
  return /*#__PURE__*/React.createElement("div", {
    className: "ticker",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marquee-outer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marquee-inner"
  }, all.map((it, i) => /*#__PURE__*/React.createElement("span", {
    className: "ticker-item",
    key: i
  }, it, /*#__PURE__*/React.createElement("span", {
    className: "ticker-sep"
  }, "\xB7"))))));
}
function CTA() {
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    className: "cta-sec"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photo-mold-01.png",
    className: "cta-mold-photo",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cta-giant-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("span", {
    className: "cg-solid"
  }, "\u0420\u0410\u0421\u0421\u0427\u0418\u0422\u0410\u0422\u042C")), /*#__PURE__*/React.createElement("div", {
    "data-reveal": true,
    "data-delay": "1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cg-outline"
  }, "\u041F\u0420\u041E\u0415\u041A\u0422"))), /*#__PURE__*/React.createElement("div", {
    className: "cta-strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ctas-left",
    "data-reveal": true,
    "data-delay": "2"
  }, /*#__PURE__*/React.createElement("p", {
    className: "ctas-desc"
  }, "\u041F\u0440\u0438\u0448\u043B\u0438\u0442\u0435 \u0447\u0435\u0440\u0442\u0451\u0436 \u0438\u043B\u0438 3D-\u043C\u043E\u0434\u0435\u043B\u044C \u2014 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0441\u0443\u0442\u043E\u043A \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u043C \u041A\u041F \u0441 \u0446\u0435\u043D\u043E\u0439 \u0438 \u0441\u0440\u043E\u043A\u0430\u043C\u0438. \u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u043F\u043E\u0434 \u043A\u0430\u0436\u0434\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442."), /*#__PURE__*/React.createElement("div", {
    className: "ctas-contacts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ctac-item",
    onClick: () => window.__openPhone()
  }, /*#__PURE__*/React.createElement("span", {
    className: "ctac-k"
  }, "\u0410\u043B\u0435\u043A\u0441\u0430\u043D\u0434\u0440 \u0421\u0435\u043C\u0435\u043D\u0435\u0446"), /*#__PURE__*/React.createElement("span", {
    className: "ctac-v"
  }, "+7 (991) 097-90-59")), /*#__PURE__*/React.createElement("div", {
    className: "ctac-item",
    onClick: () => window.__openPhone()
  }, /*#__PURE__*/React.createElement("span", {
    className: "ctac-k"
  }, "\u0414\u0430\u043D\u0438\u0438\u043B \u0412\u043E\u0440\u043E\u0431\u044C\u0435\u0432"), /*#__PURE__*/React.createElement("span", {
    className: "ctac-v"
  }, "+7 (906) 055-45-25")), /*#__PURE__*/React.createElement("div", {
    className: "ctac-item",
    onClick: () => window.__openQuote()
  }, /*#__PURE__*/React.createElement("span", {
    className: "ctac-k"
  }, "Email"), /*#__PURE__*/React.createElement("span", {
    className: "ctac-v"
  }, "additechprommash@yandex.ru")))), /*#__PURE__*/React.createElement("div", {
    className: "ctas-right",
    "data-reveal": true,
    "data-delay": "3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-atpm-white",
    style: {
      padding: '16px 32px',
      fontSize: '11px'
    },
    onClick: () => window.__openQuote()
  }, "\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u041A\u041F", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ctas-note"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ctas-dot"
  }), "\u041A\u0440\u0443\u0433\u043B\u043E\u0441\u0443\u0442\u043E\u0447\u043D\u043E \xB7 \u043A\u0440\u043E\u043C\u0435 \u0432\u044B\u0445\u043E\u0434\u043D\u044B\u0445"))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ft-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ft-logo"
  }, "\u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428"), /*#__PURE__*/React.createElement("p", {
    className: "ft-tagline"
  }, "\u041F\u0440\u0435\u0441\u0441-\u0444\u043E\u0440\u043C\u044B \u0434\u043B\u044F \u043B\u0438\u0442\u044C\u044F \u043F\u043B\u0430\u0441\u0442\u043C\u0430\u0441\u0441 \u043F\u043E\u0434 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C"), /*#__PURE__*/React.createElement("p", {
    className: "ft-full"
  }, "\u041E\u041E\u041E \xAB\u041D\u041F\u041A \xAB\u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428\xBB")), /*#__PURE__*/React.createElement("div", {
    className: "ft-col"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ft-col-label"
  }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B"), /*#__PURE__*/React.createElement("ul", {
    className: "ft-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#contact",
    className: "ft-link"
  }, "+7 (991) 097-90-59")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#contact",
    className: "ft-link"
  }, "+7 (906) 055-45-25")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#contact",
    className: "ft-link"
  }, "additechprommash@yandex.ru")), /*#__PURE__*/React.createElement("li", {
    className: "ft-muted"
  }, "\u041E\u0444\u0438\u0441 \u2014 \u041C\u043E\u0441\u043A\u0432\u0430"), /*#__PURE__*/React.createElement("li", {
    className: "ft-muted"
  }, "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u2014 \u0433. \u0412\u043B\u0430\u0434\u0438\u043C\u0438\u0440"))), /*#__PURE__*/React.createElement("div", {
    className: "ft-col"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ft-col-label"
  }, "\u0420\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u044B"), /*#__PURE__*/React.createElement("div", {
    className: "ft-legal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fl-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fl-k"
  }, "\u0418\u041D\u041D"), /*#__PURE__*/React.createElement("span", {
    className: "fl-v"
  }, "7733472230")), /*#__PURE__*/React.createElement("div", {
    className: "fl-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fl-k"
  }, "\u041E\u0413\u0420\u041D"), /*#__PURE__*/React.createElement("span", {
    className: "fl-v"
  }, "1257700330403")), /*#__PURE__*/React.createElement("div", {
    className: "fl-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fl-k"
  }, "\u041A\u041F\u041F"), /*#__PURE__*/React.createElement("span", {
    className: "fl-v"
  }, "773301001")), /*#__PURE__*/React.createElement("div", {
    className: "fl-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fl-k"
  }, "\u0421\u0442\u0430\u0442\u0443\u0441"), /*#__PURE__*/React.createElement("span", {
    className: "fl-v",
    style: {
      color: 'var(--atpm-accent)'
    }
  }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442"))))), /*#__PURE__*/React.createElement("div", {
    className: "footer-bottom"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fb-copy"
  }, "\xA9 2026 \u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B."), /*#__PURE__*/React.createElement("span", {
    className: "fb-site"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fb-dot"
  }), "additechprom.ru \xB7 \u0420\u043E\u0441\u0441\u0438\u0439\u0441\u043A\u043E\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E"))));
}
Object.assign(window, {
  Nav,
  Ticker,
  CTA,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
// ATPM Hero — split: giant type left, full-bleed mould photo right
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "hero",
    id: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-topstrip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-topstrip-inner cx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hts-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hts-bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hts-desc"
  }, "\u041F\u0420\u0415\u0421\u0421-\u0424\u041E\u0420\u041C\u042B \u0414\u041B\u042F \u041B\u0418\u0422\u042C\u042F \u041F\u041B\u0410\u0421\u0422\u041C\u0410\u0421\u0421")), /*#__PURE__*/React.createElement("div", {
    className: "hts-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hts-tag"
  }, "\u041E\u041E\u041E \u041D\u041F\u041A \u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428"), /*#__PURE__*/React.createElement("span", {
    className: "hts-tag hts-tag-num"
  }, "\u0412\u041B\u0410\u0414\u0418\u041C\u0418\u0420 \xB7 2023")))), /*#__PURE__*/React.createElement("div", {
    className: "h-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-textcol"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-textcol-inner"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "h-title",
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("span", {
    className: "ht"
  }, "\u041F\u0420\u0415\u0421\u0421"), /*#__PURE__*/React.createElement("span", {
    className: "ht"
  }, "\u0424\u041E\u0420\u041C\u042B")), /*#__PURE__*/React.createElement("p", {
    className: "h-tagline",
    "data-reveal": true,
    "data-delay": "1"
  }, "\u0420\u043E\u0441\u0441\u0438\u0439\u0441\u043A\u043E\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E.", /*#__PURE__*/React.createElement("br", null), "\u0421\u0440\u043E\u043A\u0438 \u2014 \u043D\u0435\u0434\u0435\u043B\u0438."), /*#__PURE__*/React.createElement("span", {
    className: "h-orange-line",
    "data-reveal": true,
    "data-delay": "2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-params",
    "data-reveal": true,
    "data-delay": "3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-param"
  }, "DMLS \xB7 SLM \xB7 \u0427\u041F\u0423"), /*#__PURE__*/React.createElement("span", {
    className: "h-param-sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "h-param"
  }, "1\u201432 \u0413\u041D\u0415\u0417\u0414\u0410"), /*#__PURE__*/React.createElement("span", {
    className: "h-param-sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "h-param"
  }, "\xB10.01 \u041C\u041C")))), /*#__PURE__*/React.createElement("div", {
    className: "h-visual"
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-bg-num",
    "aria-hidden": "true"
  }, "01"), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photo-atpm-mold.png",
    alt: "\u041F\u0440\u0435\u0441\u0441-\u0444\u043E\u0440\u043C\u0430 \u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428",
    className: "h-photo"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "h-specbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-specbar-inner cx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-spec-frame",
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("span", {
    className: "hsf-corner hsf-tl"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hsf-corner hsf-br"
  }), /*#__PURE__*/React.createElement("span", {
    className: "hsf-plus",
    "aria-hidden": "true"
  }, "+"), /*#__PURE__*/React.createElement("div", {
    className: "hsf-text"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hsf-brand"
  }, "\u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428 / 2026"), /*#__PURE__*/React.createElement("span", {
    className: "hsf-sub"
  }, "MOLD ENGINEERING"), /*#__PURE__*/React.createElement("span", {
    className: "hsf-sub"
  }, "PRECISION. QUALITY. RESULTS."))), /*#__PURE__*/React.createElement("div", {
    className: "h-specs",
    "data-reveal": true,
    "data-delay": "1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hsp-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hsp-k"
  }, "\u0421\u0420\u041E\u041A\u0418"), /*#__PURE__*/React.createElement("span", {
    className: "hsp-v"
  }, "\u041D\u0415\u0414\u0415\u041B\u0418, \u041D\u0415 \u041C\u0415\u0421\u042F\u0426\u042B")), /*#__PURE__*/React.createElement("span", {
    className: "hsp-div"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hsp-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hsp-k"
  }, "\u0421\u0422\u041E\u0418\u041C\u041E\u0421\u0422\u042C"), /*#__PURE__*/React.createElement("span", {
    className: "hsp-v"
  }, "\u0414\u0415\u0428\u0415\u0412\u041B\u0415 \u041A\u0418\u0422\u0410\u042F")), /*#__PURE__*/React.createElement("span", {
    className: "hsp-div"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hsp-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hsp-k"
  }, "\u0426\u0418\u041A\u041B"), /*#__PURE__*/React.createElement("span", {
    className: "hsp-v"
  }, "\u041F\u041E\u041B\u041D\u042B\u0419 \u2014 \u041E\u0422 \u041A\u0414 \u0414\u041E \u041E\u0422\u041A"))), /*#__PURE__*/React.createElement("button", {
    className: "h-arrow",
    onClick: () => window.__openPhone && window.__openPhone(),
    "aria-label": "\u041E\u0431\u0441\u0443\u0434\u0438\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 17L17 7M9 7h8v8"
  }))))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Modals.jsx
try { (() => {
// ATPM modals: phone chooser + quote request (interactive, fake submit)
const ArrowR = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14M13 6l6 6-6 6"
}));
const CloseX = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  style: {
    width: 14,
    height: 14
  },
  fill: "none",
  stroke: "#000",
  strokeWidth: "2"
}, /*#__PURE__*/React.createElement("path", {
  d: "M18 6L6 18M6 6l12 12"
}));
function PhoneModal({
  onClose
}) {
  const people = [['+7 (991) 097-90-59', 'Александр Семенец'], ['+7 (906) 055-45-25', 'Даниил Воробьев']];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-root",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "modal-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "modal-title"
  }, "\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F"), /*#__PURE__*/React.createElement("p", {
    className: "modal-sub"
  }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0437\u0432\u043E\u043D\u043A\u0430")), /*#__PURE__*/React.createElement("button", {
    className: "modal-close",
    onClick: onClose,
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
  }, /*#__PURE__*/React.createElement(CloseX, null))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, people.map(([num, name]) => /*#__PURE__*/React.createElement("a", {
    className: "phone-link",
    href: `tel:${num.replace(/[^\d+]/g, '')}`,
    key: num
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "phone-num"
  }, num), /*#__PURE__*/React.createElement("div", {
    className: "phone-name"
  }, name)), /*#__PURE__*/React.createElement(ArrowR, null)))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("p", null, "\u041A\u0440\u0443\u0433\u043B\u043E\u0441\u0443\u0442\u043E\u0447\u043D\u043E \xB7 \u043A\u0440\u043E\u043C\u0435 \u0432\u044B\u0445\u043E\u0434\u043D\u044B\u0445"))));
}
function QuoteModal({
  onClose
}) {
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-root",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "modal-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "modal-title"
  }, "\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u041A\u041F"), /*#__PURE__*/React.createElement("p", {
    className: "modal-sub"
  }, "\u041E\u0442\u0432\u0435\u0442\u0438\u043C \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0441\u0443\u0442\u043E\u043A")), /*#__PURE__*/React.createElement("button", {
    className: "modal-close",
    onClick: onClose,
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
  }, /*#__PURE__*/React.createElement(CloseX, null))), sent ? /*#__PURE__*/React.createElement("div", {
    className: "modal-success"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chk"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430"), /*#__PURE__*/React.createElement("p", {
    className: "modal-sub",
    style: {
      textAlign: 'center'
    }
  }, "\u0421\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0432 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F."), /*#__PURE__*/React.createElement("button", {
    className: "btn-atpm",
    style: {
      marginTop: 8
    },
    onClick: onClose
  }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C")) : /*#__PURE__*/React.createElement("form", {
    className: "modal-body",
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u0418\u043C\u044F"), /*#__PURE__*/React.createElement("input", {
    required: true,
    placeholder: "\u041A\u0430\u043A \u043A \u0432\u0430\u043C \u043E\u0431\u0440\u0430\u0449\u0430\u0442\u044C\u0441\u044F"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u0422\u0435\u043B\u0435\u0444\u043E\u043D"), /*#__PURE__*/React.createElement("input", {
    required: true,
    placeholder: "+7 (___) ___-__-__"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "\u0418\u0437\u0434\u0435\u043B\u0438\u0435 / \u0437\u0430\u0434\u0430\u0447\u0430"), /*#__PURE__*/React.createElement("input", {
    placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u043A\u043E\u0440\u043F\u0443\u0441 \u043F\u043E\u0434 \u043B\u0438\u0442\u044C\u0451, 8 \u0433\u043D\u0451\u0437\u0434"
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn-atpm",
    type: "submit",
    style: {
      justifyContent: 'center',
      marginTop: 6
    }
  }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 ", /*#__PURE__*/React.createElement(ArrowR, null)), /*#__PURE__*/React.createElement("p", {
    className: "modal-sub",
    style: {
      textAlign: 'center',
      margin: 0
    }
  }, "\u0418\u043B\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0438\u0442\u0435 \u0447\u0435\u0440\u0442\u0451\u0436 \u043D\u0430 additechprommash@yandex.ru"))));
}
Object.assign(window, {
  PhoneModal,
  QuoteModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Modals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Sections.jsx
try { (() => {
// ATPM content sections: About, Process, Stats, Specs, Benefits

function About() {
  const specs = [['Деятельность', 'Пресс-формы любой сложности и конфигурации'], ['Офис · Производство', 'Москва · г. Владимир'], ['Технологии', 'DMLS · SLM · ЧПУ · FDM'], ['Проектов', '30+ успешно введены в эксплуатацию'], ['Инженеров', '15 специалистов']];
  return /*#__PURE__*/React.createElement("section", {
    id: "about",
    className: "about-panel split-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-photo panel-photo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photo-mold-industrial.png",
    alt: "\u041F\u0440\u0435\u0441\u0441-\u0444\u043E\u0440\u043C\u0430 \u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428",
    className: "abt-img"
  }), /*#__PURE__*/React.createElement("span", {
    className: "panel-ghost",
    "aria-hidden": "true"
  }, "02")), /*#__PURE__*/React.createElement("div", {
    className: "panel-text",
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sw-label"
  }, "01 / \u041A\u041E\u041C\u041F\u0410\u041D\u0418\u042F"), /*#__PURE__*/React.createElement("h2", {
    className: "abt-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "abt-line"
  }, "\u0410\u0414\u0414\u0418\u0422\u0415\u0425"), /*#__PURE__*/React.createElement("span", {
    className: "abt-line abt-outline"
  }, "\u041F\u0420\u041E\u041C\u041C\u0410\u0428")), /*#__PURE__*/React.createElement("div", {
    className: "sw-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sw-specs"
  }, specs.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    className: "st-row",
    key: k
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "st-v"
  }, v)))), /*#__PURE__*/React.createElement("div", {
    className: "abt-metrics-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "abt-m-val"
  }, "\u221225%"), /*#__PURE__*/React.createElement("span", {
    className: "abt-m-lab"
  }, "vs \u0438\u043C\u043F\u043E\u0440\u0442")), /*#__PURE__*/React.createElement("div", {
    className: "abt-metric-div"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "abt-m-val"
  }, "3 \u043D\u0435\u0434."), /*#__PURE__*/React.createElement("span", {
    className: "abt-m-lab"
  }, "\u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u0441\u0440\u043E\u043A"))))));
}
const PROC_STEPS = [{
  num: '01',
  total: '04',
  title: 'АНАЛИЗ',
  dur: '1—3',
  unit: 'дня',
  items: ['Получаем чертёж или 3D-модель изделия', 'Определяем число гнёзд и точки впрыска', 'Проектируем систему охлаждения'],
  photoSrc: '../../assets/photo-atpm-mold.png',
  photoBg: '#F0F0EE',
  photoRight: true
}, {
  num: '02',
  total: '04',
  title: 'КД',
  dur: '5—14',
  unit: 'дней',
  items: ['3D-моделирование оснастки', 'Расчёт и топология охлаждения', 'Конструкторская документация по ЕСКД'],
  photoSrc: '../../assets/photo-mold-nobg.png',
  photoBg: '#060606',
  photoRight: false
}, {
  num: '03',
  total: '04',
  title: 'ПРОИЗ\u00ADВОДСТВО',
  dur: '14—30',
  unit: 'дней',
  items: ['5-осевая ЧПУ-обработка', 'Аддитивные технологии — сложные элементы', 'Термообработка · Сборка оснастки'],
  photoSrc: '../../assets/photo-hotrunner-01.jpg',
  photoBg: '#060606',
  photoRight: true
}, {
  num: '04',
  total: '04',
  title: 'ОТК',
  dur: '2—5',
  unit: 'дней',
  items: ['Пробные отливки на нашем оборудовании', 'Контроль всех размеров по КД', 'Передача полного комплекта документации'],
  photoSrc: '../../assets/photo-machine-01.jpg',
  photoBg: '#060606',
  photoRight: false
}];
function ProcessStep({
  s
}) {
  const photo = /*#__PURE__*/React.createElement("div", {
    className: "proc-photo",
    style: {
      order: s.photoRight ? 2 : 1,
      background: s.photoBg
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: s.photoSrc,
    alt: "",
    "aria-hidden": "true",
    className: "proc-photo-img"
  }), /*#__PURE__*/React.createElement("span", {
    className: "proc-ghost",
    "aria-hidden": "true",
    style: {
      color: s.photoBg === '#F0F0EE' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
    }
  }, s.num));
  const text = /*#__PURE__*/React.createElement("div", {
    className: "proc-text",
    style: {
      order: s.photoRight ? 1 : 2
    },
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sw-label"
  }, s.num, " / ", s.total, " \xB7 \u041F\u0420\u041E\u0426\u0415\u0421\u0421"), /*#__PURE__*/React.createElement("h2", {
    className: "proc-title"
  }, s.title), /*#__PURE__*/React.createElement("div", {
    className: "proc-dur"
  }, /*#__PURE__*/React.createElement("span", {
    className: "proc-dur-num"
  }, s.dur), /*#__PURE__*/React.createElement("span", {
    className: "proc-dur-unit"
  }, s.unit)), /*#__PURE__*/React.createElement("div", {
    className: "sw-rule"
  }), /*#__PURE__*/React.createElement("ul", {
    className: "proc-list"
  }, s.items.map(it => /*#__PURE__*/React.createElement("li", {
    className: "proc-item",
    key: it
  }, /*#__PURE__*/React.createElement("span", {
    className: "proc-bullet"
  }), it)))));
  return /*#__PURE__*/React.createElement("section", {
    id: s.num === '01' ? 'process' : undefined,
    className: `proc-panel ${s.photoRight ? 'proc-pr' : 'proc-pl'}`
  }, photo, text);
}
function Process() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, PROC_STEPS.map(s => /*#__PURE__*/React.createElement(ProcessStep, {
    s: s,
    key: s.num
  })));
}
function Stats() {
  return /*#__PURE__*/React.createElement("section", {
    className: "stats-sec",
    id: "stats"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photo-mold-02.png",
    className: "stats-photo",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "stats-content cx"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stats-num",
    "data-reveal": true
  }, "30+"), /*#__PURE__*/React.createElement("div", {
    className: "stats-bottom",
    "data-reveal": true,
    "data-delay": "2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stats-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stats-word"
  }, "\u041F\u0420\u041E\u0415\u041A\u0422\u041E\u0412", /*#__PURE__*/React.createElement("br", null), "\u0412 \u042D\u041A\u0421\u041F\u041B\u0423\u0410\u0422\u0410\u0426\u0418\u0418"), /*#__PURE__*/React.createElement("p", {
    className: "stats-desc"
  }, "\u041B\u0438\u0442\u044C\u0451 \u043F\u043B\u0430\u0441\u0442\u043C\u0430\u0441\u0441 \xB7 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \xB7 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u043A\u0430 \xB7 \u0430\u0432\u0438\u0430\u0446\u0438\u044F \xB7 \u0411\u041F\u041B\u0410 \xB7 \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0430. \u041B\u0438\u0442\u0435\u0439\u043D\u044B\u0435 \u0437\u0430\u0432\u043E\u0434\u044B \u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u044F\u0442\u0438\u044F \u043F\u043E \u0432\u0441\u0435\u0439 \u0420\u043E\u0441\u0441\u0438\u0438.")), /*#__PURE__*/React.createElement("div", {
    className: "stats-metrics"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sm-val"
  }, "15"), /*#__PURE__*/React.createElement("span", {
    className: "sm-lab"
  }, "\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043E\u0432")), /*#__PURE__*/React.createElement("div", {
    className: "sm-div"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sm-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sm-val"
  }, "3"), /*#__PURE__*/React.createElement("span", {
    className: "sm-lab"
  }, "\u043D\u0435\u0434. \u0441\u0440\u043E\u043A")), /*#__PURE__*/React.createElement("div", {
    className: "sm-div"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sm-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sm-val"
  }, "\u221225%"), /*#__PURE__*/React.createElement("span", {
    className: "sm-lab"
  }, "vs \u0438\u043C\u043F\u043E\u0440\u0442"))))));
}
function Specs() {
  const specs = [['Материал', 'P20 · H13 · S136 (инструментальная сталь)'], ['Гнёзд', '1 — 32'], ['Ресурс', 'до 1 000 000 циклов'], ['Точность', '±0.01 мм · IT6–IT7'], ['Габариты', 'до 1000 × 800 × 600 мм'], ['Тип литья', 'Горячий / холодный канал'], ['Охлаждение', 'Конформное · каскадное · прямолинейное']];
  return /*#__PURE__*/React.createElement("section", {
    className: "specs-panel",
    id: "catalog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "specs-text",
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sw-label"
  }, "02 / \u0412\u041E\u0417\u041C\u041E\u0416\u041D\u041E\u0421\u0422\u0418"), /*#__PURE__*/React.createElement("h2", {
    className: "specs-title"
  }, "\u0422\u0415\u0425\u041D\u0418\xAD\u0427\u0415\u0421\u041A\u0418\u0415", /*#__PURE__*/React.createElement("br", null), "\u0425\u0410\u0420\u0410\u041A\xAD\u0422\u0415\u0420\u0418\u0421\u0422\u0418\u041A\u0418"), /*#__PURE__*/React.createElement("div", {
    className: "sw-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "specs-table"
  }, specs.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    className: "st-row",
    key: k
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "st-v"
  }, v)))), /*#__PURE__*/React.createElement("div", {
    className: "specs-cta-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "specs-cta",
    onClick: () => window.__openQuote && window.__openQuote()
  }, "\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u0440\u0430\u0441\u0447\u0451\u0442", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "specs-cta-phone"
  }, "+7 991 097-90-59")))), /*#__PURE__*/React.createElement("div", {
    className: "specs-photo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photo-atpm-mold.png",
    alt: "\u041F\u0440\u0435\u0441\u0441-\u0444\u043E\u0440\u043C\u0430 \u0410\u0414\u0414\u0418\u0422\u0415\u0425\u041F\u0420\u041E\u041C\u041C\u0410\u0428",
    className: "specs-photo-img"
  }), /*#__PURE__*/React.createElement("span", {
    className: "specs-photo-ghost",
    "aria-hidden": "true"
  }, "03")));
}
function Benefits() {
  const benefits = [['01', 'Аддитивные технологии', 'DMLS · SLM · ЧПУ — элементы любой сложности, включая конформное охлаждение'], ['02', 'Сроки — недели, не месяцы', 'Исключили из цикла всё, что не влияет на качество. Полный цикл от анализа до ОТК'], ['03', 'Дешевле и качественнее Китая', 'Российское производство · без таможенных рисков · предсказуемые сроки поставки'], ['04', 'Полный цикл под контролем', 'От КД по ЕСКД до пробных отливок на нашем оборудовании — без субподряда']];
  return /*#__PURE__*/React.createElement("section", {
    id: "benefits",
    className: "ben-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ben-text",
    "data-reveal": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sw-label"
  }, "03 / \u041F\u0420\u0415\u0418\u041C\u0423\u0429\u0415\u0421\u0422\u0412\u0410"), /*#__PURE__*/React.createElement("h2", {
    className: "ben-title"
  }, "\u041F\u041E\u0427\u0415\u041C\u0423", /*#__PURE__*/React.createElement("br", null), "\u041C\u042B"), /*#__PURE__*/React.createElement("div", {
    className: "sw-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ben-list"
  }, benefits.map(([num, title, spec]) => /*#__PURE__*/React.createElement("div", {
    className: "ben-row",
    key: num
  }, /*#__PURE__*/React.createElement("span", {
    className: "ben-num"
  }, num), /*#__PURE__*/React.createElement("div", {
    className: "ben-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ben-name"
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "ben-spec"
  }, spec))))))), /*#__PURE__*/React.createElement("div", {
    className: "ben-photo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photo-mold-industrial.png",
    alt: "",
    "aria-hidden": "true",
    className: "ben-img"
  }), /*#__PURE__*/React.createElement("span", {
    className: "panel-ghost",
    "aria-hidden": "true",
    style: {
      color: 'rgba(255,255,255,0.04)'
    }
  }, "04")));
}
Object.assign(window, {
  About,
  Process,
  Stats,
  Specs,
  Benefits
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Sections.jsx", error: String((e && e.message) || e) }); }

})();
