import { Beat, useKineticCursor } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { KINDS, type Kind } from "./content";
import { usePageTitle } from "./usePageTitle";
import { CtaBeat } from "../components/CtaBeat";

export default function HubPage({ kind }: { kind: Kind }) {
  const meta = KINDS[kind];
  usePageTitle(meta.label);
  useRoom(kind);
  useKineticCursor();
  return (
    <div className="journey">
      <Beat k={`${meta.station}:${meta.hubK}`} side="left" titleAs="h1" eyebrow={meta.label} title={meta.hubTitle} reveal="rise" size="xl" immediate body={<p>{meta.hubLede}</p>}>
        <Crumbs items={[{ label: meta.label }]} />
      </Beat>
      {meta.items.map((it, i) => (
        <Beat
          key={it.slug}
          k={`${meta.station}:${i}`}
          side={i % 2 ? "left" : "right"}
          eyebrow={`${meta.singular} ${i + 1} of ${meta.items.length}`}
          title={it.title}
          reveal={kind === "products" ? "wipe" : kind === "solutions" ? "drop" : kind === "industries" ? "mask" : "slide"}
          body={
            <>
              {it.tag ? <span className="status">{it.tag}</span> : null}
              <p>{it.body}</p>
            </>
          }
          cta={{ to: `/${kind}/${it.slug}`, label: `${meta.cta} ${it.title.replace(/ \(.*\)$/, "")}` }}
          art={it.art}
        />
      ))}
      <CtaBeat />
    </div>
  );
}
