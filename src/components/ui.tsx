import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { solarIcons, type IconName } from "../icons/solar";

/* ---------- Icon: Solar Duotone Bold, inlined from a build-time subset ---------- */
export function Icon({ name, size = 22, className, label }: { name: IconName; size?: number; className?: string; label?: string }) {
  const icon = solarIcons[name];
  return (
    <svg
      className={`icon ${className ?? ""}`}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

/* ---------- Word-by-word heading. The full sentence is in a visually hidden span;
   the split words are aria-hidden, so the accessible name is never fragmented. ---------- */
type HeadingTag = "h1" | "h2" | "h3";
export function WordReveal({ as: Tag = "h2", text, className, immediate, id }: { as?: HeadingTag; text: string; className?: string; immediate?: boolean; id?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className} id={id} data-words={immediate ? "immediate" : ""}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="words">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="w">
              <span>{w}</span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/* ---------- Buttons ---------- */
type BtnProps = { to: string; children: ReactNode; variant?: "primary" | "secondary" | "light"; icon?: IconName; className?: string; size?: "lg" };
export function ButtonLink({ to, children, variant = "primary", icon = "arrow-right", className, size }: BtnProps) {
  const cls = `btn btn--${variant} ${size ? `btn--${size}` : ""} ${className ?? ""}`;
  const inner = (
    <>
      <span>{children}</span>
      <Icon name={icon} size={18} className="btn__icon" />
    </>
  );
  if (to.startsWith("#") || to.startsWith("http") || to.startsWith("mailto:") || to.startsWith("tel:")) {
    return (
      <a href={to} className={cls} data-magnetic>
        {inner}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} data-magnetic>
      {inner}
    </Link>
  );
}

/** small sentence-case label above a heading */
export const Eyebrow = ({ children }: { children: ReactNode }) => <p className="eyebrow">{children}</p>;

export function PlaceholderFlag({ children = "Placeholder copy, replace before launch" }: { children?: ReactNode }) {
  return (
    <p className="placeholder-flag">
      <Icon name="info-circle" size={16} />
      <span>{children}</span>
    </p>
  );
}
