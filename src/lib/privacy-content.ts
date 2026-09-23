/**
 * SCR-005 Privacy Policy draft (FR-008), transcribed verbatim and in DOM order from
 * docs/03-design/paper-snapshot/desktop/privacy.jsx. FR-008 requires the draft text
 * exactly as the screen shows it, including every amber "to confirm" marker.
 */

/** A value cell: plain draft text, or an amber "to confirm" marker. */
export type LegalValue =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "confirm"; readonly text: string };

const text = (value: string): LegalValue => ({ kind: "text", text: value });
const confirm = (detail: string): LegalValue => ({
  kind: "confirm",
  text: `to confirm — ${detail}`,
});

export interface DefinitionRow {
  readonly term: string;
  readonly value: LegalValue;
}

export interface LegalTableRow {
  readonly heading: string;
  readonly cells: readonly [LegalValue, LegalValue];
}

export interface LegalTable {
  /** Three column labels; the first labels the row headings. */
  readonly columns: readonly [string, string, string];
  /** Desktop widths of the first two columns, as 4px-grid utilities. */
  readonly widths: readonly [string, string];
  readonly rows: readonly LegalTableRow[];
}

export interface SectionHeading {
  readonly eyebrow: string;
  readonly title: string;
  readonly aside?: string;
}

export const PRIVACY_HERO = {
  eyebrow: "Legal",
  title: "Privacy policy",
  intro:
    "How TAMS Infotech collects, uses and protects personal data, and what you can ask us to do with it. Written to meet the UK and EU General Data Protection Regulation and India’s Digital Personal Data Protection Act, 2023.",
  markers: [
    confirm("effective date"),
    confirm("version number"),
    confirm("last reviewed by counsel"),
  ],
} as const;

export const DRAFT_NOTICE = {
  badge: "Draft — not yet legal advice",
  body: "This page carries the structure and disclosures both regimes require, but every amber marker is a fact only TAMS can supply — retention periods, processors, officer names. It has not been reviewed by a lawyer. Do not publish it until it has been, and until every marker is resolved.",
} as const;

export const IDENTITY_HEADING: SectionHeading = {
  eyebrow: "Identity",
  title: "Who we are",
  aside: "The entity responsible, and who to contact about any of this.",
};

export const IDENTITY_ROWS: readonly DefinitionRow[] = [
  { term: "Legal entity", value: text("TAMS Infotech Pvt. Ltd.") },
  {
    term: "Role under GDPR",
    value: text(
      "Controller for the data described below. Processor where we handle data inside a client’s SAP landscape under that client’s instructions.",
    ),
  },
  {
    term: "Role under the DPDP Act",
    value: text(
      "Data Fiduciary for the data described below. Data Processor where we act on a client’s instructions.",
    ),
  },
  { term: "Registered office", value: confirm("full registered address and CIN") },
  { term: "Operating office", value: text("Bengaluru, Karnataka, India") },
  { term: "General contact", value: text("+91 80 4130 1039 · sales@tamsinfotech.com") },
  { term: "Privacy contact", value: confirm("dedicated privacy mailbox") },
  {
    term: "Grievance Officer (DPDP s.13)",
    value: confirm("name, designation and email — publication is mandatory"),
  },
  {
    term: "Data Protection Officer (GDPR Art. 37)",
    value: confirm("name and contact, or a recorded decision that none is required"),
  },
  {
    term: "EU/UK representative (GDPR Art. 27)",
    value: confirm("required if you target EU or UK data subjects without an establishment there"),
  },
];

export const DATA_HEADING: SectionHeading = {
  eyebrow: "Data",
  title: "What we collect, and where it comes from",
};

export const DATA_TABLE: LegalTable = {
  columns: ["Category", "Where it comes from", "What it includes"],
  widths: ["xl:w-55", "xl:w-75"],
  rows: [
    {
      heading: "Enquiry details",
      cells: [
        text("Contact form on this site, email, phone."),
        text(
          "Name, company, work email, phone, the interest you select and what you tell us is breaking.",
        ),
      ],
    },
    {
      heading: "Candidate details",
      cells: [
        text("Applications for the roles listed on the Careers page."),
        text(
          "CV, contact details, experience, module specialisation and anything else you choose to send.",
        ),
      ],
    },
    {
      heading: "Client contact details",
      cells: [
        text("Given to us during a project by the client organisation."),
        text("Names, business contact details and roles of the people we work with."),
      ],
    },
    {
      heading: "Support and correspondence",
      cells: [
        text("Tickets, email threads and call notes during a managed-services engagement."),
        text("Whatever the exchange contains, including screenshots that may show names."),
      ],
    },
    {
      heading: "Technical data",
      cells: [
        text("Automatically, when you visit this site."),
        confirm("confirm exactly what is logged, and whether analytics run at all"),
      ],
    },
    {
      heading: "Client system data",
      cells: [
        text("Only where an engagement requires it, under the client’s instructions."),
        text(
          "Personal data inside an SAP landscape. We act as processor, not controller, for this.",
        ),
      ],
    },
  ],
};

export const GROUNDS_HEADING: SectionHeading = {
  eyebrow: "Grounds",
  title: "Why we use it, and on what legal ground",
  aside:
    "Both regimes require a stated ground for every purpose. Where they differ, both are named.",
};

export const GROUNDS_TABLE: LegalTable = {
  columns: ["Purpose", "Legal basis (GDPR)", "Ground (DPDP Act)"],
  widths: ["xl:w-60", "xl:w-85"],
  rows: [
    {
      heading: "Replying to your enquiry",
      cells: [
        text(
          "Steps prior to entering a contract, or our legitimate interest in answering people who approach us (Art. 6(1)(b), (f)).",
        ),
        text(
          "You voluntarily provided it for this purpose and have not asked us to stop (s.7(a)).",
        ),
      ],
    },
    {
      heading: "Delivering a project or managed service",
      cells: [
        text("Performance of the contract with your organisation (Art. 6(1)(b))."),
        text("Consent, or voluntary provision for the stated purpose (s.6, s.7(a))."),
      ],
    },
    {
      heading: "Assessing a job application",
      cells: [
        text("Steps prior to an employment contract (Art. 6(1)(b))."),
        text("You voluntarily provided it for this purpose (s.7(a))."),
      ],
    },
    {
      heading: "Meeting tax, accounting and statutory duties",
      cells: [
        text("Compliance with a legal obligation (Art. 6(1)(c))."),
        text("Compliance with law in force in India (s.7(b))."),
      ],
    },
    {
      heading: "Keeping this site available and secure",
      cells: [
        text("Our legitimate interest in running the site safely (Art. 6(1)(f))."),
        confirm("confirm the ground once logging is settled"),
      ],
    },
    {
      heading: "Sending marketing you asked for",
      cells: [
        text("Your consent, withdrawable at any time (Art. 6(1)(a), Art. 7(3))."),
        text("Your consent, withdrawable as easily as it was given (s.6(4), s.6(6))."),
      ],
    },
  ],
};

export const RETENTION_CALLOUT = {
  title: "Retention is the gap to close before publishing.",
  body: "Each purpose above needs a stated retention period or the criteria used to set one. GDPR Art. 13(2)(a) and the DPDP erasure duty under s.8(7) both turn on it.",
} as const;

export const DISCLOSURE_HEADING: SectionHeading = {
  eyebrow: "Disclosure",
  title: "Who we share it with",
};

export const DISCLOSURE_INTRO =
  "We do not sell personal data and we do not share it for anyone else’s marketing. We share it only with processors acting on our documented instructions, with professional advisers where we must, and where the law compels us.";

export const DISCLOSURE_ROWS: readonly DefinitionRow[] = [
  { term: "Hosting and infrastructure", value: confirm("name the provider and region") },
  { term: "Email and CRM", value: confirm("name the provider") },
  { term: "Analytics", value: confirm("name it, or state plainly that none runs") },
  {
    term: "Recruitment tooling",
    value: confirm("name it, or state that applications arrive by email"),
  },
  {
    term: "Professional advisers",
    value: text("Auditors and legal advisers, bound by confidentiality."),
  },
  {
    term: "Statutory disclosure",
    value: text("Where a court, regulator or law in force requires it."),
  },
];

export const TRANSFERS_HEADING: SectionHeading = {
  eyebrow: "Transfers",
  title: "Sending data outside its home jurisdiction",
};

export const TRANSFERS_INTRO =
  "We are based in India. If you are in the EEA or the UK, replying to you or delivering a project means your data is handled in India, which is a transfer under Chapter V of the GDPR and needs a lawful mechanism — in practice Standard Contractual Clauses plus a transfer risk assessment. The DPDP Act permits transfer out of India except to countries the Central Government restricts.";

export const TRANSFERS_ROWS: readonly DefinitionRow[] = [
  {
    term: "Transfer mechanism relied on",
    value: confirm("SCCs, UK IDTA/Addendum, or an adequacy finding"),
  },
  { term: "Transfer risk assessment", value: confirm("attach the completed TRA") },
  {
    term: "Countries data reaches",
    value: confirm("list them, including processors’ regions"),
  },
  {
    term: "Restricted countries (DPDP s.16)",
    value: confirm("check the current notified list before publishing"),
  },
];

export const RIGHTS_HEADING: SectionHeading = {
  eyebrow: "Rights",
  title: "What you can ask us to do",
  aside:
    "Your rights depend on which law applies to you. Both sets are listed so you can see the difference.",
};

export interface RightsList {
  readonly title: string;
  readonly items: readonly string[];
}

export const RIGHTS_LISTS: readonly RightsList[] = [
  {
    title: "Under the GDPR — EEA and UK",
    items: [
      "Access a copy of the personal data we hold about you (Art. 15).",
      "Have inaccurate data corrected (Art. 16).",
      "Have data erased where the grounds apply (Art. 17).",
      "Restrict how we use it while a dispute is resolved (Art. 18).",
      "Receive it in a portable, machine-readable form (Art. 20).",
      "Object to processing based on legitimate interests (Art. 21).",
      "Withdraw consent at any time, without affecting what we did before (Art. 7(3)).",
      "Complain to a supervisory authority (Art. 77).",
    ],
  },
  {
    title: "Under the DPDP Act, 2023 — India",
    items: [
      "Obtain a summary of the personal data we process and what we do with it (s.11).",
      "Know which Data Fiduciaries and Processors we have shared it with (s.11).",
      "Have it corrected, completed, updated or erased (s.12).",
      "Have your grievance answered by our Grievance Officer before approaching the Board (s.13).",
      "Nominate another person to exercise your rights if you die or become incapacitated (s.14).",
      "Withdraw consent as easily as you gave it (s.6(4), s.6(6)).",
      "Complain to the Data Protection Board of India if we do not resolve it (s.13(3)).",
      "Expect us to notify you and the Board of a personal data breach (s.8(6)).",
    ],
  },
];

export const EXERCISE_HEADING: SectionHeading = {
  eyebrow: "Process",
  title: "How to exercise them",
};

export const EXERCISE_INTRO =
  "Write to the privacy contact below. We will ask for enough information to be sure who you are, and we will not charge you for a first request.";

export const EXERCISE_ROWS: readonly DefinitionRow[] = [
  { term: "Where to write", value: confirm("dedicated privacy mailbox") },
  {
    term: "Our response time",
    value: text(
      "Within one month for a GDPR request (Art. 12(3)), extendable by two months for complex requests if we tell you why.",
    ),
  },
  { term: "DPDP grievance response", value: confirm("state your own published turnaround") },
  {
    term: "If you are not satisfied (EEA/UK)",
    value: text(
      "You may complain to your local supervisory authority. You do not have to come to us first.",
    ),
  },
  {
    term: "If you are not satisfied (India)",
    value: text(
      "Raise it with our Grievance Officer first. If it is still unresolved, you may approach the Data Protection Board of India.",
    ),
  },
];

export const COOKIES_HEADING: SectionHeading = {
  eyebrow: "Cookies",
  title: "Cookies and similar technologies",
};

export const COOKIES_INTRO =
  "The map on our Contact page loads only when you choose to load it, so no third-party cookies are set before you ask for them. That is a deliberate design decision and it is worth keeping.";

export const COOKIES_ROWS: readonly DefinitionRow[] = [
  { term: "Strictly necessary cookies", value: confirm("list them, or state that none are set") },
  {
    term: "Analytics or marketing cookies",
    value: confirm("list them and the consent mechanism, or state that none run"),
  },
  {
    term: "Consent banner",
    value: confirm("confirm whether one is needed once the above is settled"),
  },
  {
    term: "Separate cookie policy",
    value: confirm("the footer links to one — write it or remove the link"),
  },
];

export const CHILDREN_HEADING: SectionHeading = {
  eyebrow: "Children",
  title: "Children’s data",
};

export const CHILDREN_PARAGRAPHS: readonly string[] = [
  "This is a business-to-business site and it is not directed at children. We do not knowingly collect data from anyone under 18.",
  "The DPDP Act treats anyone under 18 as a child and requires verifiable parental consent before processing their data, and prohibits tracking, behavioural advertising and monitoring directed at them (s.9). The GDPR sets the information-society-services age between 13 and 16 depending on the member state. If you believe a child has sent us personal data, tell us and we will delete it.",
];

export const UPDATES_HEADING: SectionHeading = {
  eyebrow: "Updates",
  title: "Changes to this policy",
};

export const UPDATES_INTRO =
  "When this policy changes materially we will update the effective date at the top, and where the change affects how we use data you have already given us, we will tell you directly rather than relying on you to re-read the page.";

export const UPDATES_ROWS: readonly DefinitionRow[] = [
  { term: "Version history", value: confirm("keep a dated changelog — regulators ask for it") },
  { term: "Notification method", value: confirm("email, in-product notice, or both") },
];
