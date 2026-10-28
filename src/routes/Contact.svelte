<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import PageHero from "../components/PageHero.svelte";
  import Section from "../components/Section.svelte";
  import { categories, company } from "../lib/content";
  import { scene } from "../lib/state.svelte";
  import { route } from "../router";

  scene({ room: "studio", view: "contact" });

  // Set VITE_CONTACT_ENDPOINT to an endpoint that accepts a JSON POST. Without it the form
  // opens the visitor's email app with the enquiry written out, and says so.
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

  const known = new Set(categories.flatMap((c) => c.items.map((i) => i.slug)));
  const initialTopic = String(route.search.topic ?? "");

  let form = $state({
    name: "",
    email: "",
    company: "",
    role: "",
    topic: known.has(initialTopic) ? initialTopic : "",
    message: "",
  });
  type Field = "name" | "email" | "company" | "message";
  let touched = $state<Record<Field, boolean>>({ name: false, email: false, company: false, message: false });
  let status = $state<"idle" | "sending" | "sent" | "mailto" | "error">("idle");
  let formEl = $state<HTMLFormElement>();

  const errors = $derived({
    name: form.name.trim() ? "" : "Tell us your name.",
    email: !form.email.trim()
      ? "We need an email address to reply."
      : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())
        ? ""
        : "That doesn't look like an email address. Check for typos.",
    company: form.company.trim() ? "" : "Which company are you with?",
    message: form.message.trim().length >= 20 ? "" : "A sentence or two about what you need helps us reply usefully (20 characters or more).",
  });
  const valid = $derived(!errors.name && !errors.email && !errors.company && !errors.message);
  const show = (f: Field) => touched[f] && errors[f];

  function topicLabel(slug: string) {
    for (const c of categories) {
      const item = c.items.find((i) => i.slug === slug);
      if (item) return `${c.label}: ${item.name}`;
    }
    return "General enquiry";
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    touched = { name: true, email: true, company: true, message: true };
    if (!valid) {
      const first = (["name", "email", "company", "message"] as Field[]).find((f) => errors[f]);
      formEl?.querySelector<HTMLElement>(`#f-${first}`)?.focus();
      return;
    }
    const payload = { ...form, topic: topicLabel(form.topic), page: location.href };
    if (!endpoint) {
      const body = [
        `Name: ${payload.name}`,
        `Company: ${payload.company}`,
        payload.role && `Role: ${payload.role}`,
        `Email: ${payload.email}`,
        `Topic: ${payload.topic}`,
        "",
        payload.message,
      ]
        .filter((l) => l !== "")
        .join("\n");
      const subject = `Enquiry: ${payload.topic}`;
      window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status = "mailto";
      return;
    }
    status = "sending";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      status = res.ok ? "sent" : "error";
    } catch {
      status = "error";
    }
  }
</script>

<svelte:head><title>Contact · TAMS Infotech</title></svelte:head>

<PageHero
  title="Start a conversation."
  lede="Tell us what you run today, what has to change, and by when. A consultant will reply, usually with a few questions before any proposal."
/>

<Section tone="porcelain">
  <div class="layout">
    <div class="form-col">
      {#if status === "sent"}
        <div class="done" role="status">
          <Icon name="check-circle" size={32} />
          <h2>Thanks, {form.name.split(" ")[0]}. Your enquiry is with us.</h2>
          <p>We'll reply to {form.email}. If it's urgent, call {company.phone}.</p>
        </div>
      {:else if status === "mailto"}
        <div class="done" role="status">
          <Icon name="letter" size={32} />
          <h2>Your email app should now be open.</h2>
          <p>
            The enquiry is written out and addressed to {company.email}; send it from there. If nothing opened, copy your
            message and email it to <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
          <button type="button" class="btn btn--ghost" onclick={() => (status = "idle")}>Back to the form</button>
        </div>
      {:else}
        <form bind:this={formEl} onsubmit={submit} novalidate aria-describedby="form-note">
          <h2 class="form-title">Your enquiry</h2>
          <div class="row two">
            <div class="field" class:invalid={show("name")}>
              <label for="f-name">Name</label>
              <input id="f-name" name="name" autocomplete="name" bind:value={form.name} onblur={() => (touched.name = true)} aria-invalid={!!show("name")} aria-describedby={show("name") ? "e-name" : undefined} required />
              {#if show("name")}<p class="err" id="e-name"><Icon name="danger-circle" size={16} />{errors.name}</p>{/if}
            </div>
            <div class="field" class:invalid={show("email")}>
              <label for="f-email">Work email</label>
              <input id="f-email" name="email" type="email" autocomplete="email" bind:value={form.email} onblur={() => (touched.email = true)} aria-invalid={!!show("email")} aria-describedby={show("email") ? "e-email" : undefined} required />
              {#if show("email")}<p class="err" id="e-email"><Icon name="danger-circle" size={16} />{errors.email}</p>{/if}
            </div>
          </div>
          <div class="row two">
            <div class="field" class:invalid={show("company")}>
              <label for="f-company">Company</label>
              <input id="f-company" name="company" autocomplete="organization" bind:value={form.company} onblur={() => (touched.company = true)} aria-invalid={!!show("company")} aria-describedby={show("company") ? "e-company" : undefined} required />
              {#if show("company")}<p class="err" id="e-company"><Icon name="danger-circle" size={16} />{errors.company}</p>{/if}
            </div>
            <div class="field">
              <label for="f-role">Role <span class="opt">optional</span></label>
              <input id="f-role" name="role" autocomplete="organization-title" bind:value={form.role} />
            </div>
          </div>
          <div class="field">
            <label for="f-topic">What's it about? <span class="opt">optional</span></label>
            <div class="select">
              <select id="f-topic" name="topic" bind:value={form.topic}>
                <option value="">General enquiry</option>
                {#each categories as c (c.key)}
                  <optgroup label={c.label}>
                    {#each c.items as item (item.slug)}<option value={item.slug}>{item.name}</option>{/each}
                  </optgroup>
                {/each}
              </select>
              <Icon name="alt-arrow-down" size={18} />
            </div>
          </div>
          <div class="field" class:invalid={show("message")}>
            <label for="f-message">What do you need?</label>
            <textarea id="f-message" name="message" rows="6" bind:value={form.message} onblur={() => (touched.message = true)} aria-invalid={!!show("message")} aria-describedby={show("message") ? "e-message" : "h-message"} required></textarea>
            {#if show("message")}
              <p class="err" id="e-message"><Icon name="danger-circle" size={16} />{errors.message}</p>
            {:else}
              <p class="hint" id="h-message">Your current system, the plants or entities involved, and any dates you're working to.</p>
            {/if}
          </div>
          {#if status === "error"}
            <p class="err banner" role="alert">
              <Icon name="danger-triangle" size={18} />
              The enquiry didn't go through. Try again, or email {company.email} directly.
            </p>
          {/if}
          <div class="submit">
            <button class="btn" type="submit" disabled={status === "sending"} data-cursor="morph">
              {#if status === "sending"}
                <Icon name="refresh" size={20} class="spin" /> Sending
              {:else}
                Send enquiry <Icon name="arrow-right" size={20} />
              {/if}
            </button>
            <p class="note" id="form-note">
              {#if endpoint}
                We use these details only to reply to this enquiry.
              {:else}
                Sending opens your email app with the enquiry written out. We use these details only to reply.
              {/if}
            </p>
          </div>
        </form>
      {/if}
    </div>

    <aside class="direct" aria-label="Direct contact">
      <div class="block">
        <h2>Direct</h2>
        <a class="line" href={company.phoneHref}><Icon name="phone" size={22} /><span>{company.phone}</span></a>
        <a class="line" href={`mailto:${company.email}`}><Icon name="letter" size={22} /><span>{company.email}</span></a>
      </div>
      <div class="block">
        <h2>Offices</h2>
        {#each company.offices as o (o.city)}
          <address>
            <span class="city">{o.city}, {o.country}</span>
            {#each o.lines as line (line)}<span>{line}</span>{/each}
          </address>
        {/each}
      </div>
    </aside>
  </div>
</Section>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
    gap: 48px clamp(32px, 6vw, 112px);
  }
  .form-title,
  .direct h2 {
    font-size: var(--fs-h3);
    margin-bottom: 24px;
  }
  form {
    display: grid;
    gap: 22px;
  }
  .row.two {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
  }
  .field {
    display: grid;
    gap: 8px;
    align-content: start;
  }
  label {
    font-weight: 600;
  }
  .opt {
    font-weight: 400;
    color: var(--ink-3);
    margin-left: 4px;
  }
  input,
  select,
  textarea {
    width: 100%;
    min-height: 50px;
    padding: 12px 14px;
    border: 1px solid var(--rule-strong);
    border-radius: var(--r-control);
    background: var(--porcelain);
    color: var(--ink);
    transition:
      border-color var(--dur-micro) var(--ease-out),
      box-shadow var(--dur-micro) var(--ease-out);
  }
  textarea {
    resize: vertical;
    min-height: 150px;
    line-height: 1.5;
  }
  input:hover,
  select:hover,
  textarea:hover {
    border-color: var(--ink-3);
  }
  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgb(22 56 216 / 0.18);
  }
  .invalid input,
  .invalid textarea {
    border-color: #b42318;
  }
  .select {
    position: relative;
  }
  select {
    appearance: none;
    padding-right: 44px;
  }
  .select :global(.icon) {
    position: absolute;
    right: 14px;
    top: 50%;
    translate: 0 -50%;
    pointer-events: none;
    color: var(--ink-2);
  }
  .err {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    color: #b42318;
    font-size: var(--fs-small);
    line-height: 1.4;
  }
  .err :global(.icon) {
    margin-top: 1px;
  }
  .err.banner {
    padding: 12px 14px;
    border-radius: var(--r-control);
    background: #fdecea;
  }
  .hint {
    color: var(--ink-3);
    font-size: var(--fs-small);
  }
  .submit {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 24px;
    margin-top: 6px;
  }
  .note {
    color: var(--ink-3);
    font-size: var(--fs-small);
    max-width: 42ch;
  }
  .submit :global(.spin) {
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .done {
    display: grid;
    gap: 14px;
    justify-items: start;
    padding: 32px;
    border-radius: var(--r-panel);
    background: var(--paper);
    border: 1px solid var(--rule);
  }
  .done :global(.icon) {
    color: var(--blue);
  }
  .done h2 {
    font-size: var(--fs-h3);
  }
  .done p {
    color: var(--ink-2);
  }
  .direct {
    display: grid;
    gap: 48px;
    align-content: start;
  }
  .line {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-top: 1px solid var(--rule);
    font-weight: 560;
    text-decoration: none;
  }
  .line :global(.icon) {
    color: var(--blue);
  }
  .line:hover span {
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }
  address {
    display: grid;
    gap: 2px;
    padding: 14px 0 18px;
    border-top: 1px solid var(--rule);
    font-style: normal;
    color: var(--ink-2);
    font-size: var(--fs-small);
  }
  .city {
    color: var(--ink);
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 4px;
  }
  @media (max-width: 960px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .row.two {
      grid-template-columns: 1fr;
    }
  }
</style>
