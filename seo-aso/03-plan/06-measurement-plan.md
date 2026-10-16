# Measurement plan (prepared 2026-10-15)

Purpose: know within weeks whether user flow is rising, and from where. Metric definitions come from the platforms' own documentation (observed 2026-10-15); denominators differ by platform, so never compare an Apple rate with a Play rate directly.

## 1. Baseline on record

| Metric | Value | Period / source |
|---|---|---|
| App Store impressions / product page views / conversion / first-time downloads | 342 / 45 / 5.93 % / 5 | ASC period ending 2026-09-01 |
| App Store category benchmark (Health & Fitness, free) | 11.11 % median | ASC benchmark Aug 3–9 |
| Play impressions / acquisitions / first opens / MAD / 90-day conversion | 1,630 / 53 / 43 / 45 / 52.34 % | Console Aug 31–Sep 27 |
| Play acquisition mix | explore ≈55 %, links ≈32 %, unattributed ≈13 %; search terms all "Other" | Console Sep 11–24 |
| Website organic | unknown (no Search Console, no analytics) | — |
| App analytics | 119 active users, 76 new, 7,430 events | GA4 `buzzend-prod` Sep 10–19 |
| Ratings | iOS 8 worldwide; Play 17 | Oct 15 / Sept |

## 2. Metric definitions and formulas

| Surface | Metric | Formula / definition | Source |
|---|---|---|---|
| App Store | Conversion rate | (downloads + pre-orders) ÷ unique device impressions | ASC Performance metrics reference |
| App Store | Product page conversion rate | downloads from the product page ÷ unique product page views | same |
| App Store | Impressions | times the icon was displayed on the App Store | ASC |
| App Store | Search share | impressions and downloads with source type "App Store Search" ÷ total | ASC Acquisition → Source type |
| Google Play | Store listing visitors | users who visited the listing and did not already have the app | Play Console Help 9859173 |
| Google Play | Store listing acquisitions | visitors who installed | same |
| Google Play | Click-through rate | install clicks ÷ visitors (replaces legacy "conversion rate") | same |
| Google Play | Search terms | terms that drove visitors; low-volume terms grouped as "Other" | same |
| Website | Organic clicks, impressions, CTR, average position | Search Console Performance, filter query contains "buzzend" for branded vs not | GSC |
| Website | Download click rate | `download_click` events ÷ sessions | GA4 |
| Website | Store outbound rate | `store_outbound` ÷ `download_click` | GA4 |
| App | Activation rate | users with ≥1 `workout_completed` ÷ users with `signup_completed`, same cohort week | Firebase/GA4 |
| App | Day-1 / Day-7 retention | cohort users active on day 1 / day 7 ÷ cohort size | Firebase retention |
| App | Invite loop | `invite_sent`, `invite_accepted`, `challenge_joined` per week | Firebase |

## 3. Keyword rank tracking (free, reproducible)

The scripts in `../tools/` re-run today's checks: Apple autocomplete + top-200 ranks (US, NP), Google autocomplete, Google Play result positions. Run them monthly from the same machine and append to `../data/`. They give positions, not volumes; volumes come from the Keyword Planner/ASO tool exports you are providing (decision Q9), to be pasted into the blank columns of `../data/master-keyword-evidence.csv`.

Terms to watch (App Store US and NP, Play US): `ai rep counter`, `rep counter`, `squat counter`, `push up counter`, `sit up counter`, `exercise counter`, `camera workout`, `fitness challenge with friends`, `workout with friends`, `group fitness challenge`, `fitness challenge`, `workout streak`, `fitness leaderboard`, `squat challenge`, `push up challenge`, `buzzend`.

## 4. Dashboard specification (one sheet, five tabs)

| Tab | Rows | Columns | Source | Cadence |
|---|---|---|---|---|
| Store-iOS | week | impressions, unique impressions, product page views, downloads (first-time, redownloads), conversion rate, product page conversion rate, search share, top territories | ASC export | weekly |
| Store-Android | week | visitors, acquisitions, CTR, explore vs search vs referral split, named search terms, country split | Console export | weekly |
| Web | week | organic impressions, clicks, CTR, avg position (branded/non-branded), sessions, download_click, store_outbound, indexed pages | GSC + GA4 | weekly |
| App | signup week cohort | signups, activation rate, D1, D7, invites sent/accepted, challenges joined | Firebase | weekly |
| Keywords | term × month | App Store rank US/NP, Play position US, Google position (GSC) | tools/ scripts + GSC | monthly |

## 5. How we will know it worked (evidence thresholds, not guarantees)

- Website: Search Console shows ≥15 indexed pages within 30 days of the deploy and non-branded impressions appear within 60 days. Target the first non-branded clicks by day 90; no traffic number is promised.
- App Store: after the metadata release, `squat counter` and `push up counter` move from unranked into the top 100 in the US within four weeks; `ai rep counter` stays top 3. Search-sourced impressions rise week on week for four weeks.
- Google Play: named search terms start appearing in Console (today all are "Other"); acquisitions per week rise above the Sept average of ~13.
- Quality: activation rate and D7 retention of new cohorts do not fall as acquisition grows; if they do, the message is attracting the wrong users and the copy is revisited before more reach is bought.

## 6. Weekly review (15 minutes, Monday)

1. Paste last week's five rows into the sheet.
2. Check the four evidence thresholds above; mark green/amber/red.
3. One decision per week: ship a listing change, start or stop an experiment, or publish a page. Never change metadata and start an experiment in the same week.
4. Log it in the Experiments tab (hypothesis, change, metric, review date, result).
