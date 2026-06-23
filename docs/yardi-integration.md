# Yardi / RentCafe Integration — Plan & Decision Record

_Property: Mona Shores Flats (267 Seminole Rd, Norton Shores, MI 49444) · Gulker Group / Fusion Properties LLC_
_Last updated: 2026-06-23_

This is the durable record of **how the marketing site connects to Yardi**, what we shipped, and the
exact next steps to deepen it. It is written to be **reused for the next property** — see
`docs/conversion-and-seo-playbook.md` for the matching launch checklist.

---

## TL;DR

- **Integration is already partially live.** Mona Shores Flats has a Yardi/RentCafe tenant: the apply
  flow runs at `monashoresflats.securecafe.com` (SecureCafe = Yardi's legacy RentCafe online-leasing
  domain). The question was never "is it possible" — it's "how deep do we wire it in."
- **We shipped Tier 1 (zero-API).** Apply Now + Resident Login + Check-Live-Availability links, in the
  nav, hero, CTA band, contact panel, sticky mobile bar, and chatbot — all pointing at the existing
  Yardi/RentCafe pages. No Yardi approval needed.
- **Next up (needs the Yardi rep):** push website leads into Yardi as guest cards via the **email
  parser** (no API license), then optionally pull **live floor-plan pricing/availability** via the
  RentCafe API (vendor-gated, transaction-priced).
- **Do NOT build** a custom embedded application or resident-portal SSO for a single property — the
  hosted RentCafe flows already cover it for free.

---

## Yardi product map (plain English)

| Product | What it is | Do we need it? |
|---|---|---|
| **Voyager** (or **Breeze**) | Core property-management system; system of record for units, leases, ledgers, prospects ("guest cards"). | Yes — already in use by management. |
| **RentCafe** (suite) | Marketing + leasing + resident layer on top of Voyager. Umbrella for the modules below. | Yes — already provisioned. |
| · RentCafe **Online Leasing** | The online application + lease e-sign flow. **This is the `…/onlineleasing/…/guestlogin.aspx` link.** | ✅ In use. |
| · RentCafe **Resident** portal | Residents pay rent, submit work orders, view ledger/lease; + mobile app (and optional white-label "MyCafe"). Hosted on a Yardi domain. | ✅ Linked (Resident Login). |
| · RentCafe **ILS** | Lists/syndicates units on RentCafe.com from Voyager. | Optional. |
| · RentCafe **CRM** | Leasing-team lead pipeline inside RentCafe/Voyager. | Where leads should land. |
| **SecureCafe** | The **legacy domain/brand** for the same RentCafe engine. `monashoresflats.securecafe.com` is exactly this. | Already the live host. |
| **RentCafe Connect** | Outsourced contact center / AI leasing assistant; writes guest cards. | Optional add-on. |
| **RentCafe API** (APIv2) | Web-service API: `getfloorplans`, `getapartmentavailability`, `createlead`. Transaction-priced, annual cap. **Vendor-gated** (signed Common-Client agreement). | Only for Tier 2/3. |
| **Voyager API / Standard Interface** | Deep PMS integration; Standard Interface Partner Program (vendor-only: ≥2 yrs, ≥3 mutual clients). | Not for us. |

---

## The two functions you asked about

### 1. Online application / online leasing
Four options, easiest → hardest:
- **(a) Deep-link to the guestlogin page — what we do.** Zero API, fully supported, standard practice.
- (b) RentCafe-hosted property website — replaces our site; not wanted.
- (c) iframe embed — not recommended (Yardi sets framing/security headers; breaks payments/PII; hurts conversion).
- (d) Custom application via RentCafe API — heavy, vendor-gated, you'd reimplement screening/payments/lease
  compliance the hosted flow already provides. **Not worth it for one property.**

**Decision: keep (a).** We polished the CTAs around it.

### 2. Resident portal (pay rent / maintenance / ledger)
This is **RentCafe Resident**, always a **hosted Yardi-domain login** (no supported embed/SSO for a small
operator). From the marketing site we add a **"Resident Login"** button + app-store links — done.

---

## What we shipped (Tier 1 — zero API)

| Change | Where | Link target |
|---|---|---|
| **Resident Login** | Nav + contact panel | `…/residentservices/mona-shores-flats/userlogin.aspx` ⚠️ verify exact URL |
| **Apply Now** | CTA band, contact panel, sticky mobile bar, chatbot | `…/onlineleasing/mona-shores-flats/guestlogin.aspx` |
| **Check Live Availability** | Hero, floor-plan cards, chatbot | RentCafe listing page (live pricing) |
| **Pricing reconciled to live data** | Floor plans, chatbot, email | see "Data reconciliation" below |
| **Barrier-Free (ADA) plan added** | Floor plans, schema | was missing from the site entirely |

> ⚠️ **Verify before launch:** the Resident Login URL follows the standard SecureCafe pattern
> (`…/residentservices/<slug>/userlogin.aspx`) but was **not confirmed reachable** (SecureCafe blocks
> automated fetches). Ask the Yardi rep for the exact resident-services URL and the app-store links.

---

## Tier 2 — lead push + live availability (needs the Yardi rep)

### 2a. Lead push → Yardi guest cards (recommended, no API license)
Today leads land in Supabase (`leads` table) via the `submit-msf-lead` Edge Function. To get them into
Voyager so the leasing team works one pipeline, use the **email parser** (lowest friction):

1. Ask RentCafe/Yardi support for the property's **lead "parser" email address**
   (_"we want website leads to flow in as guest cards via the email parser"_).
2. In `submit-msf-lead/index.ts`, after the Supabase insert, also send a formatted email (via the
   existing Resend integration) to that parser address. The function already builds a `notes` string in
   the rentcafe-style format — reuse it. Sketch:

   ```ts
   // after the Supabase insert succeeds
   const PARSER_EMAIL = Deno.env.get('YARDI_PARSER_EMAIL') // e.g. p0xxxxx@…rentcafe.com
   if (PARSER_EMAIL) {
     await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({
         from: 'Mona Shores Flats Web <makennak@gulkergroup.com>',
         to: [PARSER_EMAIL],
         subject: `New Guest Card — ${name}`,
         text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n` +
               `Move-in: ${unitType ?? 'n/a'}\nSource: Website\n${notes}`,
       }),
     })
   }
   ```
   Confirm the **exact field format** the parser expects with the rep (formats vary).

- **Prereq:** parser address from Yardi. **Cost:** included in RentCafe license. **Effort:** ~1 day + 24–48h Yardi-side.
- **Upgrade path:** swap the email for the RentCafe API `createlead` call once a vendor relationship exists.

### 2b. Live availability/pricing feed (optional — only via an API-licensed vendor)
Replace hard-coded floor-plan prices with live data from `getfloorplans` / `getapartmentavailability`
(cache server-side 1–2×/day; never call per page load). **Gate:** requires the RentCafe API token +
Marketing API enabled per property, which in practice means going through an **approved RentCafe API
partner** — Yardi does not hand single properties their own API license. Until then we display
**"From $X — see live availability"** and deep-link to the RentCafe listing (honest, never stale).

---

## Tier 3 — full embedded application + resident SSO
**Not recommended.** Requires the RentCafe API Access Agreement (vendor/Common-Client gated),
Standard-Interface-Partner qualification for a custom build, transaction fees, and reimplementing
screening/payments/lease compliance. There is **no supported resident-portal embed/SSO** for a small
operator regardless. The hosted flows already do all of this.

---

## The exact ask for the Yardi rep

> Hi — for **Mona Shores Flats** I need:
> 1. The exact **Resident Services URL** (the `…/residentservices/…/userlogin.aspx` for this property)
>    and the iOS/Android **RentCafe Resident app** links.
> 2. To enable **website leads as guest cards via the email parser** — what's the property's parser
>    email address and the expected field format?
> 3. If we later want **live pricing on our site**: can you enable the **Web Services API + Marketing
>    API** for this property, and is that only available through an approved RentCafe API partner?
>    What are the transaction / annual-cap costs?
> 4. Please confirm our **Company code (Cxxxxxxxx)** and **property code (p0xxxxx)**.

(The property already has a RentCafe presence, so an account + account rep already exist.)

---

## Data reconciliation (live listing vs. old site)

Verified against RentCafe (live) + the Gulker Group developer page; aggregators were 403-blocked.

| Item | Old site | Corrected to | Status |
|---|---|---|---|
| 1BR | $1,425 · 834–934 sqft | from $1,425 · **834 sqft** | adjusted |
| **Barrier-Free 1BR** | _missing_ | **$1,525 · 931 sqft (ADA)** | **added** |
| 2BR | $1,750 · 1,050–1,200 sqft | from **$1,685** · **1,087–1,097 sqft** | corrected |
| 3BR | $2,100–$2,375 · up to 1,421 | from **$2,085**–$2,375 · 1,315–1,421 | corrected |
| Pickleball, dog run, playground, clubhouse | _missing_ | **added to amenities + schema** | **added** |
| Granite/island, stainless, high ceilings, LVT | partial | added to features + chatbot | added |
| Built 2025 · 120 units · pet friendly | ✅ | confirmed | unchanged |

**Verify before relying on:** (1) the first-month-free special — appears on aggregators/official site
but was NOT on the RentCafe banner when checked; confirm it's still live. (2) lat/long in the JSON-LD
(`43.1663, -86.2470`) is approximate — replace with the surveyed coordinate. (3) "basketball court"
appeared in only one source — left OFF the site as unconfirmed.

---

## Reusable per-property workflow (compound engineering)

Each new Gulker/Fusion property should reuse this exact sequence — it gets cheaper every time:

1. **Confirm the RentCafe footprint:** is there a `<slug>.securecafe.com` (or rentcafe.com) tenant?
   Get the online-leasing + resident-services URLs and the property/company codes.
2. **Reconcile data** from RentCafe (live) + the developer page before writing any copy.
3. **Ship Tier 1** from the template: Apply / Resident Login / Check Availability CTAs + sticky mobile
   bar + schema/geo (see playbook).
4. **Wire the lead parser** (Tier 2a) into the shared Supabase Edge Function — the `leads` table is
   already multi-property (`property_id`), so only the parser email + property_id differ.
5. **Decide on the availability feed** (Tier 2b) once; if a vendor relationship is established it
   applies to every property at once.

### Sources
- RentCafe API program & pricing: https://www.yardi.com/news/press-releases/yardi-announces-new-rentcafe-api-program/
- RentCafe API Terms of Use (access gating + endpoints): https://resources.yardi.com/legal/rc-api-tou/
- Lead delivery — guest card API vs email parser: https://propertyhelp.apartments.com/article/1166-how-do-i-send-leads-to-my-crm-with-yardi
- RentCafe Resident portal: https://www.yardi.com/product/rentcafe-living-resident/
- RentCafe Online Leasing: https://www.yardi.com/product/rentcafe-living-online-leasing/
- Become a Yardi Interface Partner: https://www.yardi.com/company/become-an-interface-partner/
- Practical credential setup: https://support.leasehawk.com/resource/setup-rentcafe-integration
