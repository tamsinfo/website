import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "s4hana-cloud-implementation",
    name: "S/4HANA Cloud Implementation",
    tagline: "GROW and RISE, blueprint to go-live.",
    icon: "cloud-check",
    summary:
      "Planning, fit-to-standard design, configuration, data migration, cutover and stabilisation for SAP S/4HANA Cloud.",
    lede: "We take S/4HANA Cloud from the first requirements workshop to a stable first month-end close, using SAP's own Activate phases so every checkpoint is one SAP and your auditors recognise.",
    problem: {
      title: "The hard part is rarely the software",
      body: "ERP programmes slip when processes are redesigned too late, data is cleaned too late, and integrations are discovered during testing. An implementation plan has to surface those three things in the first weeks, while they are still cheap to change.",
    },
    covers: [
      {
        title: "Implementation planning and requirements",
        body: "Scope, legal entities, plants and process areas agreed up front, with a requirements backlog that each later decision traces back to.",
      },
      {
        title: "Solution blueprint and process alignment",
        body: "Fit-to-standard workshops against SAP's best-practice processes. Gaps are recorded as configuration, extension or process change, never silently as custom code.",
      },
      {
        title: "Configuration and integration",
        body: "System configuration for finance, procurement, sales, production and inventory, plus the interfaces to the systems that stay: MES, portals, banks, tax systems.",
      },
      {
        title: "Data migration and validation",
        body: "Master and open-item data extracted, cleansed and loaded with the SAP S/4HANA Migration Cockpit, then reconciled against the legacy system by the people who own the numbers.",
      },
      {
        title: "Testing, cutover and go-live",
        body: "Unit, integration and user-acceptance cycles on real scenarios, a rehearsed cutover runbook, and a go/no-go decision made on evidence.",
      },
      {
        title: "Post-go-live stabilisation",
        body: "Hypercare through the first period-end close, with issues triaged daily and handed to the support team with full context.",
      },
    ],
    process: {
      title: "How an implementation runs",
      caption: "Phases follow SAP Activate. Duration varies with scope; we commit to dates once the Explore phase has confirmed it.",
      steps: [
        { title: "Discover", body: "Business case, scope options and the deployment model decision." },
        { title: "Prepare", body: "Project plan, team, governance and system provisioning." },
        { title: "Explore", body: "Fit-to-standard workshops and the backlog of gaps." },
        { title: "Realize", body: "Configuration, extensions, integrations and migration loads in sprints." },
        { title: "Deploy", body: "Final testing, cutover rehearsal, training and go-live." },
        { title: "Run", body: "Hypercare, then a planned handover to managed services." },
      ],
    },
    matrix: {
      title: "Which S/4HANA, and what we do in each",
      intro:
        "SAP sells S/4HANA in two cloud editions, each usually reached through a different SAP offering. The edition decides how much you can change, how upgrades arrive, and what an implementation partner actually does.",
      columns: ["Public Edition (GROW with SAP)", "Private Edition (RISE with SAP)"],
      rows: [
        {
          label: "What it is",
          cells: [
            "SaaS run by SAP on a shared code line, with best-practice processes switched on through configuration.",
            "Your own S/4HANA instance, hosted and technically operated by SAP, with the full depth of on-premise functionality.",
          ],
        },
        {
          label: "Typical starting point",
          cells: [
            "New implementations, subsidiaries, and businesses willing to adopt standard processes.",
            "Companies moving from SAP ECC or with complex processes that need deeper configuration or extension.",
          ],
        },
        {
          label: "How change is handled",
          cells: [
            "Key-user and developer extensibility only; SAP upgrades the system on its release schedule.",
            "Broader extensibility; upgrades are planned with you. A clean core still keeps them affordable.",
          ],
        },
        {
          label: "Our role",
          cells: [
            "Fit-to-standard design, configuration, integrations, data migration and release-by-release regression testing.",
            "Greenfield, system conversion or selective transition planning, custom-code remediation, migration and cutover.",
          ],
        },
      ],
    },
    role: [
      {
        title: "One team from blueprint to support",
        body: "The consultants who design the solution stay for go-live and hand over to our managed-services team in person, not through a document.",
      },
      {
        title: "Standard first, extension second",
        body: "Every gap is challenged against standard processes before it becomes an extension. When an extension is right, it is built outside the core.",
      },
      {
        title: "Your people own the numbers",
        body: "Data reconciliation and acceptance testing are run with your finance and operations owners, so go-live is a decision they make, not one we make for them.",
      },
    ],
    related: {
      solutions: ["rise-with-sap", "grow-with-sap", "integration-suite"],
      services: ["s4hana-managed-services", "license-procurement"],
      industries: ["automotive", "metals-steel"],
    },
  },
  {
    slug: "s4hana-managed-services",
    name: "S/4HANA Managed Services",
    tagline: "SLAs and a named team.",
    icon: "users-group-rounded",
    summary:
      "Application management for live SAP environments: incidents, functional and technical support, monitoring, enhancements and release readiness.",
    lede: "After go-live, your SAP system keeps changing: new plants, new tax rules, new releases from SAP. Our application management services keep it running and keep it current, with a team that knows your configuration by name.",
    problem: {
      title: "Support that starts from zero every time",
      body: "Ticket queues staffed by whoever is free mean every incident begins with someone relearning your system. The fix takes longer, and the same root cause comes back next quarter.",
    },
    covers: [
      {
        title: "Application support and maintenance",
        body: "Day-to-day support for configured processes, master-data issues, authorisations and batch jobs across finance, logistics and manufacturing.",
      },
      {
        title: "Incident management and troubleshooting",
        body: "Incidents logged, prioritised against agreed severity definitions, resolved, and closed with a root cause recorded.",
      },
      {
        title: "Functional and technical support",
        body: "Functional consultants for process questions, developers and Basis specialists for interfaces, performance and custom code.",
      },
      {
        title: "Monitoring and optimisation",
        body: "Interface queues, background jobs and system health watched proactively, with recurring issues turned into fixes rather than tickets.",
      },
      {
        title: "Enhancements and change requests",
        body: "Small changes delivered through a governed backlog: estimated, approved, tested in quality and moved to production.",
      },
      {
        title: "Release readiness",
        body: "Regression testing of your critical processes and extensions before SAP's scheduled upgrades reach production.",
      },
    ],
    process: {
      title: "How a support engagement runs",
      caption: "Service levels, coverage hours and team size are agreed in each contract. We don't publish a standard SLA because no two landscapes share one.",
      steps: [
        { title: "Transition", body: "Knowledge transfer from the implementation team or the incumbent provider." },
        { title: "Baseline", body: "Process inventory, interface map, open-ticket review and runbooks." },
        { title: "Run", body: "Incidents, service requests and monitoring against agreed service levels." },
        { title: "Improve", body: "Monthly review of trends, root causes and the enhancement backlog." },
        { title: "Evolve", body: "Release testing, roadmap items and new rollouts planned together." },
      ],
    },
    role: [
      {
        title: "A named team",
        body: "A service lead and consultants assigned to your account, where the engagement includes it, so the people answering know your system.",
      },
      {
        title: "Agreed service levels",
        body: "Severity definitions, response and resolution targets, and reporting cadence written into the contract before support begins.",
      },
      {
        title: "Fewer tickets over time",
        body: "We report on recurring incidents and fix their causes. A support contract should get quieter, not busier.",
      },
    ],
    note: "Specific SLA figures are part of each contract and are not published here.",
    related: {
      services: ["s4hana-cloud-implementation", "custom-application-build"],
      solutions: ["analytics-reporting", "integration-suite"],
      products: ["production-process"],
    },
  },
  {
    slug: "custom-application-build",
    name: "Custom Application Build",
    tagline: "Extensions that survive upgrades.",
    icon: "code-square",
    summary:
      "Business-specific applications, portals and SAP extensions built on SAP BTP and ABAP Cloud, designed to stay outside the ERP core.",
    lede: "When standard SAP doesn't cover a workflow, we build the missing piece as an application beside the core, connected through released APIs, so your next upgrade doesn't turn into a rewrite.",
    problem: {
      title: "Custom code that holds the ERP hostage",
      body: "Modifications made inside the core work until the next upgrade, when every one of them has to be found, retested and often rebuilt. The cost of a change is paid again with every release.",
    },
    covers: [
      {
        title: "Business-specific workflows",
        body: "Gate passes, child-batch releases, stock transfers, approvals: the plant-specific steps that standard transactions handle awkwardly or not at all.",
      },
      {
        title: "SAP integrations and APIs",
        body: "Extensions read and post through SAP's released OData APIs and events, so they keep working when the system underneath is upgraded.",
      },
      {
        title: "User-facing applications and portals",
        body: "SAPUI5 and Fiori apps for SAP users, and web front ends for suppliers, transporters and other people outside your ERP.",
      },
      {
        title: "Upgrade-conscious architecture",
        body: "Side-by-side on SAP BTP with the Cloud Application Programming Model, or on-stack with ABAP Cloud and RAP where the logic belongs next to the data.",
      },
      {
        title: "Maintainability and lifecycle",
        body: "Typed code, automated tests, documented deployment, and source handed over to you. An extension should be supportable by someone who didn't write it.",
      },
    ],
    process: {
      title: "How a build runs",
      caption: "We pick the extension model per requirement, not per project.",
      steps: [
        { title: "Frame", body: "Confirm the gap can't be closed with configuration or key-user tools." },
        { title: "Choose the model", body: "Key-user, on-stack ABAP Cloud, or side-by-side on BTP." },
        { title: "Design", body: "Data model, released APIs, roles and screens agreed before code." },
        { title: "Build and test", body: "Short iterations with your users on a quality system." },
        { title: "Deploy and hand over", body: "Transport or BTP deployment, runbook, and support handover." },
      ],
    },
    matrix: {
      title: "Where an extension should live",
      intro: "SAP offers three places to extend S/4HANA. Choosing correctly is most of the work of keeping a clean core.",
      columns: ["Key-user", "On-stack (ABAP Cloud)", "Side-by-side (SAP BTP)"],
      rows: [
        {
          label: "Good for",
          cells: [
            "Custom fields, simple logic, forms and analytical views.",
            "Logic that must run close to SAP data and transactions.",
            "Separate apps, external users, heavy UI, non-SAP data.",
          ],
        },
        {
          label: "Built with",
          cells: ["S/4HANA Fiori key-user apps", "ABAP RESTful Application Programming Model", "CAP (Node.js), SAPUI5, SAP HANA Cloud"],
        },
        {
          label: "Upgrade impact",
          cells: ["Lowest", "Low, when only released APIs are used", "Low, connected through released APIs"],
        },
      ],
    },
    role: [
      {
        title: "We build our own products this way",
        body: "TAMS applications such as Gate Entry and EXIM run on SAP BTP with CAP services, SAPUI5 or React front ends and SAP HANA Cloud: the same stack we recommend.",
      },
      {
        title: "Recent examples",
        body: "A child-billet release app tied to steel production orders, and a sales-order stock transfer app built on RAP and SAPUI5 for movement types 411 and 413.",
      },
      {
        title: "You own the source",
        body: "Custom builds are delivered with their source, tests and deployment descriptors so your team or ours can maintain them.",
      },
    ],
    related: {
      solutions: ["sap-btp", "integration-suite", "automation-workflow"],
      products: ["gate-entry", "vendor-portal"],
      industries: ["metals-steel", "engineering-fabrication"],
    },
  },
  {
    slug: "license-procurement",
    name: "License Procurement",
    tagline: "Right-sized modules and subscriptions.",
    icon: "key",
    summary:
      "Usage assessment, module and subscription scoping, and procurement assistance so you buy the SAP entitlements your processes actually need.",
    lede: "SAP licensing is easier to get wrong than to get right. We map your users and processes to the modules and subscription metrics that cover them, before anyone talks commercial terms.",
    problem: {
      title: "Paying for shelfware, or short at go-live",
      body: "Licences bought from a sales proposal rather than a process map tend to miss in both directions: modules nobody uses, and user types that turn out to be wrong once the real roles are defined.",
    },
    covers: [
      {
        title: "Requirements and usage assessment",
        body: "Who does what in the system, how often, and in which process areas, built from your role design rather than headcount.",
      },
      {
        title: "Modules and subscriptions",
        body: "Which S/4HANA scope items, industry functions and BTP services your processes need now, and which can wait.",
      },
      {
        title: "Licensing model considerations",
        body: "How metrics such as Full Usage Equivalents in RISE with SAP translate your user mix into subscription volume.",
      },
      {
        title: "Scope and entitlement alignment",
        body: "A reconciliation of what the implementation design assumes against what the contract includes, before go-live rather than after.",
      },
      {
        title: "Procurement assistance",
        body: "Support through the commercial process, with the contracting route confirmed for each engagement.",
      },
    ],
    process: {
      title: "How an assessment runs",
      caption: "The output is a sizing you can take into negotiation, with every number traceable to a role or process.",
      steps: [
        { title: "Inventory", body: "Roles, users, entities, plants and process areas in scope." },
        { title: "Map", body: "Roles mapped to user types and process areas to modules." },
        { title: "Size", body: "Subscription volumes modelled, with growth assumptions stated." },
        { title: "Align", body: "Sizing checked against the solution design and roadmap." },
        { title: "Procure", body: "Assistance through quotation and contracting." },
      ],
    },
    role: [
      {
        title: "Sizing from design, not from a quote",
        body: "Because we implement, we size from the role and process design the project will actually build.",
      },
      {
        title: "Plain-language trade-offs",
        body: "Where licensing choices constrain the design, or the reverse, we put both options side by side with their consequences.",
      },
    ],
    note: "TAMS assists with licence assessment and procurement. The commercial agreement and contracting party are confirmed in each engagement.",
    related: {
      services: ["s4hana-cloud-implementation"],
      solutions: ["rise-with-sap", "grow-with-sap", "sap-btp"],
    },
  },
];
