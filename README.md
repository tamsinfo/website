# TAMS Infotech website

Marketing site for TAMS Infotech: SAP S/4HANA services, SAP solutions, TAMS products and
industry pages, told through one continuous 3D studio that the camera never leaves.

## Run it

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # production build in dist/
bun run preview    # serve dist/
bun run check      # svelte-check + tsc
```

The site is a single-page app. Any static host works as long as unknown paths fall back to
`index.html` (for example `/products/exim` must serve `index.html`).

Optional: set `VITE_CONTACT_ENDPOINT` to an endpoint that accepts a JSON `POST` for the contact
form. Without it the form opens the visitor's email app with the enquiry written out.

## How it fits together

- **Svelte 5 + TypeScript** on Vite+, routing with **sv-router** (`src/router.ts`). Inner
  pages are code-split.
- **Content** lives in `src/lib/content/` as typed data: services, SAP solutions, products,
  industries, diagrams and cross-links. Pages are templates over it. `CONTENT-REVIEW.md` lists
  every claim that still needs confirmation.
- **The world** (`src/lib/world/`) is one Three.js renderer for the whole site, loaded lazily.
  Each route asks for a room and a view (`scene()` in `src/lib/state.svelte.ts`):
  - `plant`: the home story. Native scroll drives a chapter ledger: billets become gears,
    gears dock at machines, data lines connect them, the S/4HANA core rises, night turns to
    daylight.
  - `workshop` (services), `core` (SAP solutions, the blue room), `gallery` (products),
    `bays` (industries), `studio` (about, contact, 404).
  - `flow.ts` is the cursor flow-field pass; `flood.ts` is the brand-blue liquid used for
    the preloader and route changes.
- **Route transitions** (`src/lib/transition.ts`) are sv-router hooks: flood the lens,
  swap the page and move the camera underneath, drain.
- **Motion**: GSAP + ScrollTrigger for reveals (`src/lib/motion/reveal.ts`), Lenis as the
  only smooth-scroll engine (`src/lib/motion/scroll.ts`).
- **Sound** (`src/lib/audio/engine.ts`) is synthesised with Web Audio, so there are no audio
  files to license. Ambience and music toggle separately and are off by default.
- **Icons**: Solar Duotone Bold by 480 Design (CC BY 4.0). `bun scripts/icons.ts` extracts
  only the icons in use into `src/lib/icons/solar.ts`.

## Accessibility and fallbacks

- `prefers-reduced-motion`: no Lenis, no scrubbed camera (it snaps to the nearest chapter), no
  cursor effects, and a plain fade instead of the flood.
- Without WebGL, or if the scene fails or loses its context, pages show composed colour
  fields in place of the world and everything else works.
- The preloader reports completed loading steps, caps at 8 seconds, can be skipped, and is
  dismissed by Tab or Escape. The full dive plays once per session.
- 3D hotspots are pointer conveniences; every one is mirrored by a real link in the chapter
  copy.

## Palette

Paper `#F2EEE7` · Porcelain `#FBF9F5` · Ink `#101826` · Brand blue `#1638D8` ·
Blue deep `#0B1E78` · Signal `#FF5A1F` · Footer navy `#0A1633`. Type is Mona Sans (display)
and IBM Plex Sans (body), self-hosted through Fontsource.
