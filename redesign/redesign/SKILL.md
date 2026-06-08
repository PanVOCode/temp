---
name: additechprommash-design
description: Use this skill to generate well-branded interfaces and assets for АДДИТЕХПРОММАШ (ATPM) — a Russian press-form / injection-mould engineering company — for production or throwaway prototypes/mocks/decks. Contains design guidelines, colors, type, fonts, real mould photography, and a website UI kit for prototyping the industrial "K-Tech" aesthetic.
user-invocable: true
---

Read the `README.md` file within this skill first — it carries the full context, content voice, visual foundations and iconography rules. Then explore the other files:

- `colors_and_type.css` — import this for color tokens, the type ramp and semantic classes.
- `assets/` — logo mark + real injection-mould photography + partner logos. Copy what you need.
- `preview/` — small specimen cards showing each part of the system.
- `ui_kits/website/` — a high-fidelity, interactive recreation of the ATPM marketing site; lift components and patterns from here.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and apply the rules here to design on-brand.

Key brand reflexes: near-monochrome industrial palette with **one safety-orange accent (`#FF6A00`)**; oversized **expanded uppercase grotesque** headings (weight 800, tracking −0.04em); square corners (radius 0); 1px black hairlines instead of shadows; technical corner-bracket motifs; brushed-metal + grain textures; real cool-toned mould photography with giant ghost index numbers. Copy is **Russian, terse, technical, ALL-CAPS for headers**, separated by middots `·`, no emoji. **Important:** this render environment can freeze CSS entrance animations at their first frame — never let content start at `opacity:0`; keep resting state visible.

If the user invokes this skill without other guidance, ask what they want to build, ask a few focused questions, then act as an expert designer who outputs on-brand HTML artifacts or production code.
