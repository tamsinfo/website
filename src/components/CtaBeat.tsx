import { Beat } from "../experience/ui";

/** closing beat on every room: the camera carries you into the light room */
export function CtaBeat({ title = "Tell us what is breaking" }: { title?: string }) {
  return <Beat k="contact:0" side="left" eyebrow="30-minute consultation" title={title} reveal="swell" size="l" art="contact" cta={{ to: "/contact#contact-form", label: "Book a discovery call" }} />;
}
