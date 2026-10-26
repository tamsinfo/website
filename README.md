# TAMS Infotech: "The plant that builds itself"

An experience site for TAMS Infotech, an SAP Gold Partner for manufacturers. One persistent,
luminous 3D world: the camera travels from a liquid-chrome forge to a flooded data hall and a
light room as you scroll. Every route is a room in the same world. There are no photographs.
Every image is procedural 3D, or authored SVG in the static fallback.

Art direction, material language, motion language, camera plan and the signature moment for
every chapter: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md).

## Run it

Node 20 or later.

```bash
npm install
```

```bash
npm run dev
```

Opens on http://localhost:5173.

```bash
npm run build
```

Type-checks and builds to `dist/`.

```bash
npm run preview
```

Serves the production build on http://localhost:4173.

The contact form posts JSON to `VITE_CONTACT_ENDPOINT` when that variable is set. Without it,
the form runs in demo mode with a simulated success. Add `?form=fail` to the URL to see the
error state.

## Deploy (Docker / Coolify)

`deploy/Dockerfile` builds the app with Node and serves `dist/` with nginx on **port 4321**
(`deploy/nginx.conf`: SPA fallback for client routes, long-cache hashed assets). Build context
is the repository root.

```bash
docker build -f deploy/Dockerfile -t tams-web .
```

```bash
docker run -p 4321:4321 tams-web
```

In Coolify, set the Dockerfile location to `/deploy/Dockerfile` and the exposed port to 4321.
To connect the contact form, add `VITE_CONTACT_ENDPOINT` as a build argument (Vite bakes it in
at build time).

## Stack

Vite, React 19, TypeScript, React Router. three.js with `postprocessing`, `troika-three-text`
for spatial SDF type, GSAP and ScrollTrigger, and Lenis as the only smooth-scroll engine
(driven by the GSAP ticker). Fonts are self-hosted through Fontsource: Big Shoulders Display
(variable) and Instrument Sans (variable). Icons are a build-time subset of Solar Duotone
Bold (`npm run icons`).

## How it is built

| layer | where | what |
| --- | --- | --- |
| world | `src/experience/World.ts` | one renderer, scene, camera and loop; route keyframes; camera transitions per chapter; per-station local progress; hover lean and inspect-in-the-hand; liquid route cover; preloader intro drop; DPR governor |
| stations | `src/experience/stations/*` | 15 places: forge, counting floor, strain rail, lifecycle, workshop, data hall, overlook, districts, ring road, path, light room, globe, assembly room, material library, unplugged cable |
| shaders | `src/experience/core/*` | raymarched SDF metaball hero (dispersion, thin-film), GPU-morphing instanced parts, GPU data flow, brushed-metal patch, cursor flow-field trail, finish pass (trail displacement + halftone, scroll-velocity wave, motion-only chromatic fringe, blue flood, liquid transition, grain) |
| post | `core/post.ts` | DOF focused on the active station, bloom above an HDR threshold (status lights only), neutral tone mapping, finish pass |
| DOM | `src/experience/ui.tsx`, `src/pages/*` | `<Beat data-key>` sections bind copy to camera keyframes; kinetic type (char masks, 10 reveal styles, velocity skew, cursor weight); magnetic morphing cursor; preloader; inspect overlay |
| fallback | `src/illustrations/*` | reduced motion or no WebGL2: no canvas, readable stacked beats with 37 authored SVG illustrations |

A section's `data-key="station:k.sub"` picks the station, the beat and an optional orbit step.
Native scroll is the source of truth: `src/motion/conductor.ts` turns it into exact progress,
and the world damps it for the camera.

## Verification (run on this machine)

All numbers come from headless Chromium 156 with ANGLE/Metal on this Mac (Apple GPU). They are
**not** a laptop-iGPU or real-phone measurement.

| check | result |
| --- | --- |
| production build | passes (`tsc -b && vite build`) |
| console | clean on every route, both modes |
| axe, static mode, 37 routes, 1440 and 360 | 0 violations, no horizontal overflow, no `#` links, every link resolves |
| axe, world mode (home at 5 depths, a product, about) | 0 violations, one H1 per page |
| text contrast against rendered 3D pixels (every second home beat, 1440 and 390, 90th-percentile background) | all pass AA |
| interaction (`scripts/e2e.mjs`) | 19/19: skip link, mega-menu keyboard, form validation, loading, error, success, mobile menu, no-WebGL fallback |
| route transition and inspect (`scripts/flow.mjs`) | liquid cover → new room; inspect lifts, drags, Esc returns focus |
| first load (gzip transfer) | 514 KB, everything up front (JS 424, fonts 82, CSS 7) |
| preloader complete | about 3.5 s (desktop) and 4.0 s (mobile emulation) |
| frame time over a 40 s scripted scroll | desktop 1440×900 @2x: median 16.7 ms (60 fps), p95 33 ms, p99 50 ms; mobile 390×844 @2x: median 16.7 ms, p95 33 ms |

Recordings of a real wheel-driven scroll (forward, then a reverse leg) are in `docs/recordings/`,
screenshots in `docs/screenshots/after/` (desktop, mobile, rooms, interaction, fallback) and the
previous build in `docs/screenshots/before/`.

Scripts: `scripts/beats.mjs` (beat-by-beat shots), `record.mjs` (video), `rooms.mjs`,
`flow.mjs`, `e2e.mjs`, `audit.mjs`, `audit-world.mjs`, `contrast.mjs`, `perf.mjs`, `load.mjs`,
`walk.mjs`.

## Placeholders and unverified items

- **85% reduction in unplanned downtime at one automotive customer.** Shown as supplied. Confirm the figure and permission to publish before launch.
- Sub-page story beats ("The problem / How it works / Outcomes"), About story, Careers roles and legal pages are placeholder copy, flagged on the page.
- Slide paragraphs that expand the brief's one-liners (services, products, solutions) and a few connective lines ("Eight districts of the same plant…", "Seven stations… Follow the puck.", "Bring the problem; we will bring the questions.") are draft copy. Confirm with TAMS.
- Contact email `sales@tamsinfotech.com` was taken from the current live site.
- The form endpoint is not connected (demo mode until `VITE_CONTACT_ENDPOINT` is set).
- Performance is measured on an Apple GPU only. Intel/AMD integrated laptop GPUs and real phones are untested. The DPR governor lowers resolution under sustained slow frames.
- The `add-shader-cursor-trail` skill prescribes a separate WebGPU canvas with a near-black graph from the `shaders` package. That conflicts with the brief's "one persistent canvas" and the light world, so its idea (a flow field driving a dot-grid mask, ripples, grain) is rebuilt inside the single WebGL finish pass instead. It is not that exact graph.
- Sound was skipped, as allowed.
