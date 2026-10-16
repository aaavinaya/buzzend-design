# Platform rules and limits verified against official documentation (observed 2026-10-15)

Every limit below was read from the official page on 2026-10-15. Re-check before publishing; Apple and Google change these pages without notice.

## Apple App Store (App Store Connect)

| Field / rule | Verified value | Source |
|---|---|---|
| App name | "at least two characters and no more than 30 characters" | developer.apple.com/help/app-store-connect/reference/app-information |
| Subtitle | "can't be longer than 30 characters" | same |
| Promotional text | "can't be longer than 170 characters"; editable any time without a new version; "promotional text doesn't affect your app's search ranking" | …/reference/platform-version-information; developer.apple.com/app-store/search/ |
| Description | "Limited to 4000 characters", plain text, no HTML; first sentence is what users see before "more" | …/platform-version-information; developer.apple.com/app-store/product-page/ |
| Keywords | "up to 100 bytes"; "separated by commas and no spaces" (spaces allowed inside a phrase); don't repeat words already in name, subtitle or category; avoid plurals, "app", filler words, special characters; no trademarks, competitor names, irrelevant terms | …/platform-version-information; developer.apple.com/app-store/search/ |
| What's New | "Limited to 4000 characters"; required after v1 | …/platform-version-information |
| Support URL | must lead to actual contact information; Marketing URL optional; both localizable | same |
| Screenshots | up to 10 per device size; JPG/PNG, no alpha; **required: at least one for "iPhone with Dynamic Island (medium display)" (1179×2556 or 1206×2622)** and, if the app runs on iPad, one for the 13" display (2064×2752 or 2048×2732); larger sizes scale down automatically | …/reference/screenshot-specifications |
| App previews | up to 3 per localization per device size, up to 30 s, device-captured footage | developer.apple.com/app-store/product-page/ |
| Categories | primary and secondary are indexed by search; irrelevant category = rejection | developer.apple.com/app-store/search/ |
| Search ranking factors (Apple's words) | "text relevance (matches for your app's title, subtitle, keywords, and primary category), as well as user behavior (downloads, ratings and reviews, and more)" | developer.apple.com/app-store/search/ |
| Custom product pages | up to 70; vary screenshots, promotional text, app previews; reachable by unique URL, Apple Ads, deep links; can be assigned keywords so they appear in search instead of the default page | developer.apple.com/app-store/custom-product-pages/ |
| Product page optimization | up to 3 treatments vs original; icons, screenshots, previews; runs up to 90 days; Apple recommends acting only at ≥90% confidence; new metadata needs App Review | developer.apple.com/app-store/product-page-optimization/ |
| Review Guideline 2.3.7 | unique name, accurate keywords, no trademarked terms/popular app names/pricing information/irrelevant phrases in metadata; subtitles must not reference other apps or make unverifiable claims | developer.apple.com/app-store/review/guidelines/ |
| Review Guideline 5.1.1 | privacy policy link in ASC and in-app; purpose strings must "clearly and completely describe" data use; consent before collecting user or usage data | same |

## Google Play (Play Console)

| Field / rule | Verified value | Source |
|---|---|---|
| App name | 30 characters | support.google.com/googleplay/android-developer/answer/9859152 |
| Short description | 80 characters; no emojis/symbols/line breaks/repeated punctuation/caps for emphasis; avoid performance, ranking, award, testimonial, **price and promotional language** ("Best", "#1", "Top", "New", "Discount", "Sale") and calls to action ("download now") | …/answer/9859152; …/answer/9866151 |
| Full description | 4000 characters; limits count full- and half-width characters equally | …/answer/9859152 |
| Metadata policy | no emojis/emoticons/repeated special characters or ALL CAPS in title, icon, developer name; no store performance/ranking/price/promo references ("#1", "Best of Play", "free for limited time only", "New"); no unattributed testimonials in the description; avoid repetitive or unrelated keywords | …/answer/9898842 |
| App icon | 512×512, 32-bit PNG with alpha, ≤1024 KB | …/answer/9866151 |
| Feature graphic | 1024×500, JPEG or 24-bit PNG (no alpha); shown as video cover and in large-format placements; keep focal point central, avoid device imagery and Play badges | same |
| Screenshots | 2–8 per device type; JPEG/24-bit PNG; 320–3840 px; longer side ≤ 2× shorter; for large-format eligibility ≥4 shots ≥1080 px in 16:9 or 9:16; tablets/Chromebook ≥4 shots 1080–7680 px; taglines ≤20% of the image; show actual in-app experience; avoid "Best/#1/Top/New/Discount/Sale" | same |
| Preview video | YouTube URL (not playlist/channel), public or unlisted, not age-restricted, monetization off, embeddable; show the real experience in the first 10 s, only the first 30 s autoplay | same |
| Custom store listings | up to 50; customize name, icon, descriptions, graphics; target countries, search keywords, Ads traffic, lapsed/churned users, custom URL `…&listing=<id>`; not auto-translated | …/answer/9867158 |
| Store listing experiments | one default-graphics experiment or up to five localized experiments at a time; up to 2 variants; auto-stop after 6 months; results as confidence interval + minimum detectable effect; the page does not say experiments affect search ranking | …/answer/6227309 |

## Google Search

| Rule | Verified wording | Source |
|---|---|---|
| 4xx | "Google doesn't index URLs that return a 4xx status code"; already-indexed 4xx URLs "are removed from the index" | developers.google.com/search/docs/crawling-indexing/http-network-errors |
| Redirects | 301 = "strong" signal for the target; 302 = "weak" signal | same |
| Soft 404 | 200 page whose content "suggests an error… an empty page or an error message" is reported as soft 404 | same |
| JavaScript sites | "Googlebot queues all pages with a 200 HTTP status code for rendering"; "use a meaningful status code, like a 404"; "use the History API… don't use fragments"; "server-side or pre-rendering is still a great idea" | developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics |

## Apple app previews (added after the first pass)

| Rule | Verified value | Source |
|---|---|---|
| Length / size / frame rate | 15–30 seconds; ≤500 MB; ≤30 fps; H.264 (.mov/.m4v/.mp4) or ProRes 422 HQ (.mov); stereo AAC 256 kbps | developer.apple.com/help/app-store-connect/reference/app-preview-specifications |
| Resolution | iPhone 6.9"/6.5"/6.1"/5.8" classes: 886×1920 portrait (1920×886 landscape); 5.5": 1080×1920; iPad 13"/11"/10.5": 1200×1600 | same |
| Count / order | up to 3 per device size per language; previews always appear before screenshots; poster frame selectable (default 5 s); processing up to 24 h | same |
| Content rule (from Review Guideline 2.3.4) | previews may only show captures of the app itself; narration and overlays allowed | developer.apple.com/app-store/review/guidelines/ |

## Google Play acquisition metric definitions (for the measurement plan)

| Metric | Verified definition | Source |
|---|---|---|
| Store listing visitors | "users that visited your Store Listing who didn't already have your app installed on any of their devices"; counted once per day per dimension | support.google.com/googleplay/android-developer/answer/9859173 ("Understand and grow your app's user base") |
| Store listing acquisitions | "users who visited your Store Listing and installed your app"; excludes users who already had the app on another device | same |
| Click-through rate | percentage of visitors who clicked Install/Open/Pre-register; "replaces the legacy 'Conversion Rate' metric" | same |
| Traffic sources | Google Play search = searched for the app's name (ads excluded); Google Play explore = browsed then visited; Ads and referrals = from an ad or referral (Google Ads impressions not reported in Console) | same |
| Search terms report | terms with too few visitors/acquisitions are grouped as "Other" ("did not have enough visitors or acquisitions over time to be reported individually") — explains why Buzzend's Sept report showed only "Other" | same |
| Country / language | country = Google account registration country; language = device language | same |

Implication: Apple "conversion rate" (downloads ÷ unique impressions or product page views, App Analytics) and Play CTR/acquisitions use different denominators and exclusions; never compare them directly.

## Google Search appearance guidance (for titles, snippets, structured data)

| Topic | Verified wording | Source |
|---|---|---|
| Title links | "there's no limit on how long a `<title>` element can be" but links are truncated to device width; "Write descriptive and concise text"; "Avoid keyword stuffing"; "Avoid repeated or boilerplate text"; put the site name "at the beginning or end"; Google "might modify the title link"; sources include `<title>` and heading elements | developers.google.com/search/docs/appearance/title-link |
| SoftwareApplication / MobileApplication rich result | required: `name`, `offers.price` (0 for free), and one of `aggregateRating` or `review`; recommended `applicationCategory`, `operatingSystem`; follow Review-snippet guidelines → do not add a rating that is not genuinely collected on the site. The site's current markup has no rating, so it is valid structured data but not eligible for the rich result — acceptable | developers.google.com/search/docs/appearance/structured-data/software-app |
| FAQPage | "This feature will no longer appear in Google Search starting May 7, 2026"; documentation removed 2026-06-15. FAQPage markup therefore brings no rich-result benefit; keep or drop for semantics only | developers.google.com/search/docs/appearance/structured-data/faqpage (changelog entries 2026-05-08, 2026-06-15) |
