import { useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { company } from "../data/site";
import { Icon } from "./ui";

/* Discovery-call form: validation, loading, error and success states.
   Submission goes to VITE_CONTACT_ENDPOINT (JSON POST) when configured. Without it, the form
   runs in demo mode (simulated success) — see README "Contact form". Add ?form=fail to the URL
   to exercise the error state. */

type Fields = { name: string; email: string; company: string; breaking: string; consent: boolean };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "submitting" | "error" | "success";

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton(mail)?|rediffmail)\./i;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email address, like name@company.com.";
  else if (FREE_MAIL.test(f.email)) e.email = "Please use your work email so we can reach the right team.";
  if (f.company.trim().length < 2) e.company = "Please enter your company name.";
  if (f.breaking.trim().length < 10) e.breaking = "Tell us a little more — at least a sentence about what is breaking.";
  if (!f.consent) e.consent = "Please confirm we may contact you about this request.";
  return e;
}

async function submit(data: Fields) {
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return;
  }
  // demo mode
  await new Promise((r) => setTimeout(r, 1200));
  if (new URLSearchParams(location.search).get("form") === "fail") throw new Error("Simulated network error");
}

export function ContactForm() {
  const uid = useId();
  const [f, setF] = useState<Fields>({ name: "", email: "", company: "", breaking: "", consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const summary = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    const next = { ...f, [k]: v };
    setF(next);
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
  };
  const blur = (k: keyof Fields) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(f)[k] }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    const errs = validate(f);
    setErrors(errs);
    setTouched({ name: true, email: true, company: true, breaking: true, consent: true });
    const firstBad = (Object.keys(errs) as (keyof Fields)[])[0];
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    try {
      await submit(f);
      setStatus("success");
      requestAnimationFrame(() => success.current?.focus());
    } catch {
      setStatus("error");
      requestAnimationFrame(() => summary.current?.focus());
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" ref={success} tabIndex={-1} role="status">
        <Icon name="check-circle" size={40} className="form-success__icon" />
        <h3>Thanks, {f.name.split(" ")[0]}. Your request is in.</h3>
        <p>
          A consultant will email <strong>{f.email}</strong> to book your 30-minute discovery call. If it is urgent, call{" "}
          <a href={company.phoneHref}>{company.phone}</a>.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setF({ name: "", email: "", company: "", breaking: "", consent: false });
            setTouched({});
            setStatus("idle");
          }}
        >
          <span>Send another request</span>
          <Icon name="restart" size={18} className="btn__icon" />
        </button>
      </div>
    );
  }

  const field = (k: keyof Fields) => ({
    id: `${uid}-${k}`,
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
    onBlur: () => blur(k),
    disabled: status === "submitting",
  });
  const err = (k: keyof Fields) =>
    errors[k] ? (
      <p className="field__error" id={`${uid}-${k}-err`}>
        <Icon name="danger-triangle" size={16} />
        {errors[k]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-busy={status === "submitting"} id="contact-form-el">
      {status === "error" ? (
        <div className="form-alert" role="alert" tabIndex={-1} ref={summary}>
          <Icon name="danger-triangle" size={20} />
          <p>
            We could not send your request. Check your connection and try again, or email{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
        </div>
      ) : null}
      <div className="form__row">
        <div className="field">
          <label htmlFor={`${uid}-name`}>Name</label>
          <input {...field("name")} type="text" autoComplete="name" required value={f.name} onChange={(e) => set("name", e.target.value)} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-email`}>Work email</label>
          <input {...field("email")} type="email" autoComplete="email" inputMode="email" required value={f.email} onChange={(e) => set("email", e.target.value)} />
          {err("email")}
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input {...field("company")} type="text" autoComplete="organization" required value={f.company} onChange={(e) => set("company", e.target.value)} />
        {err("company")}
      </div>
      <div className="field">
        <label htmlFor={`${uid}-breaking`}>What is breaking?</label>
        <textarea
          {...field("breaking")}
          rows={4}
          required
          placeholder="e.g. Month-end close takes two weeks; production confirmations are typed in from paper."
          value={f.breaking}
          onChange={(e) => set("breaking", e.target.value)}
        />
        {err("breaking")}
      </div>
      <div className="field field--check">
        <input {...field("consent")} type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
        <label htmlFor={`${uid}-consent`}>
          I agree that TAMS Infotech may contact me about this request, as described in the <Link to="/privacy">privacy notice</Link>.
        </label>
        {err("consent")}
      </div>
      <div className="form__foot">
        <button type="submit" className="btn btn--primary btn--lg" disabled={status === "submitting"}>
          <span>{status === "submitting" ? "Sending…" : "Book a discovery call"}</span>
          {status === "submitting" ? <span className="spinner" aria-hidden="true" /> : <Icon name="calendar" size={18} className="btn__icon" />}
        </button>
        <p className="form__note">A 30-minute consultation with a consultant.</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {status === "submitting" ? "Sending your request" : ""}
      </p>
    </form>
  );
}
