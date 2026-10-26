import { Beat, useKineticCursor } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { CtaBeat } from "../components/CtaBeat";
import { PlaceholderFlag } from "../components/ui";
import { usePageTitle } from "./usePageTitle";

const ROLES = [
  ["SAP functional consultant", "Example role. Replace with the real opening: modules (PP, MM, SD, FI-CO), experience and location."],
  ["SAP ABAP and BTP developer", "Example role. Replace with the real opening: the products you would work on, stack and location."],
  ["AMS support consultant", "Example role. Replace with the real opening: the customers you would support and how the team works."],
];

export default function Careers() {
  usePageTitle("Careers");
  useRoom("careers");
  useKineticCursor();
  return (
    <div className="journey">
      <Beat k="blocks:0" side="left" titleAs="h1" eyebrow="Careers" title="Build SAP for the shop floor" reveal="rise" size="xl" immediate art="svc-build" body={<p>Work with in-house SAP consultants on manufacturing projects, and on the products we build ourselves.</p>}>
        <Crumbs items={[{ label: "Careers" }]} />
      </Beat>
      {ROLES.map(([t, b], i) => (
        <Beat key={t} k={`blocks:${i + 1}`} side={i % 2 ? "left" : "right"} eyebrow={`Role ${i + 1} of 3`} title={t} reveal="slide" body={<p className="placeholder-copy">{b}</p>} cta={{ to: "/contact#contact-form", label: "Ask about this role" }}>
          <PlaceholderFlag>Placeholder role, connect the real job list</PlaceholderFlag>
        </Beat>
      ))}
      <CtaBeat title="Not looking for a job? Tell us what is breaking." />
    </div>
  );
}
