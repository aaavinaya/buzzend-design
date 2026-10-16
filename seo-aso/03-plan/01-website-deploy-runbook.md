# Website deploy runbook — make every page return 200 (prepared 2026-10-15)

Who: whoever holds the AWS console or CLI for the buzzend.com S3 bucket and CloudFront distribution (decision Q5: manual upload). Repo: `Inventech Projects/Angular/buzzend/angular-buzzend` as it is on your machine (no pulls or merges; decision of 2026-10-15). The code and content changes to make before this deploy are specified inside that repo at `docs/seo-changes-2026-10/README.md`. Time: about 45 minutes the first time.

## 0. Why

Live today: `/` is a 7.7 KB JavaScript shell and every other path (18 sitemap URLs, `/dl`, `/link/*`) returns HTTP 404 because the Oct 7 upload came from `npm run build` (no prerender) and the CloudFront clean-URL function was never attached. Google does not index 4xx URLs.

## 1. Build (from your current checkout)

```bash
cd "/Users/avinayaacharya/Development/Inventech Projects/Angular/buzzend/angular-buzzend"
git status                                  # commit your changes from docs/seo-changes-2026-10 first
npm ci
npx playwright install chromium             # prerender needs Chromium once per machine
npm run build:seo                           # = ng build && node scripts/prerender.mjs
```

Expected: `dist/fitness-app/browser/` contains `index.html` plus one folder per route with its own `index.html` (`faqs/`, `challenges/`, `blogs/hiking/`, `privacy/`, …, and the noindex extras `dl/`, `error/`, `coming-soon/`). The script fails the build if a page has no H1 or a wrong canonical, so a green build is the content check.

Spot-check locally before uploading:

```bash
grep -c '<h1' dist/fitness-app/browser/index.html            # ≥ 1
grep -o '<title>[^<]*' dist/fitness-app/browser/faqs/index.html
grep -o 'rel="canonical" href="[^"]*' dist/fitness-app/browser/blogs/hiking/index.html
```

## 2. Upload to S3

Find the bucket name in the CloudFront distribution's origin settings (console → CloudFront → the buzzend.com distribution → Origins). Then:

```bash
BUCKET=<bucket-name>
# long-lived cache for hashed assets, short cache for HTML and the two text files
aws s3 sync dist/fitness-app/browser "s3://$BUCKET" --delete \
  --exclude "*.html" --exclude "sitemap.xml" --exclude "robots.txt" --exclude ".well-known/*" \
  --cache-control "public,max-age=31536000,immutable"
aws s3 sync dist/fitness-app/browser "s3://$BUCKET" \
  --exclude "*" --include "*.html" --include "sitemap.xml" --include "robots.txt" \
  --cache-control "public,max-age=300"
# the .well-known files: JSON content type, no cache surprises
aws s3 cp dist/fitness-app/browser/.well-known/apple-app-site-association "s3://$BUCKET/.well-known/apple-app-site-association" --content-type application/json --cache-control "public,max-age=3600"
aws s3 cp dist/fitness-app/browser/.well-known/assetlinks.json "s3://$BUCKET/.well-known/assetlinks.json" --content-type application/json --cache-control "public,max-age=3600"
```

`--delete` removes stale hashed bundles. Keep the S3 static-website error document as `index.html` (the README depends on it for `/link/*`).

## 3. Attach the CloudFront function (one time)

Console → CloudFront → Functions → Create function → name `buzzend-clean-urls`, runtime cloudfront-js-2.0 → paste `deploy/cloudfront-clean-urls.js` → Save → Test with URI `/faqs` (expect `/faqs/index.html`) and `/faqs/` (expect a 301 to `/faqs`) → Publish → Associate with the buzzend.com distribution, default behavior, event **Viewer request**.

While there, add a **response headers policy** to the same behavior: `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

## 4. Invalidate and verify

```bash
DIST=<distribution-id>
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*"
for p in / /challenges /faqs /app-guide /blogs /blogs/walk-properly /media /contact-us /privacy /terms /cookies /dl /faqs/ /home /this-does-not-exist; do
  printf "%-28s " "$p"; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://buzzend.com$p"
done
```

Acceptance: every sitemap URL → `200`; `/faqs/` → `301` to `/faqs`; `/home` → `301` to `/`; `/this-does-not-exist` → `404`; `/dl` → `200` (noindex page). Then:

```bash
curl -s https://buzzend.com/ | grep -c '<h1'                    # ≥ 1
curl -s https://buzzend.com/faqs | grep -o '<title>[^<]*'        # FAQs | Buzzend (or the new title)
curl -sI https://buzzend.com/.well-known/apple-app-site-association | grep -i content-type   # application/json
```

## 5. `www` and DNS (same session)

Route 53 → hosted zone buzzend.com → add `www` as an **A alias** to the CloudFront distribution. CloudFront → distribution → add `www.buzzend.com` as an alternate domain name and extend the ACM certificate to include it (us-east-1). Add a second small CloudFront function or a line in the existing one to 301 `www.buzzend.com/*` → `https://buzzend.com/*`. Verify: `curl -I https://www.buzzend.com/` → 301 → 200.

## 6. Search Console and analytics (same day)

1. Search Console → add property `buzzend.com` (domain property) → verify with the TXT record in Route 53 → submit `https://buzzend.com/sitemap.xml` → request indexing for `/`, `/challenges`, `/faqs`, `/app-guide`.
2. Create the GTM container and GA4 property (decision Q8), put the real container id into `src/index.html` (the loader is already there), add a consent banner per the SEO package, rebuild and redeploy (steps 1–4).

## 7. Post-deploy watch

- Day 1: Search Console → URL inspection on three pages shows "URL is available to Google".
- Day 7: Pages report shows the 19 indexable URLs discovered; the sitemap shows 19 submitted.
- Day 14–30: first impressions and queries appear in Performance; compare with the baseline (none).

## Rollback

Re-sync the previous `dist` (keep the last build zipped) and invalidate `/*`; detach the function if a route misbehaves. Nothing here touches the app or the API.
