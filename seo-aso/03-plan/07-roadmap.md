# SEO + ASO roadmap (prepared 2026-10-15)

Priorities: P0 = blocks everything else or is a compliance risk; P1 = direct effect on reach or conversion; P2 = compounding improvements; P3 = housekeeping. Effort: S ≤ half a day, M = 1–3 days, L = a week or more. Impact and confidence are judgments from the evidence in `01-discovery/`, not forecasts. No traffic or install growth is promised.

## Phase 1 — Critical fixes and corrections (week 1–2)

| ID | Task | Priority | Impact | Confidence | Effort | Depends on | Owner | Acceptance criteria | Validation |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Apply `docs/seo-changes-2026-10` in the website repo (your checkout, no merge), build with `build:seo`, upload, attach CloudFront function (runbook §1–4) | P0 | high | high | M | AWS access | website | all 19 sitemap URLs 200 with own title/H1; unknown paths 404 | curl loop in runbook §4; GSC URL inspection |
| 1.2 | Real GTM id + GA4 + consent banner; Search Console verified; sitemap submitted | P0 | high (measurement) | high | M | 1.1 | analytics | GA4 shows page_view and download_click; GSC sitemap "Success" | Tag Assistant; GSC |
| 1.3 | Correct inaccurate store copy now (remove "verified", "stories"; fix "High knes"; add burpees) using the full descriptions in packages 02/03 | P0 | medium | high | S | — | ASO | live descriptions match package text | re-fetch listings |
| 1.4 | Publish privacy disclosures: policy paragraph, Play Data safety, Apple privacy labels (package 05) | P0 | compliance | medium (legal review) | M | legal sign-off | product/legal | forms updated; policy "last updated" changed | store pages show new labels |
| 1.5 | Update Play privacy URL to `/privacy` and Apple support URL to `/contact-us` after 1.1 | P1 | low | high | S | 1.1 | ASO | URLs return 200 | curl |
| 1.6 | Replace Play short description (drop "Free workout app!") with the package text | P1 | medium | medium | S | — | ASO | 80-char field published | re-fetch |
| 1.7 | `www` DNS + redirect; HSTS headers | P1 | low | high | S | AWS | website | runbook §5 checks | curl |
| 1.8 | Fix `sameAs`/footer handles to @buzzend.official, restore TikTok | P2 | low | high | S | — | website | links resolve | manual |

## Phase 2 — Keyword targeting and listing optimisation (week 2–5)

| ID | Task | Priority | Impact | Confidence | Effort | Depends on | Owner | Acceptance criteria | Validation |
|---|---|---|---|---|---|---|---|---|---|
| 2.1 | App Store release with name `Buzzend: AI Squat Rep Counter`, subtitle `Fitness Challenges w/ Friends`, 100-byte keyword field, description, promo text (package 02) | P1 | high | medium | S (+ release) | app release train | iOS + ASO | fields match package, approved by App Review | ASC; harvest script ranks after 2–4 weeks |
| 2.2 | Play title/short/full description per package 03 | P1 | high | medium | S | 1.3 | ASO | live within 24 h | re-fetch; Console search terms within 4 weeks |
| 2.3 | New screenshots per storyboard (10 iOS, 8 Play, tablet 4) from real screens | P1 | medium | medium | L | design | marketing | first shot shows a count mid-set; no price/ranking words | upload + review |
| 2.4 | Feature graphic with exercise names; replace promo video with 20–30 s UI capture | P2 | medium | low | M | 2.3 | marketing | assets within Play specs | Console accepts |
| 2.5 | Three custom product pages (squat, push-up, friends) with keywords assigned | P2 | medium | medium | M | 2.1, 2.3 | ASO | CPPs live with keywords | ASC Acquisition by CPP |
| 2.6 | Add `pt=` provider token to website store links | P2 | low | high | S | — | website | campaign appears in ASC Campaigns | ASC |
| 2.7 | Paste Keyword Planner / ASO tool volumes into `data/master-keyword-evidence.csv` and re-prioritise | P2 | medium | high | S | exports (Q9) | SEO | volume columns filled for the shortlist | file review |

## Phase 3 — Landing pages and content (week 3–10)

| ID | Task | Priority | Impact | Confidence | Effort | Depends on | Owner | Acceptance criteria | Validation |
|---|---|---|---|---|---|---|---|---|---|
| 3.1 | Homepage, `/challenges`, `/app-guide`, `/faqs`, `/blogs` metadata and copy per package 04 §B | P1 | high | medium | M | 1.1 | website + SEO | titles/descriptions/H1s match package; legacy workout words gone | prerender output |
| 3.2 | Remove five blog stubs; 301 map; add dates/authors to remaining posts; BlogPosting fields | P1 | medium | high | S | 1.1 | website | stubs 301 → /blogs; schema valid | Rich Results Test |
| 3.3 | New pages `/ai-rep-counter`, `/squat-counter-app`, `/push-up-counter-app` (outlines in 04 §C), added to sitemap | P1 | high | medium | L | 3.1 | SEO + website | ≥800 words each, real screenshots, internal links | GSC indexed; impressions for target terms |
| 3.4 | Articles 1–5 of the content roadmap (04 §G) | P1 | medium | medium | L | 3.2 | marketing/SEO | published with author, date, sources | GSC |
| 3.5 | Articles 6–10 | P2 | medium | low | L | 3.4 | marketing/SEO | same | GSC |
| 3.6 | Prerender fetches public challenges at build time (T10) | P2 | low | medium | M | 1.1 | website | `/challenges` snapshot lists live challenges | view-source |
| 3.7 | `/sit-up-counter-app` only if the first two exercise pages earn impressions | P3 | low | low | M | 3.3 data | SEO | — | GSC |

## Phase 4 — Conversion experiments and growth loops (week 6–12)

| ID | Task | Priority | Impact | Confidence | Effort | Depends on | Owner | Acceptance criteria | Validation |
|---|---|---|---|---|---|---|---|---|---|
| 4.1 | Web fallback for `/link/*`: prerendered landing with correct Open Graph per link type, store buttons, "Join with code" explainer; Play Install Referrer payload for deferred deep link on Android | P1 | high (invite loop) | medium | L | 1.1; Android work | website + Android | a friend without the app sees the challenge name and a store button; Android install opens the challenge | device test |
| 4.2 | Route the backend streak-invite URL (`/invite/accept?token=`) to a `/link/invite/…` path handled by both apps and the web fallback | P1 | medium | medium | M | backend + apps | backend + mobile | tapped invite restores the streak flow | device test |
| 4.3 | Play experiment E1 (screenshot order), then E2 (feature graphic), one at a time | P2 | medium | low (traffic) | S each | 2.3 | ASO | run until Console declares a result | Console |
| 4.4 | Apple PPO (current vs counter-first order) once weekly impressions > ~500 | P2 | medium | low | S | 2.1, 2.3 | ASO | ≥90 % confidence before applying | ASC |
| 4.5 | Review prompts: keep the 3-workout trigger; reply to every review within 7 days | P2 | medium | medium | S ongoing | — | marketing | reply rate 100 % | store pages |
| 4.6 | Share card: add the `/link/posts/{id}` URL and "counted by Buzzend" mark to shared clips | P3 | low | low | M | mobile | mobile | shared clip carries a working link | device test |

## Phase 5 — Authority and continuous optimisation (month 3+)

| ID | Task | Priority | Impact | Confidence | Effort | Depends on | Owner | Acceptance criteria | Validation |
|---|---|---|---|---|---|---|---|---|---|
| 5.1 | Outreach for links and mentions: calisthenics and home-workout blogs, app-review sites, fitness creators (angles: multi-exercise camera counting on Android, honest accuracy post, challenge templates) | P2 | medium | low | ongoing | 3.3–3.5 | marketing | ≥5 relevant referring domains in 90 days (not purchased) | GSC Links report |
| 5.2 | Original data piece: anonymised, aggregated counting stats (e.g. most common miscount reasons) with consent-compliant sourcing | P3 | medium | low | L | 1.4 | product + marketing | published with methodology | links earned |
| 5.3 | Monthly rank harvest (tools/) and quarterly keyword re-prioritisation | P2 | medium | high | S | — | SEO | dated outputs in `data/` | file review |
| 5.4 | Country-specific Play custom listing (Nepal) and other localisations — deferred per decision Q2 | P3 | — | — | M | decision | ASO | — | — |
| 5.5 | Resolve the public GitHub Pages exposure — left as is per decision Q6; revisit if anything in it becomes sensitive | P3 | — | — | S | decision | repo owner | — | — |
