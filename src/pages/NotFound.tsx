import { Beat } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { usePageTitle } from "./usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");
  useRoom("404");
  return (
    <div className="journey">
      <Beat k="unplugged:0" side="left" titleAs="h1" eyebrow="Error 404" title="This line is not connected." reveal="jitter" size="xl" immediate art="notfound" body={<p>The page you asked for does not exist or has moved.</p>} cta={{ to: "/", label: "Back to the plant" }} />
    </div>
  );
}
