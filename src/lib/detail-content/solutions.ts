/**
 * SCR-018 to SCR-025 content (FR-046). Each page is transcribed verbatim from its own
 * snapshot, docs/03-design/paper-snapshot/{desktop,mobile}/solutions-<slug>.jsx, in
 * DOM order. Keys are the SOLUTION_ROUTES ids in src/lib/site-routes.ts.
 */

import {
  type DetailFamily,
  type DetailPageContent,
  faqSection,
  hrefForRouteId,
} from "../detail-page";
import { INDUSTRY_ROUTES, PRODUCT_ROUTES, SOLUTION_ROUTES } from "../site-routes";

const EYEBROW = "Solution";

/** SCR-018, solutions-rise-with-sap.jsx. */
const RISE_WITH_SAP: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "RISE with SAP",
  breadcrumbLabel: "RISE with SAP",
  intro:
    "A managed cloud offering that moves any on-premise ERP — including ECC 6 and S/4HANA on-premise — to the cloud, with embedded intelligence and real-time insight.",
  sections: [
    {
      id: "overview",
      tone: "bg",
      heading: { eyebrow: "Overview", title: "What it is" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "RISE is SAP's bundled route to S/4HANA Cloud Private Edition. One contract covers the ERP, the infrastructure, the technical managed service and a set of platform entitlements. It enables a smooth, secure migration where you improve compliance and build business resilience, without assembling five vendors yourself.",
        },
      ],
    },
    {
      id: "inclusions",
      tone: "sunk",
      heading: { eyebrow: "Inclusions", title: "What is inside the bundle" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "S/4HANA Cloud Private Edition",
                body: "Your own tenant, your release timing within SAP's window, full developer extensibility.",
              },
              {
                title: "Infrastructure and technical managed services",
                body: "Hyperscaler of your choice, provisioned and run by SAP.",
              },
              {
                title: "Business Process Intelligence",
                body: "SAP Signavio for process discovery and benchmarking.",
              },
            ],
            [
              {
                title: "Business Network starter pack",
                body: "Entry entitlement to SAP Business Network.",
              },
              {
                title: "SAP BTP entitlements",
                body: "Credits toward integration, extension and analytics.",
              },
              {
                title: "Tools and accelerators",
                body: "Activate methodology, readiness check, custom code analysis.",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "role",
      tone: "inverse",
      heading: { eyebrow: "Our role", title: "Where TAMS fits" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "SAP runs the infrastructure. We run the business transformation — process design, configuration, data migration, extensions, integration, testing, training and application support afterwards. The line between what SAP covers and what your partner covers is the most misunderstood thing about RISE, and we put it in writing at proposal stage.",
        },
      ],
    },
    {
      id: "fit",
      tone: "bg",
      heading: { eyebrow: "Fit", title: "Is Private Edition right for you?" },
      blocks: [
        {
          kind: "checklist",
          items: [
            "You run process manufacturing, batch traceability or a demanding quality regime",
            "You have a substantial ABAP code base that still earns its keep",
            "You need control over when releases are applied",
            "Your processes differ from standard for reasons a regulator or a customer imposes",
            "You are converting an existing ECC system and want to keep its history",
          ],
        },
      ],
    },
    faqSection("sunk", "Questions", [
      [
        "Is RISE just hosting with a new name?",
        "No. Hosting gives you infrastructure. RISE bundles the ERP licence, the infrastructure, SAP's technical managed service and platform entitlements under one contract with SAP as the accountable party.",
      ],
      [
        "Who do we call when something breaks?",
        "Infrastructure and technical platform issues go to SAP. Application, configuration and process issues come to us. We map this into a single escalation matrix at project start.",
      ],
    ]),
  ],
};

/** SCR-019, solutions-grow-with-sap.jsx. */
const GROW_WITH_SAP: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "GROW with SAP",
  breadcrumbLabel: "GROW with SAP",
  intro:
    "A modern, intelligent, ready-to-run ERP designed for speed, scalability and innovation, with built-in AI, automation and real-time analytics.",
  sections: [
    {
      id: "overview",
      tone: "bg",
      heading: { eyebrow: "Overview", title: "What it is" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "Unlock new growth opportunities with GROW with SAP S/4HANA. Designed to empower businesses of all sizes to scale efficiently, it helps you streamline operations, enhance decision-making and drive innovation on infrastructure SAP runs and upgrades for you.",
        },
        {
          kind: "paragraph",
          text: "Public Edition arrives pre-configured with SAP best practices. You adopt those processes rather than rebuilding your own, which is exactly why it goes live fast and exactly why it is not right for everybody.",
        },
      ],
    },
    {
      id: "inclusions",
      tone: "sunk",
      heading: { eyebrow: "Inclusions", title: "What you get" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Pre-configured best practices",
                body: "Ready-to-run process scope, activated rather than built.",
              },
              {
                title: "Quarterly innovation",
                body: "New capability arrives automatically. No upgrade projects.",
              },
              {
                title: "Embedded AI",
                body: "SAP Business AI and Joule across finance, supply chain and operations.",
              },
            ],
            [
              {
                title: "Guided configuration",
                body: "A configuration experience your key users can operate after go-live.",
              },
              {
                title: "Named-user subscriptions",
                body: "Per-user, per-month across eight user types, sized to actual roles.",
              },
              {
                title: "Extensibility on BTP",
                body: "Key-user extensibility in-app, side-by-side extensions on the platform.",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "reality-check",
      tone: "inverse",
      heading: {
        eyebrow: "Reality check",
        title: "Fit-to-standard is a commitment, not a slogan.",
      },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "1000",
          text: "Some of how you work today will change, and a few things will not be possible at all. Three capabilities are over-claimed on Public Edition repeatedly: stability study management, control recipes and PI sheets, and full embedded EWM. If any are core to you, the honest answer is Private Edition.",
        },
        {
          kind: "paragraph",
          text: "Where Public Edition constrains a genuinely necessary process, our Production Process applications show what a custom Fiori build on Public Edition can achieve.",
        },
        {
          kind: "link",
          label: "Production Process applications",
          href: hrefForRouteId(PRODUCT_ROUTES, "production-process"),
        },
      ],
    },
    faqSection("bg", "Questions", [
      [
        "How fast can we go live?",
        "For a single-entity Indian manufacturer with standard processes, three to six months. The constraint is rarely configuration; it is master data readiness and how quickly your team can decide to accept a standard process.",
      ],
      [
        "What if we outgrow Public Edition?",
        "Moving from Public to Private Edition later is a migration, not a switch. That is why the edition decision deserves a proper fit-gap assessment up front.",
      ],
    ]),
  ],
};

/** SCR-020, solutions-sap-btp.jsx. */
const SAP_BTP: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP BTP",
  breadcrumbLabel: "SAP BTP",
  intro:
    "Application development, automation, data management, analytics, planning, integration and AI, brought together on one platform.",
  sections: [
    {
      id: "overview",
      tone: "bg",
      heading: { eyebrow: "Overview", title: "What BTP is for" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "BTP is where the things that used to become modifications now live instead. Extensions run beside the core rather than inside it, integrations are built once and reused, and analytics reach data across SAP and non-SAP systems. It is the reason a clean core is achievable rather than aspirational.",
        },
      ],
    },
    {
      id: "with-rise",
      tone: "sunk",
      heading: { eyebrow: "With RISE", title: "Four pillars of value with RISE" },
      blocks: [
        {
          kind: "attributeTable",
          caption: "BTP pillars of value with RISE and what each means in practice",
          columns: ["Pillar", "What it means in practice"],
          /* Captured label column is 300px; the template's widest option is 280px. */
          labelWidth: "lg",
          rows: [
            {
              label: "Accelerate your move to the cloud",
              value:
                "Simplify data migration and archive irrelevant data during the move. Consolidate and centrally govern master data with SAP Master Data Governance. Reduce process failures with automated testing.",
            },
            {
              label: "Connect end-to-end processes",
              value:
                "Streamline integration using prebuilt content in SAP Integration Suite, connect to more than 170 third-party applications, and build workflows visually.",
            },
            {
              label: "Extend and automate",
              value:
                "Create apps with SAP Build Apps and SAP Build Code, automate ERP processes with SAP Build Process Automation, unify the workplace with SAP Build Work Zone.",
            },
            {
              label: "Plan and analyse",
              value:
                "Unify strategic, operational and financial planning with SAP Analytics Cloud, and reach all your data with SAP Datasphere.",
            },
          ],
        },
      ],
    },
    {
      id: "with-grow",
      tone: "bg",
      heading: { eyebrow: "With GROW", title: "Three pillars with GROW" },
      blocks: [
        {
          kind: "attributeTable",
          caption: "BTP pillars with GROW and what each means in practice",
          columns: ["Pillar", "What it means in practice"],
          labelWidth: "lg",
          rows: [
            {
              label: "Build your own breakthroughs",
              value:
                "Extend S/4HANA processes with SAP Build Process Automation, personalise business sites with SAP Build Work Zone, and accelerate delivery with low-code tools.",
            },
            {
              label: "Connect end-to-end processes",
              value:
                "Preconfigured integration content, open connectors to more than 170 applications, and visual workflow building.",
            },
            {
              label: "Plan and analyse",
              value:
                "Extended planning and analysis across departments, a real-time view with SAP Analytics Cloud, and predictive analytics.",
            },
          ],
        },
      ],
    },
    {
      id: "watch-out",
      tone: "inverse",
      heading: {
        eyebrow: "Watch out",
        title: "Entitlements are not the same as a running platform.",
      },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "1000",
          text: "RISE includes BTP credits, and they routinely go unused because nobody has been made accountable for consuming them. If you have BTP entitlements sitting idle, that is a conversation worth having before your renewal.",
        },
      ],
    },
    faqSection("sunk", "Questions", [
      [
        "Do we need BTP if we are on Public Edition?",
        "Not on day one. You need it the moment you want an extension key-user extensibility cannot deliver, an integration beyond the prebuilt content, or analytics beyond embedded reporting. For most manufacturers that is within the first year.",
      ],
      [
        "Is BTP expensive?",
        "It is consumption-based, which means it is cheap to start and easy to lose control of. We size expected consumption per use case before building, and set up cost alerts.",
      ],
    ]),
  ],
};

/** SCR-021, solutions-sap-business-ai.jsx. */
const SAP_BUSINESS_AI: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP Business AI",
  breadcrumbLabel: "SAP Business AI",
  intro:
    "Intelligent AI capabilities embedded across SAP applications to improve productivity, decision-making and business performance.",
  sections: [
    {
      id: "scope",
      tone: "bg",
      heading: { eyebrow: "Scope", title: "Across the value chain" },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "1080",
          text: "SAP Business AI delivers real-time insights, predictive analytics, process automation and industry-specific intelligence to help organizations run smarter and faster. Only SAP Business AI can help customers unlock three sources of value in a relevant, reliable and responsible manner.",
        },
        {
          kind: "cards",
          titleSize: "md",
          accentTop: true,
          rows: [
            [
              {
                title: "Customer relationships",
                body: "Product recommendation, Joule for sales orders, lead booster, account synopsis",
              },
              {
                title: "Business and supply planning",
                body: "Demand outlier correction, Joule explains planning results, natural-language queries",
              },
              {
                title: "Manufacturing and assets",
                body: "Visual quality inspection, goods receipt processing, anomaly detection in maintenance",
              },
            ],
            [
              {
                title: "Logistics execution",
                body: "Outbound delivery orders and warehouse task optimisation",
              },
              {
                title: "Enterprise management — finance",
                body: "Bank statement matching, closing error resolution, ESG report generation",
              },
              {
                title: "Enterprise management — IT and HR",
                body: "Joule copilot, AI-assisted integration generation, applicant screening, policy Q&A",
              },
            ],
          ],
        },
        {
          kind: "caption",
          text: "SAP Business AI across the value chain. Almost all of this is available today — the constraint is entitlement, release level and activation, not availability.",
        },
      ],
    },
    {
      id: "copilot",
      tone: "sunk",
      heading: { eyebrow: "Copilot", title: "Joule" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "Joule is SAP's copilot. It sits across applications, answers in business language, and increasingly takes action rather than only retrieving. The value shows up when leadership can ask a question directly instead of requesting a report.",
        },
      ],
    },
    {
      id: "watch-out",
      tone: "inverse",
      heading: {
        eyebrow: "Watch out",
        title: "Joule has a minimum release gate on Private Edition.",
      },
      blocks: [
        {
          kind: "lead",
          size: "md",
          measure: "1000",
          text: "We confirm your release level and entitlements before promising anything. Most disappointment with SAP AI comes from a capability being real but not licensed, or licensed but not activated, or activated on a release that does not support it.",
        },
      ],
    },
    {
      id: "method",
      tone: "bg",
      heading: { eyebrow: "Method", title: "What we do" },
      blocks: [
        {
          kind: "rail",
          steps: [
            { title: "Entitlement and release check" },
            { title: "Prerequisite confirmation" },
            { title: "Activation and configuration" },
            { title: "Role-based enablement" },
          ],
        },
        {
          kind: "caption",
          text: "Four steps, in this order. The entitlement check comes before the demo, because a demo of something you are not licensed for wastes everybody's time.",
        },
        {
          kind: "paragraph",
          text: "For a manufacturing-specific view, see mill products, where SAP's embedded AI is furthest along.",
        },
        {
          kind: "link",
          label: "Mill products",
          href: hrefForRouteId(INDUSTRY_ROUTES, "mill-products"),
        },
      ],
    },
    faqSection("sunk", "Questions", [
      [
        "Is our data used to train SAP's models?",
        "No. SAP's commercial terms are explicit that customer data is not used to train foundation models for other customers. It is worth reading the specific terms for the capability you are enabling, and we go through them with you.",
      ],
      [
        "What does this cost?",
        "Some capabilities are included in your existing entitlements and some are separately licensed, and the split moves. That is exactly why the entitlement check comes first rather than the demo.",
      ],
    ]),
  ],
};

/** SCR-022, solutions-industry-specific-sap-solutions.jsx. */
const INDUSTRY_SPECIFIC: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "Industry-specific SAP solutions",
  breadcrumbLabel: "Industry-specific SAP solutions",
  intro:
    "Tailored SAP solutions designed to meet unique industry requirements, delivering ready-to-run processes that accelerate digital transformation.",
  sections: [
    {
      id: "definition",
      tone: "bg",
      heading: { eyebrow: "Definition", title: "Not a rebranded standard implementation." },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "An industry pack is a pre-configured process scope, a set of extensions, and a data model shaped by problems that recur across a sector — heat traceability in steel, schedule agreements in automotive, batch genealogy in pharma.",
        },
      ],
    },
    {
      id: "portability",
      tone: "sunk",
      heading: { eyebrow: "Portability", title: "What travels between industries" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Gate and weighbridge",
                body: "Every manufacturer with inbound trucks has this problem. The product is sector-agnostic.",
              },
              {
                title: "Export and import compliance",
                body: "Anyone shipping across a border, regardless of what they make.",
              },
              {
                title: "Digital signing",
                body: "Statutory and commercial documents, in every sector.",
              },
            ],
            [
              {
                title: "Supplier collaboration",
                body: "Different documents, same structural problem — suppliers outside your system needing live data.",
              },
              {
                title: "Machine data into SAP",
                body: "Every plant with machines has data stopping at the machine.",
              },
              {
                title: "Traceability",
                body: "Serialised genealogy through staged operations, wherever a customer or regulator asks for it.",
              },
            ],
          ],
        },
        {
          kind: "paragraph",
          text: "Our sector pages set out what we build for each:",
        },
        /* Captured as a wrapping row of outlined pill links. The template has no pill-link
           block (reported BLOCKED), so each renders as the template's text link. */
        {
          kind: "link",
          label: "Automotive",
          href: hrefForRouteId(INDUSTRY_ROUTES, "automotive"),
        },
        {
          kind: "link",
          label: "Metals and steel",
          href: hrefForRouteId(INDUSTRY_ROUTES, "metals-and-steel"),
        },
        {
          kind: "link",
          label: "Mill products",
          href: hrefForRouteId(INDUSTRY_ROUTES, "mill-products"),
        },
        {
          kind: "link",
          label: "Pharmaceuticals",
          href: hrefForRouteId(INDUSTRY_ROUTES, "pharmaceuticals"),
        },
        {
          kind: "link",
          label: "Engineering and fabrication",
          href: hrefForRouteId(INDUSTRY_ROUTES, "engineering-and-fabrication"),
        },
        {
          kind: "link",
          label: "Consumer durables",
          href: hrefForRouteId(INDUSTRY_ROUTES, "consumer-durables"),
        },
      ],
    },
    faqSection("bg", "Questions", [
      [
        "Do you use SAP's industry cloud solutions?",
        "Where they fit, yes. Our own extensions cover the gaps that remain, which in Indian manufacturing are usually at the plant boundary rather than in the core process.",
      ],
    ]),
  ],
};

/** SCR-023, solutions-sap-analytics-and-reporting.jsx. */
const ANALYTICS_AND_REPORTING: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP Analytics and Reporting",
  breadcrumbLabel: "SAP Analytics and Reporting",
  intro:
    "Turn raw data into actionable insights with advanced dashboards, predictive analytics and interactive reporting.",
  sections: [
    {
      id: "overview",
      tone: "bg",
      heading: { eyebrow: "Overview", title: "SAP Analytics Cloud" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "SAP Analytics Cloud is SAP's strategic analytics and planning offering. It lets you analyse data in context and make better, faster decisions — combining analytics and planning augmented by AI in one native cloud solution, so you move from insight to action.",
        },
      ],
    },
    {
      id: "first-build",
      tone: "sunk",
      heading: { eyebrow: "First build", title: "The CFO dashboard" },
      blocks: [
        /* Captured beside the heading at a 420px measure; the template places section
           text below the heading (reported BLOCKED). */
        {
          kind: "paragraph",
          text: "The most common first build. Five KPI blocks with drill-down from the board-level number to the document that created it.",
        },
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Liquidity and cash",
                body: "Cash position, receivables ageing, payables, and the working capital cycle.",
              },
              {
                title: "Profitability",
                body: "Margin by product, plant, customer and channel, against plan.",
              },
              {
                title: "Cost",
                body: "Cost centre performance, variance analysis and the drivers behind it.",
              },
            ],
            /* Captured as two cards plus an empty third slot (reported BLOCKED). */
            [
              {
                title: "Working capital",
                body: "Inventory ageing, slow-moving stock and days of cover by material.",
              },
              {
                title: "Compliance and close",
                body: "Close status, statutory position and outstanding items.",
              },
            ],
          ],
        },
        {
          kind: "callout",
          title: "There are two routes to a CFO dashboard, and they cost differently.",
          text: "One uses SAP Analytics Cloud and reaches a richer result faster. One stays inside embedded analytics and needs no additional licence but takes materially more effort. We model both before you decide.",
        },
      ],
    },
    {
      id: "beyond-reporting",
      tone: "inverse",
      heading: { eyebrow: "Beyond reporting", title: "Planning, not just reporting" },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1080",
          text: "The planning capability is what separates SAC from a reporting tool. Sales planning, cost centre planning, capex and workforce planning run on the same model as the actuals, so the variance report is not a reconciliation exercise between two systems.",
        },
      ],
    },
    faqSection("bg", "Questions", [
      [
        "Do we need SAC if S/4HANA has embedded analytics?",
        "Not necessarily. Embedded analytics covers operational reporting on live transactional data well. SAC earns its licence when you need cross-system data, planning, or presentation-grade dashboards for leadership.",
      ],
      [
        "How long does a first dashboard take?",
        "A focused CFO dashboard on clean data is a matter of weeks. Data quality determines everything — if your profit centre assignments are inconsistent, that surfaces here first.",
      ],
    ]),
  ],
};

/** SCR-024, solutions-sap-integration-suite.jsx. */
const INTEGRATION_SUITE: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP Integration Suite",
  breadcrumbLabel: "SAP Integration Suite",
  intro:
    "Connect SAP with your entire technology ecosystem — CRMs, third-party apps, legacy systems, plant equipment — so data flows and silos close.",
  sections: [
    {
      id: "scope",
      tone: "bg",
      heading: { eyebrow: "Scope", title: "What we integrate for manufacturers" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "E-invoicing and GST",
                body: "IRN and QR generation through SAP DRC, e-way bill, GST returns, TDS and TCS.",
              },
              {
                title: "Marketplaces and e-commerce",
                body: "Storefront orders and returns flowing into SAP as documents, not spreadsheets.",
              },
              {
                title: "Banking",
                body: "Payment files out, statements in, with auto-matching against open items.",
              },
            ],
            [
              {
                title: "Plant equipment",
                body: "Weighbridges, PLC and SCADA data, quality instruments, barcode and QR scanners.",
              },
              {
                title: "Supplier and customer systems",
                body: "EDI, schedule agreements, ASNs and portal integrations.",
              },
              {
                title: "Legacy applications",
                body: "The systems nobody will decommission this year, connected rather than replaced.",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "method",
      tone: "sunk",
      heading: { eyebrow: "Method", title: "How we build integrations" },
      blocks: [
        {
          kind: "rail",
          steps: [
            {
              title: "Inventory first",
              detail: "Every interface, direction, volume and failure mode",
            },
            { title: "Prebuilt content", detail: "Use SAP's content rather than rebuilding it" },
            {
              title: "Design for failure",
              detail: "Retry, dead-letter handling, alerting, reconciliation",
            },
            {
              title: "Monitor in production",
              detail: "Named ownership, dashboards, alerts to a person",
            },
          ],
        },
        {
          kind: "caption",
          text: "An integration without an error path is not finished. Silent integration failures are the expensive kind.",
        },
      ],
    },
    {
      id: "watch-out",
      tone: "inverse",
      heading: { eyebrow: "Watch out", title: "Integration is a licensing question too." },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1000",
          text: "Systems and people that touch SAP data without logging in fall under SAP's digital access model, priced by document type. Model it before you build.",
        },
      ],
    },
    faqSection("bg", "Questions", [
      [
        "Can we keep our existing middleware?",
        "Often yes. If you already run a platform that works, we integrate to it. The argument for Integration Suite is prebuilt SAP content and lifecycle alignment, not exclusivity.",
      ],
      [
        "How do you handle weighbridge and plant floor devices?",
        "Through an edge component that normalises the device output, then a documented service into SAP. Our Gate Entry Application does exactly this for weighbridges.",
      ],
    ]),
  ],
};

/** SCR-025, solutions-sap-automation-and-workflow.jsx. */
const AUTOMATION_AND_WORKFLOW: DetailPageContent = {
  eyebrow: EYEBROW,
  title: "SAP Automation and Workflow",
  breadcrumbLabel: "SAP Automation and Workflow",
  intro:
    "Boost efficiency with automated workflows, rule-based processing and intelligent task routing — reducing operational cost and human error.",
  sections: [
    {
      id: "scope",
      tone: "bg",
      heading: { eyebrow: "Scope", title: "Where automation pays in manufacturing" },
      blocks: [
        {
          kind: "cards",
          titleSize: "lg",
          rows: [
            [
              {
                title: "Purchase and payment approvals",
                body: "Value-banded routing with real delegation, escalation and a complete audit trail.",
              },
              {
                title: "Document processing",
                body: "Supplier invoices and delivery documents read and posted, with exceptions routed to a human.",
              },
              {
                title: "Master data requests",
                body: "New material, vendor or customer creation as a governed request rather than an email.",
              },
            ],
            [
              {
                title: "Quality and deviation handling",
                body: "Non-conformance raised, routed, dispositioned and closed with evidence attached.",
              },
              {
                title: "Period close tasks",
                body: "Recurring close activities scheduled, tracked and evidenced rather than chased.",
              },
              {
                title: "Exception handling",
                body: "Situation handling so a blocked order reaches the person who can unblock it.",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "method",
      tone: "sunk",
      heading: { eyebrow: "Method", title: "How to decide what to automate" },
      blocks: [
        {
          kind: "rail",
          steps: [
            {
              title: "Count the volume",
              detail: "Automation pays on repetition, not on principle",
            },
            {
              title: "Fix the process first",
              detail: "Automating a broken chain gives you a faster broken chain",
            },
            {
              title: "Keep the human where judgement lives",
              detail: "Remove the clerical steps, not the decision",
            },
            { title: "Instrument it", detail: "Measure how often it falls to exception" },
          ],
        },
        {
          kind: "caption",
          text: "Four tests before building. A process that runs eleven times a year rarely justifies the build and the maintenance.",
        },
      ],
    },
    {
      id: "watch-out",
      tone: "inverse",
      heading: { eyebrow: "Watch out", title: "Automation and AI are not the same conversation." },
      blocks: [
        {
          kind: "lead",
          size: "lg",
          measure: "1000",
          text: "Rule-based workflow is predictable, auditable and cheap to run. Reach for AI where the input is genuinely unstructured — a scanned document, free text — and for rules everywhere else.",
        },
      ],
    },
    faqSection("bg", "Questions", [
      [
        "Is this RPA?",
        "Mostly not. Robotic process automation drives a user interface and breaks when the screen changes. SAP Build Process Automation works through APIs and released services, which is more durable.",
      ],
      [
        "Who maintains the workflows after go-live?",
        "Your key users, if we build them to be maintainable and train for it. That is a design choice made at the start.",
      ],
    ]),
  ],
};

export const SOLUTIONS_FAMILY: DetailFamily = {
  label: "Solutions",
  routes: SOLUTION_ROUTES,
  pages: {
    "rise-with-sap": RISE_WITH_SAP,
    "grow-with-sap": GROW_WITH_SAP,
    "sap-btp": SAP_BTP,
    "sap-business-ai": SAP_BUSINESS_AI,
    "industry-specific-sap-solutions": INDUSTRY_SPECIFIC,
    "sap-analytics-and-reporting": ANALYTICS_AND_REPORTING,
    "sap-integration-suite": INTEGRATION_SUITE,
    "sap-automation-and-workflow": AUTOMATION_AND_WORKFLOW,
  },
};
