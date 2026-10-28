<script lang="ts">
  import { categories, company } from "../lib/content";
  import Icon from "./Icon.svelte";
  import Logo from "./Logo.svelte";

  const year = new Date().getFullYear();
</script>

<footer class="footer" data-theme="night">
  <div class="wrap">
    <div class="top">
      <div class="lead">
        <a href="/" class="brand" aria-label="TAMS Infotech home"><Logo /></a>
        <p class="tag">SAP S/4HANA implementation, support and extension, and the applications that connect plants to it.</p>
        <div class="contact">
          <a href={company.phoneHref}><Icon name="phone" size={20} />{company.phone}</a>
          <a href={`mailto:${company.email}`}><Icon name="letter" size={20} />{company.email}</a>
        </div>
      </div>
      <nav class="cols" aria-label="Footer">
        {#each categories as c (c.key)}
          <div class="col">
            <p class="col-title"><a href={c.href}>{c.label}</a></p>
            <ul>
              {#each c.items as item (item.slug)}
                <li><a href={item.href}>{item.name}</a></li>
              {/each}
            </ul>
          </div>
        {/each}
        <div class="col">
          <p class="col-title">Company</p>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="offices">
      {#each company.offices as o (o.city)}
        <address>
          <span class="city">{o.city}, {o.country}</span>
          {#each o.lines as line (line)}<span>{line}</span>{/each}
        </address>
      {/each}
    </div>

    <div class="legal">
      <p>© {year} {company.legal}</p>
      <p>
        SAP, S/4HANA, RISE with SAP, GROW with SAP, SAP BTP and other SAP products named on this site are trademarks or
        registered trademarks of SAP SE in Germany and other countries.
      </p>
      <p>
        Icons: <a href="https://icon-sets.iconify.design/solar/" rel="noopener" target="_blank">Solar</a> by
        480 Design, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a>. Sound
        is synthesised in your browser.
      </p>
    </div>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    background: linear-gradient(180deg, var(--blue-deep) 0%, var(--navy) 62%);
    color: var(--porcelain);
    padding-block: clamp(64px, 8vw, 120px) 40px;
  }
  .footer a {
    color: inherit;
    text-decoration: none;
  }
  .footer a:hover {
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }
  .top {
    display: grid;
    grid-template-columns: minmax(260px, 1.1fr) 3fr;
    gap: clamp(40px, 6vw, 96px);
  }
  .tag {
    margin-top: 20px;
    color: var(--on-blue-2);
    max-width: 34ch;
  }
  .contact {
    display: grid;
    gap: 10px;
    margin-top: 28px;
  }
  .contact a {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 520;
  }
  .contact :global(.icon) {
    color: var(--on-blue-3);
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 32px 24px;
  }
  .col-title {
    font-weight: 600;
    margin-bottom: 14px;
  }
  .col ul {
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .col li a {
    color: var(--on-blue-2);
    font-size: var(--fs-small);
    line-height: 1.4;
  }
  .col li a:hover {
    color: var(--porcelain);
  }
  .offices {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    margin-top: clamp(48px, 6vw, 88px);
    padding-top: 32px;
    border-top: 1px solid var(--rule-blue);
  }
  address {
    font-style: normal;
    display: grid;
    gap: 2px;
    color: var(--on-blue-2);
    font-size: var(--fs-small);
  }
  .city {
    color: var(--porcelain);
    font-weight: 600;
    margin-bottom: 6px;
  }
  .legal {
    display: grid;
    gap: 8px;
    margin-top: 48px;
    font-size: 0.875rem;
    color: var(--on-blue-3);
    max-width: 90ch;
  }
  .legal a {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  @media (max-width: 1100px) {
    .top {
      grid-template-columns: 1fr;
    }
    .cols {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: 640px) {
    .cols {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .offices {
      grid-template-columns: 1fr;
    }
  }
</style>
