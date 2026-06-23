# Apartment Website — Conversion & Local-SEO Playbook

_A reusable checklist for Gulker/Fusion property marketing sites. Applied to Mona Shores Flats
2026-06-23; reuse for the next property._

This is the **compounding asset**: research-backed best practices distilled into a checklist so each new
property launch is a copy-edit, not a re-research. Pair with `docs/yardi-integration.md`.

---

## A. CTA / conversion checklist

- [x] **One primary CTA, repeated everywhere: "Schedule a Tour."** Most renters aren't ready to apply
      from the homepage — tour is the strongest first ask for a lease-up.
- [x] **Secondary CTAs:** "Apply Now" (RentCafe) and "Check Live Availability" (RentCafe listing).
- [x] **Sticky mobile bottom bar** (Tour / Call / Apply) — 84% of apartment search is mobile; single
      biggest mobile win.
- [x] **Sticky header** with persistent CTA + click-to-call.
- [x] **CTAs directly beneath the floor-plan cards.**
- [x] **Click-to-call + click-to-text** (`tel:` / `sms:`) everywhere the phone appears.
- [x] **Specials/urgency** banner ("First month free…") — kept Fair-Housing-neutral.
- [x] **Action-specific button copy.** No "Submit / Contact Us / Learn More."
- [ ] **Speed-to-lead:** fastest first response wins. Consider an AI assistant that books tours 24/7
      (the site already has a scripted+AI chatbot; a true calendar booking is the upgrade).
- [ ] **Real-time tour calendar** (RentCafe / PERQ / AI) instead of the request form — future upgrade.
- [ ] **Reviews/ratings** displayed once collected (also feeds the Google Map Pack).

## B. Fair Housing & accessibility (do not skip)

- [x] **Equal Housing Opportunity** logo + statement in the footer.
- [x] **Alt text** on every meaningful image, including floor-plan/amenity photos.
- [x] **Fair-Housing-neutral copy** — describe the property, not the ideal resident. Avoid "perfect for
      young professionals," "great for families/singles," "walking distance," etc.
- [ ] **WCAG 2.1 AA pass** — color contrast, keyboard nav, focus states, labeled fields. (Spot-checked;
      run a full audit before launch.)
- [ ] **Vet the chatbot script** — HUD holds providers liable for AI-generated discriminatory output.
- [ ] **Paid social** must use Facebook's housing "Special Ad Category"; never target by age/gender/ZIP.

## C. Geo / local SEO checklist

- [x] **Structured data (JSON-LD):** `ApartmentComplex` + per-plan `Product/Offer` + `FAQPage` in
      `<head>`. Validate with Google's Rich Results Test after each data change.
- [x] **Geo meta tags** (`geo.region/placename/position`, `ICBM`) — Bing/Yahoo use them (Google ignores).
- [x] **Open Graph + Twitter Card** tags for rich local sharing.
- [x] **Canonical URL.**
- [x] **Embedded Google Map** of the property.
- [x] **Neighborhood / "what's nearby" content** (Mona Lake, Mona Shores schools, Muskegon employers,
      US-31 commute) — proximity is a real ranking signal.
- [ ] **Google Business Profile** claimed & optimized at the exact address — the route into the Map Pack
      that ILSs (Apartments.com/Zillow) can't enter. **Highest-impact off-site task.**
- [ ] **NAP consistency** — identical Name/Address/Phone on site, GBP, RentCafe, Apartments.com, Zillow,
      Facebook. Use one consistent local number.
- [ ] **Collect Google reviews** from leasing residents — drives Map Pack ranking + AI Overviews.
- [ ] **Listings complete** on Apartments.com, Zillow, RentCafe ILS (compete on branded/suburb/long-tail;
      own the Map Pack).

## D. Per-property launch sequence

1. Reconcile data from RentCafe (live) + developer page.
2. Copy this site as the template; swap copy, photos, pricing, address, slug.
3. Replace **all** placeholder schema/meta values (lat/long, address, phone, URL, prices) — invalid or
   misleading structured data is worse than none.
4. Wire Tier 1 Yardi links (see yardi-integration.md).
5. Claim/optimize GBP; sync NAP across ILSs; start review collection.
6. Run Rich Results Test + a WCAG audit before going live.

### Key sources
RentVision, Digible, LCP Media, RealPage, The Reside Desk (CTA/conversion) · NMHC/Grace Hill (tours) ·
Respage/Funnel (AI leasing) · Market Apartments, DOJ/HUD, Converge Accessibility (Fair Housing/ADA) ·
Reach by RentCafe, Agency FIFTY3, The Media Captain (local SEO/GBP) · schema.org (structured data).
