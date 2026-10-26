import { company, diagramSteps, figures, industries, problems, processSteps, products, services, solutions } from "../data/site";
import { useMotion } from "../motion/MotionProvider";
import { Beat, InspectButton, Kinetic, useKineticCursor } from "../experience/ui";
import { useExperience, useRoom } from "../experience/Experience";
import { ContactForm } from "../components/ContactForm";
import { Icon } from "../components/ui";
import { Link } from "react-router-dom";
import { usePageTitle } from "./usePageTitle";

/* The home journey: 55 beats through one world. Each [data-key] is a camera keyframe
   (docs/ART_DIRECTION.md, camera plan). Sides alternate so type and object never collide. */

function DiagramNav({ current }: { current: number }) {
  const { lenis } = useMotion();
  const go = (i: number) => {
    const el = document.querySelector<HTMLElement>(`[data-key="connected:${i}"]`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY - innerHeight * 0.1;
    lenis ? lenis.scrollTo(y, { duration: 1.8 }) : window.scrollTo(0, y);
  };
  return (
    <ol className="dnav" aria-label="Machine sensors to SAP, in order">
      {diagramSteps.map((s, i) => (
        <li key={s.id}>
          <button type="button" className={`dnav__btn ${i === current ? "is-on" : ""}`} aria-current={i === current ? "step" : undefined} onClick={() => go(i)} data-magnetic>
            <span className="dnav__n">{i + 1}</span>
            {s.title}
          </button>
        </li>
      ))}
    </ol>
  );
}

export default function Home() {
  usePageTitle(null);
  useRoom("home");
  useKineticCursor();
  const { mode } = useExperience();
  const alt = (i: number) => (i % 2 ? "right" : "left") as "left" | "right";

  return (
    <div className="journey">
      <section className="beat beat--left beat--hero" data-key="hero:0" data-side="left">
        <div className="beat__inner">
          <p className="beat__eyebrow">SAP Gold Partner for manufacturing only</p>
          <Kinetic as="h1" text="Stop Managing Problems. Start Driving Profits with SAP." reveal="rise" className="beat__title kinetic--xl hero__title" immediate delay={1.1} />
          <p className="beat__body hero__sub">SAP solutions that cut inefficiency, automate operations, and give real-time business intelligence.</p>
          <div className="hero__actions">
            <a href="#contact" className="cta" data-magnetic>
              <span>Book a discovery call</span>
              <Icon name="calendar" size={20} className="cta__icon" />
            </a>
            <a href="#products" className="cta cta--ghost" data-magnetic>
              <span>See our products</span>
              <Icon name="arrow-right" size={20} className="cta__icon" />
            </a>
          </div>
        </div>
        {mode === "world" ? (
          <p className="hero__hint" aria-hidden="true">
            Move the cursor. Scroll to enter the plant.
          </p>
        ) : null}
      </section>

      {figures.map((f, i) => (
        <Beat
          key={f.label}
          k={`proof:${i}`}
          side="right"
          eyebrow={i === 0 ? "TAMS in numbers" : undefined}
          title={`${f.value}${f.suffix}`}
          reveal="roll"
          size="xl"
          body={<p className="figure-label">{f.label}</p>}
          art={i === 0 ? "svc-ams" : undefined}
        />
      ))}

      <Beat k="problems:0" side="left" eyebrow="The problem" title="What are you facing?" reveal="jitter" size="xl" body={<p>Five problems we hear in almost every first conversation with a manufacturer, and what SAP addresses in each.</p>} />
      {problems.map((p, i) => (
        <Beat key={p.title} k={`problems:${i}`} side={alt(i + 1)} eyebrow={`Problem ${i + 1} of 5`} title={p.title} reveal="jitter" body={<p>{p.body}</p>} art={p.art} />
      ))}

      <Beat k="services:0" side="right" eyebrow="Services" title="Four services, one lifecycle" reveal="slide" size="xl" body={<p>From the first blueprint to the hundredth support ticket, one team carries your SAP landscape.</p>} cta={{ to: "/services", label: "All services" }} />
      {services.map((s, i) => (
        <Beat key={s.slug} k={`services:${i}`} side={alt(i)} eyebrow={`Service ${i + 1} of 4`} title={s.title} reveal="slide" body={<p>{s.body}</p>} cta={{ to: `/services/${s.slug}`, label: `Explore ${s.title.split(" (")[0]}` }} art={s.art} />
      ))}

      <Beat k="products:-1" side="left" id="products" eyebrow="Products" title="Every SAP partner implements. We also build." reveal="wipe" size="xl" body={<p>Seven SAP-integrated applications, built by our own team for the work around the line.</p>} cta={{ to: "/products", label: "All products" }} />
      {products.map((p, i) => (
        <Beat
          key={p.slug}
          k={`products:${i}`}
          side={alt(i + 1)}
          eyebrow={`Product ${i + 1} of 7`}
          title={p.title}
          reveal="wipe"
          body={
            <>
              {p.tag ? <span className="status">{p.tag}</span> : null}
              <p>{p.body}</p>
            </>
          }
          cta={{ to: `/products/${p.slug}`, label: "View product" }}
          art={p.art}
        >
          <InspectButton id={p.slug} title={p.title} />
        </Beat>
      ))}

      <Beat k="connected:0" side="left" flood eyebrow="Connected manufacturing" title="From ERP to the shop floor" reveal="weight" size="xl" body={<p>We link machine data to SAP, so planning, maintenance and quality act on what the floor is actually doing.</p>} art="factory">
        <DiagramNav current={0} />
      </Beat>
      {diagramSteps.slice(1).map((s, i) => (
        <Beat key={s.id} k={`connected:${i + 1}`} side={alt(i + 1)} flood eyebrow={`${i + 2} of 4`} title={s.title} reveal="weight" body={<p>{s.text}</p>}>
          {i === 0 ? (
            <p className="note">
              <Icon name="lock-keyhole" size={20} /> Reads from the machine layer, never writes to it.
            </p>
          ) : null}
          <DiagramNav current={i + 1} />
        </Beat>
      ))}

      <section className="beat beat--right" data-key="callout:0" data-side="right">
        <div className="beat__inner">
          <p className="beat__eyebrow">One automotive customer</p>
          <Kinetic as="h2" text="85%" reveal="roll" className="beat__title kinetic--xxl" />
          <p className="beat__body callout__line">reduction in unplanned downtime at one automotive customer</p>
          <p className="beat__body">
            The next layer is TAMS Digital Manufacturing &amp; AI <span className="status">In production</span>
          </p>
          <Link to="/products/digital-manufacturing-ai" className="cta cta--ghost" data-magnetic>
            <span>See Digital Manufacturing &amp; AI</span>
            <Icon name="arrow-right" size={20} className="cta__icon" />
          </Link>
        </div>
      </section>

      <Beat k="solutions:-1" side="left" eyebrow="Solutions" title="Solutions guiding your SAP journey" reveal="drop" size="xl" body={<p>Eight districts of the same plant. Each SAP offering we implement and extend for manufacturers.</p>} cta={{ to: "/solutions", label: "All solutions" }} />
      {solutions.map((s, i) => (
        <Beat key={s.slug} k={`solutions:${i}`} side={alt(i)} eyebrow={`Solution ${i + 1} of 8`} title={s.title} reveal="drop" body={<p>{s.body}</p>} cta={{ to: `/solutions/${s.slug}`, label: `Read about ${s.title}` }} art={s.art} />
      ))}

      <Beat k="industries:-1" side="right" eyebrow="Industries" title="We only work with manufacturers" reveal="mask" size="xl" body={<p>Six segments, one focus. We do not take projects outside manufacturing.</p>} cta={{ to: "/industries", label: "All industries" }} />
      {industries.map((s, i) => (
        <Beat key={s.slug} k={`industries:${i}`} side={alt(i + 1)} eyebrow={`Industry ${i + 1} of 6`} title={s.title} reveal="mask" body={<p>{s.short}</p>} cta={{ to: `/industries/${s.slug}`, label: s.title }} art={s.art} />
      ))}

      <Beat k="process:0" side="left" eyebrow="Process" title="How we work" reveal="lines" size="xl" body={<p>Seven stations, the same path every time. Follow the puck.</p>} />
      {processSteps.map((s, i) => (
        <Beat key={s.title} k={`process:${i}`} side={alt(i + 1)} eyebrow={`Step ${i + 1} of 7`} title={s.title} reveal="lines" body={<p>{s.text}</p>} art={i === 0 ? "story-start" : undefined} />
      ))}

      <section className="beat beat--left beat--contact" data-key="contact:0" data-side="left" id="contact">
        <div className="beat__inner contact">
          <div className="contact__intro">
            <p className="beat__eyebrow">Contact</p>
            <Kinetic as="h2" text="Tell us what is breaking" reveal="swell" className="beat__title kinetic--l" />
            <p className="beat__body">Book a 30-minute consultation with a consultant. Bring the problem; we will bring the questions.</p>
            <p className="beat__body">
              <a href={company.phoneHref} className="link">
                {company.phone}
              </a>
            </p>
          </div>
          <div className="contact__form" id="contact-form">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
