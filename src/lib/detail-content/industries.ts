/**
 * SCR-026 to SCR-031 content (FR-047). Each page is transcribed verbatim from its own
 * snapshot, docs/03-design/paper-snapshot/{desktop,mobile}/industries-<slug>.jsx, in
 * DOM order. Keys are the INDUSTRY_ROUTES ids in src/lib/site-routes.ts.
 *
 * All six captures share one layout: pain-point cards, a standard-SAP checklist, a
 * dark "beyond standard SAP" lead, and the FAQ. `industryPage` holds that layout so
 * each page is its own copy only.
 */

import {
  type DetailCard,
  type DetailFamily,
  type DetailPageContent,
  faqSection,
} from "../detail-page";
import { INDUSTRY_ROUTES } from "../site-routes";

interface IndustryCopy {
  readonly title: string;
  readonly intro: string;
  /** Six pain-point cards, captured as two Desktop rows of three. */
  readonly painPoints: readonly [
    DetailCard,
    DetailCard,
    DetailCard,
    DetailCard,
    DetailCard,
    DetailCard,
  ];
  readonly standardSap: readonly string[];
  readonly ourProducts: string;
  readonly faq: readonly (readonly [question: string, answer: string])[];
}

function industryPage(copy: IndustryCopy): DetailPageContent {
  const [first, second, third, fourth, fifth, sixth] = copy.painPoints;
  return {
    eyebrow: "Industry",
    title: copy.title,
    breadcrumbLabel: copy.title,
    intro: copy.intro,
    sections: [
      {
        id: "pain-points",
        tone: "bg",
        heading: { eyebrow: "Pain points", title: "What hurts in this sector" },
        blocks: [
          {
            kind: "cards",
            titleSize: "lg",
            rows: [
              [first, second, third],
              [fourth, fifth, sixth],
            ],
          },
        ],
      },
      {
        id: "standard-sap",
        tone: "sunk",
        heading: { eyebrow: "Standard SAP", title: "How SAP addresses it" },
        blocks: [{ kind: "checklist", items: copy.standardSap }],
      },
      {
        id: "our-products",
        tone: "inverse",
        heading: { eyebrow: "Our products", title: "What we bring beyond standard SAP" },
        blocks: [{ kind: "lead", size: "lg", measure: "1080", text: copy.ourProducts }],
      },
      faqSection("bg", "Questions", copy.faq),
    ],
  };
}

/** SCR-026, industries-automotive.jsx. */
const AUTOMOTIVE = industryPage({
  title: "SAP for automotive and auto components",
  intro:
    "Schedule agreements that change weekly, customers who audit you, and recall exposure that runs the length of your supply chain.",
  painPoints: [
    {
      title: "Schedule agreement volatility",
      body: "Call-offs revised at short notice, with your planning and your supplier's planning both chasing the change.",
    },
    {
      title: "JIT and sequenced supply",
      body: "Delivery windows measured in hours, where a missed sequence stops your customer's line.",
    },
    {
      title: "Supplier quality",
      body: "PPAP, 8D and rejection tracking spread across email rather than the system that holds the receipt.",
    },
    {
      title: "Traceability for recall",
      body: "Component to batch to vehicle. When a recall comes, the question is how fast you can bound it.",
    },
    {
      title: "Price and cost pressure",
      body: "Annual price-down agreements against input costs you do not control.",
    },
    {
      title: "Tooling and amortisation",
      body: "Customer-owned tooling and amortised recovery tracked outside the ERP.",
    },
  ],
  standardSap: [
    "Scheduling agreements with JIT and forecast delivery schedules",
    "Batch management and serial numbers for component-level genealogy",
    "Quality management covering inspection lots, defects and supplier notifications",
    "Self-billing and credit memo procedures aligned to how OEMs settle",
    "Costing and profitability by part, programme and customer",
    "EDI integration for delivery schedules, ASNs and self-billing",
  ],
  ourProducts:
    "Gate Entry Application closes the receiving loop where component traceability starts. TAMS Vendor Portal gives your tier-two suppliers the same schedule visibility your OEM gives you. TAMS Connected Factory brings machine data into SAP so OEE and downtime are measured, not estimated.",
  faq: [
    [
      "Can SAP handle sequenced JIT deliveries?",
      "Yes, through JIT call and JIT delivery schedule functionality. Whether you need full sequencing depends on how close to the line you deliver.",
    ],
    [
      "Our OEM mandates a specific EDI format. Is that a problem?",
      "No. Format-specific mapping is standard integration work.",
    ],
  ],
});

/** SCR-027, industries-metals-and-steel.jsx. */
const METALS_AND_STEEL = industryPage({
  title: "SAP for metals and steel",
  intro:
    "Heat numbers, weighbridges, yield losses and prices that move between the order and the dispatch.",
  painPoints: [
    {
      title: "Heat and batch traceability",
      body: "Every coil, bar and plate traceable to its heat, with the mill test certificate attached.",
    },
    {
      title: "Weighbridge reconciliation",
      body: "Weight is your unit of trade. Gross, tare and net disputes are cash disputes.",
    },
    {
      title: "Yield and scrap",
      body: "Input to output loss tracked by process step, not estimated at month end.",
    },
    {
      title: "Variable pricing",
      body: "Prices linked to index movements, with escalation clauses applied consistently.",
    },
    {
      title: "Multiple units of measure",
      body: "Ordered in tonnes, produced in pieces, priced per kilogram, stored in metres.",
    },
    {
      title: "Grade and specification",
      body: "Customer specification tied to grade, and a rejection when it is not met.",
    },
  ],
  standardSap: [
    "Batch management with characteristics carrying heat number, chemistry and mechanical properties",
    "Multiple units of measure with conversion held on the material",
    "Quality management with certificate generation",
    "Variance analysis by process order giving real yield",
    "Condition-based pricing supporting index linkage",
    "Batch determination on sale, so the right heat goes to the right customer",
  ],
  ourProducts:
    "This is the sector our products were built in. Gate Entry Application reconciles gross, tare and net against the goods receipt before an exit pass exists. TAMS Production Process delivers bloom-to-pipe genealogy on Public Edition. TAMS DigiSign signs mill test certificates in volume as they are generated.",
  faq: [
    [
      "Can SAP hold full chemistry against a heat?",
      "Yes, as batch characteristics. The design question is which characteristics are mandatory and which are inherited through processing.",
    ],
    [
      "Is weighbridge integration standard SAP?",
      "No. Standard SAP will take a weight; getting it from the bridge without a person typing it is integration work. That is why we built Gate Entry.",
    ],
  ],
});

/** SCR-028, industries-mill-products.jsx. */
const MILL_PRODUCTS = industryPage({
  title: "SAP for mill products",
  intro:
    "Paper, packaging, building materials and allied processing — continuous operations where planning quality decides profitability.",
  painPoints: [
    {
      title: "Planning accuracy",
      body: "Demand variability against long production runs and changeover cost that punishes a wrong sequence.",
    },
    {
      title: "Trim and yield optimisation",
      body: "Every reel, sheet and roll cut decision changes the waste number.",
    },
    {
      title: "Asset reliability",
      body: "Continuous plant where unplanned downtime is the dominant cost, not labour.",
    },
    {
      title: "Quality at speed",
      body: "Inspection that must keep pace with a line that does not stop for it.",
    },
    {
      title: "Energy and input cost",
      body: "Volatile input cost passing through to a price the market may not accept.",
    },
    {
      title: "Logistics cost",
      body: "Bulky, low-density product where transport is a large share of delivered cost.",
    },
  ],
  standardSap: [
    "Production planning with process orders, campaign planning and changeover-aware sequencing",
    "Batch management with quality characteristics captured inline",
    "Plant maintenance with condition monitoring and preventive plans",
    "Costing that separates energy, material and conversion",
    "Transportation management with load building",
    "Embedded analytics on OEE, yield and downtime reason codes",
  ],
  ourProducts:
    "Mill products is one of the sectors where SAP's embedded AI is furthest along — visual quality inspection, demand outlier correction, Joule explaining planning results and warehouse task optimisation are available now rather than on a roadmap. TAMS Connected Factory supplies the machine data those capabilities need.",
  faq: [
    [
      "Where does the AI actually help first?",
      "Demand history outlier correction and AI-assisted goods receipt processing pay back fastest because they need no new hardware. Visual quality inspection has the higher ceiling but needs cameras, lighting and a training set.",
    ],
    [
      "Do we need SAP Digital Manufacturing?",
      "Only if your shop-floor requirement goes beyond what S/4HANA production planning and confirmation covers. For many mid-market mills, core S/4HANA plus targeted extensions is enough.",
    ],
  ],
});

/** SCR-029, industries-pharmaceuticals.jsx. */
const PHARMACEUTICALS = industryPage({
  title: "SAP for pharmaceuticals",
  intro:
    "Batch genealogy, serialisation and a regulator who will ask you to prove it. The edition decision matters more here than anywhere else.",
  painPoints: [
    {
      title: "Batch genealogy",
      body: "Forward and backward traceability from API through to the pack that left the warehouse.",
    },
    {
      title: "Serialisation",
      body: "Track-and-trace requirements that differ by destination market and keep moving.",
    },
    {
      title: "Validated environment",
      body: "Change control, qualification and documented evidence for every system change.",
    },
    {
      title: "Expiry and shelf-life",
      body: "FEFO handling, remaining shelf-life rules on despatch, market-specific requirements.",
    },
    {
      title: "Deviation and CAPA",
      body: "Non-conformance raised, investigated, dispositioned and closed with evidence retained.",
    },
    {
      title: "Multi-market registration",
      body: "The same product with different specifications, packs and documentation by market.",
    },
  ],
  standardSap: [
    "Batch management with full genealogy and characteristic-based determination",
    "Quality management covering inspection plans, results and usage decisions",
    "Shelf-life and FEFO handling in inventory and delivery processing",
    "Audit trail and change documentation supporting validation",
    "Serialisation integration to the track-and-trace system your markets require",
    "Batch recall that bounds the affected population from either direction",
  ],
  ourProducts:
    "Our contribution here is as much about what we tell you not to do. TAMS DigiSign covers document signing for batch records and statutory filings. Gate Entry Application secures material receipt where genealogy begins.",
  faq: [
    [
      "Can we run pharma on Public Edition?",
      "Sometimes, and sometimes not. Three Public Edition capabilities are over-claimed to pharmaceutical companies: stability study management, control recipes and PI sheets, and full embedded EWM. If those are core, Private Edition is the honest answer.",
    ],
    [
      "How does SAP support validation?",
      "Through change documentation, audit trail and a controlled transport process. SAP does not validate your system for you — validation is your process, evidenced with the artefacts the system produces.",
    ],
  ],
});

/** SCR-030, industries-engineering-and-fabrication.jsx. */
const ENGINEERING_AND_FABRICATION = industryPage({
  title: "SAP for engineering and fabrication",
  intro:
    "Engineer-to-order work where every job is different, costs accrue over months, and billing follows milestones rather than despatch.",
  painPoints: [
    {
      title: "Engineer-to-order complexity",
      body: "A bill of material that does not exist until engineering finishes, on a job already sold.",
    },
    {
      title: "Project costing",
      body: "Cost accruing across labour, material, subcontract and overhead over a long horizon.",
    },
    {
      title: "Progress billing",
      body: "Revenue recognised against milestones or percentage completion.",
    },
    {
      title: "Subcontracting",
      body: "Work moving out and back with material accountability at each step.",
    },
    {
      title: "Change orders",
      body: "Scope changes mid-project that must reach both the cost base and the invoice.",
    },
    {
      title: "Resource scheduling",
      body: "Skilled labour and machine capacity allocated across overlapping jobs.",
    },
  ],
  standardSap: [
    "Project-based costing with a work breakdown structure carrying budget, commitment and actual",
    "Make-to-order and engineer-to-order production with sales-order-linked stock",
    "Subcontracting with material provision and reconciliation",
    "Milestone billing and results analysis for long-running work",
    "Capacity planning across work centres and skilled resources",
    "Variance analysis at project and order level, visible while the job is open",
  ],
  ourProducts:
    "Where standard SAP leaves gaps for fabricators is usually at the plant boundary. Gate Entry Application covers inbound receipt against a project. TAMS DigiSign signs the certification and handover documents that accompany fabricated work.",
  faq: [
    [
      "Do we need SAP Project System?",
      "Not always. Public Edition does not include classic Project System, and for many fabricators project-based costing is sufficient. If full PS is required, that shapes the edition decision.",
    ],
    [
      "Can we track subcontracted machining?",
      "Yes, through subcontracting purchase orders with material provision.",
    ],
  ],
});

/** SCR-031, industries-consumer-durables.jsx. */
const CONSUMER_DURABLES = industryPage({
  title: "SAP for consumer durables",
  intro:
    "Distribution networks, seasonal demand, and an aftermarket obligation that lasts years after the sale.",
  painPoints: [
    {
      title: "Demand planning",
      body: "Seasonal peaks and promotional spikes against long lead times on imported components.",
    },
    {
      title: "Distribution network",
      body: "Depots, distributors and modern trade each with different terms and different data.",
    },
    {
      title: "Channel pricing and schemes",
      body: "Trade schemes, discounts and claims that consume margin quietly.",
    },
    {
      title: "Aftermarket service",
      body: "Warranty obligations, service networks and spare parts over the product's life.",
    },
    {
      title: "Spare parts planning",
      body: "Long-tail parts with unpredictable demand and a service commitment behind them.",
    },
    {
      title: "Returns",
      body: "Product coming back through the channel, needing disposition and credit.",
    },
  ],
  standardSap: [
    "Demand planning with statistical forecasting and promotion modelling",
    "Distribution requirements planning across depots",
    "Condition-based pricing with trade scheme and rebate handling",
    "Service management for warranty, service orders and field service",
    "Spare parts planning with service-level-driven stocking policy",
    "Returns processing with disposition, credit and quality feedback",
  ],
  ourProducts:
    "The plant-boundary products apply here as elsewhere — Gate Entry Application for inbound and dispatch control, TAMS DigiSign for invoicing and warranty documentation at volume, EXIM for imported components and licence position.",
  faq: [
    [
      "Can SAP handle trade schemes and distributor claims?",
      "Yes, through rebate and settlement management. The recurring problem is that schemes get agreed commercially in terms the system was never told about.",
    ],
    [
      "How do we plan spare parts for a long tail?",
      "Service-level-driven stocking policy rather than forecast-driven planning, with parts segmented by criticality and demand pattern.",
    ],
  ],
});

export const INDUSTRIES_FAMILY: DetailFamily = {
  label: "Industries",
  routes: INDUSTRY_ROUTES,
  pages: {
    automotive: AUTOMOTIVE,
    "metals-and-steel": METALS_AND_STEEL,
    "mill-products": MILL_PRODUCTS,
    pharmaceuticals: PHARMACEUTICALS,
    "engineering-and-fabrication": ENGINEERING_AND_FABRICATION,
    "consumer-durables": CONSUMER_DURABLES,
  },
};
