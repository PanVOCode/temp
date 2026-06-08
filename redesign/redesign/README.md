# АДДИТЕХПРОММАШ — Design System

**ATPM** (ООО «НПК «АДДИТЕХПРОММАШ») is a Russian engineering company that designs and manufactures **injection-moulding press-forms (пресс-формы) for plastics**, using additive manufacturing (DMLS / SLM), 5-axis CNC machining and full-cycle in-house production. Office in Moscow, production in Vladimir. Founded 2023.

The brand voice is **industrial, blunt and confident** — a precision-engineering firm that competes on *speed* ("weeks, not months"), *price* ("cheaper than China") and *full-cycle control* ("from CAD to QC, no subcontractors"). The visual identity is a hard, near-monochrome **"K-Tech" engineering aesthetic**: machined-steel greys, hairline rules, a single safety-orange accent, oversized expanded grotesque type, technical corner brackets and brushed-metal/grain textures.

This design system packages that identity so design agents can produce on-brand interfaces, decks and marketing assets.

---

## Sources

Everything here was reverse-engineered from materials the user provided. The reader may or may not have access — links kept for reference:

- **GitHub — primary source of truth:** [`PanVOCode/temp`](https://github.com/PanVOCode/temp) — an Astro marketing site with a complete, hand-built design system (`src/styles/custom.css`) and section components (`Hero`, `Achievements`, `Features`, `Cases`, `Partners`, `Faq`, `Footer`, `Nav`). **Explore this repo** to build higher-fidelity work — the `.astro` components carry the exact CSS, copy and layout logic this kit is derived from.
- **Live site:** [additechprom.ru](https://additechprom.ru/) (built on Tilda) — public marketing presence and copy reference.

> The licensed display typeface (**Akzidenz-Grotesk Pro**) is *not* in the repo. We ship **Barlow** (Google Fonts) as the closest free substitute. See the type note below.

---

## CONTENT FUNDAMENTALS

How ATPM writes. The copy is **Russian, terse, technical and declarative** — built for industrial buyers (engineers, procurement, factory owners), not consumers.

**Tone & vibe.** Confident, no-nonsense, faintly aggressive. It sells on hard guarantees, not adjectives. Sentences are short and often verbless fragments. There is no marketing fluff, no storytelling, no emotional appeal — just specs, timelines and price advantages.

**Casing.** SCREAMING UPPERCASE is the signature. Headlines, navigation, labels, button text, ticker items — almost all set in caps with wide letter-spacing. Body copy and spec values are sentence case. Numbers are everywhere and set large.

**Person.** Mostly **first-person plural "мы" (we)** describing what the company does — *"Получаем чертёж… Проектируем… Исключили из цикла всё, что не влияет на качество."* The customer is addressed implicitly via imperatives — *"Пришлите чертёж или 3D-модель."* No "ты/вы" intimacy; it's a B2B supplier voice.

**Punctuation as decoration.** The **middot `·`** is a structural separator everywhere (*"DMLS · SLM · ЧПУ"*, *"Москва · г. Владимир"*). Em-dashes set ranges (*"1—32 гнезда"*, *"14—30 дней"*). Tolerances are written with `±` (*"±0.01 мм"*). Slashes mark section indices (*"01 / КОМПАНИЯ"*).

**Numbers & units.** Always concrete and metric: `±0.01 мм`, `1—32 гнезда`, `до 1 000 000 циклов`, `−25% vs импорт`, `30+ проектов`, `15 инженеров`, `3 нед.`. Stats are a core persuasion device and are typeset huge.

**No emoji. Ever.** None in the source. Iconography is line-SVG and engineering symbols (`+`, `·`, crosshairs, corner brackets) — never pictographic emoji.

**Representative copy:**
- Hero: **«ПРЕСС-ФОРМЫ»** · "Российское производство. Сроки — недели."
- УТП strip: *"СРОКИ — НЕДЕЛИ, НЕ МЕСЯЦЫ · СТОИМОСТЬ — ДЕШЕВЛЕ КИТАЯ · ЦИКЛ — ПОЛНЫЙ, ОТ КД ДО ОТК"*
- Section eyebrows: *"01 / КОМПАНИЯ"*, *"02 / ВОЗМОЖНОСТИ"*, *"03 / ПРЕИМУЩЕСТВА"*
- CTA: **«РАССЧИТАТЬ ПРОЕКТ»** · "Пришлите чертёж или 3D-модель — в течение суток подготовим КП с ценой и сроками."
- Tagline lockup: *"MOLD ENGINEERING · PRECISION. QUALITY. RESULTS."*

When writing new copy: stay in Russian, stay uppercase for headers, lead with a number or a hard claim, separate facts with `·`, and never soften it.

---

## VISUAL FOUNDATIONS

**Palette.** Near-monochrome and industrial. Paper grey `#F3F3F3` ground, ink `#111`, true black `#000` for all structural hairlines and primary buttons, white `#FFF` for inverted surfaces — and **exactly one accent, safety orange `#FF6A00`**. Orange is rationed: a 2px logo dot, a 40px underline, bullet dots, the big stat numbers, hover states, a pulsing status dot. Dark panels go to `#060606`–`#0A0A0A`. No second hue, no tints beyond greys.

**Type.** Akzidenz-Grotesk Pro (→ Barlow fallback). The headline treatment is the identity: **weight 800, `font-stretch: expanded`, letter-spacing −0.04em, line-height ~0.84–0.9, UPPERCASE**, set enormous (hero up to 200px). A recurring move is the **outline/stroke heading** (`-webkit-text-stroke` with transparent fill) paired against a solid one. Eyebrows/labels are the opposite: 9–10px, weight 300–500, letter-spacing 0.25–0.35em, uppercase, grey. Body is plain regular 14–16px at line-height 1.6.

**Layout.** Strict, gridded, editorial. Full-viewport (`100vh`) panels stacked and separated by **1px black rules**. The signature panel is a **two-column split: oversized type on one side, a full-bleed product photo on the other**, with the photo *bleeding past its column* over the text side, and a **giant ghost index number** ("01"–"04") sitting behind it at very low opacity. A `--max-w: 1440px` container with `clamp()` padding. Everything aligns to hairlines.

**Backgrounds & texture.** Not flat. A fixed full-page **grayscale film grain** (SVG fractal-noise, ~6.5% opacity, `mix-blend: multiply`) sits over everything. Light sections also carry a faint **45°/−45° cross-hatch + horizontal brushed-metal** line texture. Dark panels get their own grain layer plus a low-opacity (~28–30%) blown-up product photo bleeding off-edge. **No gradients as decoration** — only black/grey/orange flats and these textures.

**Imagery.** Real photographs of **machined steel injection moulds** — cool, hard, high-contrast metal (brass cooling fittings, black guide pins, engraved part numbers like "ATPM-MOLD-01"). Often shot on white and composited oversized & contained so the whole part reads, or used dark and ghosted as a backdrop. `filter: contrast(1.1)` is common. Imagery is never warm, soft, or lifestyle — it's product-on-seamless and process/machine shots.

**Borders & corners.** Corners are **square — radius 0** everywhere (cards, buttons, inputs, photos). The only rounded thing is a 5px pulsing status dot. Structure is expressed through **1px solid black hairlines** (between panels, table rows at `rgba(0,0,0,0.08)`, dividers at `rgba(0,0,0,0.12)`). A signature motif is the **technical corner bracket** — small L-shaped marks at opposite corners of a frame (`.ip` / `.h-spec-frame`), plus crosshairs and a tiny orange `+`.

**Shadows & elevation.** Essentially **none**. This is a flat, drawn, blueprint-like system — elevation is communicated by hairlines, inversion (black panels) and texture, not by drop shadows or blur cards. The one blur is the nav bar's `backdrop-filter: blur(16px) saturate(1.4)` over a translucent paper background.

**Buttons.** Rectangular, uppercase, weight 800, 11px, letter-spacing 0.2em, ~14×28px padding, with a trailing arrow icon. Three variants: solid black (`.btn-atpm`), outline black (`.btn-atpm-outline`), solid white (`.btn-atpm-white`). **Hover flips the fill to orange** (or black→fill for outline). No radius, no shadow, 0.2s transition.

**Hover / press states.** Hover = **color/fill change** (to orange or to black) and occasionally a small `padding-left` nudge (rows slide right ~8px) or an underline that scales in from the left (`transform: scaleX`). No scale-up, no glow. Links go orange on hover. There is no distinct "press/active" shrink — interactions are crisp, not springy.

**Motion.** Restrained and editorial. On scroll, elements **reveal with `opacity 0→1` + `translateY(32→0)`** over ~1s on `cubic-bezier(0.22,1,0.36,1)`, staggered by `data-delay` (100ms steps). One **infinite marquee ticker** (28s linear) of services. A slow pulsing orange status dot. Underline/bracket micro-transitions at 0.2–0.25s. `prefers-reduced-motion` is fully honoured (animations collapse to instant). No bounces, no parallax, no decorative loops on content.

**Transparency & blur.** Used sparingly and purposefully: the translucent blurred nav; grain/noise overlays at low opacity; ghosted background photos at ~28% on dark; hairlines expressed as black-at-low-alpha. Glass/blur is *not* a general surface style.

---

## ICONOGRAPHY

ATPM's icon language is **minimal, custom, line-based — there is no icon library**.

- **Logo mark** (`assets/logo-mark.svg`): a single filled glyph — a stylised faceted **"A"/additive form** (also the favicon). Pairs with the uppercase wordmark **АДДИТЕХПРОММАШ** and a 6px orange square dot. No alternate logos exist in the source.
- **UI icons** are hand-rolled inline `<svg>`, **1.5–2px stroke, no fill, square caps, 24×24 viewBox** — arrows (`M5 12h14M13 6l6 6-6 6`, and the diagonal `M7 17L17 7M9 7h8v8`), a close ✕, a phone handset (filled), and brand glyphs for **Telegram** and **WhatsApp** (filled paths). Stroke weight matches the hairline system. Match this style for any new icon: thin stroke, geometric, no rounding, monochrome (inherits `currentColor`, turns orange/white on dark).
- **Engineering symbols as icons.** The system leans on typographic/technical marks instead of pictograms: the **middot `·`**, **`+` crosshair plus**, **L-shaped corner brackets**, full **crosshair** (`.ip-cross`), and the slash in section indices. These do more iconographic work than any drawn icon.
- **No emoji, no unicode-pictograph icons, no PNG sprite, no icon font.**
- **Partner logos** (`assets/partner-*.png`) are client/partner wordmarks (SIBUR, Keramet, Mayak/Маяк, MEI/МЭИ, Armakom, Glavproekt) shown desaturated in a marquee/grid.

If you need an icon not in the set, draw a new 24×24 line-SVG at 1.5–2px stroke (or pull from a thin geometric set like **Lucide** at stroke-width 1.5 as the closest CDN match) and **flag the substitution** — keep it monochrome and square-capped to match.

---

## VISUAL ASSETS (`assets/`)

Real product/process photography and brand marks copied from the source repo:

| File | What |
|---|---|
| `logo-mark.svg` | ATPM glyph / favicon mark (single-color, set via `fill`) |
| `photo-atpm-mold.png` | Hero mould — engraved "ATPM-MOLD-01", on white |
| `photo-mold-nobg.png` | Two-plate mould, transparent background |
| `photo-mold-industrial.png` | Industrial mould, dark composite |
| `photo-mold-01.png`, `photo-mold-02.png` | Additional mould shots (dark-panel backdrops) |
| `photo-hotrunner-01.jpg` | Hot-runner / process close-up |
| `photo-machine-01.jpg` | Machine / QC process shot |
| `partner-*.png` | 6 partner/client wordmark logos |

---

## INDEX — what's in this system

```
README.md ................. this file — context, content, visual & icon foundations
colors_and_type.css ....... color tokens + type ramp + semantic classes (import this)
SKILL.md .................. Agent-Skill entry point
assets/ ................... logo mark + real mould photography + partner logos
preview/ .................. Design-System tab cards (color, type, components, motifs)
ui_kits/
  website/ ................ ATPM marketing-site UI kit (the core product)
    README.md, index.html, *.jsx, *.css
```

> No slide-deck template was provided in the source, so `slides/` is intentionally omitted (we don't invent brand collateral that doesn't exist upstream). Ask if you'd like a brand-applied deck template built.

**Start here:** import `colors_and_type.css`, read the *Visual Foundations* + *Content Fundamentals* above, then pull components from `ui_kits/website/` or slides from `slides/`. For pixel-faithful work, also browse the source repo [`PanVOCode/temp`](https://github.com/PanVOCode/temp).

### Caveats
- **Display font is substituted.** Real brand face is **Akzidenz-Grotesk Pro** (licensed, not in repo); we render **Barlow**. Drop the licensed OTFs into `fonts/` to restore exact metrics — the `@font-face` hooks are already in `colors_and_type.css`.
- All copy is **Russian** by design. Keep it Russian unless asked otherwise.
