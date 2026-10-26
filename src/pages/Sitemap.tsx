import { Link } from "react-router-dom";
import { Beat } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { KINDS, type Kind } from "./content";
import { usePageTitle } from "./usePageTitle";

const TOP = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/careers", "Careers"],
  ["/contact", "Contact Us"],
  ["/brand", "Brand kit"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/cookies", "Cookies"],
] as const;

export default function Sitemap() {
  usePageTitle("Sitemap");
  useRoom("sitemap");
  return (
    <div className="journey">
      <Beat k="contact:0.3" side="left" titleAs="h1" eyebrow="Sitemap" title="Every room in the plant" reveal="lines" size="l" immediate>
        <div className="sitemap">
          <div>
            <h2 className="sitemap__h">Company</h2>
            <ul>
              {TOP.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          {(Object.keys(KINDS) as Kind[]).map((k) => (
            <div key={k}>
              <h2 className="sitemap__h">
                <Link to={`/${k}`}>{KINDS[k].label}</Link>
              </h2>
              <ul>
                {KINDS[k].items.map((i) => (
                  <li key={i.slug}>
                    <Link to={`/${k}/${i.slug}`}>{i.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Beat>
    </div>
  );
}
