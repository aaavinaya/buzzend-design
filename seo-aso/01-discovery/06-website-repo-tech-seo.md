> Produced 2026-10-15 by a read-only audit of both website repo copies. Live-site claims (404s, missing prerender, placeholder GTM id, www DNS, AASA content type) were re-verified with independent HTTP fetches (see 01-live-website-audit.md).

# Buzzend website — source-code technical SEO audit

Date: 2026-10-15. Read-only review of the two local copies of `angular-buzzend` plus a handful of
live HTTP probes against buzzend.com (curl, no browser) to establish which build is deployed.
Paths below are absolute. "copy 1" = `/Users/avinayaacharya/Development/Inventech Projects/Angular/angular-buzzend`,
"copy 2" = `/Users/avinayaacharya/Development/Inventech Projects/Angular/buzzend/angular-buzzend`,
"worktree" = `/Users/avinayaacharya/Development/Inventech Projects/Angular/angular-buzzend/.claude/worktrees/seo-phase2`.

---

## A. Which copy is deployed

### Git state

| | copy 1 (`angular-buzzend`) | worktree `seo-phase2` (inside copy 1) | copy 2 (`buzzend/angular-buzzend`) |
|---|---|---|---|
| Remotes | `origin` = github.com/inventechgroup/angular-buzzend, `self` = github.com/aaavinaya/angular-buzzend | same object store as copy 1 | identical remotes |
| Checked-out branch | `main` @ `c1bd9c5` (2026-07-01, "Merge PR #87 fix/challenge-filter") | `seo/phase2-clean-urls` @ `5a28789` (2026-10-05 09:55 +0545) | `seo/clean-urls-prerender` @ `8627984` (2026-10-07 10:23 +0545) |
| Known `origin/main` | stale: `c1bd9c5` (never fetched after July) | stale (same store) | fresh: `d117eab` (2026-09-30, PR #91 merging `redesign-v2`, which includes Phase 1 `0119eff`) |
| Ahead of real `origin/main` | behind (pre-redesign code: hash routing, Bootstrap, owl-carousel, Material icons) | 2 commits (`50bfae6`, `5a28789`) | 1 commit (`8627984`) |
| Pushed where | — | `self/seo/phase2-clean-urls` only | `self/seo/clean-urls-prerender` only |
| Merged into `origin/main`? | n/a | **No** | **No** |
| `scripts/prerender.mjs` | absent (no scripts/ dir) | present, 251 lines, hard-coded `ROUTES` | present, 275 lines, sitemap-driven |
| CloudFront function | absent | `infra/cloudfront-clean-urls.js` (32 lines) | `deploy/cloudfront-clean-urls.js` (58 lines) |
| `prompt.md` | absent on main | present (24,366 B) | present (identical, `cmp` same) |
| `dist/` | old design build, 2026-10-05 08:52 (`main-JLFYN6YP.js`, `bootstrap.bundle.js`, 10 KB shell index.html with the old "Buzzend-Lift & Uplift…" title) | prerendered build 2026-10-05 09:53 (`dist/fitness-app/browser`, 37 entries) | prerendered build 2026-10-06 09:16 (117 files; `main-5UHNGWBO.js`; 24 route folders incl. blogs/*, challenges/*, dl, error) |
| Working tree | `M package-lock.json`, untracked `.claude/` | clean | clean (untracked `.claude/`) |

### What is actually live (probed 2026-10-15)

* `https://buzzend.com/sitemap.xml` and `/robots.txt` are **byte-identical** to copy 2's `src/sitemap.xml` / `src/robots.txt` (19 URLs, lastmod 2026-10-06, prerender comment). The worktree's sitemap has 10 URLs, `/faq`, lastmod 2026-10-05 — so the worktree is **not** what shipped.
* Live `Last-Modified` for `/`, `/sitemap.xml`, `main-*.js`, `/assets/**`: **Thu, 08 Oct 2026 03:19 GMT** (i.e. 08:04 +0545 on 8 Oct, the day after commit `8627984`). Served by `server: AmazonS3` behind CloudFront (`x-cache: Hit from cloudfront`, POP BOM78).
* Live `main-PXZMXNP3.js` is 171,169 bytes — exactly the size of copy 2's `dist/.../main-5UHNGWBO.js`; `cmp -l` shows only 126 differing bytes (chunk-hash references). It contains Phase-2-only strings (`":slug"`, `"/faqs"`, `redirectTo:""`, the `blogSlug` regex `[^a-z0-9]+`, `bz-revealed`) and none of the worktree's (`"/faq"`). **Conclusion: the live JS is a plain `ng build` of copy 2's `seo/clean-urls-prerender` source.**
* **But the live HTML is the un-prerendered shell.** `GET /` → 200, 7,707 bytes, `<app-root></app-root>` empty, **0 `<h1>`**, 10 words of visible text, no shell-guard script. (Copy 2's prerendered `index.html` is 102,340 bytes with the H1 and ~1,000 words.)
* **Every other path returns HTTP 404** (`x-cache: Error from cloudfront`, body = the same 7,707-byte shell): `/faqs`, `/faqs/`, `/home`, `/challenges`, `/blogs`, `/blogs/hiking`, `/dl`, `/error`, `/link/contents/…`, `/link/challenges/…`, `/faqs/index.html`, `/this-page-does-not-exist`. No 301s for `/faqs/` or `/home` → **`deploy/cloudfront-clean-urls.js` is not attached**, and the per-route `<route>/index.html` snapshots were **not uploaded**. The pages render in a browser only because Angular boots on the S3 error document.
* `http://buzzend.com/` → 301 `https://buzzend.com/` (good). `www.buzzend.com` has **no DNS record** (curl exit 000, `dig` empty). No `strict-transport-security` header.
* Live `/.well-known/apple-app-site-association` and `assetlinks.json` are dated **29 Apr 2026** and differ from the repo (live: only `com.inventechgroup.buzzend`; repo adds `com.inventechgroup.winjeet` in both files). AASA is served as `application/x-www-form-urlencoded`.

**Deployed copy = copy 2, branch `seo/clean-urls-prerender` @ `8627984`, built with `npm run build` (plain `ng build`, package.json L7) rather than `npm run build:seo` (L11), uploaded 2026-10-08 without the CloudFront function.** Exactly the failure mode the worktree commit `5a28789` warned about ("the live site was deployed without it").

### Worktree `seo-phase2` vs copy 2 — diff by file and intent

Both branches implement marketing's "Remaining SEO Fixes" on top of Phase 1 (`0119eff`). The worktree (Oct 5) is the earlier attempt; copy 2 (Oct 7) is a re-implementation that superseded it. Neither is merged. Differences (worktree → copy 2):

| File / area | worktree `seo/phase2-clean-urls` | copy 2 `seo/clean-urls-prerender` |
|---|---|---|
| `src/app/app-routing.module.ts` | FAQ moved to **`/faq`**, `faqs` → redirect; blog stays `/blogs/blog-details?category=` | FAQ stays **`/faqs`**; adds `blogs/:slug` (L37) + legacy `blog-details` redirect (L36) |
| `src/app/constants/blog-slug.ts` | — | new `blogSlug()` (type → kebab slug) |
| `blog-single-details.component.ts/html`, `blogs.component.*` | query-param articles | per-slug pages, canonical per article, BlogPosting + BreadcrumbList JSON-LD, prev/next by slug |
| `scripts/prerender.mjs` | hard-coded `ROUTES` (12 pages; `/faq`), keeps pristine shell as `index.csr.html`, scrolls page to trigger reveals, fails per route | reads routes from `src/sitemap.xml` + `EXTRA_ROUTES` (`/challenges/current`, `/challenges/upcoming`, `/dl`, `/coming-soon`, `/error`), `reducedMotion`, strips GTM script, injects a "shell guard" after `</app-root>`, verifies all then writes |
| CloudFront fn | `infra/cloudfront-clean-urls.js`: rewrites `/x` and `/x/` → `/x/index.html`, `/link/*` → `/index.csr.html`; no redirects | `deploy/cloudfront-clean-urls.js`: 301 `/x/` → `/x`, 301 `/home` → `/`, rewrite `/x` → `/x/index.html`, passthrough `/`, `/link/*`, `/.well-known/*`, extensions |
| `package.json` | `build` = `ng build && node scripts/prerender.mjs` (prerender is the default; `build:seo` removed) | `build` = `ng build`; `build:seo` = build + prerender (**easy to skip — and it was**) |
| `src/sitemap.xml` | 10 URLs (`/faq`), 2026-10-05 | 19 URLs (`/faqs`, 9 blog slugs), 2026-10-06 |
| `src/index.html` hash redirect | skips `/link/*`, maps `/faqs`→`/faq`, no `hashchange` listener | maps `/home`→`/`, keeps query, also on `hashchange` |
| `header/footer/contact/cookies/privacy/terms .html` | links to `/faq` | links to `/faqs` |
| `README.md` | "Deploying (S3 + CloudFront)" section, `infra/` | architecture notes, `deploy/`, `build:seo` |
| `prompt.md` | identical in both | identical |

---

## B. Route inventory (copy 2, `src/app/app-routing.module.ts`)

Routing strategy: `PathLocationStrategy` (`src/app/app.module.ts:64`); Angular 21 NgModule app, zone CD re-enabled (L59). All marketing routes sit under `LayoutComponent` (header + `<main id="main-content">` + footer, `components/layout/layout.component.html`); `/error` and `/link/*` are outside the layout.

| Route | Component (file) | Indexable? | Handling |
|---|---|---|---|
| `/` | `HomeComponent` (L26, `pathMatch:'full'`) | yes | prerendered → `index.html` |
| `/home` | `redirectTo:''` (L27) | no | Angular redirect; CF fn 301 → `/` (`deploy/cloudfront-clean-urls.js:24-26`) — **not live** |
| `/dl` | `DownloadLinkComponent` lazy (L28) | **no** — `index:false` → `noindex,nofollow` (`download-link.component.ts:28-33`) + `robots.txt Disallow: /dl` | prerendered (EXTRA_ROUTES). Platform detection: `UtilityService` regex on `navigator.userAgent` (`regex-constants.ts:3-4`: `/Android/i`, `/iPhone\|iPad\|iPod/i`); Android → `window.location.href = PLAY_STORE_URL`, iOS → `APP_STORE_URL` (`download-link.component.ts:42-48`), desktop shows both badges. Pushes `download_click` to `dataLayer` first. Store URLs in `constants/store-links.ts:9-14`: `https://apps.apple.com/app/buzzend/id1658683882?ct=buzzend-website`, `https://play.google.com/store/apps/details?id=com.inventechgroup.buzzend&referrer=utm_source%3Dbuzzend.com%26utm_medium%3Dweb%26utm_campaign%3Dwebsite` |
| `/media` | `MediaCollectionComponent` lazy (L29) | yes | prerendered |
| `/coming-soon` | `ComingSoonComponent` lazy (L30) | no (`index:false`) | prerendered; not linked from anywhere |
| `/blogs` | `BlogsComponent` (L34) | yes | prerendered |
| `/blogs/blog-details` (legacy `?category=`) | `BlogSingleDetailsComponent` (L36) | no | client redirect to `/blogs/<slug>` with `replaceUrl` (`blog-single-details.component.ts:59-67`); unknown category → `/blogs` |
| `/blogs/:slug` | `BlogSingleDetailsComponent` (L37) | yes (9 published slugs) | prerendered for the 9 sitemap slugs; unknown slug → `router.navigate(['/blogs'])` (L68-73), not a 404 |
| `/faqs` | `FaqComponent` lazy (L40) | yes | prerendered |
| `/terms`, `/app-guide`, `/privacy`, `/cookies`, `/contact-us` | lazy standalone components (L41-45) | yes | prerendered |
| `/challenges`, `/challenges/current`, `/challenges/upcoming` | `ChallengesComponent` (L49-51; tabs toggle in-template, "kept because shared externally") | yes, but aliases canonicalise to `/challenges` | all three prerendered (identical title/H1/canonical) |
| `**` (inside layout) | `ErrorPageComponent` lazy (L53) | no (`index:false`, canonical `/error`) | HTTP status comes from the host: live = 404 (S3 error document). Head of the served file is the **homepage** snapshot's head until Angular boots |
| `/error` | `ErrorPageComponent` (L12, "kept for old external links") | no; `robots Disallow: /error` | prerendered |
| `/link/contents/:contentId`, `/link/posts/:postId` | `SharedLinkComponent` (L16-18) | no (`index:false`, `shared-link.component.ts:58-62`; **no `path` → canonical = `https://buzzend.com/`**) | **not prerendered** (by design); loads shell via host fallback. Fetches `GET {apiUrl}/v1/public/contents/{id}` or `/posts/{id}` (`shared-link.service.ts:41-51`, prod `https://io.buzzend.com`, `environment.prod.ts:3-4`). Shows TikTok-style vertical viewer (video/image, author, view/like counts), runtime `document.title = "{author} on Buzzend"` (L89); mobile → "Get the full experience" popup with store link; "Open App" → `openInApp()` sets a 2.5 s timer to the store, cancelled on `visibilitychange` (L166-175); error state "Content Unavailable" + store link |
| `/link/challenges/:id?code=` | `ChallengeLinkComponent` lazy (L20) | no (`index:false`) | not prerendered. "You're invited to a challenge" card; "Get the App" → store by UA; "Open in Buzzend" re-navigates to the same https URL (relies on Universal Link/App Link) with 2.5 s store fallback (`challenge-link.component.ts:94-105`) |
| Legacy `/#/…` hash URLs | inline script `src/index.html:58-79` | — | client-side only: `#/path?q` → `location.replace('/path?q')`, `/home`→`/`; also on `hashchange`. Server sees `/` (200) so old `buzzend.com/#/contact-us` links work via JS; no server 301 is possible for fragments |
| Legacy `/home?s=about\|challenges\|faqs` | `HeaderSectionComponent` `LEGACY_SECTION_IDS` (`header-section.component.ts:8-13, 49-56`) | — | scrolls to `how-it-works` / `features` / `faqs` |

Deep-link verification files: `public/.well-known/apple-app-site-association` (team `YL8Z4C8AT6`, bundle ids `com.inventechgroup.buzzend`, `com.inventechgroup.winjeet`, `"/": "*"`) and `assetlinks.json` (package `com.inventechgroup.buzzend` + `winjeet`, SHA-256 fingerprints) copied via `angular.json` assets glob.

---

## C. Per-page metadata (from the prerendered `dist/fitness-app/browser/**/index.html` in copy 2 — i.e. what *would* be live if `build:seo` + CloudFront function were deployed)

Where set: static defaults + global JSON-LD in `src/index.html`; per-page `title`/`description`/`og:title`/`og:description`/`og:url`/`og:image`/`robots`/`canonical` via `SeoService.update()` (`src/app/services/seo.service.ts:24-36`), page JSON-LD via `SeoService.setJsonLd()` (L38-47, `<script data-page-jsonld>`); each component calls these in `ngOnInit`. `SeoService` appends ` | Buzzend` unless the title already contains "Buzzend" (L25). **It never updates `twitter:title`, `twitter:description`, `twitter:image`, `og:type`, `og:image:alt`, `og:site_name` — those stay at the homepage values on every page.**

Global head (`src/index.html`): `<html lang="en">` (L2); robots `index, follow` (L9); `apple-itunes-app app-id=1658683882` (L10); canonical `https://buzzend.com/` (L11); theme-color `#ff6b00`; OG `website`/`Buzzend`/title/description/url/`https://buzzend.com/assets/brand/og-image.jpg` 1200×630 + alt/`en_US` (L15-24); Twitter `summary_large_image`, `@buzzendofficial`, title/description/image/alt (L27-32); favicons SVG+32/48/192 PNG, apple-touch-icon 180, `site.webmanifest` (L34-39); font preload (L41). JSON-LD `@graph` (L81-119): `Organization` (`@id https://buzzend.com/#organization`, logo `app-icon-512.png`, `sameAs` FB/IG/Twitter/YouTube), `MobileApplication` (operatingSystem "iOS, Android", `HealthApplication`, `downloadUrl` ×2 untagged store URLs, `Offer` price 0 USD, publisher), `WebSite` (name/url/publisher; no SearchAction).

| Route | Component | `<title>` (len) | Meta description (len) | H1 | Canonical | Indexable | Notes |
|---|---|---|---|---|---|---|---|
| `/` | Home | Buzzend: Fitness Challenge App With Friends \| AI Rep Counter (60) | Challenge friends, keep your daily streak and climb live leaderboards while Buzzend’s AI camera counts every rep. Free on iOS and Android. (138) | Fitness Challenges With Friends, Counted by AI | https://buzzend.com/ | yes | H2s: How Buzzend Works / It counts your reps. / Everything You Need to Stay Motivated / Built for Friends, Beginners and Fitness Lovers / Eat like you train. / Frequently Asked Questions / Start Your First Challenge Today. `FAQPage` (5 Q, `home.component.ts:84-105,125-136`). "Live right now" challenge section **absent** in snapshot (API blocked). 19 imgs, all alt, 14 lazy |
| `/challenges` (+ `/current`, `/upcoming`) | Challenges | Fitness Challenges \| Buzzend (28) | Browse upcoming and current community fitness challenges on Buzzend — walking, running, yoga, meditation and more. (114) | Challenge your crew. | https://buzzend.com/challenges (all 3) | yes | **Description + hero copy name legacy workouts** (`challenges.component.ts:60`, `.html:10-13`) while filter chips are Squats/Push Up/Lunge/Sit Up/Jumping Jack (`FILTER_WORKOUTS` L21-27). Snapshot body text = "No challenges here right now — check back soon." Duplicate title/H1 across 3 URLs (canonicalised) |
| `/faqs` | Faq | FAQs \| Buzzend (14) | Answers to common questions about Buzzend — challenges, AI rep counting, step tracking, posting, privacy and your account. (122) | Questions, answered. | …/faqs | yes | `FAQPage` with 37 Questions (`faq.component.ts:37-45`); 6 category H2s |
| `/app-guide` | AppGuide | App Guide — How to use Buzzend (30) | A quick guide to Buzzend: sign in, join or create a challenge, invite friends, record workouts with the AI camera and climb the leaderboard. (140) | Zero to top of the board. | …/app-guide | yes | 5 step H2s; no HowTo schema |
| `/blogs` | Blogs | Blog \| Buzzend (14) | Practical guides on workouts, nutrition and mindful movement — from proper walking form to the best pre- and post-workout foods. (128) | Guides to keep you buzzing. | …/blogs | yes | 9 cards, each `<h2>`; no Blog/ItemList schema |
| `/blogs/hiking` | BlogSingleDetails | Hiking \| Buzzend (16) | Hiking, walking in nature as a recreational activity. Especially among those with sedentary occupations, hiking is a natural exercise that promotes physical… (157) | Hiking | …/blogs/hiking | yes | 53 words. `BlogPosting` (headline, description, image `hiking.svg`, url, publisher) + `BreadcrumbList` (Blog → title); **no author/datePublished/dateModified**; `og:type` stays `website` |
| `/blogs/running` | " | Running \| Buzzend (17) | Running is a method of terrestrial locomotion allowing humans and other animals to move rapidly on foot. Running is a type of gait characterized by an aerial… (158) | Running | …/blogs/running | yes | 123 words, Wikipedia-style "[1]"/"[2]" artifacts |
| `/blogs/cycling` | " | Cycling \| Buzzend (17) | Cycling, also, when on a two-wheeled bicycle, called bicycling or biking, is the use of cycles for transport, recreation, exercise or sport.[1] People engaged… (159) | Cycling | …/blogs/cycling | yes | 47 words; image `cycling.svg` 371 KB |
| `/blogs/meditation` | " | Meditation \| Buzzend (20) | Meditation is the practice of training attention and awareness to reach a calmer, clearer state of mind. A few quiet minutes a day can lower stress, improve… (157) | Meditation | …/blogs/meditation | yes | 60 words |
| `/blogs/pranayama` | " | Pranayama \| Buzzend (19) | Pranayama is control of Breath. Prana is Breath or vital energy in the body. On subtle levels prana represents the pranic energy responsible for life or life… (158) | Pranayama | …/blogs/pranayama | yes | 38 words; image `paranayama.jpg` (typo filename) |
| `/blogs/pre-workouts` | " | Best Pre-Workout Foods - Snacks, Fruits, Protein, Carbs, Fat! \| Buzzend (71) | Ready for a Challenge? These foods will fill up your energy the right way. We all want to get the most out of a workout – to train harder, spin faster, run… (156) | Best Pre-Workout Foods - Snacks, Fruits, Protein, Carbs, Fat! | …/blogs/pre-workouts | yes | 557 words; body uses `<h6>` sub-headings |
| `/blogs/during-workouts` | " | Best Foods During a Workout - Drinks, Snacks, Fruits, Protein! \| Buzzend (72) | A Challenge in progress? These foods will fill up your energy the right way during your workouts. The key behind a successful routine is to keep your body… (155) | (= title w/o suffix) | …/blogs/during-workouts | yes | 444 words |
| `/blogs/post-workouts` | " | Best Post-Workout Foods - Snacks, Fruits, Protein, Carbs, Fat! \| Buzzend (72) | Done with a Challenge? These foods will fill up your energy the right way. To get the most out of your workouts, it's essential to eat the right foods at the… (158) | (= title) | …/blogs/post-workouts | yes | 666 words |
| `/blogs/walk-properly` | " | How to Walk Properly \| Buzzend (30) | A Walking Challenge in progress? This information will help you to do better. How to Walk Properly: Most of us likely don’t give much thought to how we walk or… (160) | How to Walk Properly | …/blogs/walk-properly | yes | 1,022 words |
| `/media` | MediaCollection | Buzzend on Social Media (23) | Follow Buzzend on Instagram, Facebook, X and YouTube for challenge highlights, app demos and community updates. (111) | Buzzend, everywhere you scroll. | …/media | yes | 4 outbound social cards (`media-collection.component.ts:16-41`), 3 app screenshots; no embeds |
| `/contact-us` | ContactUs | Contact Us \| Buzzend (20) | Questions, feedback or a problem with the Buzzend app? Get in touch with the Buzzend team. (90) | Talk to team Buzzend. | …/contact-us | yes | **No form, no backend** — `mailto:hello@buzzend.com` only (`contact-us.component.html:25`); links to /faqs, /media |
| `/privacy` | Privacy | Privacy Policy \| Buzzend (24) | Read how Buzzend collects, uses and protects your personal information. (71) | Privacy Policy | …/privacy | yes | ~3.8k words; "Last updated September 03, 2026"; mentions Firebase Crashlytics (app) |
| `/terms` | Terms | Terms and Conditions \| Buzzend (30) | The terms and conditions that govern your use of the Buzzend mobile application and services. (93) | Terms and Conditions | …/terms | yes | ~2.8k words; sections are `<h3>` only (no h2) |
| `/cookies` | Cookies | Cookies Policy \| Buzzend (24) | Learn what cookies are and how Buzzend uses them on its website and services. (77) | Cookies Policy | …/cookies | yes | freeprivacypolicy.com boilerplate dated September 28, 2022 |
| `/dl` | DownloadLink | Download Buzzend (16) | Get Buzzend free on the App Store or Google Play and start challenging your friends today. (90) | Get Buzzend. | …/dl | **no** (noindex,nofollow + robots Disallow) | prerendered |
| `/coming-soon` | ComingSoon | Coming Soon \| Buzzend | Something new is on the way to Buzzend. (39) | Something new is on the way. | …/coming-soon | no | orphan page |
| `/error` and `**` | ErrorPage | Page not found \| Buzzend | The page you were looking for could not be found. (49) | This page took a rest day | …/error | no | robots Disallow |
| `/link/contents/*`, `/link/posts/*` | SharedLink | Shared workout — open in Buzzend → runtime "{author} on Buzzend" | A workout shared from the Buzzend app. Open it in Buzzend to see the full post. | only inside mobile popup ("Get the full experience") | **https://buzzend.com/** (path omitted) | no (noindex) | served as the homepage head until JS runs → social scrapers get the generic homepage card |
| `/link/challenges/*` | ChallengeLink | Challenge invite — open in Buzzend | You have been invited to a Buzzend challenge. Open it in the Buzzend app to join. | You're invited to a challenge | https://buzzend.com/ | no | same |

Duplicates / missing / mismatches:
* Duplicate title+description+H1: `/challenges` = `/challenges/current` = `/challenges/upcoming` (canonical consolidates; only `/challenges` in sitemap). `/index.html` and (once the CF function is attached) `/faqs/index.html` etc. are reachable duplicates → canonical covers.
* `twitter:title`/`twitter:description` on every inner page = homepage values (confirmed in `dist/faqs/index.html`, `dist/blogs/hiking/index.html`). `og:type=website` on blog posts. `og:image` identical site-wide (brand image), including blog posts whose `BlogPosting.image` differs.
* Titles: the three food posts are 71–72 chars (truncate in SERP); `Hiking | Buzzend`, `Blog | Buzzend`, `FAQs | Buzzend` (14–17 chars) carry no intent keywords. Marketing H1s (`Challenge your crew.`, `Guides to keep you buzzing.`, `Questions, answered.`, `Zero to top of the board.`, `Talk to team Buzzend.`, `Buzzend, everywhere you scroll.`) contain no target terms.
* Blog descriptions are auto-generated (`truncate(stripHtml(description),160)`, `blog-single-details.component.ts:83`) and end in "…".
* Sitemap vs routes: the 19 sitemap URLs match exactly the 19 indexable routes (no missing, no extras). **Mismatch with reality: 18 of the 19 return HTTP 404 live** (see A).
* `src/index.html:8` uses a straight apostrophe ("Buzzend's") while `home.component.ts:116` uses a curly one — SeoService overrides at runtime; cosmetic.

---

## D. Prerender and hosting

`scripts/prerender.mjs` (copy 2):
* Requires an existing `ng build` (`INDEX_PATH`, L212); refuses to re-run over a snapshot (L220-223).
* Routes = every `<loc>` in `src/sitemap.xml` (must be `https://buzzend.com` origin, no hash/query, L64-73) + `EXTRA_ROUTES = ['/challenges/current','/challenges/upcoming','/dl','/coming-soon','/error']` (L33).
* Starts a tiny static server over `dist/fitness-app/browser` that serves the pristine shell for every extensionless path (L85-112), launches Playwright Chromium (1280×900, `reducedMotion:'reduce'`, L232-235), aborts requests to `io.buzzend.com` / `io-stage.buzzend.com` so no API data is baked in (L36, L238-241), waits for `networkidle` + `document.fonts.ready`, force-adds `.bz-revealed` to all `[data-reveal]`, removes GTM `<script src>` (L132), serialises `document.documentElement.outerHTML`.
* Injects a "shell guard" right after `</app-root>` (L148-157): if `location.pathname` ≠ the snapshot's route, empty `app-root` so `/link/*` and 404 URLs boot from an empty root (avoids flash of the homepage).
* Verification (L167-209): visible `<h1>`, no `href="…#/"`, `application/ld+json` present, not the 404 title; for sitemap routes: canonical must equal `https://buzzend.com<route>` and no `noindex`; homepage must contain `apps.apple.com`, `play.google.com`, "How Buzzend Works". Renders all, fails the build if any problem, otherwise writes `<route>/index.html` (`/` → `index.html`).
* Output confirmed in `dist/`: 24 prerendered pages (19 indexable + 5 extra), `<html lang="en" data-beasties-container>` (Angular critical-CSS inlining), 8 inline `<style>` blocks (~30 KB) on the homepage.
* Limitations: API-driven sections render as empty states (homepage live-challenges section omitted; `/challenges` snapshot says "No challenges here right now"); not wired into the default `build`; needs `npx playwright install chromium` on the build machine (README).

Deploy flow: **no CI/CD config in either repo** (no `.github/`, buildspec, amplify, scripts). README (copy 2) describes manual S3 + CloudFront: run `npm run build:seo`, upload `dist/fitness-app/browser/`, keep S3 error document = `index.html` (how `/link/*` loads), attach `deploy/cloudfront-clean-urls.js` as a viewer-request CloudFront Function (runtime cloudfront-js-2.0) on the default behaviour.

`deploy/cloudfront-clean-urls.js` behaviour:
* `/`, `/link/*`, `/.well-known/*` pass through untouched (L20).
* `/home`, `/home/` → **301** `/` with query preserved (L24-26).
* Any URI ending in `/` → **301** to the slash-less URI (query preserved) (L28-30) — one URL per page.
* Extensionless last segment → rewrite to `<uri>/index.html` (L32-36), e.g. `/faqs` → `/faqs/index.html` (200, no redirect). Paths with an extension pass through.
* Unknown extensionless path → rewritten to `/foo/index.html` → S3 miss → **falls through to the S3 error document** (comment L9-11). The HTTP status then depends on the CloudFront custom-error-response configuration, which is not in the repo. **Live today, S3 error responses come back as HTTP 404** (`x-cache: Error from cloudfront`), so unknown paths are hard 404s, not soft 404s — but so are `/link/*` deep links and (today) every real page. If someone "fixes" the 404s by mapping the error response to 200 without uploading the snapshots, every URL becomes a soft 404 returning the homepage shell.

`robots.txt` (`src/robots.txt`, copied as-is): `User-agent: *`, `Allow: /`, `Disallow: /dl`, `Disallow: /error`, `Sitemap: https://buzzend.com/sitemap.xml`. `sitemap.xml` (`src/sitemap.xml`) is **hand-maintained** (static asset; XML comment instructs devs to add pages manually; prerender fails if routes drift). All 19 `<lastmod>` values are the same date (2026-10-06) regardless of real content dates (privacy updated 2026-09-03; cookies 2022). Copy 1's old files (pre-redesign) were a per-bot `robots.txt` with `Disallow: /src/` and a 2023 sitemap listing `/home?s=…` and `/dl`.

---

## E. Blog (`src/app/blog.json`, 20 entries; rendered via `blogs.component.ts` / `blog-single-details.component.ts`, slug = `blogSlug(type)`)

Fields available: `type`, `title`, `description` (HTML body), `image`. **No author, no dates, no excerpt, no category taxonomy, no reading time.** Entries whose description matches `/coming soon/i` are filtered out of listing, detail and prev/next (`blogs.component.ts:23,48`; `blog-single-details.component.ts:15,40`).

| Slug (`/blogs/…`) | Title | Words | Image (size) | Status | Topic / relevance to current product |
|---|---|---|---|---|---|
| `hiking` | Hiking | 53 | `hiking.svg` 107,780 B | published, in sitemap | Legacy wellness; encyclopedic (Britannica/Wikipedia-style). Not a current workout type |
| `running` | Running | 123 | `running.svg` 26,945 B | published | Legacy; verbatim Wikipedia lead incl. "[1]", "[2]" |
| `cycling` | Cycling | 47 | `cycling.svg` 370,993 B | published | Legacy; Wikipedia lead with "[1]"; broken sentence ("referred to as  Apart from") |
| `meditation` | Meditation | 60 | `meditation.svg` 65,442 B | published | Legacy wellness |
| `pranayama` | Pranayama | 38 | `paranayama.jpg` 54,802 B | published | Legacy wellness; thinnest page |
| `pre-workouts` | Best Pre-Workout Foods - Snacks, Fruits, Protein, Carbs, Fat! | 557 | `pre-workouts.webp` 23,590 B | published; featured on home | Nutrition; mentions "challenge" |
| `during-workouts` | Best Foods During a Workout - Drinks, Snacks, Fruits, Protein! | 444 | `during-workouts.webp` 25,944 B | published; featured on home | Nutrition |
| `post-workouts` | Best Post-Workout Foods - Snacks, Fruits, Protein, Carbs, Fat! | 666 | `post-workouts.webp` 23,048 B | published; featured on home | Nutrition |
| `walk-properly` | How to Walk Properly | 1,022 | `walk-properly.webp` 19,926 B | published | Walking form (ties to step tracking); structure mirrors a well-known Healthline article |
| `sleeping`, `cooking`, `pullup`, `pushup`, `swimming`, `a-week-challenge`, `yoga`, `three-weeks-challange`, `thigh-workouts`, `home-workouts`, `abs-home-workouts` | — | 2–3 | referenced images mostly no longer exist in `src/assets/images` (e.g. `sleeping.svg`, `cooking.svg`, `abs_workout.jpg` deleted in redesign) | **placeholders "coming soon……", filtered out** | 11 dead entries |

Assessment: 0 of 9 published posts cover the current product (camera rep counting for squats/push-ups/sit-ups/jumping jacks/lunges, friend challenges, streaks, leaderboards). 5 of 9 (hiking/running/cycling/meditation/pranayama) are 38–123-word stubs about workout types that were soft-deleted from the product, with copied-encyclopedia text; they occupy 5 of the 19 sitemap slots and are linked from `/blogs`. The four nutrition/walking posts are usable but generic and undated. `BlogPosting` schema lacks author/dates (`blog-single-details.component.ts:89-108`). Body HTML uses `<h6>`/`<center>`/`<b>`/`<br/>` (no h2/h3), rendered via `[innerHTML]`.

---

## F. FAQ

Source of truth: `src/app/components/faq/faq-data.ts` (`FAQ_CATEGORIES`, 6 categories, 37 questions) rendered by `FaqComponent` with `FaqAccordionComponent` (`<h3>` + button + `role=region` panel). `FAQPage` JSON-LD **is emitted** on `/faqs` with all 37 Q/A (`faq.component.ts:37-45`) and on `/` with the 5 homepage questions (`home.component.ts:125-136`). `src/app/services/faq.service.ts` (49 Q&A with `steps`, older wording) is **not referenced anywhere** — dead code with conflicting facts (e.g. challenges "up to a full year" vs faq-data "up to two months"; sign-in "mobile number, Google or Apple" vs "mobile number").

Homepage (5): Is Buzzend free? · How does AI rep counting work? · Which exercises can it count? · Does it work on iPhone and Android? · Do I need a gym or any equipment?

`/faqs` (37):
* Getting started (7): What is Buzzend? · What makes Buzzend unique? · How does the AI rep counting work? · Does Buzzend have any fees? · Who can use the app? Is there an age limit? · How do I start? · Is Buzzend solely for fitness?
* Challenges (8): How can I create a challenge? · Can I challenge my family and friends privately? · How long can a challenge be? · Can I join multiple challenges at once? · What kinds of challenges does Buzzend provide? · Do participants need to be in the same time zone? · Is there a leaderboard to track progress in challenges? · How can I invite friends?
* Steps & activity tracking (7): How can I view my step count? · Can I monitor my weekly step counts? · Can I sync my fitness tracker? · How do I sync my steps? · Can the app track both calories and distance? · How do I set or change my step goal? · Should I add my weight and height?
* Posts & community (5): How do I post my content? · How do I like a post, and can I see who viewed it? · Can I connect with other users? · Can I share my Buzzend progress on social media? · Does the app offer chat?
* Privacy & safety (7): How do I block a user? · How do I unfollow someone? · How do I report challenge abuse? · How do I report an abusive user account? · How do I report a content violation? · How do I delete my stories or content? · Does Buzzend have a privacy policy?
* Your account (3): How do I change my username? · How can I delete my Buzzend account? · How do I get help?

Note: "Who can use the app? Is there an age limit?" answers "Anyone can use the app", while `/terms` requires 18+ and `/privacy` says the service does not address anyone under 18 — factual conflict.

---

## G. Analytics and verification

* **GTM loader present but disabled**: `src/index.html:43-56` seeds `window.dataLayer` and loads `gtm.js?id=` only if an id is supplied; the id is the empty string (L55, comment "GTM container id goes here"). No `G-…`, `GTM-…`, `UA-…` id anywhere in `src/`, `public/`, `scripts/`.
* `trackDownloadClick()` pushes `{event:'download_click', platform}` to `dataLayer` (`store-links.ts:21-26`) from home/header/footer/dl/shared-link/challenge-link — events currently go nowhere.
* No Firebase web SDK, no Meta pixel, no Clarity/Hotjar. No `google-site-verification` meta and no `google*.html` verification file (Search Console must be verified via DNS or not at all).
* **No cookie-consent banner or consent mode** in the codebase; no `localStorage`/cookie usage by the site itself. `/cookies` page is a 2022 generator boilerplate describing "Necessary" and "Functionality" cookies (login/language) the site does not set. Privacy policy references Firebase Crashlytics and GDPR rights. If GTM/GA4 is enabled, EU consent handling will be needed.
* Pre-redesign copy 1 `main` also had no analytics tags.

---

## H. Media and performance signals

Assets shipped (`src/assets`, copied verbatim to `dist` and live):
* Used on the homepage: `images/app/home.webp` 86,970 B (hero, `fetchpriority="high"`, 1080×2400 attrs), `challenge.webp` 63,220, `real-ai.webp` 28,968, `activity.webp` 47,688, `ai-counter.webp` 34,136, `streak.webp` 49,588, blog teasers `pre/during/post-workouts.webp` 23–26 KB each, store badges `appstore-link-blackbg.svg` 15,324 / `googlestore-link-blackbg.svg` 9,251, `brand/app-icon-96.png` 3,714. Homepage: 13 `<img>` in template (19 in snapshot incl. header/footer), **all with alt**, 10 `loading="lazy"`, width/height set. No `<video>`, no `<iframe>`, no carousel library (old `ngx-owl-carousel-o`, Material icons and Bootstrap were removed in the redesign).
* **Unreferenced but shipped and publicly served**: `images/mobile-device-new.svg` **7,066,456 B** (live 200), `video/teaser-720.mp4` **950,019 B** + `teaser-poster.webp` (live 200; no template references), `pushups-new.svg` 53,167, `squats-new.svg` 88,498, `pushup.svg` 68,390 (placeholder blog), `tiktok-icon.svg`, `icon.svg`, `squats.svg`. Total `assets/images` 8.2 MB, of which ~7.5 MB is unused.
* Heavy used assets: `cycling.svg` 370,993 B (blog list + `/blogs/cycling`), `hiking.svg` 107,780 B, `meditation.svg` 65,442 B.
* Template-wide `<img>` alt coverage: 50 `<img>` across 15 templates, **0 missing alt** (several decorative `alt=""`, dynamic `[alt]` bindings for API images). Blog detail hero `<img>` has no width/height (CLS risk, `blog-single-details.component.html:32-33`).
* Fonts: single self-hosted `assets/fonts/Inter-latin.woff2` (48,432 B), `font-display: swap`, variable weight 100–900 (`src/styles.scss:82-90`), preloaded in `index.html:41`. No Google Fonts (copy 1 main loaded Righteous/Montserrat/Work Sans/Material Icons from Google).
* Third parties at runtime: none (GTM disabled). External images: challenge covers/avatars from the API CDN and default `https://itg-misc-static-public.s3.us-east-2.amazonaws.com/defaultImageChallenge.png`. YouTube appears only as outbound links / linkified text in challenge descriptions (`upcoming-challenge.component.ts:86`).
* JS: initial bundle ≈ 512 KB raw (`chunk-DHZGWDQ7.js` 296 KB framework, `main` 171 KB, `polyfills` 35 KB, `styles` 10 KB; ~130 KB transfer per the Phase-1 build log); 11 lazy chunks. Budgets in `angular.json` 600 KB warn / 1 MB error. `@angular/animations` deliberately excluded (`app.module.ts:45-46`).
* Motion: IntersectionObserver reveal engine (`app.component.ts`), `prefers-reduced-motion` honoured; prerender bakes the revealed state.

---

## I. i18n

* `@angular/localize` is a dependency and `import '@angular/localize/init'` is in `src/polyfills.ts:4`, but **no `i18n` attributes or `$localize` calls exist** in templates/TS — unused weight.
* `<html lang="en">` (`src/index.html:2`); `og:locale en_US`. **No `hreflang`**, no Nepali or other locale, single-language site. `angular.json` has the default `extract-i18n` target only.

---

## J. Exact URLs used

Stores (`src/app/constants/store-links.ts`):
* App Store: `https://apps.apple.com/app/buzzend/id1658683882?ct=buzzend-website` (JSON-LD and Smart App Banner use the untagged id `1658683882`).
* Google Play: `https://play.google.com/store/apps/details?id=com.inventechgroup.buzzend&referrer=utm_source%3Dbuzzend.com%26utm_medium%3Dweb%26utm_campaign%3Dwebsite` (JSON-LD uses the untagged URL).
* Package/bundle: `com.inventechgroup.buzzend` (Apple team `YL8Z4C8AT6`); second app `com.inventechgroup.winjeet` only in repo `.well-known` files.

Social (footer `footer-section.component.html:21-37`, `/media` `media-collection.component.ts:16-41`, `sameAs` `index.html:91-96`):
* Facebook `https://www.facebook.com/Buzzend-109219458607969/`
* Instagram `https://www.instagram.com/buzzendofficial/`
* X/Twitter `https://twitter.com/buzzendofficial` (`twitter:site @buzzendofficial`)
* YouTube `https://www.youtube.com/@buzzendofficial`
* TikTok `https://www.tiktok.com/@buzzend_official` — present in copy 1 `main` footer (added June 2026, commit `d790368`), **dropped in the redesign**; `tiktok-icon.svg` still shipped. No LinkedIn anywhere.
* Company: `https://inventechgroup.com/home` (footer L86). Email: `hello@buzzend.com` (contact, FAQ, cookies, privacy).

Contact page backend: **none** — no `<form>`, no `HttpClient` call; a `mailto:hello@buzzend.com` button (`contact-us.component.html:25`). Only HTTP endpoints in the site: `POST https://io.buzzend.com/v1/public/challenge/filter-by?pageNumber=N` (`data.service.ts:20`) and `GET https://io.buzzend.com/v1/public/{contents|posts}/{id}` (`shared-link.service.ts:46,50`); staging `io-stage.buzzend.com`.

---

## K. prompt.md and SEO documentation

* `prompt.md` (identical in copy 2 and the worktree; not on copy 1 `main`) is the **redesign brief**, not an SEO changelog: a 1,516-line Claude Code prompt asking for a full UI/UX redesign ("AI fitness + movement + premium product design"), listing the five camera workouts, mandating that `/link/*` dynamic links and existing routes must not break (§4), and specifying SEO deliverables in §26-28 (titles, descriptions, canonicals, OG/Twitter, robots, sitemap, structured data incl. Organization/WebSite/Article/FAQ/Breadcrumb/SoftwareApplication, clean URLs, per-page keyword purpose), performance (§29), accessibility (§30) and a phased process (Phase 7 = SEO, Phase 8 = performance, Phase 9 = QA). It suggests pages that were never built: About, How It Works, Workouts + individual workout pages, challenge detail pages.
* Marketing's actual SEO specs are referenced but **not in either repo**: "Buzzend_SEO_Requirements" (Phase 1, commit `0119eff`, code comments cite "SEO doc §3.3, §3.5, §4.3") and "Buzzend_Remaining_SEO_Fixes" (Oct 2026, commits `50bfae6`/`8627984`).
* Done in Phase 1 (`0119eff`, 2026-10-01, merged to `origin/main` via PR #91): homepage-only prerender (`scripts/prerender-home.mjs`), exact 60-char title + ≤155 description mirrored in OG/Twitter, robots meta, iOS Smart App Banner, SVG/PNG favicons, apple-touch-icon, web manifest, 1200×630 OG image, homepage heading tree (H1 "Fitness Challenges With Friends, Counted by AI", six §3.3 feature headings, five FAQ questions), tracked store links (`ct=` / Play `referrer`), `download_click` dataLayer events, GTM loader stub, sitemap reduced to hashless URLs.
* Done in Phase 2 (`8627984`, unmerged, partially deployed): hash → path routing, `/home` → `/`, per-slug blog URLs with legacy redirect, prerender of all sitemap routes + noindex extras with build-time verification, shell guard, CloudFront clean-URL function, skip-link fix, README.
* Explicitly left open / "later": GTM container id ("once marketing supplies its id", `index.html:44-55`), attaching the CloudFront function and switching the deploy to `build:seo` (README), the worktree's note that `build` should include prerender (`5a28789`), `/link/*` prerender intentionally excluded. README (copy 2) also lists the **TODO-like constraint** "Add every new public page to the sitemap".

---

## Findings (numbered, with evidence and severity)

1. **High — The live site is the un-prerendered SPA shell and every non-root URL returns HTTP 404.** `curl https://buzzend.com/` → 200, 7,707 B, 0 `<h1>`, empty `<app-root>`; `/faqs`, `/challenges`, `/blogs/hiking`, `/dl`, `/link/*`, `/this-page-does-not-exist` → **404** with the same shell (`x-cache: Error from cloudfront`). The sitemap (identical to `src/sitemap.xml`) advertises 19 URLs, 18 of which 404, and its XML comment claims they are prerendered. Root cause: deploy used `npm run build` (`package.json:7` = `ng build`) instead of `build:seo` (`:11`), and `deploy/cloudfront-clean-urls.js` is not attached (no 301 on `/faqs/` or `/home`). Fix path: run `build:seo` (or make `build` include prerender as worktree commit `5a28789` did), upload the whole `dist/fitness-app/browser/` including `<route>/index.html`, attach the function, then re-probe. Until then Google can index only the homepage, and only via JS rendering.
2. **High — Phase 2 SEO work is unmerged and duplicated across two divergent branches.** copy 2 `seo/clean-urls-prerender` (`8627984`) is 1 commit ahead of `origin/main` and exists only on the personal fork `self`; copy 1's worktree `seo/phase2-clean-urls` (`5a28789`) is an older, incompatible variant (`/faq` instead of `/faqs`, `index.csr.html`, `infra/`). Deploying from the wrong branch would change public URLs again. Copy 1's `main` and its `origin/main` ref are three months stale.
3. **High (content) — 5 of 9 published blog posts are 38–123-word legacy-workout stubs with copied encyclopedia text.** `src/app/blog.json:2-25,62-67` (hiking/running/cycling/meditation/pranayama; "[1]" citation artifacts at L11, L17; broken sentence L17). They are in the sitemap and `BlogPosting` schema is emitted for them (`blog-single-details.component.ts:89-108`). No post covers camera rep counting, friend challenges or streaks. Thin/duplicate content risk; recommend noindex/remove or rewrite around current workouts.
4. **Medium — `/challenges` SEO copy describes the pre-pivot product.** Meta description "walking, running, yoga, meditation and more" (`challenges.component.ts:60`) and hero paragraph (`challenges.component.html:10-13`) vs. filter chips Squats/Push Up/Lunge/Sit Up/Jumping Jack (`FILTER_WORKOUTS`, L21-27) and the homepage marquee (`home.component.ts:37-45`). Also the H1 "Challenge your crew." carries no keyword.
5. **Medium — Prerendered snapshots contain no challenge content.** API hosts are blocked (`scripts/prerender.mjs:36,238-241`), so `dist/challenges/index.html` body text reads "No challenges here right now — check back soon." and the homepage snapshot omits the "Challenges you can join today" section (`active-challenge.component.html:1` renders nothing when the list is empty). Crawlers that do not execute JS see an empty challenges page. Consider a build-time fetch of public challenges (or static fallback copy) instead of blocking.
6. **Medium — Twitter card and OG type/alt tags are never updated per page.** `SeoService.update()` (`seo.service.ts:24-36`) sets `og:title/description/url/image` but not `twitter:title`, `twitter:description`, `twitter:image`, `og:type`, `og:image:alt`; confirmed `dist/faqs/index.html` and `dist/blogs/hiking/index.html` carry the homepage Twitter title/description and `og:type=website`.
7. **Medium — `BlogPosting` schema is incomplete and descriptions are auto-truncated.** No `author`, `datePublished`, `dateModified`, `mainEntityOfPage`; `description` = first 160 chars of the body with "…" (`blog-single-details.component.ts:83`); `image` is a line-art SVG for 4 posts. `blog.json` has no author/date fields to source from.
8. **Medium — `/link/*` deep-link landings expose the homepage head and a 404 status to scrapers.** Not prerendered (by design, `prerender.mjs:13-14`), so the served HTML is the homepage snapshot (title/canonical/OG of the homepage) until JS runs; `SharedLinkComponent`/`ChallengeLinkComponent` call `seo.update` without `path` → canonical `https://buzzend.com/` (`shared-link.component.ts:58-62`, `challenge-link.component.ts:60-64`). Live they return HTTP 404 (finding 1). Shared posts therefore show the generic Buzzend card (or nothing) in iMessage/WhatsApp/Slack previews. Consider a lightweight server-side OG endpoint or a dedicated prerendered `/link` shell with generic-but-correct tags.
9. **Medium — Live `.well-known` files are stale and the AASA has the wrong content type.** Live AASA/assetlinks `Last-Modified: 29 Apr 2026`, missing the `winjeet` entries present in `public/.well-known/*` (repo), AASA served as `application/x-www-form-urlencoded` (Apple expects `application/json`). Outside pure SEO, but the deploy evidently did not include `public/` or S3 kept older objects.
10. **Medium — `www.buzzend.com` does not resolve; no HSTS.** `dig www.buzzend.com` empty; `curl https://www.buzzend.com` fails. Add a DNS record + redirect to the apex (and an ACM cert SAN); add `Strict-Transport-Security`.
11. **Medium — No analytics or Search Console verification are actually wired.** GTM id is `''` (`src/index.html:55`); `download_click` pushes are unobserved (`store-links.ts:21-26`); no `google-site-verification` meta/file. No consent mechanism exists if GTM is later enabled (`/cookies` boilerplate dated 2022, `cookies.component.html:10`).
12. **Medium — Title/H1 strategy.** Three blog titles 71–72 chars (`dist/blogs/{pre,during,post}-workouts`), legal/blog/FAQ titles 14–20 chars ("Blog | Buzzend", "FAQs | Buzzend", "Hiking | Buzzend"), marketing H1s without target terms on `/challenges`, `/blogs`, `/faqs`, `/app-guide`, `/contact-us`, `/media` (see table). Homepage title is exactly 60 chars as specified.
13. **Low — `robots.txt` blocks `/dl` while it is the primary CTA target on every page** (`Disallow: /dl`, `src/robots.txt:3`; `routerLink="/dl"` in header, footer, home, challenges, cards). The page's `noindex` can never be read; Google may list the URL without a snippet. Either allow crawling and rely on `noindex`, or link CTAs directly to the tagged store URLs.
14. **Low — ~7.5 MB of unreferenced assets are built and publicly served**: `assets/images/mobile-device-new.svg` 7,066,456 B, `assets/video/teaser-720.mp4` 950,019 B (+ poster), `pushups-new.svg`, `squats-new.svg`, `pushup.svg`, `tiktok-icon.svg`, `icon.svg`, `squats.svg` (no references in `src/app/**` or `styles.scss`). Not a page-weight issue (unreferenced) but wastes S3/CDN and build time; `cycling.svg` (371 KB) *is* used on `/blogs` and `/blogs/cycling`.
15. **Low — Sitemap `lastmod` is hand-maintained and uniform** (`src/sitemap.xml:8-26`, all 2026-10-06) despite real dates (privacy 2026-09-03, cookies 2022-09-28, blog undated). Consider generating the sitemap at build time from routes + content dates.
16. **Low — Dead FAQ service with conflicting facts.** `src/app/services/faq.service.ts` (49 Q&A, unused) vs `faq-data.ts` (37): challenge duration "up to a full year" vs "up to two months"; sign-in methods differ. Also `faq-data.ts:31-33` "Anyone can use the app" vs `/terms` 18+ and `/privacy` under-18 exclusion. Resolve before FAQ schema is relied upon.
17. **Low — Unknown blog slug does not 404.** `blog-single-details.component.ts:68-73` navigates to `/blogs` (200) instead of the error route; with the CF function attached the host will 404 anyway, but the client behaviour masks typos in links.
18. **Low — TikTok profile dropped.** `https://www.tiktok.com/@buzzend_official` was in the pre-redesign footer (copy 1 `main`, `footer-section.component.html:129`) and is absent from footer, `/media` and `sameAs` in copy 2; no LinkedIn either. Confirm which profiles are active and add them to `sameAs`.
19. **Low — `@angular/localize` initialised but unused** (`src/polyfills.ts:4`, `package.json` dependency) — small bundle overhead; no hreflang needed while single-locale.
20. **Low — Reachable duplicate URL variants once the CF function is live**: `/index.html`, `/faqs/index.html`, `/blogs/hiking/index.html` return 200 (extension passthrough, `deploy/cloudfront-clean-urls.js:32-36`). Canonical tags mitigate; optionally 301 `*/index.html` → clean URL.
21. **Low — FAQPage markup has limited upside**: since 2023 Google shows FAQ rich results only for authoritative government/health sites; harmless but do not expect rich snippets from `/` or `/faqs`.
22. **Low — Blog body semantics**: article HTML in `blog.json` uses `<h6>` for sub-headings (skipping h2–h5), `<center>`, `<b>`, `<br/>` runs; rendered via `[innerHTML]` (`blog-single-details.component.html:35`); hero image lacks dimensions (L32-33).
23. **Low — Snapshot served at `/index.html` blanks itself.** The shell guard compares `location.pathname` to `/` and empties `app-root` for `/index.html` (`prerender.mjs:150-151`), so a direct `/index.html` visit renders blank until JS boots — cosmetic.

---

## Top uncertainties

1. **CloudFront configuration is not in the repo.** Whether a custom error response (404 → 200 or 404 → 404) is set, whether the viewer-request function will be attached, which S3 bucket/distribution is used and who performs deploys (no CI). Live behaviour (404 for everything but `/`) implies "error document = index.html, status 404" today.
2. **Exact source of the live build.** Live `main-PXZMXNP3.js` differs from copy 2's `dist/main-5UHNGWBO.js` in 126 bytes (chunk-hash references only), so it was built from the same source on a different run/machine, probably commit `8627984` or the Oct 6-8 working tree; cannot prove the commit hash.
3. **Marketing's SEO spec documents** ("Buzzend_SEO_Requirements", "Buzzend_Remaining_SEO_Fixes", sections §3.3/§3.5/§4.3) are referenced in commits/comments but not present in either repo — the "done vs left" list above is reconstructed from commit messages and code.
4. **Originality of blog content**: the running/cycling/hiking leads look like verbatim Wikipedia/Britannica text and "How to Walk Properly" mirrors a Healthline article; not verified with a plagiarism tool.
5. **Which FAQ facts are correct** (challenge max duration, sign-in methods, age limit) — two conflicting data sources in the repo and conflicts with the legal pages.
6. **Whether `/challenges/current` and `/challenges/upcoming` are still shared externally** (kept only for that reason, `app-routing.module.ts:46-48`); they could be 301'd to `/challenges`.
7. **GTM/GA4 ownership**: container id, Search Console property/verification method (likely DNS), and whether EU consent is required for the planned analytics.
8. **Deep-link scope**: whether the `winjeet` app entries should be live in `.well-known`, and whether the AASA content type has caused Universal Link validation problems — out of SEO scope but surfaced by the live diff.
9. **`www` intent**: no DNS record for `www.buzzend.com` — may be intentional, but typed-in `www` traffic currently fails.
10. **Runtime behaviour of the snapshots on the real CDN** (inline `<style>` blocks, `data-beasties-container` critical CSS, hydration-free re-bootstrap) was only inspected statically; no browser run was performed in this audit.
