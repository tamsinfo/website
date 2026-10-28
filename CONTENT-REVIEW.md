# Content review before launch

The brief asks for every claim to be verified before publication. This is the list of what the
site currently says, where it came from, and what still needs a decision from TAMS.

## Sources used

- **tamsinfotech.com (October 2026)**: company name, the three office addresses, phone
  (+91 80 4130 1039), email (info@tamsinfotech.com), "SAP partner", "over a decade of
  experience", and the industries the current site lists.
- **Gate Entry**: `gatepass-rehaul` README and `db/schema.cds`. Pass types, approval rules,
  weighbridge, gates, print slips with QR codes, audit trail, role-based apps, CAP + SAPUI5 +
  HANA Cloud on BTP Cloud Foundry, and the S/4HANA OData services it reads.
- **EXIM**: `exim` README, `docs/00-intake/project-brief.md`, `docs/01-planning/mvp-scope.md`.
  ICEGATE, DGFT licences, letters of credit, Class III DSC signed on the user's device,
  tamper-evident audit trail, India data residency, one deployment per customer,
  S/4HANA Cloud and on-premise via Cloud Connector, ECC and Business One out of scope.
- **Custom build examples**: `childbillet` (Child Billet Management, Fiori) and `sotransfer`
  (sales-order stock transfer, RAP + SAPUI5, movement types 411/413).

## Needs a decision or confirmation

| Where | What the site says | What to confirm |
| --- | --- | --- |
| Home, About | "SAP partner" | The current site shows an SAP Gold Partner badge. Confirm the current partner level before naming it. |
| Home | "Over a decade of SAP work … across manufacturing, pharmaceuticals, automotive, mining, chemicals and retail" | Taken from the current site's industry list. Confirm. |
| Custom Application Build | Child-billet release app and SO stock transfer app cited as recent examples (client unnamed) | Confirm these may be described publicly. |
| EXIM | Described from the approved MVP scope | Confirm what is live today versus in development, and whether automated portal submission should be mentioned as roadmap. |
| Digital Signature, Vendor Portal, Production Process, Connected Factory, Digital Manufacturing & AI | Marked on each page as "intended scope, confirmed in a walkthrough"; diagrams labelled conceptual | Supply product documentation so these can move to "documented", or confirm the wording. |
| Digital Signature | No legal-validity claim | Confirm certificate types and jurisdictions before saying more. |
| License Procurement | "Contracting route confirmed for each engagement"; no reseller claim | Confirm TAMS's actual SAP licensing role. |
| Managed Services | No published SLA figures | Intentional, per the brief. |
| Industry pages | No case studies; CTA offers references | Supply verified case studies if they exist. |
| Home "Typical routes" | Presented as paths, not bundles | Intentional, per brief §3.5. |
| Client logos | None shown | The current site shows client logos (TATA, Cipla, Biocon, etc.). Add them only with permission and official assets. |
| Brand mark | A new three-block "T" mark and wordmark | Replace with the official logo if the existing identity is kept. |

## Contact form

Without `VITE_CONTACT_ENDPOINT` the form opens the visitor's email app with the enquiry written
out to info@tamsinfotech.com, and says so on screen. Set the variable to an endpoint that accepts
a JSON `POST` to submit directly.
