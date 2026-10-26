import { Beat, useKineticCursor } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { Logo, Mark, Wordmark } from "../components/Logo";
import { Icon } from "../components/ui";
import { usePageTitle } from "./usePageTitle";
import type { IconName } from "../icons/solar";

const SWATCHES = [
  ["--paper", "#F2EEE7", "Paper, the environment"],
  ["--porcelain", "#FBF9F5", "Porcelain, matte ceramic"],
  ["--ink", "#101826", "Ink, type"],
  ["--blue", "#1638D8", "Brand blue, the flood"],
  ["--signal", "#FF5A1F", "Signal, the one accent: status lights only"],
  ["--navy", "#0A1633", "Navy, footer only"],
];
const CONTRAST = [
  ["Ink on paper", "15.9 : 1"],
  ["Ink 2 on paper", "7.6 : 1"],
  ["Porcelain on brand blue", "7.4 : 1"],
  ["Brand blue on paper", "6.7 : 1"],
  ["Footer text on navy", "14.9 : 1"],
];
const ICONS: IconName[] = ["cloud-upload", "headphones-round", "code-square", "key", "delivery", "globus", "pen-2", "plug-circle"];

export default function Brand() {
  usePageTitle("Brand kit");
  useRoom("brand");
  useKineticCursor();
  return (
    <div className="journey brand">
      <Beat k="library:0" side="left" titleAs="h1" eyebrow="Brand kit" title="The plant that builds itself" reveal="rise" size="xl" immediate body={<p>The TAMS kit: a luminous industrial studio, one deep brand blue, one signal accent, and materials with real character. Source of truth: src/styles/tokens.css and docs/ART_DIRECTION.md.</p>}>
        <Crumbs items={[{ label: "Brand kit" }]} />
      </Beat>
      <Beat k="library:1" side="right" title="The mark" reveal="slide" body={<p>A T-beam, flange and web split by a stencil gap, with one blue node where the beam meets the floor. The preloader builds it from these three parts.</p>}>
        <div className="brand-row">
          <Logo size={44} />
          <Mark size={72} />
          <Wordmark height={34} />
        </div>
      </Beat>
      <Beat k="library:2" side="left" title="Colour" reveal="mask">
        <ul className="swatches">
          {SWATCHES.map(([t, hex, role]) => (
            <li key={t}>
              <span className="swatch" style={{ background: `var(${t})` }} />
              <span>
                <strong>{role}</strong>
                <br />
                <span className="small">
                  {t} · {hex}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <table className="contrast">
          <tbody>
            {CONTRAST.map(([a, b]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Beat>
      <Beat k="library:3" side="right" title="Type" reveal="weight" body={<p>Big Shoulders Display, variable 100 to 900: industrial signage, set enormous; weight thins under the cursor. Instrument Sans for reading at 18px / 1.6.</p>}>
        <p className="type-sample">Stop Managing Problems.</p>
      </Beat>
      <Beat k="library:4" side="left" title="Materials" reveal="lines" body={<p>Dispersive glass, frosted glass, anodised blue metal with brushed streaks, brushed steel, iridescent coating, matte ceramic, and the signal light, the only thing that blooms.</p>} />
      <Beat k="library:5" side="right" title="Motion and cursor" reveal="drop" body={<p>Every chapter has its own camera move and its own type reveal. The cursor is a magnetic ring that becomes the shape of what it is over; its trail disturbs the world.</p>}>
        <ul className="icon-row" aria-label="Solar Duotone Bold icon samples">
          {ICONS.map((n) => (
            <li key={n}>
              <Icon name={n} size={28} />
            </li>
          ))}
        </ul>
        <p className="small">Icons: Solar Duotone Bold by 480 Design via Iconify (CC BY 4.0).</p>
      </Beat>
    </div>
  );
}
