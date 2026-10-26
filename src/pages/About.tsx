import { company, figures } from "../data/site";
import { Beat, useKineticCursor } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { CtaBeat } from "../components/CtaBeat";
import { PlaceholderFlag } from "../components/ui";
import { usePageTitle } from "./usePageTitle";

export default function About() {
  usePageTitle("About Us");
  useRoom("about");
  useKineticCursor();
  return (
    <div className="journey">
      <Beat k="globe:0" side="left" titleAs="h1" eyebrow="About Us" title="An SAP partner that only works with manufacturers" reveal="rise" size="xl" immediate art="sol-ai" body={<p>{`${company.name} is an ${company.description.replace(/\.$/, "")}, based in ${company.address}, supporting customers in five countries.`}</p>}>
        <Crumbs items={[{ label: "About Us" }]} />
      </Beat>
      {figures.map((f, i) => (
        <Beat key={f.label} k={`proof:${i}`} side="right" title={`${f.value}${f.suffix}`} reveal="roll" size="xl" body={<p className="figure-label">{f.label}</p>} />
      ))}
      <Beat k="globe:1" side="right" title="Manufacturing only" reveal="lines" art="sol-industry" body={<p className="placeholder-copy">Replace with why TAMS chose to work only with manufacturers, and what that focus means for a customer's project.</p>}>
        <PlaceholderFlag />
      </Beat>
      <Beat k="globe:2" side="left" title="We implement, and we build" reveal="lines" art="svc-build" body={<p className="placeholder-copy">Replace with how the seven TAMS products grew out of problems seen again and again on customer shop floors.</p>}>
        <PlaceholderFlag />
      </Beat>
      <Beat k="globe:3" side="right" title="One in-house team" reveal="lines" art="svc-ams" body={<p className="placeholder-copy">Replace with how the in-house consultants work across implementation, support and product development.</p>}>
        <PlaceholderFlag />
      </Beat>
      <CtaBeat />
    </div>
  );
}
