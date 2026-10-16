# Website SEO package — buzzend.com (prepared 2026-10-15)

Scope: the deployed Angular repo (`Inventech Projects/Angular/buzzend/angular-buzzend`) as it is on your machine; no pulls or merges. The file-by-file implementation of everything below, with code and the full page and article copy, lives inside that repo at `docs/seo-changes-2026-10/` (README + `content/`). No URL structure changes except removing five legacy blog stubs (decision Q7) and adding three new pages. Deployment steps are in `01-website-deploy-runbook.md`. None of this touches the apps or the API.

## A. Technical fixes (ordered)

| # | Fix | Severity | Evidence | Acceptance check |
|---|---|---|---|---|
| T1 | Deploy prerendered build + attach CloudFront clean-URL function (runbook §1–4) | P0 | 18/19 sitemap URLs return 404 | all sitemap URLs 200 with own title/H1/canonical |
| T2 | Real GTM container id in `src/index.html`; GA4 property; consent banner with Consent Mode defaults denied for EU regions | P0 | GTM id placeholder | Tag Assistant shows GA4 page_view and `download_click` |
| T3 | Search Console domain property (DNS TXT), submit sitemap | P0 | no property | sitemap "Success", 19 discovered |
| T4 | `www` DNS alias + 301 to apex; HSTS and security headers via response headers policy (runbook §3, §5) | P1 | www unresolvable; no HSTS | `curl -I https://www.buzzend.com/` → 301 → 200 |
| T5 | Remove the five legacy blog stubs from `blog.json` and the sitemap; add their five slugs to a redirect map in the CloudFront function (301 → `/blogs`) | P1 | 38–123-word copied stubs with Article schema | `/blogs/hiking` → 301 `/blogs` |
| T6 | `SeoService.update()` to also set `twitter:title`, `twitter:description`, `twitter:image`, `og:type` (`article` for posts) and `og:image:alt` per page | P2 | tags frozen at homepage values | `curl -s /faqs \| grep twitter:title` shows the FAQ title |
| T7 | `BlogPosting` schema: add `author` (Organization Buzzend), `datePublished`, `dateModified`, `mainEntityOfPage`; add date fields to `blog.json` | P2 | schema incomplete | Rich Results Test passes with no warnings |
| T8 | Fix `sameAs` and footer/`/media` links to `@buzzend.official` (Instagram, TikTok, YouTube), Facebook page id 100085812681441; restore TikTok icon; X only if kept (decision Q10) | P2 | handle mismatch | links resolve to the real profiles |
| T9 | Allow `/dl` in robots.txt (keep `noindex`) so Google can read the directive; keep CTAs pointing to `/dl` | P2 | Disallow blocks the noindex | GSC shows `/dl` excluded by noindex, not blocked |
| T10 | Prerender: let the build fetch `POST io.buzzend.com/v1/public/challenge/filter-by` once so `/challenges` and the homepage snapshot contain real public challenges (fallback static copy if the API fails) | P2 | snapshots say "No challenges here right now" | prerendered `/challenges` lists ≥1 challenge |
| T11 | Serve `.well-known/apple-app-site-association` as `application/json` (runbook §2) | P2 | wrong content type | header check |
| T12 | Remove ~7.5 MB unreferenced assets (`mobile-device-new.svg`, `teaser-720.mp4`, …) from `src/assets` | P3 | bucket bloat | build output smaller |
| T13 | FAQ: reconcile `faq-data.ts` with Terms (age limit) and product (challenge length 1–365 days, sign-in methods); delete dead `faq.service.ts` | P3 | conflicting facts | one FAQ source, facts match app |
| T14 | Sitemap `lastmod` generated at build time from content dates | P3 | uniform hand-set dates | lastmod differs per page |

Apple campaign tracking: the store links carry `ct=buzzend-website`; App Analytics only attributes campaign links that also carry your provider token `pt=`. Add `pt=<your provider token from App Store Connect → Campaigns>` to `store-links.ts`.

## B. Page-by-page metadata (copy-ready)

Title lengths are editorial guidelines (Google truncates by pixel width and may rewrite); descriptions target ≤155 characters. Brand suffix " | Buzzend" is appended by `SeoService` unless the title already contains "Buzzend".

| Route | Primary keyword | Secondary | Intent | Title (chars) | Meta description (chars) | H1 | Notes |
|---|---|---|---|---|---|---|---|
| `/` | ai rep counter app | fitness challenges with friends, squat counter, push up counter | commercial | Buzzend: AI Rep Counter App & Fitness Challenges With Friends (61) | Your phone camera counts your squats, push-ups, sit-ups and more, then turns every workout into a challenge with friends. Free on iOS and Android. (148) | The rep counter that turns workouts into challenges with friends | counter-first per Q1; keep the six feature H2s; add a "Seven exercises" H2 listing all seven |
| `/ai-rep-counter` (new hub) | ai rep counter, rep counter app | camera rep counter, automatic rep counter, exercise counter app | commercial/informational | AI Rep Counter App: Count Reps With Your Phone Camera (52) | How Buzzend's AI rep counter works: prop up your phone, pick squats, push-ups, sit-ups, lunges, jumping jacks, burpees or high knees, and hear every rep counted. (160 → trim to 155) | Count your reps with your phone camera | links to the exercise pages, /challenges, /app-guide |
| `/squat-counter-app` (new) | squat counter app | squat counter, automatic squat counter, squat counter ai, squat tracker | commercial | Squat Counter App: Automatic Squat Counting With Your Camera (58) | Buzzend counts your squats automatically with your phone camera: no wearable, no tapping. Set-up tips, what counts as a rep, and 7-day squat challenges with friends. (160 → trim) | Count your squats automatically | side-on setup, knee-height camera, depth rules, miscount fixes, challenge CTA |
| `/push-up-counter-app` (new) | push up counter app | push up counter camera, push up counter ai, pushup counter, push up challenge | commercial | Push Up Counter App: Your Camera Counts Every Push-Up (54) | Buzzend's push up counter uses your phone camera to count reps and tell you why one did not count. Floor setup, form cues and push-up challenges with friends. (156 → trim) | Count your push-ups with your camera | front-facing floor setup; mention Android explicitly (gap: rivals are iPhone-only) |
| `/sit-up-counter-app` (new, phase 3) | sit up counter app | sit up counter, situp counter | commercial | Sit Up Counter App: Automatic Sit-Up Counting (46) | … | Count your sit-ups automatically | only after the two pages above have Search Console data |
| `/challenges` | fitness challenges with friends | workout challenge app, group fitness challenge, challenge friends | commercial | Fitness Challenges With Friends: Join or Create One (50) | Join a public Buzzend challenge or create your own with squats, push-ups, sit-ups, lunges, jumping jacks, burpees, high knees or steps. Reps counted by your camera, live leaderboards. (175 → trim to 155) | Fitness challenges with friends, counted by your camera | replace "walking, running, yoga, meditation" copy; show live challenges (T10); explain codes, invite links, approval, 7/14/30/60-day lengths |
| `/app-guide` | how to use buzzend | camera setup rep counting, phone camera workout app | informational | How to Set Up Buzzend: Camera Rep Counting in 3 Steps (52) | Prop your phone up two or three steps away, pick an exercise, start moving. Where to place the phone for each exercise, lighting tips and what to do when a rep does not count. (170 → trim) | Set up your phone, pick an exercise, start moving | add per-exercise placement table (side-on vs facing) from the product docs |
| `/faqs` | buzzend faq | is buzzend free, how does ai rep counting work | informational | Buzzend FAQ: Rep Counting, Challenges, Streaks and Privacy (56) | Answers about how Buzzend counts reps with your camera, which exercises it supports, how challenges and streaks work, and what data the app collects. (147) | Buzzend FAQ | add the privacy answer from `05-privacy-disclosures.md`; FAQPage markup optional (no rich result since 2026-05-07) |
| `/blogs` | home workout guides | rep counting guides, fitness challenge ideas | informational | Buzzend Blog: Home Workout Guides, Rep Counting and Challenges (59) | Practical guides for home workouts you can count: camera setup, squat and push-up form, challenges with friends, streaks and what to eat around a workout. (152) | Guides for home workouts you can count | list new posts first |
| `/blogs/pre-workouts` | what to eat before a workout | pre-workout foods | informational | Pre-Workout Foods: What to Eat Before a Workout (46) | keep, tighten to ≤155 | What to eat before a workout | add date/author; link to /ai-rep-counter |
| `/blogs/during-workouts` | what to eat during a workout | — | informational | What to Eat and Drink During a Workout (38) | keep, tighten | What to eat and drink during a workout | same |
| `/blogs/post-workouts` | what to eat after a workout | post-workout foods | informational | Post-Workout Foods: What to Eat After a Workout (46) | keep, tighten | What to eat after a workout | same |
| `/blogs/walk-properly` | how to walk properly | walking posture, daily steps | informational | How to Walk Properly: Posture, Stride and Daily Steps (52) | keep, tighten | How to walk properly | link to the step-goal feature |
| `/blogs/{hiking,running,cycling,meditation,pranayama}` | — | — | — | remove | — | — | 301 → `/blogs` (T5) |
| `/media` | buzzend social media | — | navigational | Buzzend on Instagram, TikTok, YouTube and Facebook (49) | Follow Buzzend (@buzzend.official) for rep-counting demos, challenge highlights and community updates. (104) | Buzzend, everywhere you scroll | handles per Q10 |
| `/contact-us` | contact buzzend | buzzend support | navigational | Contact Buzzend (15) | Questions, feedback or a problem with the Buzzend app? Email hello@buzzend.com or use the in-app Help & Support form. (113) | Talk to the Buzzend team | mention in-app support path |
| `/privacy`, `/terms`, `/cookies` | — | — | navigational | keep | keep | keep | privacy text per disclosures; cookies page rewritten when consent banner ships |
| `/dl` | — | — | — | Download Buzzend (noindex) | keep | Get Buzzend | allow crawl, keep noindex (T9) |

Avoid: a separate "/fitness-challenges-with-friends" page (would cannibalise `/challenges`), pages per exercise beyond the three with demand evidence, and any page under ~600 words of original content.

## C. New page outlines

**`/ai-rep-counter`** (hub, ~900 words): H2 How the AI rep counter works (camera on phone, joint positions, count spoken) · H2 Seven exercises it counts (list with one-line setup each) · H2 Set up in three steps · H2 Accuracy: what counts and what doesn't (half reps, framing, lighting) · H2 Your privacy (counting on-device; video uploaded only if you post; movement data collected to improve counting, link to policy) · H2 Turn counts into challenges with friends · H2 FAQ (3 questions) · CTA "Get Buzzend" to `/dl`. Schema: BreadcrumbList; keep global MobileApplication. Internal links: the exercise pages, `/challenges`, `/app-guide`, `/faqs`.

**`/squat-counter-app`** (~800 words): H2 Why counting squats by hand fails · H2 How Buzzend counts a squat (side-on, phone at knee height, two to three steps back, depth and stand-up) · H2 What the coach says when a rep doesn't count · H2 Squat challenges with friends (7-day starter, 30-day) · H2 Setup checklist · FAQ (2) · CTA. Image alt examples: "Phone propped at knee height side-on to count squats"; "Buzzend counting squat 12 of 20".

**`/push-up-counter-app`** (~800 words): H2 Phone on the floor, camera facing you · H2 What counts (full range, hips level) · H2 Push-up challenges with friends · H2 Works on Android and iPhone (rivals are iPhone-only) · setup checklist · FAQ · CTA.

## D. Redirects

| From | To | Type |
|---|---|---|
| `/blogs/hiking`, `/blogs/running`, `/blogs/cycling`, `/blogs/meditation`, `/blogs/pranayama` | `/blogs` | 301 (CloudFront function map) |
| `/blogs/blog-details?category=…` | per-slug URL (already client-side) | keep |
| `/home`, `/faqs/` and other trailing slashes | `/`, `/faqs` | 301 (function, already written) |
| `www.buzzend.com/*` | `https://buzzend.com/*` | 301 (T4) |

## E. Structured data

- Keep `Organization` (fix `sameAs`), `WebSite`, `MobileApplication` (no `aggregateRating` unless genuinely collected on the site; Google's Software App rich result requires a rating or review and we will not fabricate one).
- `BlogPosting` on posts with author/dates/mainEntityOfPage (T7); `BreadcrumbList` on posts and new pages.
- `FAQPage`: optional; Google stopped showing FAQ rich results on 2026-05-07.
- No `HowTo` (rich result retired), no fake reviews.

## F. Internal linking

Header: add "Rep counter" (→ `/ai-rep-counter`) next to Challenges. Footer: Squat counter, Push-up counter, App guide, Blog. Homepage "It counts your reps" section → hub; "Challenge your crew" → `/challenges`. Each exercise page ↔ hub ↔ `/challenges`. Blog posts end with a "Count it with Buzzend" box linking to the hub and `/dl`.

## G. Content roadmap (first 90 days)

| # | Target keyword (evidence) | Supporting | Intent | Title | Slug | Outline (H2s) | Angle | Links | CTA | Priority | Effort | Funnel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | how to count push ups with your phone camera (Google suggests "push up counter camera", "app that counts push ups") | push up counter app android, ai push up counter | informational→commercial | How to Count Push-Ups With Your Phone Camera | how-to-count-push-ups-with-your-phone | why hand counting fails · floor setup · what counts · when it miscounts · try it | setup photos from real sessions; Android + iPhone | push-up page, hub | Get Buzzend | P1 | M | top→mid |
| 2 | squat counter app (Apple hint 1, 0 big apps) | automatic squat counter, squat counter ai | commercial | Squat Counter App: How Automatic Squat Counting Works | squat-counter-app-how-it-works | sensors vs camera · depth · side-on setup · challenges | compares accelerometer counters (hold-the-phone) with camera counting | squat page | Get Buzzend | P1 | M | mid |
| 3 | fitness challenges with friends at home (gap: no competitor covers) | workout challenge ideas with friends, no equipment | informational | 12 Fitness Challenges to Do With Friends at Home (No Equipment) | fitness-challenges-with-friends-at-home | 7-day squat starter · push-up ladder · burpee minute · steps vs reps · fair scoring for mixed levels · how to run it in Buzzend | each challenge maps to a Buzzend template | /challenges | Start a challenge | P1 | M | top |
| 4 | workout streak app / how streaks work | fitness streak, restore a streak | informational | How Workout Streaks Work (and How to Keep Yours) | how-workout-streaks-work | thresholds (10 reps, 20 jacks, 3,000 steps) · restore · habit science (cited) | real product rules, no hype | streak FAQ | Get Buzzend | P2 | S | mid |
| 5 | why didn't my rep count (accuracy complaints are the #1 review theme among rivals) | rep counter accuracy, camera rep counter setup | informational | Why Didn't My Rep Count? Camera Setup for Accurate Counting | why-didnt-my-rep-count | framing · lighting · angle per exercise · half reps · what the coach says | turns a weakness into trust | app guide | — | P2 | S | retention |
| 6 | 30 day squat challenge with friends (Apple hint 1–3) | squat challenge app | commercial | 30-Day Squat Challenge With Friends: Rules, Tracker and Template | 30-day-squat-challenge-with-friends | plan table · scoring · Buzzend template (60-day max, custom lengths) | printable + in-app | squat page, /challenges | Start it in Buzzend | P2 | M | top |
| 7 | push up challenge with friends | push up challenge app | commercial | Push-Up Challenge With Friends: Fair Rules and a 14-Day Plan | push-up-challenge-with-friends | — | counted, not self-reported | push-up page | Start it | P2 | M | top |
| 8 | does a rep counter app record you (privacy gap) | on-device ai workout | informational | Does a Rep Counter App Record You? On-Device Counting Explained | does-a-rep-counter-app-record-you | what the camera does · what leaves the phone (honest) · how to check an app's privacy label | the truthful version competitors only assert | privacy | — | P2 | S | trust |
| 9 | jumping jack counter / burpee counter / high knees counter (Apple hint 1 for jumping jack and burpee counter; no social app counts them) | cardio counters | commercial | Burpee, Jumping Jack and High Knees Counters in One App | burpee-jumping-jack-high-knees-counter | setup facing camera · what counts · cardio challenges | only multi-exercise app positioning | hub | Get Buzzend | P3 | S | mid |
| 10 | how many squats should i be able to do (Google alpha suggestions) | squat test by age | informational | How Many Squats Should You Be Able to Do? A Simple Self-Test | how-many-squats-should-i-be-able-to-do | cite a published norm source; test it with the counter | careful, general fitness info, not medical advice | squat page | Count your test | P3 | M | top |

Rules for every article: original text, named sources for any norm or health statement, no medical claims, one CTA, real screenshots with demo names, author and date, at least 300 words of specific text at launch (the nine drafts run 305–603 words) and expanded as questions and screenshots accumulate, internal links per section F.

## H. Analytics implementation (decision Q8)

- GTM container → GA4 web property. Events: `page_view`, `download_click` (already pushed; parameters `platform`, `location`), `store_outbound` on the `/dl` redirect, `cta_click` (hero, footer), `faq_open`. Mark `download_click` as a key event.
- Consent Mode v2 banner: analytics denied by default for EEA/UK visitors until accepted; granted elsewhere; link to `/cookies` (rewrite the 2022 boilerplate to describe GA4 cookies).
- Search Console: domain property; weekly export of queries split branded (`buzzend`) vs non-branded.
- Store links: Apple `ct=` + `pt=`; Play `referrer=utm_source%3Dbuzzend.com…` (already present).
