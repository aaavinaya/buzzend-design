# Live website audit — buzzend.com (observed 2026-10-15)

Method: HTTP fetches of all 19 sitemap URLs plus 17 variant/edge URLs with a desktop browser User-Agent, 3 pages re-fetched as Googlebot; headers via HEAD requests; JS bundle downloaded and searched. Raw HTML saved in the session scratchpad (`site-raw/`). No crawler tool, Lighthouse or Search Console was used.

## Status of every URL

| URL | UA | HTTP | Bytes | Title chars | Meta desc chars | H1 count | Visible words | Canonical | Notes |
|---|---|---|---|---|---|---|---|---|---|
| https://buzzend.com/ | browser | 200 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ |  |
| http://buzzend.com/ | browser | 200 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ |  |
| https://www.buzzend.com/ | browser | None | 0 | 0 | 0 | 0 |  |  | connection failed: <urlopen error [Errno 8] nodename nor servname provided, or  |
| https://buzzend.com/index.html | browser | 200 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ |  |
| https://buzzend.com/challenges | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/challenges/ | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/faqs | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/app-guide | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/hiking | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/running | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/cycling | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/meditation | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/pranayama | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/pre-workouts | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/during-workouts | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/post-workouts | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/walk-properly | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/media | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/contact-us | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/privacy | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/terms | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/cookies | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/dl | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/error | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/this-page-does-not-exist-xyz123 | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/link/challenges/1 | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/link/posts/1 | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/link/invite/1 | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/.well-known/assetlinks.json | browser | 200 | 345 | 0 | 0 | 0 |  |  | application/json |
| https://buzzend.com/.well-known/apple-app-site-association | browser | 200 | 399 | 0 | 0 | 0 |  |  | application/x-www-form-urlencoded |
| https://buzzend.com/apple-app-site-association | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blog | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/faq | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/download | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/privacy-policy | browser | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/ | googlebot | 200 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ |  |
| https://buzzend.com/challenges | googlebot | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |
| https://buzzend.com/blogs/hiking | googlebot | 404 | 7707 | 60 | 138 | 0 | 10 | https://buzzend.com/ | serves SPA shell with 404 |

## Homepage head as served (verbatim values)

- `<title>` (60 chars): Buzzend: Fitness Challenge App With Friends | AI Rep Counter
- meta description (138 chars): Challenge friends, keep your daily streak and climb live leaderboards while Buzzend's AI camera counts every rep. Free on iOS and Android.
- robots: ['index, follow']; canonical: ['https://buzzend.com/']; lang: en; hreflang: none
- Open Graph: {"og:type": "website", "og:site_name": "Buzzend", "og:title": "Buzzend: Fitness Challenge App With Friends | AI Rep Counter", "og:description": "Challenge friends, keep your daily streak and climb live leaderboards while Buzzend's AI camera counts every rep. Free on iOS and Android.", "og:url": "https://buzzend.com/", "og:image": "https://buzzend.com/assets/brand/og-image.jpg", "og:image:width": "1200", "og:image:height": "630", "og:image:alt": "Buzzend — social fitness challenges with AI rep counting", "og:locale": "en_US"}
- Twitter: {"twitter:card": "summary_large_image", "twitter:site": "@buzzendofficial", "twitter:title": "Buzzend: Fitness Challenge App With Friends | AI Rep Counter", "twitter:description": "Challenge friends, keep your daily streak and climb live leaderboards while Buzzend's AI camera counts every rep. Free on iOS and Android.", "twitter:image": "https://buzzend.com/assets/brand/og-image.jpg", "twitter:image:alt": "Buzzend — social fitness challenges with AI rep counting"}
- JSON-LD types: Organization, MobileApplication, WebSite (one @graph block; MobileApplication has downloadUrl for both stores, Offer price 0 USD, no aggregateRating)
- Analytics markers found in HTML: ['GTM-XXXXXXX'] (literal placeholder container ID)
- Visible text words: 10; H1: none; H2: none; images: 0; store links in HTML: none (all rendered client-side)
- `apple-itunes-app` meta present (app-id=1658683882) → Safari Smart App Banner works.

## Hosting facts (HEAD requests)

- Origin: AmazonS3 behind CloudFront (`x-cache: Error from cloudfront` on every non-root path; `Hit/Miss from cloudfront` on root). Edge POP observed: BOM78.
- `last-modified` of index.html, sitemap.xml, robots.txt, main JS: Thu, 08 Oct 2026 03:19 GMT → the Oct 7 `seo/clean-urls-prerender` build WAS uploaded, but `/challenges/index.html`, `/challenges.html` and `/privacy/index.html` all return 404 → the prerendered route folders are not in the bucket (or a clean-URL rewrite function is not attached).
- No `Strict-Transport-Security`, no `Cache-Control` on HTML/JS/robots/sitemap. Compression not verified (HEAD without Accept-Encoding).
- `www.buzzend.com`: no DNS record (dig returns nothing) → connection failure. Apex resolves to CloudFront IPs; Route 53 nameservers.
- `/.well-known/assetlinks.json` → 200, application/json, package com.inventechgroup.buzzend, SHA-256 fingerprint present. `/.well-known/apple-app-site-association` → 200 but Content-Type `application/x-www-form-urlencoded`; appID YL8Z4C8AT6.com.inventechgroup.buzzend, matches all paths (`/` : `*`).
- API host `io.buzzend.com` exists (referenced in the bundle).

## Routes compiled into the live bundle (main-PXZMXNP3.js)

`''`, `/`, `home`, `challenges`, `challenges/current`, `challenges/upcoming`, `faqs`, `app-guide`, `blogs`, `blogs/:slug`, `blog-details`, `media`, `contact-us`, `privacy`, `terms`, `cookies`, `dl`, `error`, `coming-soon`, `link/challenges/:id`, `link/posts/:postId`, `link/contents/:contentId`. No `useHash` → path-based routing only; legacy `#/...` links (e.g. the Play privacy URL `https://buzzend.com/#/privacy`) land on the shell and depend on a client-side fragment handler (none found in the bundle by string search — confirm in source).

## Search engine indexation snapshot

- DuckDuckGo `site:buzzend.com`: 1 result (homepage). Bing `site:buzzend.com`: reports 85 results (URL list in the discovery summary). Google: not checkable without Search Console (the search tool used does not honor `site:`).

## Findings (severity → fix → validation)

1. **P0 — Every page except the homepage returns HTTP 404.** All 18 non-root sitemap URLs (challenges, faqs, app-guide, blogs ×10, media, contact-us, privacy, terms, cookies), `/dl` and `/link/*` return 404 with the SPA shell. Google does not index 4xx URLs and removes previously indexed ones (Google Search Central, HTTP status codes doc, observed 2026-10-15). Impact: only one indexable page; sitemap errors; the Play privacy-policy link and any `/dl` smart link are broken for crawlers and link previews. Fix: deploy the prerendered route folders from `scripts/prerender.mjs` to S3 and attach the CloudFront clean-URL function (or S3 error-document/CloudFront custom-error returning the route's own HTML with 200 only for real routes); keep genuine 404s as 404. Validation: `curl -I` each sitemap URL → 200 with its own title/H1/canonical; Search Console URL Inspection; sitemap report shows 19 indexed.
2. **P0 — Homepage is an empty client-rendered shell** (10 visible words, no H1, no store links in HTML, same for Googlebot). Fix: ship the prerendered index.html; Validation: `curl -s https://buzzend.com/ | grep -c '<h1'` ≥ 1 and visible copy present.
3. **P0 — Analytics not firing:** GTM container ID is the literal placeholder `GTM-XXXXXXX`; no GA4 tag or Search Console verification meta found. Fix: real GTM/GA4 ID in `index.html`/environment, verify GSC via DNS. Validation: Tag Assistant / GA4 realtime; GSC property verified.
4. **P1 — Canonical collapse:** because the shell is served everywhere, every path carries `canonical=https://buzzend.com/`. Harmless while pages 404, harmful the moment they return 200 without per-route prerender. Validation: per-page canonical equals its own URL.
5. **P1 — `www.buzzend.com` does not resolve.** Fix: add CNAME/alias to CloudFront and 301 to apex. Validation: `curl -I https://www.buzzend.com/` → 301 → 200.
6. **P2 — Security/caching headers absent** (no HSTS, no Cache-Control). Fix: CloudFront response-headers policy. Validation: headers present.
7. **P2 — Legacy hash URLs:** Play Console privacy URL `https://buzzend.com/#/privacy` and older material use `#/`. Fix: client-side fragment→path redirect plus update store links to `/privacy`. Validation: open the URL → privacy content visible.
8. **P2 — AASA served as `application/x-www-form-urlencoded`.** Apple recommends `application/json`. Fix: S3 object metadata. Validation: `curl -I`.
9. **P3 — Brand consistency in structured data:** `sameAs` lists `youtube.com/@buzzendofficial`; the promo video's channel is `@buzzend.official` (YouTube oEmbed, 2026-10-15). Verify which handle is real and align.
10. **Positive:** robots.txt and sitemap.xml are correct in form (sitemap lists only clean URLs, `lastmod` 2026-10-06; robots disallows `/dl` and `/error`); OG/Twitter tags and og-image (1200×630, 110 KB) present; JSON-LD Organization/MobileApplication/WebSite present without fabricated ratings; Smart App Banner meta present; AASA and assetlinks served.
