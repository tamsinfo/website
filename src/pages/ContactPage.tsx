import { company } from "../data/site";
import { Beat, useKineticCursor } from "../experience/ui";
import { useRoom } from "../experience/Experience";
import { Crumbs } from "../components/Crumbs";
import { ContactForm } from "../components/ContactForm";
import { Icon } from "../components/ui";
import { usePageTitle } from "./usePageTitle";

export default function ContactPage() {
  usePageTitle("Contact Us");
  useRoom("contact");
  useKineticCursor();
  return (
    <div className="journey">
      <Beat k="contact:0" side="left" titleAs="h1" eyebrow="Contact Us" title="Tell us what is breaking" reveal="swell" size="xl" immediate art="contact" body={<p>Book a 30-minute consultation with a consultant.</p>}>
        <Crumbs items={[{ label: "Contact Us" }]} />
        <ul className="contact__list">
          <li>
            <Icon name="phone" size={20} />
            <a href={company.phoneHref}>{company.phone}</a>
          </li>
          <li>
            <Icon name="letter" size={20} />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </li>
          <li>
            <Icon name="map-point" size={20} />
            <span>{company.address}</span>
          </li>
        </ul>
      </Beat>
      <section className="beat beat--right beat--contact" data-key="contact:0.1" data-side="right" id="contact-form">
        <div className="beat__inner">
          <h2 className="beat__eyebrow">Book a discovery call</h2>
          <div className="contact__form">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
