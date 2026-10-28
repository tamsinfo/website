import type { DiagramKey } from "./types";

export type Diagram = {
  title: string;
  caption: string;
  columns: { label: string; owner: string; nodes: string[]; emphasis?: boolean }[];
  /** Connector labels between adjacent columns. */
  links: string[];
};

export const diagrams: Record<DiagramKey, Diagram> = {
  btp: {
    title: "Extending S/4HANA on SAP BTP",
    caption: "Conceptual architecture. Extensions and integrations live on SAP BTP, so the S/4HANA core stays upgradeable.",
    columns: [
      { label: "SAP S/4HANA", owner: "SAP", nodes: ["Clean core", "Standard processes", "Released APIs and events"] },
      {
        label: "SAP BTP",
        owner: "SAP platform · built on by TAMS",
        emphasis: true,
        nodes: ["Side-by-side apps (CAP, SAPUI5)", "Integration flows", "API management", "Workflow"],
      },
      { label: "Outside the ERP", owner: "Your partners and plants", nodes: ["Supplier portals", "MES and machines", "Government portals", "Web and mobile users"] },
    ],
    links: ["OData APIs and business events", "Managed integrations"],
  },
  rise: {
    title: "Responsibilities in a RISE with SAP programme",
    caption: "Who does what. SAP's exact responsibilities follow your RISE with SAP contract.",
    columns: [
      {
        label: "Your business",
        owner: "TAMS works here",
        emphasis: true,
        nodes: ["Process design", "Data migration", "Integrations and extensions", "Testing and cutover", "Application support"],
      },
      { label: "S/4HANA Cloud, Private Edition", owner: "SAP", nodes: ["Application under subscription", "Technical upgrades", "System operations"] },
      { label: "Infrastructure", owner: "SAP, on a hyperscaler", nodes: ["Hosting", "Backups", "Network and security baseline"] },
    ],
    links: ["Configured and extended on", "Hosted and operated on"],
  },
  grow: {
    title: "Fit-to-standard in GROW with SAP",
    caption: "Every gap gets one of three answers. Extension is the last of them, not the first.",
    columns: [
      { label: "Best-practice processes", owner: "SAP", nodes: ["Order to cash", "Procure to pay", "Plan to produce", "Record to report"] },
      { label: "Fit-to-standard", owner: "TAMS with your team", emphasis: true, nodes: ["Walk real scenarios", "Record each gap", "Decide gap by gap"] },
      { label: "Decision", owner: "Outcome per gap", nodes: ["Adopt the standard", "Change the process", "Extend on SAP BTP"] },
    ],
    links: ["Demonstrated in workshops", "Resolved as"],
  },
  ai: {
    title: "Where AI sits in an SAP process",
    caption: "Native SAP AI and TAMS-built AI are different things, and both stop at a person's decision.",
    columns: [
      { label: "Data in SAP", owner: "Your data", nodes: ["Transactions", "Documents", "Production data"] },
      {
        label: "AI layer",
        owner: "SAP and TAMS",
        emphasis: true,
        nodes: ["Embedded SAP AI scenarios (SAP)", "Joule, where available (SAP)", "Custom models on SAP BTP (TAMS)"],
      },
      { label: "Your process", owner: "People decide", nodes: ["Human review", "Decision recorded", "Manual fallback"] },
    ],
    links: ["Grounded in", "Suggests; people decide"],
  },
  industry: {
    title: "Standard SAP and where it stops",
    caption: "Each industry page states which steps are standard SAP and which need an application or integration.",
    columns: [
      { label: "Industry process", owner: "Your plant", nodes: ["Plan", "Produce", "Trace", "Ship"] },
      { label: "Standard SAP", owner: "SAP", nodes: ["Production planning and MRP", "Batch management", "Quality management", "Inventory and logistics"] },
      { label: "Where standard stops", owner: "TAMS", emphasis: true, nodes: ["Gate Entry", "Production Process", "Connected Factory", "EXIM"] },
    ],
    links: ["Mapped onto", "Completed by"],
  },
  analytics: {
    title: "From transactions to decisions",
    caption: "Define the KPI first, then the model, then the dashboard.",
    columns: [
      { label: "Sources", owner: "Your systems", nodes: ["S/4HANA transactions", "MES and machines", "Spreadsheets and other ERPs"] },
      { label: "Model", owner: "TAMS designs", emphasis: true, nodes: ["KPI definitions", "CDS views and data models", "Data integration"] },
      { label: "Use", owner: "Your people", nodes: ["Shift dashboards", "Management KPIs", "Planning in SAP Analytics Cloud"] },
    ],
    links: ["Combined with lineage", "Read live"],
  },
  integration: {
    title: "One integration layer instead of many scripts",
    caption: "Conceptual architecture. SAP Integration Suite is SAP's product; the flows, mappings and monitoring are what we build.",
    columns: [
      { label: "SAP S/4HANA", owner: "SAP", nodes: ["Orders and deliveries", "Invoices", "Master data"] },
      {
        label: "SAP Integration Suite",
        owner: "SAP product · flows built by TAMS",
        emphasis: true,
        nodes: ["Integration flows", "API management", "Events", "Monitoring and alerts"],
      },
      { label: "Connected systems", owner: "Partners and plants", nodes: ["Suppliers and EDI partners", "Logistics providers", "Banks and tax systems", "Plant systems"] },
    ],
    links: ["Released APIs", "Each partner's format"],
  },
  workflow: {
    title: "An approval, end to end",
    caption: "Every step leaves a record, so the question 'who approved this?' always has an answer.",
    columns: [
      { label: "Event", owner: "A system", nodes: ["Purchase requisition", "Gatepass created", "Invoice received"] },
      { label: "Rules", owner: "Configured", emphasis: true, nodes: ["Document type", "Value threshold", "Plant or process"] },
      { label: "Approver", owner: "A person", nodes: ["Approve or reject", "Delegate", "Escalate when overdue"] },
      { label: "Record", owner: "Audit trail", nodes: ["Decision and time", "Next step triggered"] },
    ],
    links: ["Routed by", "Assigned to", "Logged as"],
  },
};
