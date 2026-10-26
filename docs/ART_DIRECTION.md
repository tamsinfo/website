# TAMS — Art direction: "The plant that builds itself"

Written before the rebuild. The code in `src/experience/` is built against this document;
each file in `src/experience/stations/` holds its part of the camera plan as data.

## Concept

One continuous, luminous industrial-design studio the size of a hangar. You fall into it from
the preloader and the camera never leaves it again, even between routes. As you scroll, the
world assembles itself in the order a manufacturer would recognise:

> raw material becomes parts → parts become machines → machines connect into a plant →
> the plant connects to SAP.

Every chapter is a *place* in that one world. Objects hand off between chapters (the hero
liquid shatters into parts, the parts count the proof, the service blocks re-form four times,
the data particles become the solution districts' traffic). Nothing fades out and in.

Routes are rooms in the same building. Changing page floods the lens with a liquid of brand
blue, the camera is carried to the next room underneath it, and the liquid drains away.

Tone: premium industrial design studio. Credible to a plant head; never gamey. No black (the
footer is the only dark surface), no neon, no HUD, no sci-fi chrome.

## Palette

| role | value | use |
| --- | --- | --- |
| paper (environment) | `#F2EEE7` warm white | background, fog, floor |
| porcelain | `#FBF9F5` | matte ceramic parts |
| ink | `#101826` | type on paper |
| brand blue | `#1638D8` deep, saturated | brand surfaces, flooded chapters, anodised metal |
| blue deep | `#0B1E78` | flood shadows, footer gradient start |
| signal | `#FF5A1F` safety orange, the one saturated accent | status lights (the only bloom), anomaly, In production |
| footer navy | `#0A1633` | footer only |

Flooded beat: "From ERP to the shop floor" turns the whole viewport brand blue; type goes
porcelain. It is the only flood on the home journey, so it lands.

## Type

- Display: **Big Shoulders Display** (variable 100–900), an industrial signage face cut from
  Chicago street signs. Set enormous (14–22vw), condensed, tight. Weight is a live axis: it
  thins under the cursor and swells with scroll velocity.
- Body: **Instrument Sans** (variable), 17–18px / 1.6.
- Kinetic rules: titles are split into characters inside word masks; the accessible name is
  one unsplit string. Every chapter uses a different reveal (see the ledger). Type skews with
  scroll velocity (max 6°) and settles with the damped scroll.
- Spatial type: the chapter word also exists in the world as SDF text (troika) the camera
  flies past and through. It is decorative (aria-hidden); the DOM carries meaning.

## Material language (all physically based, extended with custom shader code)

| material | build | where |
| --- | --- | --- |
| dispersive glass | MeshPhysical transmission 1, ior 1.5, dispersion 5, thickness, low roughness | intelligence core, signature, proof halo, contact forms |
| frosted → clear glass | same with animated roughness/transmission | transparency problem |
| anodised blue metal | metalness 1, roughness .3, anisotropy .8 + shader-patched brushed streaks | service blocks, machines, barrier |
| brushed steel | same, warm grey | bolts, beams, chains |
| iridescent coating | clearcoat + iridescence 1, thin-film 200–600nm | modules, vendor tokens, AI panel frame |
| matte ceramic | roughness .85, sheen | plinths, bodies, floor |
| liquid chrome (hero) | raymarched SDF metaballs, studio env in shader, thin-film fresnel, three-tap dispersion | hero object only |
| status light | emissive signal orange > 1.0 | the only thing that blooms |

Lighting: one warm key with a soft shadow, a cool sky fill, a PMREM studio environment
built from emissive softboxes. Post: depth of field focused on the active station, bloom on
emissive status lights only (luminance threshold), film grain, chromatic fringe that only
appears with motion, and a cursor flow field that displaces the image beneath the pointer.

## Motion language

- Native scroll is the truth (Lenis smooths it). The camera follows a damped copy (λ 3.2).
- Eases: `expo.out` for arrivals, `power3.inOut` for camera holds, `power4.in` for exits.
  Overlap always: type starts before the camera lands, the object reacts after.
- Anticipation: objects strain (problems), parts hesitate before they fly (proof), machines
  dip before they rise (products).
- Cursor: a magnetic, morphing ring (no labels) that becomes the shape of what it is over;
  a flow-field trail in the post pass disturbs the world; parts are repelled by the cursor.

## Camera plan and signature moments (one per chapter)

| # | chapter | place | camera move (unique) | signature moment | DOM type reveal |
| --- | --- | --- | --- | --- | --- |
| 0 | preloader → hero | the forge | drop from 40 m to eye height | the logo mark assembles from three parts with real progress; at 100% its blue node floods the screen and the camera falls into the world; a liquid-chrome metaball follows the cursor and re-forms into the TAMS beam | characters rise from masks, staggered by word |
| 1 | proof | counting floor | slow dolly left | 4,000 brushed bolts and plates assemble into each figure in turn (14+, 25, 25+, 5, 7), the cursor scatters them | the number ticks with the parts; label slides |
| 2–6 | five problems | the strain rail | crane along a curved rail, rising between each | each metaphor strains as you arrive and resolves as you leave: a beam buckles then articulates, glass links pull apart then snap, frosted glass clears to show flow, plates rattle then close into a shield, a box overflows then grows | characters jitter on X then lock |
| 7–10 | four services | the lifecycle | orbit 90° around one spot | 48 anodised blocks re-form four times: blueprint grid → ring with SLA hand → core with snapping modules → right-sized selection | words slide up from below, one per beat |
| 11–17 | seven products | the workshop | lateral truck past plinths | seven machines; hover leans, click lifts any of them into the hand (inspect) | clip wipe from the left |
| 18–21 | from ERP to the shop floor | the data hall | world floods blue; the camera flies through the IIoT ring and the glass core | live particles stream one way from sensors to SAP; "reads from the machine layer, never writes to it" rides along the line | weight sweep 100 → 900 |
| 22 | 85% callout | the overlook | pull back as the flood drains | the figure set in the largest type on the site | numerals roll |
| 23–30 | eight solutions | the districts | aerial rise and drop between blocks | each district has its own material identity | letters drop from above |
| 31–36 | six industries | the ring road | banked orbit around a turntable | six dioramas, the camera leans into the curve | horizontal mask |
| 37–43 | seven process steps | the path | chase camera behind one glass puck | the puck travels the whole path; each station lights as it passes | line-by-line |
| 44 | contact | the light room | rise into whiteout | calm, slow glass forms; the form | soft weight swell |
| — | footer | — | — | deep navy, the only dark surface | — |

Rooms for other routes (same world, own signature visual):
services → lifecycle; products → workshop (inspect on every machine); solutions → districts;
industries → ring road; about → glass globe with five country nodes; careers → assembly room
(blocks stacking); contact → light room; brand → material library (one sphere per material);
legal/sitemap → light room; 404 → the unplugged cable.

## Fallbacks (do not shape the main experience)

Reduced motion or no WebGL: no canvas, no preloader animation, no cursor, no smooth scroll.
Every chapter renders as readable DOM with its authored SVG illustration (the static kit in
`src/illustrations`). Content and order are identical.
