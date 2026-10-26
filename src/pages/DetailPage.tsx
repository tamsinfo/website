import { useParams } from "react-router-dom";
import { Beat, InspectButton, useKineticCursor } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { CtaBeat } from "../components/CtaBeat";
import { PlaceholderFlag } from "../components/ui";
import { KINDS, story, type Kind } from "./content";
import { usePageTitle } from "./usePageTitle";
import NotFound from "./NotFound";

export default function DetailPage({ kind }: { kind: Kind }) {
  const { slug } = useParams();
  const meta = KINDS[kind];
  const index = meta.items.findIndex((i) => i.slug === slug);
  const item = meta.items[index];
  usePageTitle(item?.title ?? "Not found");
  useRoom(slug);
  useKineticCursor();
  if (!item) return <NotFound />;
  return (
    <div className="journey">
      <Beat k={`${meta.station}:${index}`} side="left" titleAs="h1" eyebrow={meta.singular} title={item.title} reveal="rise" size="xl" immediate art={item.art} body={<>{item.tag ? <span className="status">{item.tag}</span> : null}<p>{item.body}</p></>}>
        <Crumbs items={[{ label: meta.label, to: `/${kind}` }, { label: item.title }]} />
        {kind === "products" ? <InspectButton id={item.slug} title={item.title} /> : null}
      </Beat>
      {story(kind, item.title).map((s, j) => (
        <Beat key={s.key} k={`${meta.station}:${index}.${j + 1}`} side={j % 2 ? "left" : "right"} eyebrow={`Part ${j + 1} of 3`} title={s.title} reveal="lines" art={s.art} body={<p className="placeholder-copy">{s.body}</p>}>
          <PlaceholderFlag />
        </Beat>
      ))}
      <CtaBeat />
    </div>
  );
}
