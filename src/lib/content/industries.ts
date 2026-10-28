import type { Industry } from "./types";

export const industries: Industry[] = [
  {
    slug: "automotive",
    name: "Automotive and Auto Components",
    short: "Automotive",
    tagline: "Schedules, quality and supplier flow for tiered production.",
    icon: "car",
    headline: "Keep the line fed when the OEM changes the schedule.",
    context:
      "Tier-one and tier-two suppliers build to schedules they don't control. Delivery schedules change weekly, sometimes daily, and every change ripples through material requirements, subcontractors and the gate. Quality failures are traced to a part number and a lot, and the customer expects the answer the same day.",
    challenges: [
      { title: "Schedule volatility", body: "Customer schedules revised faster than planning can absorb, leaving production plans out of date by the time they print." },
      { title: "Subcontracting loops", body: "Components sent out for plating, heat treatment or machining and expected back on time, with stock visible at the subcontractor." },
      { title: "Part-level traceability", body: "A defect at the customer has to be traced back through lots, machines and incoming material." },
      { title: "Dock and gate congestion", body: "Inbound and outbound trucks competing for the same gate, with no link between the vehicle and the document it carries." },
    ],
    flow: {
      caption: "From customer schedule to dispatch, with the points where SAP and TAMS applications meet.",
      steps: [
        { title: "Schedule", body: "Customer delivery schedules received and run through MRP." },
        { title: "Procure", body: "Supplier schedules and subcontract orders issued." },
        { title: "Receive", body: "Inbound vehicles checked in at the gate against the purchase order." },
        { title: "Produce", body: "Production orders tracked by stage, with machine data where connected." },
        { title: "Inspect", body: "In-process and final inspection recorded against the lot." },
        { title: "Dispatch", body: "Billing, gate exit and delivery against the customer schedule." },
      ],
    },
    standard: [
      "Scheduling agreements and delivery schedules",
      "MRP, production orders and subcontracting",
      "Batch management and quality inspection",
      "Inventory by plant, storage location and subcontractor",
    ],
    extended: [
      "Gate check-in linked to purchase orders and billing documents (Gate Entry)",
      "Stage-by-stage order tracking on the floor (Production Process)",
      "Machine data linked to orders (TAMS Connected Factory)",
      "Supplier self-service for orders and documents (Vendor Portal)",
    ],
    apps: [
      { slug: "gate-entry", why: "Ties every inbound and outbound truck to the SAP document it carries." },
      { slug: "production-process", why: "Shows planners where each order is between release and confirmation." },
      { slug: "vendor-portal", why: "Gives sub-tier suppliers order visibility without another email." },
    ],
    tech: [
      { slug: "integration-suite", why: "Exchanges schedules and confirmations with customer and supplier systems." },
      { slug: "analytics-reporting", why: "Tracks delivery performance and rejection rates by customer and part." },
    ],
    cta: "Talk to us about schedule-driven production on SAP.",
    related: {
      services: ["s4hana-cloud-implementation", "s4hana-managed-services"],
      solutions: ["industry-solutions"],
    },
  },
  {
    slug: "metals-steel",
    name: "Metals and Steel",
    short: "Metals & steel",
    tagline: "Heat, grade and batch traceability from melt to dispatch.",
    icon: "ladle",
    headline: "Trace every coil and billet back to its heat.",
    context:
      "In steel, the unit of truth is the heat. A heat is cast into billets or slabs, rolled, cut and sometimes split again, and every piece that ships must carry its chemistry and grade with it. Material is weighed at every movement, and dispatch runs to statutory deadlines.",
    challenges: [
      { title: "Heat-to-piece genealogy", body: "One heat becomes many billets, and a billet becomes child billets or coils. Each split must keep its parent's characteristics." },
      { title: "Grade and specification", body: "Chemistry and mechanical results recorded per heat and checked against the grade ordered." },
      { title: "Weight everywhere", body: "Theoretical and actual weights differ, and the weighbridge is the source of truth for both receipts and dispatch." },
      { title: "Dispatch compliance", body: "Test certificates, e-invoices and e-way bills prepared before the truck can leave." },
    ],
    flow: {
      caption: "Melt to dispatch, showing where genealogy is created and where weight is captured.",
      steps: [
        { title: "Melt", body: "Heat number created with its chemistry as batch characteristics." },
        { title: "Cast", body: "Billets or slabs produced as batches carrying the heat." },
        { title: "Split", body: "Child billets released against the production order, keeping the parent's data." },
        { title: "Roll", body: "Rolled product recorded with grade and dimensions." },
        { title: "Test", body: "Results recorded and the grade released by quality." },
        { title: "Weigh and ship", body: "Weighbridge net weight, certificates and statutory documents at dispatch." },
      ],
    },
    standard: [
      "Batch management with classification for heat, grade and chemistry",
      "Batch where-used and genealogy reporting",
      "Quality inspection and usage decisions",
      "GST e-invoice and e-way bill steps through SAP's India localisation",
    ],
    extended: [
      "Child-billet release tied to production orders (custom build)",
      "Weighbridge capture at the gate with net weight (Gate Entry)",
      "Export documentation and licences for overseas orders (EXIM)",
      "Anomaly flags on production data (TAMS Digital Manufacturing & AI)",
    ],
    apps: [
      { slug: "gate-entry", why: "Captures entry and exit weights and links them to the pass and its SAP document." },
      { slug: "exim", why: "Handles shipping documents, licences and letters of credit for exports." },
      { slug: "digital-manufacturing-ai", why: "Flags unusual readings across heats for engineers to review." },
    ],
    tech: [
      { slug: "industry-solutions", why: "Batch classification models built around heat and grade." },
      { slug: "sap-btp", why: "Hosts genealogy and release apps beside the core." },
    ],
    cta: "Talk to us about heat and batch traceability.",
    related: {
      services: ["custom-application-build", "s4hana-cloud-implementation"],
      solutions: ["analytics-reporting"],
    },
  },
  {
    slug: "mill-products",
    name: "Mill Products",
    short: "Mill products",
    tagline: "Variant-heavy orders, rolls and lots handled cleanly.",
    icon: "reel",
    headline: "Sell by the roll, plan by the tonne, ship by the lot.",
    context:
      "Paper, film, textiles, wire and other mill products are sold in endless combinations of width, thickness, length and finish. A single customer order can mean several production runs, and a single run can be cut to fill many orders. Quantities change unit of measure at every step.",
    challenges: [
      { title: "Variant explosion", body: "Thousands of saleable variants that shouldn't each become a separate material master." },
      { title: "Units that change", body: "Ordered in metres or pieces, produced in tonnes, invoiced in either. Conversions have to hold across the chain." },
      { title: "Lots and remnants", body: "Parent rolls cut into child lots, with offcuts and remnants that still have value." },
      { title: "Order combination", body: "Production runs planned to combine orders efficiently without breaking delivery promises." },
    ],
    flow: {
      caption: "Order to dispatch for a characteristic-driven product.",
      steps: [
        { title: "Configure", body: "Order entered with its characteristics: width, gauge, finish." },
        { title: "Combine", body: "Orders grouped into production runs." },
        { title: "Produce", body: "Parent rolls or lots produced with their characteristics." },
        { title: "Convert", body: "Rolls slit or cut into child lots for specific orders." },
        { title: "Pack", body: "Lots packed and labelled with order and characteristics." },
        { title: "Dispatch", body: "Weighed, documented and released at the gate." },
      ],
    },
    standard: [
      "Variant configuration and characteristic-based materials",
      "Batch management for parent and child lots",
      "Alternative units of measure",
      "Production planning and MRP",
    ],
    extended: [
      "Weighbridge-backed dispatch at the gate (Gate Entry)",
      "Stage tracking through converting operations (Production Process)",
      "Machine data from winders and lines (TAMS Connected Factory)",
    ],
    apps: [
      { slug: "gate-entry", why: "Records dispatch weights against billing documents." },
      { slug: "production-process", why: "Follows each run through converting stages." },
      { slug: "connected-factory", why: "Brings line data from the mill into SAP context." },
    ],
    tech: [
      { slug: "industry-solutions", why: "Characteristic and variant models designed for the product range." },
      { slug: "analytics-reporting", why: "Yield, remnant and order-fill reporting." },
    ],
    cta: "Talk to us about variant-heavy order handling.",
    related: {
      services: ["s4hana-cloud-implementation"],
      solutions: ["sap-btp"],
    },
  },
  {
    slug: "pharmaceuticals",
    name: "Pharmaceuticals",
    short: "Pharmaceuticals",
    tagline: "Batch records and quality release built for compliance.",
    icon: "pills",
    headline: "Release a batch with every record already in place.",
    context:
      "In pharmaceutical manufacturing, a batch isn't finished when production ends. It's finished when quality releases it, and release depends on documentation: materials used, results recorded, deviations closed. Every step is inspected, and auditors expect to see the record without anyone recreating it.",
    challenges: [
      { title: "Batch genealogy", body: "Every raw material lot traced into every finished batch, forwards and backwards." },
      { title: "Quality release", body: "Release decisions waiting on results and documents spread across systems." },
      { title: "Controlled materials", body: "Expiry, retest dates and stock status enforced so the wrong lot can't be issued." },
      { title: "Document control", body: "Signed records kept with the batch, not in a separate filing room." },
    ],
    flow: {
      caption: "A batch from receipt of materials to release.",
      steps: [
        { title: "Receive", body: "Materials received into quality inspection stock." },
        { title: "Sample and test", body: "Incoming inspection and results recorded." },
        { title: "Dispense", body: "Released lots issued to the process order." },
        { title: "Manufacture", body: "Process order executed and progress recorded." },
        { title: "Review", body: "Results, deviations and documents checked." },
        { title: "Release", body: "Usage decision recorded and the batch made available." },
      ],
    },
    standard: [
      "Process orders and recipes",
      "Batch management with shelf-life and retest dates",
      "Quality management: inspection lots, results and usage decisions",
      "Batch where-used traceability",
    ],
    extended: [
      "Digital signing of SAP documents (Digital Signature)",
      "Anomaly flags in production and quality data (TAMS Digital Manufacturing & AI)",
      "Export documentation for regulated markets (EXIM)",
    ],
    apps: [
      { slug: "digital-signature", why: "Applies verifiable signatures to documents in the release process." },
      { slug: "digital-manufacturing-ai", why: "Highlights unusual results across batches for review." },
      { slug: "exim", why: "Prepares export documentation for shipments abroad." },
    ],
    tech: [
      { slug: "industry-solutions", why: "Quality and batch processes configured around release." },
      { slug: "automation-workflow", why: "Routes review and approval steps to the right people." },
    ],
    cta: "Talk to us about batch traceability and quality release.",
    related: {
      services: ["s4hana-cloud-implementation", "s4hana-managed-services"],
      solutions: ["analytics-reporting"],
    },
  },
  {
    slug: "engineering-fabrication",
    name: "Engineering and Fabrication",
    short: "Engineering & fabrication",
    tagline: "Project manufacturing with costed bills of material.",
    icon: "ruler-cross-pen",
    headline: "Know what the project will cost before the steel is cut.",
    context:
      "Engineered-to-order manufacturers build things once: a pressure vessel, a structural package, a special-purpose machine. The bill of material evolves as engineering progresses, materials are bought for a specific project, and margin depends on whether actual cost tracks the estimate.",
    challenges: [
      { title: "Changing bills of material", body: "Engineering revisions arrive while procurement and production are already under way." },
      { title: "Project-specific stock", body: "Material bought for one project must stay with that project, not get consumed by another." },
      { title: "Estimate versus actual", body: "Cost estimates made at quotation drift from actuals with no early warning." },
      { title: "Progress visibility", body: "Customers and managers ask where the job is, and the answer depends on who you ask." },
    ],
    flow: {
      caption: "A project from engineering to delivery, with costs tracked at each step.",
      steps: [
        { title: "Estimate", body: "Costed bill of material and routing prepared for the quotation." },
        { title: "Engineer", body: "Design released in stages as the bill of material matures." },
        { title: "Procure", body: "Long-lead and project-specific materials ordered against the project." },
        { title: "Fabricate", body: "Production orders executed and tracked by stage." },
        { title: "Assemble and test", body: "Final assembly, inspection and test records." },
        { title: "Deliver", body: "Dispatch, invoicing and actual-versus-estimate review." },
      ],
    },
    standard: [
      "Project structures with project-specific stock",
      "Bills of material, routings and production orders",
      "Cost estimates and actual cost collection",
      "Procurement and inventory against projects",
    ],
    extended: [
      "Stage-by-stage fabrication tracking (Production Process)",
      "Export documentation for overseas projects (EXIM)",
      "Custom applications for engineering change and progress reporting (custom build)",
    ],
    apps: [
      { slug: "production-process", why: "Shows fabrication progress stage by stage for each project." },
      { slug: "exim", why: "Handles documentation for equipment shipped overseas." },
    ],
    tech: [
      { slug: "analytics-reporting", why: "Reports estimate-versus-actual cost by project and phase." },
      { slug: "sap-btp", why: "Hosts engineering-change and progress apps beside S/4HANA." },
    ],
    cta: "Talk to us about project manufacturing on SAP.",
    related: {
      services: ["custom-application-build", "s4hana-cloud-implementation"],
      solutions: ["industry-solutions"],
    },
  },
  {
    slug: "consumer-durables",
    name: "Consumer Durables",
    short: "Consumer durables",
    tagline: "Demand, distribution and service in one system.",
    icon: "washing-machine",
    headline: "Plan for the season, ship to every channel, support every unit.",
    context:
      "Appliance and electronics manufacturers plan against seasonal, promotion-driven demand and sell through distributors, retailers and their own channels. Once a product is sold, it still has to be serviced, often by serial number, for years.",
    challenges: [
      { title: "Seasonal demand", body: "Forecasts built on promotions and seasons that change faster than supply can respond." },
      { title: "Multi-tier distribution", body: "Stock spread across plants, depots and channel partners, each with its own view of availability." },
      { title: "Serial-level history", body: "Units tracked from production to installation to service, by serial number." },
      { title: "Statutory dispatch", body: "High-volume dispatches needing e-invoices and e-way bills without slowing the dock." },
    ],
    flow: {
      caption: "From demand plan to after-sales.",
      steps: [
        { title: "Forecast", body: "Demand planned by product, channel and season." },
        { title: "Supply", body: "Production and procurement planned against the forecast." },
        { title: "Produce", body: "Units built and serialised." },
        { title: "Distribute", body: "Stock moved to depots and channel partners." },
        { title: "Sell", body: "Orders fulfilled across channels." },
        { title: "Service", body: "Installations and service calls recorded against the unit." },
      ],
    },
    standard: [
      "Demand and supply planning",
      "Sales and distribution across channels",
      "Serial number management",
      "GST e-invoice and e-way bill steps through SAP's India localisation",
    ],
    extended: [
      "Gate check-in for high-volume dispatch (Gate Entry)",
      "Supplier collaboration on components (Vendor Portal)",
      "Digitally signed invoices and documents (Digital Signature)",
    ],
    apps: [
      { slug: "gate-entry", why: "Keeps outbound trucks moving with passes created from billing documents." },
      { slug: "vendor-portal", why: "Shares component orders and schedules with suppliers." },
      { slug: "digital-signature", why: "Signs outgoing documents without a print-and-scan step." },
    ],
    tech: [
      { slug: "analytics-reporting", why: "Forecast accuracy, channel stock and service KPIs." },
      { slug: "integration-suite", why: "Connects distributor, e-commerce and service systems to SAP." },
    ],
    cta: "Talk to us about demand, distribution and service on SAP.",
    related: {
      services: ["s4hana-cloud-implementation", "s4hana-managed-services"],
      solutions: ["grow-with-sap"],
    },
  },
];
