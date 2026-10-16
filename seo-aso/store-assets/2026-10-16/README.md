# Store assets v7 — rendered 2026-10-16 from the landmark photos

Source photos (eight exercises, burpees added 2026-10-16 15:22): `~/Downloads/Workout-image-with landmark/` (copied to `buzzend-content/assets/workout-landmark/`). App screens: `buzzend-content/assets/screens-clean/v6-*.png` (sanitised recreations with demo identities). Templates, jobs and the render script are in `_source/` so any shot can be re-rendered with `node shoot.mjs _source/jobs.json` from `buzzend-content/tools`.

## iOS folder — mirrors the App Store Connect "Product Page Information" tabs

| Folder | ASC tab / use | Size | Files |
|---|---|---|---|
| `ios/01-iphone-dynamic-island-medium-display/` | iPhone with Dynamic Island (medium display) — the only iPhone tab offered for this app | 1206×2622 | 10 (upload all, in file order) |
| `ios/02-ipad-13-inch/` | iPad 13" display | 2064×2752 | 10 |
| `ios/03-custom-product-pages-extras/` | Custom product pages (sit-ups, lunges, jumping jacks, high knees, burpees) | 1206×2622 | 5 |
| `ios/04-creative-assets-header-and-search/` | Product page header (3840×1646), search results (3840×2560), universal (5244×2950) | as named | 3 |
| `ios/_extra-sizes-not-offered-in-asc/` | 6.9", 6.5" and 1179×2556 sets kept for reference only; ASC rejected 1284×2778 on 2026-10-16 | — | 35 |

Not applicable: iPhone Duo (skipped on request), Apple Watch (no watch app), App Previews (video needed).

## Validation

93 files. Every file was checked by script: exact pixel size for its slot, no alpha channel (Apple and Play both reject alpha), under 8 MB. Results in `_source/validation.json`.

| Slot | Files | Size | Store requirement met |
|---|---|---|---|
| ios/01-iphone-dynamic-island-medium-display | 10 | 1206×2622 PNG | iPhone medium-display slot (also accepts 1179×2556) |
| ios/02-ipad-13-inch | 10 | 2064×2752 PNG | iPad 13" display tab (accepts 2064×2752 or 2048×2732) |
| ios/03-custom-product-pages-extras | 5 | 1206×2622 PNG | per-exercise shots for custom product pages |
| android/phone-1080x1920 | 8 | 1080×1920 PNG | 9:16, within 320–3840 px, 8 of 8 slots |
| android/tablet-7-1080x1920 | 8 | 1080×1920 PNG | ≥4 required for large-screen placement |
| android/tablet-10-1440x2560 | 8 | 1440×2560 PNG | ≥4 required, 1080–7680 px |
| android/feature-graphic-1024x500 | 1 | 1024×500 PNG | 24-bit, no alpha, focal point central, no badges |

Not produced (needs footage, not stills): App Store app preview (15–30 s, 886×1920) and a replacement Play video. The icon is unchanged (`buzzend-content/store-assets/android/app-icon-512.png`).

## Upload order and copy per slot


### ios/01-iphone-dynamic-island-medium-display (same shots and order on iPad)

| # | Headline | Supporting line | Asset | File |
|---|---|---|---|---|
| 1 | Your camera counts your reps. | Squats, push-ups, sit-ups and more, out loud | squats.jpg | `01-your-camera-counts-your-reps-1320x2868.png` |
| 2 | Seven exercises, one app. | Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees | grid | `02-seven-exercises-one-app-1320x2868.png` |
| 3 | Challenge your friends. | Create or join with a code. Live leaderboard. | v6-challenge.png | `03-challenge-your-friends-1320x2868.png` |
| 4 | Coaching while you move. | Hear why a rep didn't count | squat-side-wise.jpg | `04-coaching-while-you-move-1320x2868.png` |
| 5 | Keep your streak. | One quick set a day. Restore it if you slip. | v6-streak.png | `05-keep-your-streak-1320x2868.png` |
| 6 | Post your set. Cheer theirs. | Every counted set shows up for your friends | v6-community.png | `06-post-your-set-cheer-theirs-1320x2868.png` |
| 7 | Steps count too. | Daily step goal, top activities, calories | v6-home.png | `07-steps-count-too-1320x2868.png` |
| 8 | Join with a code or link. | Public challenges, or private with approval | v6-discover.png | `08-join-with-a-code-or-link-1320x2868.png` |
| 9 | Push-ups, counted. | Phone on the floor, camera facing you | pushup.jpg | `09-push-ups-counted-1320x2868.png` |
| 10 | See your progress. | Best day, pace and daily trend per challenge | v6-stats.png | `10-see-your-progress-1320x2868.png` |

### android/phone-1080x1920

| # | Headline | Supporting line | Asset | File |
|---|---|---|---|---|
| 1 | Your camera counts your reps. | Squats, push-ups, sit-ups and more, out loud | squats.jpg | `01-your-camera-counts-your-reps-1080x1920.png` |
| 2 | Seven exercises, one app. | Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees | grid | `02-seven-exercises-one-app-1080x1920.png` |
| 3 | Challenge your friends. | Create or join with a code. Live leaderboard. | v6-challenge.png | `03-challenge-your-friends-1080x1920.png` |
| 4 | Coaching while you move. | Hear why a rep didn't count | squat-side-wise.jpg | `04-coaching-while-you-move-1080x1920.png` |
| 5 | Keep your streak. | One quick set a day. Restore it if you slip. | v6-streak.png | `05-keep-your-streak-1080x1920.png` |
| 6 | Post your set. Cheer theirs. | Every counted set shows up for your friends | v6-community.png | `06-post-your-set-cheer-theirs-1080x1920.png` |
| 7 | Steps count too. | Daily step goal, top activities, calories | v6-home.png | `07-steps-count-too-1080x1920.png` |
| 8 | Join with a code or link. | Public challenges, or private with approval | v6-discover.png | `08-join-with-a-code-or-link-1080x1920.png` |

### ios/02-ipad-13-inch

| # | Headline | Supporting line | Asset | File |
|---|---|---|---|---|
| 1 | Your camera counts your reps. | Squats, push-ups, sit-ups and more, out loud | squats.jpg | `01-your-camera-counts-your-reps-2064x2752.png` |
| 2 | Seven exercises, one app. | Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees | grid | `02-seven-exercises-one-app-2064x2752.png` |
| 3 | Challenge your friends. | Create or join with a code. Live leaderboard. | v6-challenge.png | `03-challenge-your-friends-2064x2752.png` |
| 4 | Coaching while you move. | Hear why a rep didn't count | squat-side-wise.jpg | `04-coaching-while-you-move-2064x2752.png` |
| 5 | Keep your streak. | One quick set a day. Restore it if you slip. | v6-streak.png | `05-keep-your-streak-2064x2752.png` |
| 6 | Post your set. Cheer theirs. | Every counted set shows up for your friends | v6-community.png | `06-post-your-set-cheer-theirs-2064x2752.png` |
| 7 | Steps count too. | Daily step goal, top activities, calories | v6-home.png | `07-steps-count-too-2064x2752.png` |
| 8 | Join with a code or link. | Public challenges, or private with approval | v6-discover.png | `08-join-with-a-code-or-link-2064x2752.png` |
| 9 | Push-ups, counted. | Phone on the floor, camera facing you | pushup.jpg | `09-push-ups-counted-2064x2752.png` |
| 10 | See your progress. | Best day, pace and daily trend per challenge | v6-stats.png | `10-see-your-progress-2064x2752.png` |

The 6.5" iPhone set, the two Play tablet sets and the 10" set carry the same shots in the same order. Custom product pages: squat page → shots 1, 2, 4, 3, 5; push-up page → 9, 2, 4, 3, 5 (plus `cpp-extras` sit-ups/lunges/jumping jacks/high knees/burpees for exercise-specific pages); friends page → 3, 8, 6, 1, 5.

## App Store creative assets (product page header and search results)

Specs verified on Apple's "Creative assets specifications" page (2026-10-16): product page header 21:9 at 3840×1646 (or the universal 16:9 PNG at 5244×2950); search results 3:2 from 1920×1280 to 3840×2560 (or the same universal 5244×2950 PNG); JPEG or PNG, no alpha. Apple's asset best practices: one clear idea, make the purpose obvious at a glance, keep the focal point central and key elements inside the safe area, short text only, no prices, URLs, awards or other-platform logos.

| File | Placement | Size |
|---|---|---|
| `ios/04-creative-assets-header-and-search/header-21x9-3840x1646.png` | Product page header | 3840×1646 |
| `ios/04-creative-assets-header-and-search/search-results-3x2-3840x2560.png` | Search results | 3840×2560 |
| `ios/04-creative-assets-header-and-search/universal-16x9-5244x2950.png` | Either placement (one asset for both) | 5244×2950 |

Composition: headline left, the squats camera view right, all key elements inside the central 78 % of the width; no app icon or name in the artwork because the App Store shows them beside the asset. Use App Store Connect's Preview tool on the header and search placements before publishing; if a device preview clips the text or the photo, upload the universal 16:9 file instead. Re-render with `_source/jobs-creative-assets.json`.

## Before you upload — three checks

1. **Counts and overlays.** The photos show the camera view with the exercise label, the skeleton overlay and a count (6, 14, 23, 18, 12, 31, 40, 9). Strategy rule 40 says a demo must never show a count the app did not produce. If these frames were composed rather than captured from a real session, either replace them with real session frames before upload or treat them as illustrations and keep the headline wording as is (no accuracy claims are made). Both stores also require screenshots to reflect the actual app, so compare the overlay style with the shipped camera screen.
2. **App screens are recreations.** `v6-*.png` are sanitised recreations of the live screens with approved demo names (Ema William, Kiran Shah, Anita Malan, Adesh, Riya). Open the same screens in the shipped 3.1.14 build and confirm nothing differs materially (labels, tabs, buttons).
3. **In-app wording visible in shots 3 and 10.** The challenge description reads "Camera-verified reps" and the statistics badge reads "Camera-verified · counted by pose detection". These are inside the app UI, not our headlines, but the audit recommends the product copy move to "counted by the camera". If you change the in-app text, re-capture those two screens and re-render.

Headlines use no price, ranking or superlative words; taglines stay under 20 % of each image; every screenshot shows the app interface or the camera view inside a phone frame.

## Re-render

```bash
cd ~/Development/buzzend-content/tools
node shoot.mjs "~/Development/Buzzend Design/seo-aso/store-assets/2026-10-16/_source/jobs.json"
```
Edit headlines in `_source/make_jobs.py` (then `python3 -I make_jobs.py <output root>`), or the look in `_source/v7-*.html` (copies of `buzzend-content/store-assets/templates/v7-*.html`).

