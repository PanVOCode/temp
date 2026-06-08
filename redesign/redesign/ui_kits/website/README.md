# АДДИТЕХПРОММАШ — Website UI Kit

A high-fidelity, interactive recreation of the ATPM marketing site (single long-scroll landing page). Built in React (inline JSX via Babel), recreated from the source Astro components in [`PanVOCode/temp`](https://github.com/PanVOCode/temp).

## Run it
Open `index.html`. It assembles the full page and is interactive:
- **Позвонить / phone numbers** → opens a phone-chooser modal (Александр / Даниил).
- **Запросить КП / Запросить расчёт** → opens a quote-request modal with a fake-submitting form (shows a success state).
- **Burger menu** (≤900px) toggles mobile nav.
- **Esc** closes any modal.

## Files
| File | Contents |
|---|---|
| `index.html` | App shell — assembles sections, owns modal state, wires `window.__openPhone` / `window.__openQuote` |
| `Hero.jsx` | Split hero — giant `ПРЕСС/ФОРМЫ` type + full-bleed mould photo + spec bar |
| `Sections.jsx` | `About`, `Process` (4 panels), `Stats`, `Specs`, `Benefits` |
| `Chrome.jsx` | `Nav`, `Ticker` (marquee), `CTA`, `Footer` |
| `Modals.jsx` | `PhoneModal`, `QuoteModal` (interactive) |
| `styles.css` | Tokens + buttons + eyebrows + shared bits (imports `../../colors_and_type.css`) |
| `sections.css` | All section/layout/modal styles (adapted verbatim from source) |

## Component coverage
Nav (sticky, blurred) · marquee ticker · split-panel hero · two-column photo/text panels with ghost index numbers · dark stat panel · spec table · benefits list (hover-slide rows) · dark CTA with outline display type · multi-column footer with legal block · phone + quote modals · 3 button variants · square hairline form inputs.

## Notes & fidelity
- **Pixel source of truth** is the source repo's `.astro` files; layout, copy, spacing and colors are lifted from there.
- Real **mould photography** is referenced from `../../assets/`.
- Display font is **Barlow** (fallback for the licensed Akzidenz-Grotesk Pro — see root README).
- **Entrance reveal animations are intentionally disabled.** The preview/render environment freezes CSS animations & transitions at their first frame, which would leave content that starts at `opacity:0` permanently hidden. Content is therefore always visible. In a normal browser you can re-enable the source's scroll-reveal (`opacity 0 → 1` + `translateY`) safely.
- These are cosmetic recreations — forms don't submit anywhere; phone links are real `tel:` hrefs.
