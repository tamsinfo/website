import { company } from "../data/site";
import { Beat } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { PlaceholderFlag } from "../components/ui";
import { usePageTitle } from "./usePageTitle";

const TITLES = { privacy: "Privacy notice", terms: "Terms of use", cookies: "Cookie notice" } as const;

export default function Legal({ kind }: { kind: keyof typeof TITLES }) {
  usePageTitle(TITLES[kind]);
  useRoom(kind);
  return (
    <div className="journey">
      <Beat
        k="contact:0.2"
        side="left"
        titleAs="h1"
        eyebrow="Legal"
        title={TITLES[kind]}
        reveal="lines"
        size="l"
        immediate
        body={
          <>
            <p className="placeholder-copy">This page will hold the {TITLES[kind].toLowerCase()} for {company.legalName}. It is a template so that the footer link resolves.</p>
            {kind === "cookies" ? <p>This site does not set analytics or advertising cookies, and stores nothing in your browser beyond what it needs to display the page.</p> : null}
            <p>
              Questions: <a className="link" href={`mailto:${company.email}`}>{company.email}</a>
            </p>
            <p className="small">{company.trademark}</p>
          </>
        }
      >
        <Crumbs items={[{ label: TITLES[kind] }]} />
        <PlaceholderFlag>Placeholder, legal text must be supplied and reviewed by counsel</PlaceholderFlag>
      </Beat>
    </div>
  );
}
