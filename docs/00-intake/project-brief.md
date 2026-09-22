---
artifact: project-brief
phase: 0
status: approved
version: 1
updated: 2026-09-22
owner: orchestrator
depends_on: []
---

# Project Brief: TAMS Infotech Website

## Problem

TAMS Infotech is an SAP partner company. It needs a public landing website that
presents the company and its SAP services to prospective clients. The site MUST let
visitors send an enquiry through a contact form. Phase 1 defines the page content,
services, and conversion goals.

## Working name

- **Name:** TAMS Infotech Website
- **Slug:** `tams-infotech-website`

## Intended users

- **Visitors:** prospective clients evaluating TAMS Infotech for SAP work.
- **Enquiry recipients:** TAMS Infotech staff who receive contact-form submissions by
  email.
- **Maintainer:** one developer, after handoff.

Phase 1 refines these personas.

## Deployment target

Container platform. The site ships as one container image running the Node server
that Astro's Node adapter builds. The specific platform is not yet chosen.

## Hard constraints

1. **Existing design.** A UI design already exists in a Paper design file. It is the
   design and the design system for this project. Agents MUST NOT create an independent
   design. The user provides the Paper link when Phase 3 asks for it.
2. **Contact form.** The site MUST capture enquiries through a contact form.
3. **Email delivery.** Enquiries MUST be delivered to a company inbox by SMTP.
4. **Privacy regulation.** The site MUST comply with the EU GDPR and India's DPDP Act.
   This implies a privacy policy and consent handling for non-essential cookies.
5. **SAP brand guidelines.** Any use of SAP names, logos, or partner badges MUST follow
   SAP partner branding rules.
6. **Maintenance.** One developer maintains the site after handoff. Operational
   complexity MUST stay within what one person can run.

## Explicitly out of bounds

- User accounts, login, authentication, or a client portal.

## Open for Phase 1

- Page inventory, sections, and copy source.
- Whether a CMS, blog, or multiple languages are needed. The user did not exclude them.
- Which SAP partner tier and badges apply.
- Enquiry recipient address, spam protection, and acknowledgement emails.
- Analytics, and therefore which cookies need consent.
- Container platform and domain.
