# What Buzzend needs to do to raise user flow

Prepared 2026-10-15 for Avinaya and the Buzzend team. Everything here comes from the discovery audit (`../01-discovery/`), the keyword and competitor research (`../02-research/`) and your answers to the ten questions. Nothing has been published; every store or site change waits for your go.

## The short version

Buzzend's shortage is reach, not conversion. Fewer than 2,000 people a month see the app in either store, the website has one indexable page, and invitations from existing users die on a 404. The listing itself converts: on Google Play about half of the people who reach it install. So the order of work is:

1. **Unblock (week 1–2):** deploy the already-built website pages, wire analytics and Search Console, correct the inaccurate store claims, publish the privacy disclosures.
2. **Get found (week 2–5):** counter-first store metadata that covers the exercise searches Buzzend is missing today, new screenshots, three custom product pages.
3. **Earn search traffic (week 3–10):** fix the website copy, replace the legacy blog, publish the rep-counter hub and two exercise pages, then ten articles on topics no competitor covers.
4. **Stop the leak (week 6–12):** give invite and share links a web landing page and a deferred deep link so friends without the app can still join.
5. **Measure weekly and iterate (ongoing):** one dashboard, one decision a week, monthly rank checks with the scripts in `../tools/`.

## Decisions you made (2026-10-15)

| # | Decision | What it changes |
|---|---|---|
| 1 | Counter-first store name | Name `Buzzend: AI Squat Rep Counter`; friends/challenges move to the subtitle and short description |
| 2 | All English markets equally | One English listing and one website; no Nepal- or US-specific work in the first 90 days (the Nepal-heavy install base is noted for later) |
| 3 | Android `NEW_EXERCISES` flag is on in production | Seven exercises named everywhere, including burpees and high knees |
| 4 | Draft the privacy disclosures too | Package 05 covers the policy paragraph, Play Data safety and Apple labels; the truthful on-device message becomes usable |
| 5 | You deploy the website by hand, from your current checkout, no pulls or merges | Runbook in package 01; code changes specified in the website repo at `docs/seo-changes-2026-10/` |
| 6 | Leave GitHub Pages as is | Noted as a risk only (roadmap 5.5) |
| 7 | Remove the five legacy blog stubs and redirect | Redirect map and replacement content in package 04 |
| 8 | Deliverables as markdown in this repo | This folder |
| 9 | Exports coming: App Store Connect, Play Console, Search Console + GA4, a keyword-volume tool | Volume columns in `../data/master-keyword-evidence.csv` get filled; dashboard goes live |
| 10 | Handles `@buzzend.official` everywhere | Website `sameAs`, footer, `/media`, store contact fields |

## Where the users will come from

| Channel | Today | After the plan | Why we believe it (evidence, not a forecast) |
|---|---|---|---|
| App Store search | ~340 impressions a period; ranks #1 for `ai rep counter`, unranked for `squat counter`, `push up counter`, `sit up counter` | name + subtitle + keyword field cover all 25 key terms (coverage check in `../02-research/keyword-evidence-notes-2026-10-15.md` §2 and the variant scoring) | `squat counter` is autocomplete rank 1 in US, GB and NP with no app over 10k ratings in the US top 10; six exercise terms have hint rank 1–2 and 0–2 big apps |
| Google Play search | only brand and `fitness challenge with friends` (#11 US) | title carries `ai rep counter` and `squat counter`; full description lists each exercise as a counter | Play's `ai rep counter` and `squat counter` results are small apps (100+ to 1K+ installs); in September the title "Buzzend: AI Rep Counter" reached #36 in Nepal for `rep counter` |
| Google Search | one indexable page, no analytics | 19 pages indexable plus a rep-counter hub, two exercise pages and ten articles | no competitor has pages for squat/sit-up/burpee counters, Android counter intent or "fitness challenges with friends at home"; Google autocomplete shows these queries exist |
| Invites and shares | links 404 without the app | web landing + deferred deep link | every invite from an existing user is currently lost at the install step |
| Browse / explore | ≈55 % of Play acquisitions | more screenshots (first = counting mid-set), feature graphic naming exercises, custom product pages | Apple and Google both say screenshots and ratings influence search results and browse placement |

## Week 1–2: unblock

| Do | Owner | Where the details are |
|---|---|---|
| Deploy the prerendered site and attach the CloudFront function; add `www`; HSTS | you (website) | `01-website-deploy-runbook.md` |
| Put the real GTM id in, create GA4 and the consent banner, verify Search Console, submit the sitemap | analytics | runbook §6; `04-website-seo-package.md` §H |
| Correct the live descriptions now: remove "Every rep is verified" and "stories", fix "High knes", add burpees | ASO | descriptions in `02-apple-app-store-metadata.md` and `03-google-play-metadata.md` |
| Replace the Play short description (drops "Free workout app!") | ASO | `03-google-play-metadata.md` |
| Publish the privacy disclosures (policy paragraph, Data safety, Apple labels) | product + legal | `05-privacy-disclosures.md` |
| Point the Play privacy URL to `/privacy` and the Apple support URL to `/contact-us` once they return 200 | ASO | — |

## Week 2–5: store listings

Final fields (character counts are computed by `../tools/build_metadata.py`; alternates and the full texts are in the packages):

| Field | Final | Count |
|---|---|---|
| App Store name | Buzzend: AI Squat Rep Counter | 29/30 |
| App Store subtitle | Fitness Challenges w/ Friends | 29/30 |
| App Store keywords | push up,sit up,jumping jack,lunge,burpee,high knees,workout,streak,leaderboard,camera,exercise,group | 100/100 bytes |
| App Store promotional text | Your phone camera counts your squats, push-ups, sit-ups, lunges, jumping jacks, burpees and high knees. Challenge friends, keep your streak and climb the leaderboard. | 166/170 |
| Play title | Buzzend: AI Squat Rep Counter | 29/30 |
| Play short description | Your camera counts squats, push ups & sit ups. Challenge friends, keep streaks. | 79/80 |
| Descriptions | see packages 02 and 03 | 1959 and 2102 of 4000 |

Also: ten screenshots in the storyboard order (first = a count mid-set), an app preview and a Play video that show counting in the first ten seconds, three custom product pages (squat counter, push-up counter, challenges with friends) with keywords assigned, and the `pt=` provider token on website store links so campaign attribution works. Hold product-page tests until weekly impressions exceed about 500; at today's volume they cannot reach 90 % confidence.

## Week 3–10: website and content

- Rewrite homepage, `/challenges`, `/app-guide`, `/faqs`, `/blogs` metadata and copy (package 04 §B); the challenges page still describes walking, running, yoga and meditation.
- Remove the five legacy stubs with 301s; add dates and authors to the four remaining posts.
- Publish `/ai-rep-counter`, `/squat-counter-app`, `/push-up-counter-app` (outlines in package 04 §C), then the ten articles in §G, five by week 6 and five by week 10.
- Every page links to the hub, the hub links to the exercise pages and `/challenges`, and every article ends with one CTA.

## Week 6–12: growth loops in the product

- `/link/*` web fallback: a prerendered landing that shows the challenge or post name, correct Open Graph tags for chat previews, store buttons, and the "Join with code" explainer; Android carries the invite in the Play Install Referrer so the app opens on the right challenge after install. iOS has no native deferred link, so the landing page tells the user to open Buzzend and enter the code.
- Route the backend's streak-invite URL (`/invite/accept?token=`) into the same `/link/` family so the apps and the web handle it.
- Keep the review prompt after three workouts; answer every review within a week; never incentivise ratings.
- Put the working post link and the "counted by Buzzend" mark on every shared clip.

## What the copy may and may not say

Allowed: "Your phone camera counts your reps"; "counting happens on your phone"; "your video is never uploaded unless you post it"; "reps counted by the camera, not typed in"; the seven exercise names; "free to download" (descriptions only).
Not allowed: "verified", "anti-cheat", "nothing leaves your phone", "stories", "comments", accuracy percentages, "best", "#1", "perfect form", "replaces your trainer", anything about Full Body routines or elimination challenges until they ship.

## How we will know it is working

Weekly dashboard (package 06) with four evidence thresholds: 19 pages indexed within 30 days and non-branded impressions within 60; `squat counter` and `push up counter` inside the App Store top 100 in the US within four weeks of the metadata release while `ai rep counter` stays top 3; named search terms appearing in Play Console; activation and day-7 retention of new cohorts holding steady as reach grows. Monthly rank checks with `../tools/apple_keywords.py`, `google_suggest.py` and the Play pair.

## Open items that need your hand

- The exports from decision 9 (App Store Connect keyword field and analytics, Play Console search terms and Data safety, Search Console access, keyword volumes).
- Legal review of the disclosure drafts before anything about privacy is published.
- Confirmation of the FAQ facts that conflict today (age limit vs Terms; challenge length).
- A date for the App Store release that carries the metadata (keyword field changes ship only with a build).

## Files in this plan

| File | What it is |
|---|---|
| `01-website-deploy-runbook.md` | step-by-step deploy and verification |
| `…/angular-buzzend/docs/seo-changes-2026-10/` (in the website repo) | the complete Angular change spec: code per file, blog data, new pages and nine finished articles |
| `02-apple-app-store-metadata.md` | field-by-field App Store package, storyboard, CPP/PPO plan |
| `03-google-play-metadata.md` | field-by-field Play package, graphics, experiments |
| `04-website-seo-package.md` | technical fixes, page-by-page metadata, new pages, redirects, schema, content roadmap, analytics |
| `05-privacy-disclosures.md` | policy paragraph, Data safety answers, Apple labels |
| `06-measurement-plan.md` | definitions, formulas, dashboard, thresholds, weekly review |
| `07-roadmap.md` | phased tasks with priority, effort, owners, acceptance criteria |
| `08-publication-checklist.md` | pre- and post-publication checks and the monitoring schedule |
| `../data/metadata-workbook.csv` | copy-paste workbook with limits, counts and policy checks |
| `../data/master-keyword-evidence.csv` | 1,820 terms with the evidence collected; volume columns blank until your exports arrive |
