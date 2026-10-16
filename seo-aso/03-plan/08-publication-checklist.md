# Publication checklist (prepared 2026-10-15)

Nothing below is done until you tick it. Keep this file with dates and initials.

## Before publishing — website repo and hosting
- [ ] PR `seo/clean-urls-prerender` → `main` merged; `npm run build:seo` green (prerender validation passed)
- [ ] `src/index.html` has the real GTM id; consent banner present; `google-site-verification` not needed (DNS verification)
- [ ] Blog stubs removed from `blog.json` and `sitemap.xml`; redirect map added to `deploy/cloudfront-clean-urls.js`
- [ ] New pages present in `sitemap.xml`; each has title, description, canonical, H1, breadcrumb schema
- [ ] `sameAs`/footer handles = @buzzend.official set; `pt=` added to App Store links
- [ ] Spot-check `dist/fitness-app/browser/{faqs,challenges,blogs/walk-properly}/index.html` titles and canonicals
- [ ] Upload per runbook §2; CloudFront function attached (§3); invalidation created (§4)

## Before publishing — Google Search Console
- [ ] Domain property verified (TXT)
- [ ] Sitemap submitted; no errors
- [ ] URL inspection requested for `/`, `/challenges`, `/ai-rep-counter`, `/squat-counter-app`, `/push-up-counter-app`

## Before publishing — Google Play Console
- [ ] Data safety answers updated per package 05 and approved internally
- [ ] Title (29/30), short description (≤80, no "free", no "!"), full description pasted from package 03; character counts match
- [ ] Screenshots 1080×1920 (≥4, first = counting mid-set), tablet sets, feature graphic 1024×500, icon 512×512 uploaded
- [ ] Privacy policy URL = `https://buzzend.com/privacy` (returns 200)
- [ ] No experiment running in the same week as a metadata change
- [ ] "What's new" text free of superlatives and prices

## Before publishing — App Store Connect
- [ ] Privacy labels updated per package 05
- [ ] Name (29/30), subtitle (29/30), keyword field (100/100 bytes, comma-separated, no spaces after commas, no repeats of name/subtitle words), promotional text (≤170), description pasted from package 02
- [ ] Support URL `/contact-us` and privacy URL `/privacy` return 200
- [ ] Screenshots: 6.9"/6.7" set plus 6.5" set, iPad 13" set; first shot shows a count mid-set; no price/ranking words
- [ ] Custom product pages created with keywords assigned (squat, push-up, friends)
- [ ] Release notes reviewed (template in package 02); submitted with the app build

## Before publishing — analytics and reporting
- [ ] GA4 key event `download_click` marked; Consent Mode defaults verified in an EU location (VPN) and a non-EU location
- [ ] Dashboard sheet created with the five tabs in package 06; baseline rows pasted
- [ ] `tools/` scripts run once after publication; outputs dated in `data/`

## After publishing — verification (day 1–3)
- [ ] `curl -I` every sitemap URL → 200; `/faqs/` → 301; unknown path → 404; `www` → 301
- [ ] `view-source` of `/` shows the H1 and store links in HTML
- [ ] App Store and Play pages re-fetched: title, subtitle/short description and first paragraph match the packages
- [ ] GSC shows pages discovered; GA4 Realtime shows traffic and `download_click`
- [ ] Deep links still open the apps (`/link/challenges/{id}`), AASA served as `application/json`

## Monitoring schedule
- Weekly (Monday, 15 min): dashboard rows; four evidence thresholds; one decision logged
- Monthly: run `tools/apple_keywords.py`, `google_suggest.py`, Play pair; update `data/`; review new reviews and reply
- Quarterly: re-check Apple/Google policy pages listed in `01-discovery/03-platform-rules-verified-2026-10-15.md`; re-prioritise keywords with the latest volume exports
