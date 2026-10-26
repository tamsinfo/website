import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { nav, type NavGroup } from "../data/site";
import { Logo } from "./Logo";
import { ButtonLink, Icon } from "./ui";

/* Header: skip link, logo, primary nav with disclosure dropdowns, CTA, mobile menu.
   Dropdowns follow the disclosure pattern (button + aria-expanded), open on hover for fine
   pointers, close on Escape / outside click / focus leaving, and return focus to the trigger. */

function Dropdown({ group, open, setOpen }: { group: NavGroup; open: boolean; setOpen: (v: boolean) => void }) {
  const id = useId();
  const wrap = useRef<HTMLLIElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const active = pathname.startsWith(group.to);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, setOpen]);

  return (
    <li
      ref={wrap}
      className={`nav__item nav__item--menu ${open ? "is-open" : ""}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={btn}
        type="button"
        className={`nav__link ${active ? "is-active" : ""}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {group.label}
        <Icon name="alt-arrow-down" size={14} className="nav__chev" />
      </button>
      <div className="mega" id={id} hidden={!open}>
        <div className="mega__inner">
          <div className="mega__intro">
            <p className="mega__title">{group.label}</p>
            <Link to={group.to} className="text-link" onClick={() => setOpen(false)}>
              All {group.label.toLowerCase()} <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <ul className="mega__grid">
            {group.items!.map((it) => (
              <li key={it.to}>
                <NavLink to={it.to} className="mega__link" onClick={() => setOpen(false)}>
                  <span className="mega__icon">
                    <Icon name={it.icon} size={22} />
                  </span>
                  <span>
                    <span className="mega__name">{it.label}</span>
                    <span className="mega__desc">{it.desc}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [section, setSection] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    const first = panel.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a, button");
        const firstEl = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`mobile-menu ${open ? "is-open" : ""}`} id="mobile-menu" ref={panel} hidden={!open} role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="mobile-menu__top">
        <Link to="/" onClick={onClose} aria-label="TAMS Infotech home">
          <Logo size={28} />
        </Link>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close menu">
          <Icon name="close-circle" size={26} />
        </button>
      </div>
      <ul className="mobile-menu__list">
        {nav.map((g) =>
          g.items ? (
            <li key={g.to}>
              <button
                type="button"
                className="mobile-menu__link"
                aria-expanded={section === g.to}
                onClick={() => setSection(section === g.to ? null : g.to)}
              >
                {g.label}
                <Icon name="alt-arrow-down" size={18} className="nav__chev" />
              </button>
              {section === g.to ? (
                <ul className="mobile-menu__sub">
                  <li>
                    <Link to={g.to} onClick={onClose}>
                      All {g.label.toLowerCase()}
                    </Link>
                  </li>
                  {g.items.map((it) => (
                    <li key={it.to}>
                      <Link to={it.to} onClick={onClose}>
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ) : (
            <li key={g.to}>
              <NavLink to={g.to} end className="mobile-menu__link" onClick={onClose}>
                {g.label}
              </NavLink>
            </li>
          ),
        )}
      </ul>
      <div className="mobile-menu__cta">
        <ButtonLink to="/contact#contact-form">Book a discovery call</ButtonLink>
      </div>
    </div>
  );
}

export function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpenMenu(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-header__inner">
          <Link to="/" className="site-header__logo" aria-label="TAMS Infotech home">
            <Logo />
          </Link>
          <nav className="nav" aria-label="Primary">
            <ul className="nav__list">
              {nav.map((g) =>
                g.items ? (
                  <Dropdown key={g.to} group={g} open={openMenu === g.to} setOpen={(v) => setOpenMenu(v ? g.to : null)} />
                ) : (
                  <li className="nav__item" key={g.to}>
                    <NavLink to={g.to} end className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}>
                      {g.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <ButtonLink to="/contact#contact-form" className="site-header__cta" icon="calendar">
            Book a discovery call
          </ButtonLink>
          <button
            type="button"
            className="icon-btn site-header__burger"
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            onClick={() => setMobile(true)}
          >
            <Icon name="hamburger-menu" size={26} />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </header>
      <MobileMenu open={mobile} onClose={() => setMobile(false)} />
    </>
  );
}
