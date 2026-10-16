# Stage 1 — Discovery summary, serious issues, early evidence and open questions

Date: 2026-10-15. Scope: everything reachable from this machine plus public web/store data. Nothing has been changed in any repository, listing or live system. Detailed evidence lives in the numbered files beside this one; each number below carries its source.

## 1. What was accessible

| Source | Status | Where | Notes |
|---|---|---|---|
| Website source (Angular 21) | ✅ two copies | `Inventech Projects/Angular/buzzend/angular-buzzend` (deployed, branch `seo/clean-urls-prerender`, unmerged) and `Inventech Projects/Angular/angular-buzzend` (stale `main`, July) | see 06 |
| Live website | ✅ fetched | https://buzzend.com | see 01 |
| Android native app (Kotlin/Compose) | ✅ | `Inventech Projects/Android/android-buzzend` + release branches | see 04 |
| iOS native app (Swift) | ✅ | `Inventech Projects/ios/Buzzend` | see 04 |
| Legacy Flutter app | ✅ (stage checkout) | `Inventech Projects/Flutter/flutter_stage/flutter_buzzend` | replaced in both stores by the native apps |
| Backend (Spring Boot, AWS) | ✅ | `Inventech Projects/Java/java-itg-gochall` | see 05 |
| Content / marketing repo | ✅ | `buzzend-content` | strategy, 30-day plan, sprint logs, store assets; see 07 |
| Design prototype repo | ✅ | `Buzzend Design` | Full Body + Elimination specs (unreleased features) |
| Apple App Store listing (public) | ✅ | iTunes Lookup (us, np, in, gb, au, ca) + web page | see 02 |
| Google Play listing (public) | ✅ | Play web page (US, NP) | see 02 |
| App Store Connect (keyword field, promo text, analytics, PPO) | ❌ | — | export needed |
| Play Console (Data safety, search terms, experiments, country data) | ❌ (only Sept screenshots in android repo docs) | — | export needed |
| Google Search Console | ❌ no property/verification found | — | access needed |
| GA4 web | ❌ GTM id is a placeholder; no GA4 on the site | — | decision needed |
| Firebase Analytics (apps) | partial | GA4 property `buzzend-prod` numbers quoted in android docs | export needed |
| Keyword volume tools (Keyword Planner, Ahrefs/Semrush, ASO tool) | ❌ | — | volumes left blank; proxies used |
| Google Trends | ❌ programmatic access returns HTTP 429 | — | manual CSV export would work |

## 2. Product truth (from code, not marketing docs)

| Capability | Status 2026-10-15 | Evidence |
|---|---|---|
| Camera rep counting: squats, push-ups, sit-ups, jumping jacks, lunges | SHIPPED both stores | 04 §1 |
| Burpees, high knees | SHIPPED in v3.1.14 (iOS release notes 2026-10-11); Android behind `NEW_EXERCISES` Remote Config flag, prod default off | 02, 04 §1.2 |
| Pose detection | on-device Google MediaPipe PoseLandmarker; no video uploaded for counting | 04 §2.1 |
| Pose landmark trace upload | EVERY production set uploads a 33-landmark trace to the backend, attributed to the user, no opt-out, not disclosed in privacy policy / Data safety | 04 §2.2, 05 §1 |
| Workout clip | recorded during the set; uploaded only if the user taps Post; "Save copy" burns rep count into the clip | 04 §2.3 |
| Voice coaching | recorded ElevenLabs clips (not TTS) + spoken rep number; form cues on screen; demo video per exercise | 04 §1.4 |
| Challenges | public + private (private creation backend-allowlisted), join codes, invite links, approval flow, 7/14/30/60/custom 1–365 days, prizes fields, winner type | 04 §3, 05 §3 |
| Leaderboards | cumulative rep sums from count-only uploads; no server verification ("Challenges today can be cheated", design doc) | 04 §3 |
| Beat-It competitions | shipped; attempt counts once the clip is posted | 04 §3 |
| Elimination challenge | UNRELEASED (main only; server gate prod 3.1.15) | 04 §3, 05 §5 |
| Full Body guided routines | UNRELEASED (main only, 2026-10-14) | 04 §1.2 |
| Streaks | backend-computed; thresholds 3000 steps / 20 jumping jacks / 10 reps; restore via workout or 3 friend invites in 24 h | 04 §4 |
| Steps | Android Play Services Local Recording + sensor; iOS HealthKit | 04 §4 |
| Feed, posts, likes, shares, editor with music | shipped | 04 §5 |
| Stories | NOT shipped (empty modules) — yet both live descriptions say "Social feed and stories" | 04 §5 |
| Comments | do not exist | 04 §5 |
| Chat | 1:1 encrypted (P-256/AES), group chats with app-wide key, support chat | 04 §5 |
| Auth | Google + phone OTP (Android); Google + Apple + phone OTP (iOS); no guest mode; no country restriction in code | 04 §6 |
| Localization | English only on both apps and the site; ~71–81 % of the Android installed base is in Nepal | 04 §7, §10 |
| Analytics | Firebase custom events since Android 3.1.7 / identified by Firebase uid; Crashlytics; no attribution or deferred deep-link SDK | 04 §8 |
| Deep links | `buzzend.com/link/{posts,challenges,users,chats}` open the apps (assetlinks + AASA live); without the app the URL returns 404; streak-invite link `buzzend.com/invite/accept?token=` is built by the backend but not routed by site or Android | 04 §9, 05 §2, 01 |
| In-app review | iOS StoreKit prompt after ≥3 workouts; Android opens the Play listing (policy-safe) | 04 §8 |
| Monetization | none; free app | 07 §c |

## 3. Current positioning and live metadata (observed 2026-10-15)

| Surface | Live value | Chars |
|---|---|---|
| Website title | Buzzend: Fitness Challenge App With Friends \| AI Rep Counter | 60 |
| Website meta description | Challenge friends, keep your daily streak and climb live leaderboards while Buzzend's AI camera counts every rep. Free on iOS and Android. | 138 |
| Website H1 (in source, not served live) | Fitness Challenges With Friends, Counted by AI | — |
| App Store name | Buzzend: Fitness Challenges | 27/30 |
| App Store subtitle | AI Workout Rep Counter | 22/30 |
| App Store description, first sentence | Buzzend makes fitness fun, social and impossible to quit. Challenge your friends, keep your daily streak alive and climb the live leaderboard, while the AI camera counts every rep for you. | 1635/4000 total |
| Play title | Buzzend: Fitness Challenges | 27/30 |
| Play short description | Challenge friends, keep your streak & let AI count every rep. Free workout app! | 79/80 |
| Play full description | same opening as iOS, plus exercise list (typo "High knes", burpees missing) | 1801/4000 |
| Categories | iOS Health & Fitness + Social Networking; Play Health & Fitness | — |
| Ratings | iOS: US 4.5 (4), NP 5 (2), IN 5 (1), AU 5 (1), GB 0, CA 0. Play: 4.765 from 17 ratings (Sept Console), not shown publicly | — |
| Social handles | IG/TikTok/YouTube `@buzzend.official`; X `@buzzendofficial` (dormant); site `sameAs` points to `instagram.com/buzzendofficial` and `youtube.com/@buzzendofficial` (mismatch) | — |

History that matters: on 2026-09-29 the live pair was "Buzzend: AI Rep Counter" / "Fitness is better with friends" (04 §10.2); with v3.1.14 on 2026-10-11 it became "Buzzend: Fitness Challenges" / "AI Workout Rep Counter". The approved strategy (07 §a) says the camera workout is the hero and "do not make the social feed the main product story"; the September keyword research ranked *rep counter* and *squat counter* as the top opportunities; the live title now leads with "Fitness Challenges" instead. Four days is too soon to judge the effect, but this is the central strategic question (Q1 below).

## 4. Most serious issues

| # | Severity | Issue | Evidence | Owner |
|---|---|---|---|---|
| X-1 | P0 (exposure) | The whole `buzzend-content` repo — growth strategy, KPIs, budgets, team roster, outreach scripts — is public at `aaavinaya.github.io/buzzend-content/` (HTTP 200, no robots/noindex). Not yet found in search results, but fully indexable. `buzzend-design` Pages are public too. | 07 §i | repo owner |
| X-2 | P0 (compliance; blocks privacy copy) | Pose landmark traces and identified analytics are uploaded in production without disclosure in the privacy policy, Terms, Play Data safety or App Store privacy labels. Any "nothing leaves your phone" claim would be false; Apple 5.1.1 and Play Data safety accuracy are at risk. | 04 §2.2, 03 | product/legal |
| W-1 | P0 (SEO) | Every website URL except `/` returns HTTP 404 (18 of 19 sitemap URLs, `/dl`, `/link/*`). The Oct 7 prerender branch was deployed with `ng build` instead of `build:seo` and the CloudFront clean-URL function is not attached. Google does not index 4xx URLs. | 01, 06 F1 | website/devops |
| W-2 | P0 (SEO) | Homepage is a 10-word JS shell with no H1 and no store links in HTML; identical for Googlebot. | 01 | website |
| W-3 | P0 (measurement) | No analytics anywhere on the site: GTM id is the placeholder `GTM-XXXXXXX`; no GA4; no Search Console verification found. | 01, 06 §G | analytics |
| S-1 | P1 (accuracy) | Both store descriptions claim "Every rep is verified, so every challenge is fair" and "Social feed and stories". Verification does not exist server-side and Stories are not shipped. Apple 2.3 / Play metadata policy require accurate metadata. | 02, 04 §3/§5 | ASO |
| S-2 | P1 (policy) | Play short description ends with "Free workout app!" — Google's preview-asset guidance says not to use price/promotional language; Apple 2.3.7 similarly bans pricing information in metadata (the iOS keyword list proposed in September also contained `free`). | 02, 03 | ASO |
| S-3 | P1 | Play full description typo "High knes"; burpees missing from the exercise list; iOS description names no exercises at all. | 02 | ASO |
| S-4 | P1 | Play privacy-policy URL is `https://buzzend.com/#/privacy` (legacy hash URL); `/privacy` itself is 404 live. | 02, 01 | ASO + website |
| W-4 | P1 | 5 of 9 blog posts are 38–123-word stubs about retired workout types (hiking, running, cycling, meditation, pranayama) with copied encyclopedia text, all in the sitemap with BlogPosting schema; 0 posts about rep counting, challenges or streaks; `/challenges` meta description still says "walking, running, yoga, meditation". | 06 F3, F4 | SEO content |
| W-5 | P1 | `www.buzzend.com` has no DNS record; no HSTS. | 01 | devops |
| D-1 | P1 (growth loop) | Invite/share links have no web fallback: a friend without the app hits a 404; no deferred deep linking; the backend's streak-invite URL `/invite/accept` is not routed anywhere. | 04 §9, 05 §2 | product + website |
| W-6 | P2 | Twitter card tags, `og:type`, `og:image:alt` never change per page; BlogPosting lacks author/dates; FAQ data has two conflicting sources (challenge length, age limit) and conflicts with Terms (18+). | 06 F6, F7, F16 | SEO |
| W-7 | P2 | `/dl` is the site-wide CTA target but is `Disallow`ed in robots.txt and `noindex`; store links carry `ct=buzzend-website` without an Apple `pt=` provider token, so App Analytics campaign attribution will not work. | 06 F13, §J | SEO/analytics |
| W-8 | P2 | AASA served as `application/x-www-form-urlencoded`; live `.well-known` files are from April and differ from the repo. | 01, 06 F9 | devops |
| B-1 | P2 | Brand consistency: `sameAs` and footer use `@buzzendofficial` handles while the real IG/TikTok/YouTube handles are `@buzzend.official`; TikTok link dropped in the redesign; Linktree points to the old handle. | 06 §J, 07 §h | marketing |
| B-2 | P2 | Backend swagger UI/API docs default to public; `/v1/public/user/exists` is a phone-number oracle. Not SEO, but surfaced by the audit. | 05 §2 | backend |

## 5. Biggest opportunities (evidence so far)

1. **Fix the website deployment and Google can index 19 pages instead of 1.** The code already contains per-page titles, descriptions, canonicals, H1s, Organization/MobileApplication/WebSite/FAQPage/BlogPosting schema (06 §C). This is a deploy step, not a rebuild. (Note: Google discontinued FAQ rich results on 2026-05-07, so FAQPage markup is harmless but brings no SERP feature — 03.)
2. **Own the "camera/AI rep counter" cluster on both stores and on Google.** Evidence (fresh 2026-10-15 run): `squat counter` is Apple hint rank 1 in US, GB and NP with zero apps over 10k ratings in the US top 10; `push up counter & tracker`, `pushup counter`, `push up counter free`, `sit up counter`, `jumping jack counter` are hint rank 1–2 with 0–2 large apps; the live subtitle already ranks #1 in the US for `ai rep counter`; Google autocomplete returns "squat counter app", "push up counter camera", "push up counter ai", "rep counter camera", "ai rep counter" in every tested country; Play's "ai rep counter" results are small apps with 100+ to 500+ installs (02-research/competitors-store-data). Buzzend is the rare app that counts seven bodyweight exercises; most rivals count one exercise.
3. **"Workout/fitness challenge with friends" is the social cluster where Buzzend already shows up on Play (#11 US, #13 NP)** — and Google autocomplete shows "workout competition with friends app", "workout accountability with friends app", "fitness challenge app with friends", "fitness challenge apps for groups". Pair it with the counter cluster rather than choosing one.
4. **Nepal is the real installed base (71–81 % of Android devices, iOS ratings in NP).** Nothing in the listings, website or keyword research is Nepal-specific (English-only is fine; Nepali search behaviour and Play country data are untested). Play custom store listings can target countries and search keywords (up to 50), and Apple allows up to 70 custom product pages with keyword assignment (03).
5. **Content gap on Google:** no competitor page cleanly answers "app that counts push-ups/squats with your phone camera", "fitness challenges to do with friends at home", "how workout streaks work". The current blog is off-product; four usable nutrition/walking posts can stay.
6. **Store creative:** iOS uses 5 of 10 screenshot slots and no app preview; the Play video is a vertical Short with hashtags in its title. Apple PPO (3 treatments, 90 days) and Play experiments are unused since the inconclusive May PPO test.
7. **Reviews:** 8 iOS ratings and 17 Play ratings worldwide; the in-app review prompt exists (after ≥3 workouts). Ratings are an Apple-stated ranking factor (03).

## 6. Early keyword evidence (preliminary; volumes not available)

Method (all run 2026-10-15): Apple App Store autocomplete for 56 seeds × 3 storefronts (US, GB, NP) plus the iTunes Search API top-200 for 378 candidate terms in US and NP (gives Buzzend's live rank and the number of large apps per term); Google autocomplete for 43 seeds × 6 countries + a–z expansions; Google Play search result sets for 34 queries × 4 countries. Full tables: `data/master-keyword-evidence.csv` (1,820 terms) and `02-research/keyword-evidence-notes-2026-10-15.md`.

**Fresh App Store ranks for the live metadata (title "Buzzend: Fitness Challenges", subtitle "AI Workout Rep Counter"):** US — `ai rep counter` #1, `group fitness challenge` #15, `fitness challenge with friends` #52, `fitness leaderboard` #74, `rep counter` #131, `squat challenge` #142; `squat counter`, `push up counter`, `sit up counter` not in the top 200. Nepal — `ai rep counter` #2, `group fitness challenge` #2, `fitness leaderboard` #5, `squat tracker` #12, `fitness streak` #21, `rep counter free` #30, `squat counter` #37, `rep counter` #40, `workout streak` #41, `fitness challenge` #84, `fitness challenge with friends` #139. Reading: the subtitle already wins the exact phrase `ai rep counter`; exercise-specific counter terms do not rank because the exercise words are in neither name nor subtitle (and the hidden keyword field is unknown). No search volumes were obtained; "demand" below is a proxy, not a number.

| Cluster | Candidate terms (platform) | Demand proxy | Competition observed | Buzzend today |
|---|---|---|---|---|
| Rep counting (camera) | squat counter, push up counter, rep counter, sit up counter, exercise counter, ai rep counter, camera rep counter | Apple hint rank 1–2; Google suggests "…app", "…camera", "…ai" | Apple: 0–2 apps >10k ratings in top 10 for squat/push-up terms; Play: small single-exercise apps | App Store: `ai rep counter` #1 US / #2 NP; `rep counter` #131 US / #40 NP; `squat counter` — US / #37 NP; `push up counter` absent both. Play: not in top 30 (4 countries) |
| Social challenge | workout with friends, fitness challenge with friends, workout competition app, fitness challenge app, challenge friends | Apple hint rank 1–2; Google suggests "…with friends app", "…for groups", "…for workplace" | Play "fitness challenge" dominated by Leap (550K reviews); "workout with friends" returns gym loggers (Hevy etc.) | App Store: `group fitness challenge` #15 US / #2 NP; `fitness challenge with friends` #52 US / #139 NP; `fitness leaderboard` #74 US / #5 NP. Play: #11 US / #13 NP for "fitness challenge with friends" |
| Streak / habit | workout streak, fitness streak, exercise habit tracker | Apple hint rank 1 (3 big apps in top 10) | habit trackers | App Store: `fitness streak` #105 US / #21 NP; `workout streak` #41 NP |
| AI coach | ai workout coach, ai fitness coach | Apple hint rank 2, 4 big apps; Google suggests "…app", "…free" | Zing, Fitbod, FitnessAI, BodBot — strong | none; low fit (Buzzend coaches form cues, not plans) |
| Home workout | home workout app, bodyweight workout app | very broad | Leap, Freeletics, NTC | none; avoid as primary |
| Brand | buzzend | Google autocomplete returns nothing for "buzzend"; Bing shows the homepage; Play/App Store brand search #1 | — | #1 brand in all stores |

Terms to avoid for now: "home workout", "fitness app", "workout app" alone (broad, dominated), "ai fitness coach" (intent mismatch), anything with "free", "best", "#1" (policy), competitor names.

## 7. Competitors (store data + web positioning collected)

Headline findings from `02-research/competitors-web-2026-10-15.md` (35 apps, observed 2026-10-15):
- Every camera rep counter on either store is push-up-only (Puuush 3.4K ratings, PushFit 2.4K, PushApp, PushTrack, Pushup Club, Arena, Striga, Push Up Boss) or one-app-per-exercise (GOLDEN, Play 100K+). The only multi-exercise counters are tiny (Neon Pose, 50+ installs) or iOS-only (Orbit, 54 ratings). Nobody counts jumping jacks, lunges, burpees or high knees inside a social app.
- Social-challenge apps verify by selfie, self-report or wearable/Health data (GymRats 4.7K/1M+, Challenges 5.7K/100K+, Stridekick, StepBet, Fitness Pact, Rival, FitChallenge); none uses the camera, and their reviews complain about cheating. Buzzend's truthful wedge: reps counted by the camera, not typed in (not "verified" — see 04 §3).
- "Video never leaves your phone" is stated by six direct competitors (16 quotes collected) — table stakes. Buzzend can only say "no video is uploaded unless you post it" until the pose-trace upload (X-2) is disclosed or changed.
- Content: only PushApp (~300 push-up posts, six landing pages) and fitnesschallenge.club (10 use-case pages) publish SEO content; no one has pages for squat/sit-up/burpee/jumping-jack counters, "how to count push-ups with your phone camera", Android-intent counter queries, or "fitness challenges with friends at home".
- Localization risk: tier-1 counters ship 12–26 languages; Buzzend is English-only.
- Pricing: most counters push subscriptions (Striga requires one); "free on both platforms" is rare and credible for Buzzend.

Store-data detail (ratings, installs, short descriptions, Play search snapshots): `02-research/competitors-store-data-2026-10-15.md`.


## 8. Measurement baseline on record

| Metric | Value | Period / source |
|---|---|---|
| iOS impressions / product page views / CVR / first-time downloads | 342 / 45 / 5.93 % / 5 | ASC, period ending 2026-09-01 (07 §g) |
| iOS category CVR benchmark (Health & Fitness, free) | 11.11 % (50th pct 4.76 %, 75th 15.02 %) | ASC benchmark Aug 3–9 |
| iOS PPO test since 2026-05-06 | baseline 10.75 % vs 6.91 / 5.66 / 5.42 %, 15–29 impressions each | inconclusive (07 §g) |
| Play impressions / acquisitions / first opens / MAD / listing CVR | 1.63K / 53 / 43 / 45 / 52.34 % | Console, Aug 31–Sep 27 (04 §10.3) |
| Play acquisition sources Sep 11–24 | Explore ≈55 %, links ≈32 %, unattributed ≈13 %; all search terms hidden as "Other" | 04 §10.3 |
| Play installed base by country | Nepal 71–81 %, US ≈14 %, UK small | Console Jul 26–Aug 2 (04 §10.3) |
| Play ranks (Nepal, signed out) | "rep counter" #36 → #50; "squat counter" #146 → #87 | Sep 3 → Sep 25, title then "Buzzend: AI Rep Counter" (04 §10.3) |
| GA4 app property | 7,430 events, 119 active users, 76 new | Sep 10–19 (04 §8) |
| Tracked `go/` redirect clicks | 0 iOS / 0 Android | Sep 9 → Oct 15 (07 §e) |
| Website analytics | none | — |

## 9. Missing information and the exact exports needed

1. App Store Connect: current keyword field (all localizations), promotional text, support/marketing URLs, custom product pages, PPO test status; App Analytics → Acquisition (impressions, page views, conversion, downloads by source and territory, last 90 days) as CSV; Ratings & Reviews export.
2. Play Console: Store listing text as published (all languages), Data safety form answers, Store performance → Search terms (even if "Other"), Acquisition by country, Custom store listings/experiments status, Ratings & reviews export; the Google Sheet "Buzzend Growth Tracker" (Store-Android tab).
3. Firebase: Remote Config values for `new_exercises_*` in prod; GA4 `buzzend-prod` access or an export of `workout_completed`, `signup_completed`, `challenge_joined` by platform for the last 60 days.
4. Website: who deploys buzzend.com (S3 bucket, CloudFront distribution, whether a CI exists), the CloudFront error-page configuration, Route 53 access for `www`; GTM/GA4 container to use (or approval to create one); Search Console property (DNS verification).
5. Keyword volumes: any Google Keyword Planner account, Ahrefs/Semrush/Similarweb, or an ASO tool (AppTweak/Sensor Tower/AppFollow) login or CSV exports; alternatively Google Trends CSVs for the shortlist. Without these, volume columns stay blank by design.
6. Legal/privacy: the current privacy policy text source of truth and who owns Data safety / privacy labels (needed before any privacy wording is used).
7. Brand: confirmation of the official handles (`@buzzend.official` vs `@buzzendofficial`), the Facebook page URL to use, whether TikTok should be listed.

## 10. Questions that change the strategy (with my recommendation)

1. **Positioning of the store title: challenge-first (current) or counter-first?** Evidence favours leading with the camera counter (Apple/Google demand at hint rank 1–2 with weak competition; strategy §3.3; Sept Play ranks appeared only while "Rep Counter" was in the title) and keeping "challenges with friends" in the subtitle/short description. New evidence from today's harvest: the current subtitle already wins `ai rep counter` (#1 US), while `squat counter` / `push up counter` / `sit up counter` do not rank at all — so the real decision is which exercise words go into the name, the subtitle and the 100-character keyword field. Recommendation: keep both themes, put the strongest counter phrase in the name, friends/challenges in the subtitle, exercise names in the keyword field; I will prepare two or three compliant variants with exact character counts in Stage 5 for you to choose from, and nothing changes in App Store Connect without your approval.
2. **Primary market(s).** Nothing documents a target country; the installed base is Nepal-heavy, the keyword research was US-only. Recommendation: treat US + Nepal as co-primary (English listing for both; Nepal-specific custom store listing on Play once we have Console country data), UK/CA/AU/IN secondary. Please confirm.
3. **May we mention burpees and high knees on Android?** Only if the prod Remote Config flag is on. Please confirm the flag state.
4. **Privacy wording.** Until X-2 is resolved, store/web copy will say only what the code supports: "your camera counts reps on your phone; video is uploaded only if you post it". Do you want me to draft the privacy-policy/Data-safety update as part of the package (recommended), or keep it strictly out of scope?
5. **Website deployment ownership.** W-1 is a deploy task on an unmerged branch. Should the SEO package assume the `seo/clean-urls-prerender` branch is merged and deployed first (recommended), and who runs the deploy?
6. **GitHub Pages exposure (X-1).** Recommendation: make `buzzend-content` private or stop deploying the repo root; move only the `go/` redirects to a public repo. Please decide before anything from this audit is committed here — otherwise the audit itself becomes public.
7. **Blog policy.** Remove or `noindex` the five legacy stubs and rewrite the blog around current workouts (recommended), or keep them?
8. **Where should deliverables live?** Answered 2026-10-15: markdown files in `Buzzend Design/seo-aso/` (moved out of the publicly deployed content repo).
9. **Analytics stack.** GTM + GA4 on the site with a consent banner (needed for EU visitors) — approve creating/using a container?

## 11. Assumptions I will proceed under unless told otherwise

- English-only listings for now; US and Nepal as the two markets to validate first; UK/CA/AU/IN as secondary English storefronts.
- Shipped features only (section 2); burpees/high knees described as available on iOS and on Android only after flag confirmation; nothing about Full Body routines, elimination challenges, stories, comments, prizes payout or "verified" reps.
- Free app; no monetization wording beyond what policy allows (no "free" in titles/short descriptions).
- Website work builds on the deployed branch `seo/clean-urls-prerender`; recommendations will not change URL structure again.

## 12. Next steps (Stage 2–3, already underway)

- Done: fresh Apple App Store harvest → `data/master-keyword-evidence.csv` (1,820 terms, evidence columns only) and `02-research/keyword-evidence-notes-2026-10-15.md`; competitor web positioning → `02-research/competitors-web-2026-10-15.md`.
- With your answers to Q1–Q3: keyword prioritisation, keyword-to-field and keyword-to-page maps, then the Apple/Play metadata variants with programmatic character counts, website page-by-page copy, content roadmap, roadmap and checklists.
