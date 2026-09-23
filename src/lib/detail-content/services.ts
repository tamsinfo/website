/**
 * SCR-007 to SCR-010 content (FR-006). Each page is transcribed verbatim from its own
 * snapshot, docs/03-design/paper-snapshot/{desktop,mobile}/services-<slug>.jsx, in
 * DOM order. Keys are the SERVICE_ROUTES ids in src/lib/site-routes.ts.
 */

import { type DetailFamily, type DetailPageContent, faqSection } from "../detail-page";
import { PLACEHOLDER_ROUTES, SERVICE_ROUTES, hrefFor } from "../site-routes";

const EYEBROW = "Service";

/** SCR-007, services-s4hana-cloud-implementation.jsx. */
const CLOUD_IMPLEMENTATION: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP S/4HANA Cloud Implementation",
  breadcrumbLabel: "SAP S/4HANA Cloud Implementation",
  intro:
    "GROW and RISE. Blueprint to go-live on Public or Private Edition, with fixed scope and a named delivery team.",
  sections: [
    {
      id: "scope",
      tone: "bg",
      heading: { eyebrow: "Scope", title: "What we deliver" },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "960",
          text: "End-to-end S/4HANA Cloud implementations that modernise operations without stopping them. Optimised processes, minimal disruption, and a configured system aligned to how your plant actually runs. Every project is scoped against SAP Activate, with deliverables named in the contract.",
        },
      ],
    },
    {
      id: "method",
      tone: "sunk",
      heading: { eyebrow: "Method", title: "The five phases" },
      blocks: [
        {
          kind: "rail",
          steps: [
            { title: "Discover", detail: "Digital discovery, process fit review, signed scope" },
            { title: "Prepare", detail: "Charter, governance, systems, data migration plan" },
            { title: "Explore", detail: "Fit-to-standard workshops, every gap logged and decided" },
            {
              title: "Realize",
              detail: "Configuration, extensions, data migration, three test cycles",
            },
            {
              title: "Deploy and run",
              detail: "Cutover rehearsal, go-live, hypercare with the same team",
            },
          ],
        },
        {
          kind: "callout",
          title: "SAP Activate phases as we run them",
          text: "Every gap found in Explore is logged, sized and decided before Realize begins — accept the standard, configure, or extend.",
        },
      ],
    },
    {
      id: "comparison",
      tone: "bg",
      heading: { eyebrow: "Comparison", title: "Which edition" },
      blocks: [
        {
          kind: "comparisonTable",
          caption: "Public Edition (GROW) compared with Private Edition (RISE)",
          columns: ["Public Edition (GROW)", "Private Edition (RISE)"],
          rows: [
            {
              label: "Best when",
              values: [
                "Processes close to standard, light custom code",
                "Complex process manufacturing, heavy customisation",
              ],
            },
            {
              label: "Go-live",
              values: [
                "Faster, pre-configured best practices",
                "Longer runway, more configuration freedom",
              ],
            },
            {
              label: "Extensibility",
              values: [
                "Key-user extensibility plus side-by-side on BTP",
                "Developer extensibility including classic ABAP",
              ],
            },
            {
              label: "Upgrades",
              values: [
                "Automatic, on SAP's quarterly cycle",
                "You control release timing within a window",
              ],
            },
            {
              label: "Licensing",
              values: [
                "Named per-user, per-month across eight user types",
                "FUE-based, a metric rather than a user type",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "deliverables",
      tone: "inverse",
      heading: { eyebrow: "Deliverables", title: "What you get, in writing" },
      blocks: [
        {
          kind: "checklist",
          items: [
            "Signed-off business blueprint and process design documents",
            "A configured system with the rationale documented per decision",
            "Data migration with reconciliation reports you can audit",
            "Integration to your existing systems, tested end to end",
            "GST, e-invoicing with IRN and QR, TDS and TCS as standard scope",
            "Key-user and end-user training, plus recorded sessions your team keeps",
            "Cutover plan, go-live support and a defined hypercare window",
          ],
        },
      ],
    },
    faqSection("bg", "FAQ", [
      [
        "How long does an implementation take?",
        "For a single-plant Indian manufacturer on Public Edition with standard processes, three to six months. Private Edition, multi-plant, or heavy process manufacturing usually runs six to twelve. The variable is rarely our side — it is decision speed and master data quality on yours.",
      ],
      [
        "What does my team have to do?",
        "Provide business process owners who can decide, not just attend. Expect one to two days a week per module owner during Explore, more during testing.",
      ],
      [
        "Can we implement in phases?",
        "Yes. For multi-plant groups we usually recommend finance and one plant first, then rolling out the template.",
      ],
    ]),
  ],
};

/** SCR-008, services-s4hana-managed-services.jsx (artboard "Managed Servies" is a typo). */
const MANAGED_SERVICES: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP S/4HANA Managed Services",
  breadcrumbLabel: "SAP S/4HANA Managed Services",
  intro:
    "Best-practice SAP application support delivered by experienced offshore and near-shore consultants — as your extended team, not a ticket queue.",
  sections: [
    {
      id: "coverage",
      tone: "bg",
      heading: { eyebrow: "Coverage", title: "What we run for you" },
      blocks: [
        {
          kind: "chipGroups",
          groups: [
            { label: "SAP functional", chips: ["FI and CO", "MM", "SD", "PP", "QM", "PM", "EWM"] },
            {
              label: "SAP technical",
              chips: [
                "ABAP",
                "Basis",
                "Fiori and UI5",
                "Integration",
                "Security and authorisations",
                "BTP",
              ],
            },
            {
              label: "TAMS products",
              chips: [
                "Gate Entry Application",
                "EXIM",
                "Digital Signature",
                "Production Process",
                "Vendor Portal",
              ],
            },
          ],
        },
        {
          kind: "callout",
          title: "One AMS team, one ticket queue, one monthly service review",
          text: "Your own SAP-integrated applications are supported by the people who built them, not treated as third-party software.",
        },
      ],
    },
    {
      id: "engagement",
      tone: "sunk",
      heading: { eyebrow: "Engagement", title: "Three ways to engage" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Full landscape AMS",
                body: "Long-term turnkey support across your complete SAP landscape. Named core team with a documented backup for each role, fixed monthly retainer, and reserved capacity for the change backlog.",
              },
              {
                title: "Skill-specific support",
                body: "Support against one skill set where you have a gap. One or two named consultants, billed monthly and scoped to the skill.",
              },
              {
                title: "Spot assignments",
                body: "Short-term work on an hourly or day rate. Useful for year-end, an audit, or a backlog clear-out.",
              },
            ],
          ],
        },
        {
          kind: "callout",
          title: "Service levels are agreed per engagement.",
          text: "Priority definitions, response and resolution targets, support window and the escalation matrix are written into the schedule before we start. We will not quote generic SLAs on a web page and then negotiate them down.",
        },
      ],
    },
    {
      id: "transition",
      tone: "inverse",
      heading: { eyebrow: "Transition", title: "Taking over someone else's system" },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "960",
          text: "A fair share of our AMS work starts with a system we did not build. We run a landscape and documentation review first, then transition in phases with a knowledge-transfer window. If what you have needs remediation before support is realistic, we will say so before signing rather than after.",
        },
      ],
    },
    faqSection("bg", "FAQ", [
      [
        "Can you support a system another partner implemented?",
        "Yes. We start with a landscape review and documented transition rather than taking tickets on day one. The review typically takes two to three weeks.",
      ],
      [
        "Do we get named consultants or a pool?",
        "A named core team with a documented backup for each role. Pooled support looks cheaper and costs more, because nobody accumulates knowledge of your configuration.",
      ],
      [
        "Can AMS include enhancements, not just fixes?",
        "Yes, and it should. We reserve a defined portion of monthly capacity for the change backlog.",
      ],
    ]),
  ],
};

/** SCR-009, services-custom-application-build.jsx. */
const CUSTOM_APPLICATION_BUILD: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "Custom Application Build",
  breadcrumbLabel: "Custom Application Build",
  intro:
    "Applications and extensions that do what standard SAP will not — built to survive the next upgrade instead of blocking it.",
  sections: [
    {
      id: "principle",
      tone: "bg",
      heading: { eyebrow: "Principle", title: "Extending without breaking the core" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1000",
          text: "Extensions use released APIs and extension points, not modifications to standard objects. That is what keeps your quarterly upgrades uneventful.",
        },
      ],
    },
    {
      id: "comparison",
      tone: "sunk",
      heading: { eyebrow: "Comparison", title: "How extensibility differs by edition" },
      blocks: [
        {
          kind: "comparisonTable",
          caption: "Extensibility on Public Edition compared with Private Edition",
          columns: ["Public Edition", "Private Edition"],
          rows: [
            {
              label: "In-app",
              values: [
                "Key-user extensibility: custom fields, logic in released BAdIs, custom CDS views",
                "Key-user plus developer extensibility",
              ],
            },
            {
              label: "Classic ABAP",
              values: ["Not available", "Available, but constrains your upgrade path"],
            },
            {
              label: "Side-by-side",
              values: ["SAP BTP — RAP, CAP, SAP Build", "SAP BTP, same model"],
            },
            {
              label: "Upgrade impact",
              values: [
                "Low if you stay within released extension points",
                "Depends entirely on discipline",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "capability",
      tone: "bg",
      heading: { eyebrow: "Capability", title: "What we build" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Fiori applications",
                body: "Purpose-built screens for roles standard SAP serves badly — shop floor, security desk, quality inspection.",
              },
              {
                title: "RAP business objects",
                body: "Transactional services with proper draft handling and authorisation.",
              },
              {
                title: "Integrations",
                body: "SAP to e-commerce, marketplaces, banking, GST networks, weighbridges and plant systems.",
              },
            ],
            [
              {
                title: "Forms and output",
                body: "GST-compliant invoices, delivery challans, gate passes and statutory documents.",
              },
              {
                title: "Workflow",
                body: "Approval chains with real delegation, escalation and audit trail.",
              },
              {
                title: "Data and reporting",
                body: "CDS-based analytical models and dashboard content.",
              },
            ],
          ],
        },
        {
          kind: "callout",
          title: "Seven of our builds grew into products",
          text: "Look at what we have already built before commissioning something new — the gap you are describing may already be solved.",
        },
        /* No products index page exists (FR-007 edge case), so this link is "#" (FR-012). */
        {
          kind: "link",
          label: "See what we have built",
          href: hrefFor(PLACEHOLDER_ROUTES.allProducts),
        },
      ],
    },
    faqSection("sunk", "FAQ", [
      [
        "Will custom development break our upgrades?",
        "Not if it is built on released extension points, which is how we build. We document which extension points each object depends on, so upgrade impact is a check rather than an investigation.",
      ],
      ["Who owns the code?", "You do. Source, documentation and transport requests are yours."],
      [
        "Can you take over half-finished development?",
        "Usually, after a code review. We will be direct if what exists is better restarted than rescued, and show you why.",
      ],
    ]),
  ],
};

/** SCR-010, services-license-procurement.jsx. */
const LICENSE_PROCUREMENT: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "License Procurement",
  breadcrumbLabel: "License Procurement",
  intro:
    "The right modules and subscription plan, sized before you sign rather than discovered afterwards.",
  sections: [
    {
      id: "advisory",
      tone: "bg",
      heading: { eyebrow: "Advisory", title: "Sizing before signature" },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "1000",
          text: "We simplify your SAP licensing journey by helping you choose the right modules and subscription plans for your business. Cost-effective procurement, compliance, and clean onboarding.",
        },
        {
          kind: "callout",
          title: "The distinction that catches people out",
          text: "FUE — Full Use Equivalent — is a metric under RISE, not a type of user. GROW and Public Edition use named per-user, per-month subscriptions across eight defined user types. They are not interchangeable, and conflating them is the most common reason a licence bill lands above budget.",
        },
      ],
    },
    {
      id: "assessment",
      tone: "inverse",
      heading: { eyebrow: "Assessment", title: "What we look at" },
      blocks: [
        {
          kind: "checklist",
          items: [
            "Actual named-user counts by role, not headcount",
            "Which user type each role genuinely needs — most organisations over-buy at the top tier",
            "Modules you will use in year one versus year three, and how to phase the commitment",
            "Digital access and indirect use exposure from your integrations",
            "Renewal timing and where the negotiating leverage sits",
            "Compliance posture, so a licence audit is uneventful",
          ],
        },
      ],
    },
    {
      id: "timing",
      tone: "bg",
      heading: { eyebrow: "Timing", title: "Two conversations, not one" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Before you buy",
                body: "Sizing, edition choice and a commercial structure that matches your rollout rather than your ambition.",
              },
              {
                title: "Before you renew",
                body: "A usage review against what you are actually paying for. This is where most of the recoverable money sits.",
              },
            ],
          ],
        },
      ],
    },
    faqSection("sunk", "FAQ", [
      [
        "Do you resell SAP licences?",
        "We advise on sizing and procurement as an SAP partner. The advisory conversation happens first and independently of the commercial one.",
      ],
      [
        "What is indirect access and should we worry?",
        "It is the licensing treatment of systems and people that touch SAP data without logging into SAP. SAP's digital access model prices it by document type. It is worth modelling before you build the integration, not after.",
      ],
    ]),
  ],
};

export const SERVICES_FAMILY: DetailFamily = {
  label: "Services",
  routes: SERVICE_ROUTES,
  pages: {
    "s4hana-cloud-implementation": CLOUD_IMPLEMENTATION,
    "s4hana-managed-services": MANAGED_SERVICES,
    "custom-application-build": CUSTOM_APPLICATION_BUILD,
    "license-procurement": LICENSE_PROCUREMENT,
  },
};
