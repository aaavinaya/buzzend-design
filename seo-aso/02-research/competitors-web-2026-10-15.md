> Produced 2026-10-15 from public sources only (App Store US pages, Google Play pages, competitor websites, web search). Raw HTML copies were kept in the session scratchpad for audit.
>
> **Reconciliation note (product truth, see ../01-discovery/04-product-truth-mobile.md §3):** section (b) item 2 describes "camera-verified friend challenges" as an open position. Buzzend's camera does count the reps (no manual rep entry exists), but the server receives counts only and performs no verification; the internal design doc states "Challenges today can be cheated". Until verified sessions ship, the supportable wording is "reps counted by your camera, not typed in" — a genuine differentiator versus self-report apps — not "verified", "anti-cheat" or "the camera is the referee". Likewise, section (d) shows that "video never leaves your phone" is table stakes among rep counters; Buzzend can truthfully say "no video is uploaded unless you post it", but not "nothing leaves your phone", because pose-landmark traces are uploaded (04 §2.2) until that changes or is disclosed.

# Buzzend — Competitor Web / App Store / Google Play Research

**Observation date:** 2026-10-15
**Scope:** public sources only — competitor websites, Apple App Store US pages (apps.apple.com/us), Google Play pages (play.google.com, hl=en_US&gl=US), and web search. No private rankings, revenue, or conversion data are claimed anywhere in this document.
**Convention:** "not observable" = the page blocked the fetch, the field was not rendered, or the field does not exist on that page. All ratings/counts are the values shown on the store page at observation time (developer-reported privacy labels are not verified by Apple/Google).

**Method notes / limits**
- App Store pages were fetched and read as text. Screenshot *count* is not observable on any page (the gallery renders as 1x1 placeholder images); individual review star values are not rendered, only the review text, so review themes are from the 4 visible reviews per page.
- Google Play pages are too large for the fetch tool, so raw HTML was downloaded with curl (desktop UA) and parsed. "Installs" is the page's "Downloads" field; "short description" is the page's `<meta name="description" property="og:description">`.
- Website `<title>` / meta description / H1 were taken from raw HTML (curl). Raw copies kept for audit in `scratchpad/research/play-raw/` and `scratchpad/research/web-raw/`.
- Fetch failures: challenges.app blocks the fetch tool (curl worked); app.eumplus.kr is an empty Flutter shell; Wette (id6756288037) returned HTTP 404 on US and DE storefronts; "AI Push Up Counter & Tracker" (id6484504666) 404; zing.coach/blog 404; runtastic.com 307.

**Buzzend reference (from brief, not re-verified):** free; phone camera counts squats, push-ups, sit-ups, jumping jacks, lunges, burpees, high knees; challenges with friends; live leaderboards; daily streaks; step tracking; social feed; iOS + Android; English only; small user base.

---

## TIER 1 — camera / AI rep counters

### 1.1 Push Up Counter & Tracker ("Puuush") — id6470828037
**Website** https://puuush.app/
- `<title>`: `Puuush | Push-up counter and tracker for iPhone`
- Meta description: `Puuush counts your reps, keeps your streak going and puts you on the leaderboard, with your friends or the whole world. On iPhone and Apple Watch.`
- H1: `Every push-up counts.`
- Positioning: camera push-up counter with streaks and friend/global leaderboards, iPhone + Apple Watch.
- Pricing on site: not observable (store shows Puuush Pro Monthly $3.99, Puuush Pro Annual $29.99, plus "tip" IAPs $1.99–$100).
- Blog: none. Has an **Events** section (monthly rhythm challenges: `/events/push-ups-on-the-beat-1`, `/events/push-ups-on-the-beat-2`) and `/leaderboards`.
- Download CTA: plain text link "Download" → App Store. No badges, no Google Play, no smart link, no QR.
- Feature/exercise landing pages: none (nav: `/events`, `/leaderboards`; footer: `/privacy`, `/terms`).
- Trust statement (site): "Puuush follows your body with ARKit, Apple's latest augmented reality technology, and counts each rep on its own." Privacy policy (https://puuush.app/privacy): "Puuush uses your iPhone's front camera, including the TrueDepth camera when available" … "This happens on your device." … "No photo, video or face data is recorded, stored or sent". Account data "stored with Supabase, on servers in the United States."
- Android: not observable (site names only iPhone and Apple Watch).

**App Store** https://apps.apple.com/us/app/id6470828037
- Title: `Push Up Counter & Tracker` · Subtitle: `100 pushups in 6 weeks`
- First sentence: "*Puuush* yourself!" — then: camera counting, four workout modes (Sequence, Open Goal, Limit, Timer), stats/charts/widgets, Apple Watch counting via motion sensors.
- Rating: **4.8 (3.4K ratings)** · Category: Health & Fitness · Free + IAP (see above) · Screenshots: not observable · Age 4+ · Size 200.1 MB · Languages: English + 11.
- Counting: "Automatically count push up trough ARKit / Vision technology (camera)"; v5.3.5 "now uses the iPhone's motion sensors to help prevent cheating"; Watch uses gyroscope/accelerometer + ML.
- What's New (5.4.1): "Push-Ups On The Beat: push-ups meet rhythm games." — monthly rhythm challenge with leaderboards.
- Privacy label: Data Used to Track You: Identifiers. Linked: email, user ID. Not linked: usage, diagnostics, fitness.
- Review themes — praise: polished design, widgets + Apple Health, structured 100-push-up program, responsive support ("resolved within the day"). Complaints: camera "did not recognize my body" / misses reps in low light ("whenever I do push-ups it just says I didn't do them"), Pro paywall/pricing, difficulty ramps too fast.

**Google Play:** not listed (not observable; site is iPhone/Apple Watch only).
**Keyword themes:** push up, counter, tracker, 100 pushups / 6 weeks, streak, leaderboard, friends, Apple Watch.
**Buzzend differentiation:** Puuush is push-ups only and iPhone only; Buzzend counts seven exercises on iOS *and* Android and lets friends compete across platforms. Its top complaint (body not recognized / low light) is a messaging opportunity: publish a setup/lighting guide and position full-body pose tracking vs. Puuush's face/ARKit approach.

### 1.2 PushFit — id551162217
**Website** https://pushfit.app/
- `<title>`: `PushFit · The Push-Up Workout Tracker`
- Meta description: `PushFit counts your push-ups with the front camera while your phone lies on the floor. No hands, no wearable. Goals, streaks that survive rest days, Apple Watch, widgets, Apple Health and leaderboards.`
- H1: `Put the phone down. PushFit counts for you.` · Tagline: "No hands. No wearable. No subscription."
- Pricing: "No subscription" (store: PushFit Pro one-time, price not observable).
- Blog: none. Has a **User Guide** (`/guide/`) with chapters: `guide/counting`, `guide/goals`, `guide/lockout`, `guide/watch`, `guide/history`, `guide/personalize`, `guide/data`.
- Download CTA: official App Store badge + Google Play badge. No smart link/QR.
- Feature landing pages: guide chapters only.
- Trust statements: "Nothing is recorded and nothing leaves your iPhone." (home). Guide (https://pushfit.app/guide/counting): "The camera feed is used to derive one distance and is never written to disk, never uploaded, and never shown to anyone." / "Nothing is recorded and nothing is sent." / "There is no photo, no video and no face data leaving your iPhone." Also candid limits: "the app is watching how far your face travels, not how hard you are working." / "It is not looking at your form, your arms or your background." / "If the camera stops seeing you mid-set, counting stops with it."
- Android: yes (Google Play badge → com.pushfit).

**App Store** https://apps.apple.com/us/app/id551162217
- Title: `PushFit` · Subtitle: `Push Up Workout Tracker`
- First sentence: "You do push-ups." — phone on floor, front camera counts reps and depth; Watch counting, widgets, Health, leaderboards, optional ad-free Pro.
- Rating: **4.7 (2.4K)** · Health & Fitness · Free (Pro one-time, price n/o) · Screenshots n/o · Age 9+ · 47.7 MB · English + 20 languages.
- Counting: front camera tracks face distance (thresholds ~25 cm down / ~29 cm up per guide); Watch uses wrist motion; manual tap mode.
- What's New (3.0.3): streaks that survive rest days, new calendar/widgets, video sharing; Game Center "85 achievements".
- Privacy label: Linked: fitness, user ID. Not linked: device ID, product interaction, crash data. Store text: "No photo or video is ever saved, and no face data ever leaves your iPhone."
- Review themes — praise: detailed stats/graphs, accurate counting, leaderboard + reminders motivate. Complaints: occasional miscounts/double counts; "suspicious leaderboard totals from unverified users"; can't label variations (diamond/clap).

**Google Play** https://play.google.com/store/apps/details?id=com.pushfit
- Title: `PushFit` · Short description: `The Push-Up Workout Tracker` · **Installs 5K+** · Rating 2.7 (24 reviews) · Health & Fitness · dev Ben Humphries · no IAP, no ads · Data safety: "No data shared with third parties", "No data collected" · **Last updated Jan 10, 2024** (stale).
**Keyword themes:** push-up, workout tracker, counter, front camera, no hands / no wearable, streaks, leaderboards, Apple Watch.
**Buzzend differentiation:** PushFit only measures face-to-phone distance for push-ups and its Android build is stale (2.7 rating, last update Jan 2024). Buzzend uses full-body pose tracking across seven exercises and actively ships on Android — "the camera counter Android users can actually use" is a direct wedge. Its "unverified leaderboard totals" complaint supports a "camera-verified leaderboards" message.

### 1.3 Push Up Counter GOLDEN PushUps — id6657950305 (GOLDEN Sports-Apps)
**Website** https://goldensportsapps.com/
- `<title>`: `GOLDEN Sports-Apps — Let AI handle the count. You focus on the workout.`
- Meta description: `AI-powered workout apps with on-device pose estimation. Push-Ups, Pull-Ups, Burpees, Sit-Ups & Squats — count, coach and progress, automatically.`
- H1: `Let AI handle the count. You focus on the workout.`
- Positioning: "On-device pose-estimation, a motivational voice coach, and adaptive training plans" — **five separate apps**: GOLDEN Push-Ups, GOLDEN Bars (pull-ups/dips), GOLDEN Burpees, GOLDEN Sit-Ups, GOLDEN Squats.
- Pricing on site: not observable (store: Basic Monthly $1.99, Basic Yearly $9.99, Basic $24.99).
- Blog: none (anchors only: #technology, #features, #apps, #faq, #study; external feature-request board). Site in EN/DE/FR/ES.
- Download CTA: App Store + Google Play badges per app; "Get it now" anchor button.
- Feature/exercise landing pages: none (per-exercise *apps*, not pages).
- Trust statements: "Runs locally on iOS & Android. Your video never leaves the phone." / "We don't collect any of your data. All your workouts are stored locally on your device only." Privacy policy (https://goldensportsapps.com/privacy.html): "Camera input—including images, video frames, and intermediate pose or exercise-recognition data derived from them" is processed on device and "It is never transmitted to or stored on our servers."; "Camera input and intermediate pose or exercise-recognition data are never included in Crashlytics reports."
- Android: yes.

**App Store** https://apps.apple.com/us/app/id6657950305
- Title: `Push Up Counter GOLDEN PushUps` · Subtitle: `Real-Time Push Up Tracker`
- First sentence: "Transform your fitness routine with the ultimate AI-powered push-up counter that brings you a hands-free experience." — 10-min every-other-day plan, leaderboards + group challenges, App Blocker, Harvard push-up study citation.
- Rating: **4.6 (77)** · Health & Fitness · Free + IAP · Screenshots n/o · Age 4+ · 361.1 MB · English + 25 languages.
- Counting: "AI pose estimation tracks full range of motion and pace in real time"; "uses cutting-edge pose estimation technology directly on your device"; side-view form check (hip dips); back-camera video journaling.
- What's New (1.092): "App Blocker — Block distracting apps and unlock a short access window by completing push-ups, squats, or a mixed workout."
- Privacy label: Linked: email, purchase history, user/device ID, advertising data, **photos or videos**, fitness. Not linked: purchases, device ID, product interaction, diagnostics.
- Review themes — praise: form guidance and tips, progress tracking, motivation from rankings/challenges. Complaints: none visible; one reviewer asks "people create an app for squats that would be amazing" (the squat app exists separately).

**Google Play** https://play.google.com/store/apps/details?id=com.stephanduechtel.goldenpushups
- Title: `Pushup Tracker GOLDEN Push-Ups` · Short: `AI push up counter with real-time tracking, workout plans and challenges` · **Installs 100K+** · Rating **3.4 (590)** · Health & Fitness · IAP, no ads · Data safety: "No data shared with third parties", "No data collected" · Updated Sep 19, 2026 · Description: "This information is processed only on your device and is not sent to our servers or shared." Sibling: `GOLDEN Sit ups - Abs Workout` (com.stephanduechtel.goldensitups) — short `Real-Time Sit-Up Counter`, 1K+, 3.4.
**Keyword themes:** AI, push up counter, real-time, tracker, hands-free, pose estimation, on-device, workout plans, challenges.
**Buzzend differentiation:** GOLDEN is the only tier-1 player covering several bodyweight moves on both platforms, but it fragments them into five apps and none covers jumping jacks, lunges or high knees. Buzzend's "all seven exercises + steps + friends in one free app" is the counter-position; GOLDEN's 3.4 Android rating (vs 4.6 iOS) also suggests Android accuracy is a weak spot to attack with proof content.

### 1.4 Squat Counter - Auto counting — id6755665178
**Website** https://app.eumplus.kr/ — Flutter web shell: `<title>` `Eumplus`; meta description `A new Flutter project.`; H1/positioning/pricing/blog/CTA: not observable.
**App Store** https://apps.apple.com/us/app/id6755665178
- Title: `Squat Counter - Auto counting` · Subtitle: `Automatic squat counting`
- First sentence: "The best partner for a strong lower body and toned glutes, introducing 'Squat Counter'." — auto counts reps, logs date/duration/calories, calendar + graphs, solo challenges beginner→expert with badges.
- Rating: **4.0 (1)** · Health & Fitness · Free (IAP n/o) · dev Cheon Sam Yeol · Age 9+ · 137.6 MB · English + 18 languages.
- Counting: "Precise AI Posture Analysis & Auto Counting"; "Advanced motion recognition technology analyzes your joint movements and counts reps only when you perform a proper squat."; optional "verification photo capture". What's New (1.0.24): counts "even from greater distances" and "even when the phone is tilted".
- Privacy label: Track: identifiers. Linked: email, name. Not linked: fitness, photos/videos, user ID, usage, diagnostics.
- Reviews: one ("Almost perfect": wants to delete history without deleting account). Themes: not observable.
**Google Play:** not found (not observable).
**Keyword themes:** squat, counter, auto counting, automatic, AI posture.
**Buzzend differentiation:** squats-only, solo, 1 rating, no Android. Buzzend can own "squat counter app" on both stores and add the social layer this app lacks entirely.

### 1.5 Striga — Pushup Tracker — id6754952234
**Website:** not observable (no site found; privacy/terms hosted at trytongue.com).
**App Store** https://apps.apple.com/us/app/id6754952234
- Title: `Striga — Pushup Tracker` · Subtitle: `Camera rep counter & streaks`
- First sentence: "Transform your fitness journey with Striga, the intelligent pushup tracking app" — daily/weekly totals, history, daily leaderboard, Sign in with Apple; **requires Striga Pro** after 1-week trial.
- Rating: **2.0 (3)** · Health & Fitness · Free + IAP: Pro Monthly $5.00, Pro Annual $50.00 · dev Chad Newbry · Age 13+ · 91.4 MB · 18 languages.
- Counting: camera + "advanced AI" "pose detection technology".
- Privacy label: Linked: fitness, email, name, user ID, **Body (Hands, Head)**.
- Review themes — praise: none visible. Complaints: "This app doesn't track push ups very well", freezes and loses reps, screen turns off mid-set. What's New (2.4.2): freeze fix.
**Google Play:** not observable.
**Keyword themes:** pushup tracker, camera rep counter, streaks.
**Buzzend differentiation:** subscription-gated from day one with a 2.0 rating and a "Body (Hands, Head)" privacy declaration. Buzzend's free core + explicit on-device/no-video-stored messaging is a clean contrast.

### 1.6 Orbit: Workout with Friends — id6448385157
**Website:** not observable (privacy policy on motusfitness.notion.site; note: search results index the same id under the name "MOTUS AI: Workout Planner", suggesting a rename; live US page shows "Orbit").
**App Store** https://apps.apple.com/us/app/id6448385157
- Title: `Orbit: Workout with Friends` · Subtitle: `Daily Fitness Challenge Game`
- First sentence: "The ultimate social-fitness app powered by AI to transform your workout experience." — AI form feedback, "Intelligent Reps Counter", auto highlights, plans, social feed, stats, leaderboard.
- Rating: **4.4 (54)** · Health & Fitness · Free + IAP: Orbit Plus Weekly $1.99 / $9.99, Monthly $4.99, Annual $29.99 / $39.99, Orbit Plus $14.99, "Big Discount" $2.99 · dev Ankit Patel · Age 9+ · 196.5 MB · **English only**.
- What's New (2.19.2): "Tug of War: 1v1 pushups, squats, punches battles with friends."
- Privacy label: Linked: email. Not linked: name, product interaction, diagnostics.
- Review themes — praise: "corrects my form in real time", "ease of use for this application of computer vision", "I play these workout games with my buddies daily!". Complaints: some features behind subscription.
**Google Play:** not observable (no listing found).
**Keyword themes:** workout with friends, daily fitness challenge, game, AI, social-fitness, reps counter.
**Buzzend differentiation:** the closest *concept* match (AI counting + friends + 1v1), but iOS-only, English-only and subscription-upsold with 54 ratings. Buzzend: Android + iOS, seven exercises plus steps, free. Both are English-only, so language is not a wedge here.

### 1.7 PushApp - Push-Up Counter — id6778940787 (Elia Move)
**Website** https://trypushapp.com/
- `<title>`: `AI Push-Up Counter App | Count Reps With Your Camera`
- Meta description: `PUSHapp is an AI push-up counter app for iPhone and web. Count clean pushups with your camera, track streaks, and compete on leaderboards.`
- H1: `AI push-up counter.` · Positioning: "On-device AI pose detection counts every clean rep from your phone camera."
- Pricing: free counter/tracking/share cards, no sign-up to start; store: PushApp Pro $9.99, Pro Yearly $99.99 (7-day trial).
- **Blog: yes, ~300 posts** ("Push-Up Blog & Workouts", https://trypushapp.com/blog). Examples: "Push Up Counting App: Auto-Count & Progress" (/blog/push-up-counting-app), "Free Push Up App: Auto Count, Plans & Tracking", "Push Up App for Apple Watch: Auto Count & Health Sync", "Pushup Challenge for Beginners: 4-Week Plan", "PUSHapp vs Freeletics: Counter or Full AI Coach?", "We Watched 148,000 Push-Ups: What Real Sets Look Like", "Diamond pushups vs regular pushups", "Wall Pushups Muscles Worked". Clusters: form/technique, variations, programs, muscles/benefits, comparisons, daily counts & challenge rules, app/counter pages, norms by age/sex, troubleshooting. Some thin programmatic titles ("Benefits: Meanings, Uses, and Examples").
- Download CTA: App Store badge + Google Play badge + web-app link (`/app?start=1`). No QR/smart link.
- **Feature landing pages:** `/ai-push-up-counter`, `/pushup-counter`, `/pushup-counter-app`, `/pushup-tracker`, `/pushup-leaderboard`, `/30-day-pushup-challenge` (all push-up).
- Trust statements: "Counting happens on your device — nothing is uploaded just to count." / "Pose detection runs on your device. Nothing is uploaded just to count your reps." / "Video only leaves your phone if you choose to render a shareable clip while signed in".
- Android: yes ("Now on the App Store & Google Play").

**App Store** https://apps.apple.com/us/app/id6778940787
- Title: `PushApp - Push-Up Counter` · Subtitle: `AI push-up counter & coach`
- First sentence: "PushApp counts your push-ups automatically using your phone's camera and on-device AI — no wearables, no manual tapping."
- Rating: **5.0 (8)** · Health & Fitness · Free + IAP (Pro $9.99, Pro Yearly $99.99) · Age n/o · 341.3 MB · English.
- Social: global + private leaderboards, friend invite links, live 1v1 duels / "PUSH KOMBAT", monthly cash challenge, streaks. "Rep counting runs on-device." Live duels share video/audio only when both opt in. Knee push-ups detected and excluded.
- Privacy label: Linked: user ID, product interaction, purchase history, payment info, email, name, photos/videos.
- Reviews: none visible (aggregate only).

**Google Play** https://play.google.com/store/apps/details?id=com.eliamove.pushapp
- Title: `PushApp` · Short: `AI push-up counter with camera tracking, stats, and progress goals.` · **Installs 1K+** · Rating 4.6 · Health & Fitness · IAP, no ads · Data safety: no sharing, may collect, encrypted, deletion available · Updated Oct 3, 2026.
**Keyword themes:** AI push-up counter, camera, coach, leaderboard, streaks, on-device, 30-day challenge.
**Buzzend differentiation:** PushApp is the SEO leader of tier 1 (hundreds of posts, six keyword landing pages) but every page is push-up-only and the meta says "for iPhone and web". Buzzend can copy the landing-page pattern for the six exercises nobody has pages for (squat counter, sit-up counter, jumping jack counter, burpee counter, lunge counter, high-knees counter) and for Android-intent queries.

### 1.8 PushTrack: Pushup Counter — id6780742603
**Website:** not observable (privacy at pushtrack-ai.vercel.app/privacy).
**App Store** https://apps.apple.com/us/app/id6780742603
- Title: `PushTrack: Pushup Counter` · Subtitle: `Count pushups with your camera`
- First sentence: "Open the camera, do your push-ups, and watch the reps count themselves—no tapping."
- Rating: **5.0 (1)** · Health & Fitness · Free (core free; no IAP list) · dev Doron Hetz · 33 MB · English · released Jun 23 (2026).
- Social: friends, group leaderboard, groups with chat, streaks with rest days + freezes; Form Coach beta.
- Trust: "All of the vision processing happens on your device, so your video never leaves your phone." / "Your video is never uploaded."
- Privacy label: Linked: health/fitness, email, name, photos/videos, user ID.
**Google Play:** not observable (no listing found).
**Buzzend differentiation:** brand-new, 1 rating, push-ups only, iOS only.

### 1.9 Pushup Club — id6761735214
**Website:** not observable (privacy at appprivacy.romankoch.online).
**App Store** https://apps.apple.com/us/app/id6761735214
- Title: `Pushup Club` · Subtitle: `Push up tracker`
- First sentence: "Every pushup counts." — community counter toward 100 billion push-ups; front camera counts; no paywalls/ads; optional supporter tips.
- Rating: **5.0 (4)** · Health & Fitness · Free + optional "Club Supporter" IAPs $1.99–$19.99 (one-time and monthly) · dev Roman Koch · 32.4 MB · English · first release May 7 (2026).
- Counting: front camera, calibration, only reps "with at least 70% confidence" count; no manual entry.
- Trust: "Your camera feed is processed entirely on your device." / "No video is recorded, stored, or transmitted."
- Social: private challenges via 6-character code, global leaderboards (Sign in with Apple), streaks, badges, live global total.
**Google Play:** not observable.
**Buzzend differentiation:** donation-funded, push-ups only, iOS only; its "global total" gimmick is a community mechanic Buzzend could adapt per exercise.

### 1.10 Push Up Counter: Arena — id1609456321
**Website** https://www.pushupchampion.com/
- `<title>`: `Pushup Champion & Pushup Arena | Push-up apps for iPhone`
- Meta description: `Count push-ups, battle bosses, and take on Arena 100 Ultra. Start Pushup Arena training free, then continue with Pro. Discover our push-up apps for iPhone.`
- H1: `Two ways to keep pushing.` · Positioning: "Your next personal best starts with one more rep."
- Pricing: freemium (Chapter 1 + Training Days 1–5 free, Pro after; store: Lifetime $4.99). Blog: none. CTA: App Store badge + text link. No Play. Landing pages: none. Trust: none about camera (Apple Health permission note only). Android: not observable.
**App Store** https://apps.apple.com/us/app/id1609456321
- Title: `Push Up Counter: Arena` · Subtitle: `Automatic Pushup Tracker`
- First sentence: "Build strength. Beat your best. Own the arena." — camera counting, boss battles, training plans, rankings.
- Rating: **4.8 (64)** · Health & Fitness · Free + IAP (Lifetime $4.99; Pro) · English + 4 · 26.4 MB.
- Counting: "Automatic rep counting with your iPhone camera"; Wall Mode / Floor Mode. Privacy label: **tracks** location, identifiers, usage, diagnostics (third-party advertising).
- Social: Game Center friends ("Friendly competition through Game Center"), global leaderboards, Boss Mode, Arena 100 Ultra daily streak with streak freezes (Pro).
- Review themes — praise: consistency, competition. Complaints: "I keep getting ads in the middle of my sets", requests for "squats and pull ups", in-set rep-rate display.
**Google Play:** not observable.
**Buzzend differentiation:** ads interrupt sets and users explicitly ask for squats — Buzzend has squats and no mid-set ads (if that holds; verify before claiming).

### 1.11 Additional iOS counter observed — Push Up Counter: AI Tracker (id6760224222)
https://apps.apple.com/us/app/id6760224222 — Subtitle `Hands-Free Reps, Home Workout`; first sentence "How many push-ups can you do? Find out — then beat it every day."; **5.0 (1)**; Free + IAP (Monthly $3.99, Yearly $19.99, Lifetime $39.99; 7-day trial); AI camera mode + "Position-Verified Mode" (phone on floor); digital-pet "Buddy"; global leaderboards, streaks; privacy label: "The developer does not collect any data from this app."; 51.7 MB; English (voice EN/TR).

### 1.12 Android equivalents (Google Play, camera/AI counting in listing)
| App (package) | Short description (meta) | Installs | Rating | Notes |
|---|---|---|---|---|
| **Push Up Boss: Multiplayer Game** (app.pushupboss.android) https://play.google.com/store/apps/details?id=app.pushupboss.android | "Push-up game with online battles, crossplay, boss fights and AI rep counting" | **50K+** | 4.0 (424) | dev Ipirio; IAP + ads; "Use Vision AI to automatically count your push-ups with the camera"; "play with friends across iOS and Android with crossplay"; "No account. No subscription."; Data safety: may share with third parties. Updated Oct 8, 2026. |
| **PoseUp: AI Push-Up Counter** (com.hanhyo.poseup) https://play.google.com/store/apps/details?id=com.hanhyo.poseup | "6-week push-up challenge with AI pose tracking. Start at your own level!" | 100+ | n/o | no IAP/ads; "Detects body joints in real time to count reps only when your posture is correct"; Data safety: no data collected. |
| **GymCam: AI Jump & Rep Counter** (com.mfnd.GymCam) https://play.google.com/store/apps/details?id=com.mfnd.GymCam | "A camera app that automatically counts your reps and jump-rope sessions." | 1K+ | 4.8 | MAE Software; "any exercise"; hand-gesture start/stop; records video with count overlay; "challenge their friends"; Data safety: no data collected. |
| **Neon Pose - AI Workout Counter** (com.justwitworks.neonpose) https://play.google.com/store/apps/details?id=com.justwitworks.neonpose | "AI counts your reps & scores your form. Squat, push-up & sit-up, neon overlay." | 50+ | n/o | IAP + ads; 0–100 form score; multi-exercise (squat/push-up/sit-up) but tiny. |
| **Squat Auto Counter - SQUATUP** (com.flowbitlabs.squatup) https://play.google.com/store/apps/details?id=com.flowbitlabs.squatup | "SQUATUP: Auto-count squats easily and track workouts with a clean, simple UI." | 1K+ | 4.1 | IAP + ads; "Recognition may vary depending on lighting, camera angle, device performance, and your environment."; "Workout history (stored on-device)". |
| GOLDEN Push-Ups (com.stephanduechtel.goldenpushups) | see 1.3 | **100K+** | 3.4 (590) | |
| PushFit (com.pushfit) | see 1.2 | 5K+ | 2.7 (24) | stale (Jan 2024) |
| PushApp (com.eliamove.pushapp) | see 1.7 | 1K+ | 4.6 | |

Takeaway: on Android the camera-counting field is push-up-dominated and small (only GOLDEN and Push Up Boss exceed 10K installs); no Android listing combines multi-exercise camera counting with friend challenges.

---

## TIER 2 — social challenge / accountability apps

### 2.1 GymRats · Fitness challenge — id1453444814
**Website** https://www.gymrats.app/
- `<title>`: `GymRats · Start a fitness challenge or accountability group` · Meta description: not observable (none) · H1: `Fitness groups for all` (also `Individual and team challenges`).
- Positioning: "Start a challenge or accountability group."
- Pricing (https://www.gymrats.app/pricing, "Pricing · GymRats"): Free ("Supported by ads", max 2 active groups; unlimited participants, custom scoring, team challenges, chat, Apple Health / Health Connect / Fitbit / Garmin) · Pro $3.99/mo or $32.99/yr (ad-free, unlimited groups, "Rat Pack", 1-min videos, themes, scoring limits, group mods, data export).
- Blog: `/news` holds a single founder post ("Android release, iOS updates, and future of GymRats", Aug 18, 2020) — no active blog.
- Download CTA: text links ("Get started", "Download for iOS/iPadOS/Android") → `/download`, plus store badge images (App Store, Google Play). No QR/smart link.
- Landing pages: `/features`, `/pricing`, `/about`, `/faq`; language variants (es, pt, fr, de, ja, ms). No use-case pages.
- Trust: "Since this is a competition, proof of activity is required."
- Android: yes (com.hasz.gymrats.app).
**App Store** https://apps.apple.com/us/app/id1453444814
- Title: `GymRats · Fitness challenge` · Subtitle: `Activity tracking for groups` · First sentence: "Band together to improve your fitness by competing in a group fitness challenge."
- Rating: **4.9 (4.7K)** · Health & Fitness · Free + IAP (Pro Monthly $3.99, Pro Annual $32.99) · Age 13+ · 153.4 MB · English + 6.
- Mechanics: "All that's required for a workout is a photo and a title."; score by workouts/miles/minutes/calories/steps/custom; Apple Health import; leaderboard; release notes mention goals/streaks stats and Friends.
- Privacy label: Linked: user ID, product interaction, health, precise location, email, name, photos/videos. Not linked: device ID (third-party advertising), crash data.
- Review themes — praise: check-in accountability, customizable scoring, easy Health sync + photo uploads, group motivation. Complaints: name off-putting, want richer chat/profiles, nutrition/goal tools, "bring back open point tracking", edit photos after posting.
**Google Play** https://play.google.com/store/apps/details?id=com.hasz.gymrats.app — Title `GymRats · Fitness challenge` · Short `Activity tracking for groups` · **Installs 1M+** · Rating 4.7 (114K) · Health & Fitness · IAP, no ads · Updated Oct 12, 2026.
**Keyword themes:** fitness challenge, group, activity tracking, accountability group, team challenges.
**Buzzend differentiation:** GymRats verifies effort with a selfie and a title; Buzzend verifies the actual reps with the camera. "Proof is the rep count, not the photo" is a sharp contrast for the "fitness challenge app with friends" query GymRats dominates.

### 2.2 Challenges - Compete, Get Fit — id1051342211 (FitNow / Lose It!, Ziff Davis)
**Website** https://challenges.app/ (Wix; blocks fetch tool, curl OK)
- `<title>`: `Home | challenges.app` · Meta description: none · H1: `Build Better Habits, One Challenge at a Time.`
- Positioning: "Challenges makes healthy habits and friendly competition simple."
- Pricing (https://www.challenges.app/pricing, `Challenges | Pricing`): **Basic — FREE, <1000 participants** (individual & team challenges, core challenge types, Android & iOS) · **Enterprise — "Starting at $10k", 1000+ participants** (reporting, dedicated support, exclusive challenge types, secure invitations).
- Blog: none. CTA: links to App Store (id1051342211) and Google Play (com.fitnow.challenges); nav Download / Healthy / About / Services / How It Works / Get Started. Competition types: "Team Based — Teams of 4 compete" / "Individual". Trust: footer "Consumer Health Data Policy", "Do Not Sell My Personal Information". Android: yes.
**App Store** https://apps.apple.com/us/app/id1051342211
- Title: `Challenges - Compete, Get Fit` · Subtitle: `Get fit with friends` · First sentence: "Get fit and compete with friends, family & coworkers with the Challenges app." — team challenges to close Stand/Move/Exercise rings, Bronze/Silver/Gold medals, nudges, wall comments.
- Rating: **4.6 (5.7K)** · Health & Fitness · Free (IAP n/o) · Age 4+ · 50.2 MB · English + 6.
- Privacy label: Linked: health, coarse location, name, email, user ID, product interaction, crash (incl. developer marketing).
- Review themes — praise: "I have never in my entire life worked out every single day but because of this app", "It's addicting", multiple metrics in one app. Complaints: points disappearing/not syncing, unhelpful support, requests for rest days / 100-point daily cap / Fitbit.
**Google Play** https://play.google.com/store/apps/details?id=com.fitnow.challenges — Title `Challenges - Compete, Get Fit` · Short `Inspiring wellness one challenge at a time.` · **Installs 100K+** · Rating 4.2 (1.08K) · no IAP, no ads · Updated Aug 7, 2026 · Android copy: "Move More or Eat Well challenge types", "Team Throwdowns or Solo Smackdowns".
**Keyword themes:** challenges, compete, get fit, friends, coworkers, team.
**Buzzend differentiation:** wearable/ring-driven and corporate-leaning (Enterprise from $10k); no exercise counting at all. Buzzend: "no Apple Watch, no wearable — your camera is the referee."

### 2.3 Fitness Pact — id1667620204
**Website** https://www.fitnesspact.com/
- `<title>`: `Fitness Pact - Have more fun, get more fit.` · Meta description: `Fitness Pact: An app that motivates you by bringing you and your friends together to hold each other accountable in a hilarious way.` · H1: `FINALLY ACCOMPLISH YOUR RESOLUTIONS` (page also has H1s "Want a cookie?" [cookie banner] and "Featured Pacts").
- Positioning: "…ultimate motivation and accountability" (pacts with a "payoff"/punishment).
- Pricing on site: not observable (store: Month of Motivation $2.99, 90-day Habit Transformation $6.99, Year of Change $24.99, Pact to the Future $49.99).
- Blog: none. CTA: App Store + Google Play badges. Landing pages: none (anchors #features, #featured_pacts; `/faqs`). Trust: cookie notice only. Android: yes (com.fitnesspact).
**App Store** https://apps.apple.com/us/app/id1667620204
- Title: `Fitness Pact: Better Together` · Subtitle: `Stay Accountable Together` · First sentence: "Boring workouts are dead."
- Rating: **4.5 (80)** · Health & Fitness · Free + IAP · Age 4+ · 35.1 MB · English. Privacy label: tracks identifiers; not linked: phone number, device/user ID, photos/videos, diagnostics.
- Review themes — praise: friend accountability + "ridiculous payoffs", fun, couples competing. Complaints: comments freeze the app, can't edit commitments after starting, want to comment on images.
**Google Play** https://play.google.com/store/apps/details?id=com.fitnesspact — Title `Fitness Pact: Get Fit Together` · Short `Workout Challenge with Friends` · **Installs 1K+** · Rating 3.5 (28) · IAP · Data safety: "No data shared with third parties", "No data collected" · Updated Mar 24, 2026 · Teen.
**Keyword themes:** accountable, together, friends, pact, workout challenge, resolutions.
**Buzzend differentiation:** manual self-reporting with social penalties; Buzzend's camera removes the honor-system problem entirely.

### 2.4 Steps: Fitness Challenge — id6760107862 (FamilyUnion Technologies)
**Website** https://www.fitnesschallenge.club/
- `<title>`: `Fitness Challenge — Group Step Challenge App for Friends & Teams`
- Meta description: `Fitness Challenge is a free group fitness challenge app for friends, families, and teams. Create weekly or monthly step challenges, compete on live leaderboards, and challenge AI opponents — on iOS and Android.`
- H1: `Step Up. Challenge Friends.` · Positioning: "The group step challenge app for friends and teams. Compete on live leaderboards and stay active together."
- Pricing: Free "$0 forever" · Fitness Challenge Plus $4.99/mo or $49.99/yr, 7-day trial.
- **Blog: yes** (https://www.fitnesschallenge.club/blog, "Blog – Fitness Challenge & Habit Building Insights"): "The Power of Peer Accountability: How Social Support Systems Build Lifelong Exercise Habits"; "How to Start a Group Step Challenge: The Complete Setup Guide for Friends, Families, & Teams"; "How to Run a Successful Workplace Step Challenge: The Complete 2026 Guide"; "Long-Term Movement, Lifelong Health: Compounding Benefits of Daily Steps"; "Why Social Fitness Challenges Beat Solo Gym Resolutions Every Time"; "The Ripple Effect: Building Lifelong Fitness Habits Through Community Movement". No post covers push-ups, squats, bodyweight or camera counting.
- CTA: "Download on App Store" / "Get it on Google Play" links; QR code + universal link (`fitnesschallenge.club/join/XXXX`) used for *group joins*, not downloads.
- **Use-case landing pages (strongest SEO architecture in tiers 1–2):** `/best-step-challenge-app`, `/best-step-challenge-apps`, `/group-fitness-challenge`, `/30-day-step-challenge`, `/monthly-fitness-challenge`, `/weekly-step-challenge`, `/workplace-step-challenge`, `/family-fitness-challenge`, `/team-fitness-challenge`, `/walking-challenge`, `/ai-fitness-challenge`, `/features`, `/support`.
- Trust: "Manually entered step logs in Apple Health or Google Health Connect are automatically ignored." / "Pure, honest competition for your family, friends, and coworkers."
- Android: yes (com.michaelyoussef.fitnesschallenge); "Android users finally get the beloved triple-ring daily tracking experience alongside iPhone teammates."
**App Store** https://apps.apple.com/us/app/id6760107862
- Title: `Steps: Fitness Challenge` · Subtitle: `Group Step Counter & Chat` · First sentence: "Compete with friends in real-time, climb the leaderboard, collect all the fitness badges."
- Rating: **4.9 (23)** · Health & Fitness · Free + IAP (Plus Monthly $4.99, Yearly $49.99) · Age 9+ · 58.8 MB · English.
- Features: up to 5 groups; steps/distance/flights/calories/rings; live leaderboards; daily goals with streak multipliers; group chat; QR joins; "Smart AI Rivals" (Easy→Extreme); anti-cheat filters for manual/spoofed steps.
- Privacy label: Linked: health, name, email, messages, photos/videos, user ID.
- Review themes — praise: seamless Health sync, leaderboards + AI rivals, clean UI, notifications "when people have passed me". Complaints: none visible.
**Google Play** https://play.google.com/store/apps/details?id=com.michaelyoussef.fitnesschallenge — Title `Fitness Challenge` · Short `Track steps, compete in group challenges with friends, and climb the ranks!` · **Installs 10+** · Rating n/o · IAP · Updated Oct 8, 2026.
**Keyword themes:** step challenge, group, friends, teams, leaderboard, fitness challenge, AI opponents.
**Buzzend differentiation:** steps-only. Its programmatic use-case page model (`/30-day-step-challenge`, `/family-fitness-challenge`…) is the template Buzzend should replicate for rep-based challenges (`/30-day-squat-challenge`, `/push-up-challenge-with-friends`), where no one has pages.

### 2.5 Wette — id6756288037
- App Store US page: **HTTP 404** at `apps.apple.com/us/app/id6756288037`, `/us/app/wette/id6756288037` and the DE storefront at observation time — all store fields **not observable** (possibly removed/unavailable in US). Search-snippet only (unverified): free; create fitness challenges with friends, up to 30 per group; gym frequency/duration/custom; progress verified by workout photos via in-app camera; claims "AI verification system with 98% accuracy".
- Website: not observable. Google Play: not observable.
- Note for Buzzend: even this "AI verification" is photo-of-workout verification, not rep counting.

### 2.6 Movva - Fitness Challenges — id6757069803
**Website** https://movva.app/en/
- `<title>`: `Create fitness challenges with friends | Movva` · Meta description: `Create and participate in fitness challenges with friends, log calories, distance, or active days, and track group performance. Add cash prizes to make the competition even more exciting and rewarding` · H1: `Turn your workouts into competition`.
- Positioning: "Create fitness challenges with friends, track your progress, and compete for cash prizes."
- Pricing: per-challenge entry fee set by creator; platform fees not observable. Blog: none. CTA: "Get the app"/"Get started" → `/en/download`. Landing pages: none (`/en/questions`, `/en/contact`). Trust: "Movva is not a betting platform." Android: not observable.
**App Store** https://apps.apple.com/us/app/id6757069803
- Title: `Movva - Fitness Challenges` · Subtitle: `Challenge friends, win prizes` · First sentence: "Create personalized fitness challenges, invite friends, and track progress in real time."
- Rating: not observable ("hasn't received enough ratings") · Health & Fitness · Free (IAP n/o) · dev Rodrigo Pasini de Souza · Age 13+ · 119.3 MB · English + Portuguese.
- Verification: "You can record your activities manually or connect with Apple Health to sync your workouts." Chat in challenges (1.9.0), public challenges, comments/reactions, prizes to winners.
**Google Play:** not observable.
**Keyword themes:** fitness challenges, friends, prizes, compete, cash.
**Buzzend differentiation:** manual/Health-logged, prize-money model with regulatory framing; Buzzend's verified reps make low-stakes friendly competition trustworthy without money.

### 2.7 Rival - Compete With Friends — id6464426060
**Website** https://rival.framer.ai/
- `<title>`: `Rival App` · Meta description: `Unleash your competitive spirit and bask in the neon glow of victory. It's gym versus gym, runner against runner, all in pursuit of the ultimate prize—bragging rights. Take control of your journey and push your limits right here with Rival!` · H1: `Rival`.
- Positioning: "Welcome to Rival—the thrilling frontier of digital fitness contests!" Game modes listed: Most Steps, Most Miles, Most Calories, **Most Push-Ups, Most Sit-Ups**, Weight Lifting.
- Pricing: not observable. Blog: none. CTA: "Download Now" → generic appstore.com link. Landing pages: none. Trust: none. Android: not observable.
**App Store** https://apps.apple.com/us/app/id6464426060
- Title: `Rival - Compete With Friends` · Subtitle: not observable · First sentence: "Welcome to Rival - Your Ultimate Fitness Challenge App!"
- Rating: **5.0 (25)** · Health & Fitness · Free (IAP n/o) · dev Sako Hovaguimian · Age 4+ · 35 MB · English · **last update v2.1.5 on 09/17/2024** (stale).
- Verification: "Morals in question? Settle the score by uploading proof of your workout."; HealthKit integration. Team mode, head-to-head, streaks, nudges, Daily/Weekly Goals.
- Review themes — praise: "track your own personal fitness as well as your friends", "like a role-playing game", nice UI. Complaints: none visible.
**Google Play:** not observable.
**Keyword themes:** compete with friends, fitness challenge, rival, bragging rights.
**Buzzend differentiation:** Rival already sells "Most Push-Ups / Most Sit-Ups" contests but on the honor system (+ proof upload) and hasn't shipped since 2024; Buzzend runs the same contests with camera-counted reps.

### 2.8 WeFit - Fitness With Friends — id6740943229
**Website** https://www.wefitlabs.com/
- `<title>`: `WeFit - Track Compete & Achieve` · Meta description: `WeFit is a social fitness tool that engages users through competition, challenges, and a strong social experience.` · H1: not observable; hero: "YOUR FRIENDS HIT THEIR STEPS. DID YOU?" / "TURN FITNESS INTO A DAILY GAME WITH FRIENDS".
- Pricing: not observable. Blog: none. CTA: "DOWNLOAD" button → App Store ("WeFit Early Access"). Landing pages: none (events via Luma, NYC). Trust: none. Android: not observable (iPhone only).
**App Store** https://apps.apple.com/us/app/id6740943229
- Title: `WeFit - Fitness With Friends` · Subtitle: `Move Together. Stay Consistent` · First sentence: "WeFit is a social fitness app that helps you stay consistent by working out with friends."
- Rating: **5.0 (10)** · Health & Fitness · Free + IAP (WeFit+ Yearly $39.99, Monthly $7.99) · Age 13+ · 96.2 MB · English.
- Features: daily step goals, weekly challenges/quests, leaderboards with friend filter, streaks (18-hour grace for WeFit+), XP + coins + shop, groups with chat. Privacy label: Linked: fitness, name, email, user/device ID.
**Google Play:** not observable.
**Keyword themes:** fitness with friends, move together, consistent, steps, daily game.
**Buzzend differentiation:** steps/XP gamification, iOS-only early access; no rep counting.

### 2.9 FitChallenge — id6498945419 (FitChallenge SAS)
**Website** https://fitchallenge.io/
- `<title>`: `FitChallenge - Turn Workouts Into a Game You Want to Win` · Meta description: not observable · H1: `Turn workouts into a game you want to win.`
- Positioning: "Duel friends in real time, spin daily challenges, and earn FitCoins to boost your rank."
- Pricing: "Go Premium" (amounts n/o on site; store $2.99/mo, $19.99/yr). Blog: none. CTA: "Download on iOS" / "Download on Android" buttons (repeated). Landing pages: none. Trust: none. Android: yes (io.fitchallenge.FitChallenge).
**App Store** https://apps.apple.com/us/app/id6498945419
- Title: `FitChallenge` · Subtitle: `Real-Time Fitness Duels` · First sentence: "Challenge friends to real-time fitness duels."
- Rating: not observable (not enough ratings) · Health & Fitness · Free + IAP (Monthly $2.99, Yearly $19.99) · Age 13+ · 155.8 MB · English.
- Tracking: "Log workouts in seconds." (manual); "Every session you complete is automatically written to Apple Health". 1v1 duels, community/custom challenges, leaderboards, streaks, feed, XP/badges, FitCoins, medals (1.8.0). Privacy label: tracks contact info/identifiers/usage (third-party advertising).
**Google Play** https://play.google.com/store/apps/details?id=io.fitchallenge.FitChallenge — Title `FitChallenge` · Short `Join challenges, track progress & level up. Fitness fun with the community!` · **Installs 100+** · Rating 4.9 · IAP + ads.
**Keyword themes:** fitness duels, real-time, challenge friends, game, level up.
**Buzzend differentiation:** "real-time duels" with manually logged reps; Buzzend's camera-counted live leaderboard is the honest version of the same promise.

### 2.10 Stridekick Activity Challenges — id1484402218
**Website** https://www.stridekick.com/
- `<title>`: `Stridekick - Free Step Challenges for Groups` · Meta description: `Compete in free fitness challenges, run group events and uncover wellness must-haves. Connect a wearable and get stepping!` · H1 (rendered): "Step, sweat and challenge your friends".
- Pricing: freemium ("start for free", "Level up to Unlimited"; store Pro tiers $12.99–$549.99 by participant count). **Blog: yes** (`/blog`; post titles not observable from home). CTA: **smart link** `link.stridekick.com/join` + App Store/Google Play badges + QR code. Landing pages: `/for-companies`, `/run-group-event`, `/challenges`, `/pricing`, `/steps-to-distance`; large `/shop`. Trust: none quoted. Android: yes.
**App Store** https://apps.apple.com/us/app/id1484402218
- Title: `Stridekick Activity Challenges` · Subtitle: `Fun step & activity challenges` · First sentence: "Compete in free, fun activity challenges with your friends and family–no matter which fitness tracker they have."
- Rating: **4.6 (4.4K)** · Health & Fitness · Free + IAP · Age 18+ · 90.4 MB · EN/FR/ES. Modes: Leaderboard, Streak, Target; community modes; "enter your activity manually" allowed.
- Review themes — praise: cross-tracker competition, fun UI, responsive dev. Complaints: scammers/weak moderation, private-challenge caps/removal ("The new update removed all private challenges"), Pro cost, few notifications.
**Google Play** https://play.google.com/store/apps/details?id=com.stridekick.Stridekick — Title `Stridekick Activity Challenges` · Short `Stridekick: A step challenge app` · **Installs 100K+** · Rating 4.7 (3.82K) · IAP · Updated Oct 14, 2026.
**Keyword themes:** step challenges, activity challenges, groups, friends, free, wearable.
**Buzzend differentiation:** wearable-centric step contests with moderation/scam complaints; Buzzend's camera-verified reps need no wearable and are hard to fake.

### 2.11 StepBet — id1056175729
**Website** https://stepbet.com/
- `<title>`: `StepBet` · Meta description: `Build an active lifestyle` · H1: `Win together with stepbet` · Positioning: "Achieve your fitness goals by putting real money on the line."
- Pricing: membership page (`/membership`; store: Membership $10.99–$12.99/mo, Annual $59.99–$79.99, Quarterly $29.99, Lifetime $119.99); bet amounts not observable on home. Blog: none. CTA: App Store + Google Play badges. Pages: `/membership`, `/faq`, `/rules`. Trust: none; social proof "Paid out to winners $148,873,781". Android: yes (com.stepbet.app).
**App Store** https://apps.apple.com/us/app/id1056175729
- Title: `StepBet: Walk, Get Active, Win` · Subtitle: `Step Goal & Fitness Motivation` · First sentence: "Become more active and earn money doing it!"
- Rating: **4.8 (23K)** · Health & Fitness · Free + IAP · Age 18+ (gambling/contests) · 130 MB · English. Step sources: Apple Health, Apple Watch, Fitbit, Garmin.
- Review themes — praise: "just competitive enough", wearable sync. Complaints: "A lot of effort for little money back", rising goals, concerning marketing email.
**Google Play** https://play.google.com/store/apps/details?id=com.stepbet.app — Title `StepBet: Get Active & Stay Fit` · Short `Step Goal & Fitness Motivation - Become more active and earn money` · **Installs 1M+** · Rating 4.5 (9.54K) · no IAP · ads.
**Keyword themes:** step goal, get active, win, earn money, bet, motivation.
**Buzzend differentiation:** money-stakes step games (18+); Buzzend is free, all-ages, rep-based.

---

## TIER 3 — large brands (positioning / keyword themes only)

| Brand | App Store title · subtitle · first sentence · rating (count) | Play title · short description · installs · rating | Website `<title>` / meta | Social mechanics observed | Blog focus |
|---|---|---|---|---|---|
| **Strava** https://apps.apple.com/us/app/id426826309 · https://play.google.com/store/apps/details?id=com.strava | `Strava: Run, Bike, Walk` · `Track & share with friends` · "Strava makes fitness tracking social." · 4.8 (377K); IAP Subscription $11.99 / $79.99 | `Strava: Run, Bike, Walk` · "Track your active life in one place and share the journey with friends." · 100M+ · 4.6 (1.2M) | `Strava \| Running, Cycling & Hiking App - Train, Track & Share` / "Strava connects millions of runners, cyclists, hikers, walkers and other active people through the sports they love…"; H1 "Community-Powered Motivation" | challenges, clubs + club messaging, segments, streaks | stories.strava.com: product updates, community/inclusion, running/cycling training; no bodyweight/rep content |
| **Nike Training Club** https://apps.apple.com/us/app/id301521403 · …id=com.nike.ntc | `Nike Training Club` · `Training and Workouts` · "Nike Training Club isn't just another workout app — it's a portal to Nike's top trainers, athletes and experts." · 4.8 (282K); Free | `Nike Training Club` · "Your ultimate training partner. Unlock workout programs and track your activity." · 10M+ · 4.3 (373K) | `Nike Training Club App. Home Workouts. Nike.com` / "NTC provides 185+ free workouts from bodyweight-only sessions, invigorating yoga classes, targeted training programs, and full-equipment home workouts for all fitness levels." | none observable (no challenges/leaderboards/streaks) | n/a |
| **Freeletics** https://apps.apple.com/us/app/id654810212 · …id=com.freeletics.lite | `Freeletics: Workouts & Fitness` · `Home & Gym AI Coach, Planner` · "Europe's #1 fitness app…" · 4.6 (22K); Training Coach $34.99 / $59.99 | `Freeletics: Fitness Workouts` · "A personal trainer in your pocket. At-home HIIT workouts & custom training plans" · 10M+ · 4.2 (261K) | `Intensive workouts & individual training plans \| FREELETICS` / "Get a personal workout plan based on your fitness level. High intensity training: anytime & anywhere. Start training today!" | badges, streaks, "community of 60 million" | freeletics.com/en/blog: training (kettlebell, triceps, back), nutrition, mindset, member stories, "Find Your Free Challenge"; no rep counting |
| **Fitbod** https://apps.apple.com/us/app/id1041517543 · …id=com.fitbod.fitbod | `Fitbod: Gym & Fitness Planner` · `AI Personal Trainer & Workouts` · "Build muscle, gain strength and lose weight with a customized workout plan just for you." · 4.8 (287K); Monthly $12.99–$15.99 | `Fitbod: Workout & Gym Planner` · "Gym & home workout plans with strength training, exercise tracking, HIIT & more." · 1M+ · 4.5 (31.6K) | `Fitbod – Workout Planner & Fitness App` / "Fitbod is a personalized workout planner and fitness app that creates strength training plans based on your goals, fitness level, and available equipment."; H1 "LESS PLANNING. MORE PROGRESS." | none (community mention only) | fitbod.me/blog: strength programming, bulking/cutting, nutrition, HIIT, TRX, recovery; one generic "turn any goal into a fitness challenge" post |
| **Hevy** https://apps.apple.com/us/app/id1458862350 · …id=com.hevy | `Hevy - Workout Tracker Gym Log` · `Weight Lifting Routine Planner` · "Join +10 million users!" · 4.9 (98K); Pro $2.99/mo, $23.99/yr, $74.99 lifetime | `Hevy - Gym Log Workout Tracker` · "Gym Log & Workout Tracker \| Fitness Journal, Training & Weight Lifting Planner" · 5M+ · 4.9 (278K) | `Hevy - The #1 Workout Tracker & Gym Logger App` / "Hevy is the #1 free gym workout tracker & planner app for iOS and Android. Plan your lifting routines, log workouts, and track progress." | follow friends' lifts, copy routines (feed-like) | hevyapp.com/blog: gym beginner guides, training methodology, plateaus; no bodyweight/challenge content |
| **adidas Running** https://apps.apple.com/us/app/id336599882 · …id=com.runtastic.android | `adidas Running: Run tracker` · `From Walk to Marathon training` · "Welcome to the adidas Running app — your all-in-one fitness companion." · 4.8 (109K); Free | `adidas Running: Run tracker` · "From Walk to Marathon training" · 50M+ · 4.6 (1.74M) | runtastic.com → 307 redirect (not observed) | global challenges, virtual races, community feeds | n/o |
| **Home Workout - No Equipments (Leap)** https://apps.apple.com/us/app/id1313192037 · …id=homeworkout.homeworkouts.noequipment | `Home Workout - No Equipments` · `Bodyweight Fitness & Training` · "Pain or injury getting in the way?" · 4.9 (127K); Premium Yearly $39.99, Monthly $9.99 | `Home Workout - No Equipment` · "Home workouts for fitness & fast bodybuilding at home - no equipment needed." · 100M+ · 4.9 (4.04M) | `FITNESS APPS-Millions of Users' Choice` / meta none; App Store badges only; no blog | none observable | none |
| **Seven** https://apps.apple.com/us/app/id650276551 · …id=se.perigee.android.seven | `Seven: 7 Minute Workout` · `Daily HIIT Bodyweight Exercise` · "Join the movement of 40 million and see results with just 7 minutes a day." · 4.8 (138K); 7 Club $4.99–$9.99 | `Seven - 7 Minute Workout` · "Quick bodyweight HIIT workouts, just 7 minutes a day!" · 10M+ · 4.5 (121K) | seven.app → perigee.se (title tag n/o; hero "Small habits lead to big changes."); store badges; `/articles` | daily challenge, "compete with friends" | articles section (titles n/o) |
| **Zing AI** https://apps.apple.com/us/app/id1552207792 | `Zing AI: Home & Gym Workouts` · `Fitness Tracker & Planner` · "Zing is the ultimate AI Coach, revolutionizing fitness with AI-powered, personalized workouts…" · 4.8 (31K); Zing Premium $18.99, Body Scan Report $19.99 | Play: not observable (package not identified) | zing.coach → 307 to partner.zing.coach (B2B): `AI Fitness Coaching for Gyms and Apps \| ZNG COACH™` / "Give every member a personal AI coach. ZNG partners with gyms, apps and wellness brands…"; /blog 404 | monthly challenges, "Fitness Circle" friends; Zing Vision "uses your smartphone's camera to track movements in real-time" (form feedback, no rep counting observable) | none reachable |

Tier-3 keyword themes to borrow or avoid: "home workout / no equipment / bodyweight" (Leap, Seven, NTC), "AI coach / personal trainer" (Freeletics, Fitbod, Zing), "track & share with friends / community" (Strava, Hevy). None of them markets *counting* or *verified* reps, and none of the bodyweight brands (Leap, Seven, NTC) markets friend challenges prominently except Seven ("compete with friends").

---

## (a) Comparison table

| Name | Tier | Platforms | AI/camera counting? — exercises | Social challenges? | Streaks? | Price | App Store ratings (count) | Play installs |
|---|---|---|---|---|---|---|---|---|
| **Buzzend (reference)** | — | iOS + Android | Yes — squats, push-ups, sit-ups, jumping jacks, lunges, burpees, high knees | Yes (friends, live leaderboards, feed) + steps | Yes | Free | small | small |
| Push Up Counter & Tracker (Puuush) | 1 | iOS, Apple Watch | Yes (ARKit/Vision + motion) — push-ups | Leaderboards (friends/world), monthly rhythm events | Yes | Free + Pro $3.99/mo, $29.99/yr | 4.8 (3.4K) | not listed |
| PushFit | 1 | iOS, Apple Watch, Android (stale) | Yes (face-distance) — push-ups | Leaderboards | Yes (survive rest days) | Free; Pro one-time (n/o) | 4.7 (2.4K) | 5K+ (2.7) |
| GOLDEN Push-Ups (+4 sibling apps) | 1 | iOS + Android | Yes (on-device pose) — push-ups; separate apps for pull-ups/dips, burpees, sit-ups, squats | Leaderboards + group challenges | Yes (Play copy) | Free + Basic $1.99/mo, $9.99/yr, $24.99 | 4.6 (77) | 100K+ (3.4) |
| Squat Counter - Auto counting | 1 | iOS | Yes (AI posture/motion) — squats | No (solo badge challenges) | n/o | Free | 4.0 (1) | not found |
| Striga — Pushup Tracker | 1 | iOS | Yes (AI pose) — push-ups | Daily leaderboard | Yes | Sub required: $5/mo, $50/yr | 2.0 (3) | n/o |
| Orbit: Workout with Friends | 1 | iOS | Yes (computer vision) — push-ups, squats, punches (1v1) | Yes (friends, 1v1 Tug of War, feed, leaderboard) | n/o | Free + Orbit Plus $1.99/wk–$39.99/yr | 4.4 (54) | n/o |
| PushApp | 1 | iOS + Android + web | Yes (on-device pose) — push-ups | Yes (friends, 1v1 live duels, leaderboards, cash challenge) | Yes | Free + Pro $9.99, $99.99/yr | 5.0 (8) | 1K+ (4.6) |
| PushTrack | 1 | iOS | Yes (on-device ML) — push-ups | Yes (friends, groups + chat, leaderboards) | Yes (+freezes) | Free | 5.0 (1) | n/o |
| Pushup Club | 1 | iOS | Yes (front camera) — push-ups | Yes (code-join challenges, global leaderboards, global counter) | Yes | Free (optional tips) | 5.0 (4) | n/o |
| Push Up Counter: Arena | 1 | iOS | Yes (camera, wall/floor mode) — push-ups | Game Center friends, global leaderboards, boss battles | Yes (Pro, freezes) | Free + Lifetime $4.99 / Pro; ads | 4.8 (64) | n/o |
| Push Up Counter: AI Tracker | 1 | iOS | Yes (AI camera + floor mode) — push-ups | Global leaderboards | Yes | Free + $3.99/mo, $19.99/yr, $39.99 | 5.0 (1) | n/o |
| Push Up Boss (Android) | 1 | Android + iOS (crossplay) | Yes (Vision AI) — push-ups | Yes (online battles, friends, tournaments) | Yes | Free, IAP + ads | n/o | 50K+ (4.0) |
| PoseUp (Android) | 1 | Android | Yes (AI pose) — push-ups | No | Yes | Free | n/o | 100+ |
| GymCam (Android) | 1 | Android | Yes (AI) — "any exercise" + jump rope | "challenge friends" (video) | n/o | Free + IAP | n/o | 1K+ (4.8) |
| Neon Pose (Android) | 1 | Android | Yes (AI pose) — squats, push-ups, sit-ups | No | n/o | Free, IAP + ads | n/o | 50+ |
| SQUATUP (Android) | 1 | Android | Yes (auto) — squats | No | n/o | Free, IAP + ads | n/o | 1K+ (4.1) |
| GymRats | 2 | iOS + Android | No (photo proof) | Yes (groups, custom scoring, chat) | Stats only | Free (ads, 2 groups) + Pro $3.99/mo, $32.99/yr | 4.9 (4.7K) | 1M+ (4.7) |
| Challenges - Compete, Get Fit | 2 | iOS + Android | No (Apple Health / rings / steps) | Yes (teams of 4, individual, corporate) | n/o | Free; Enterprise from $10k | 4.6 (5.7K) | 100K+ (4.2) |
| Fitness Pact | 2 | iOS + Android | No (self-report) | Yes (pacts with penalties, feed) | n/o | Free + $2.99–$49.99 | 4.5 (80) | 1K+ (3.5) |
| Steps: Fitness Challenge | 2 | iOS + Android | No (Health/Health Connect steps) | Yes (groups, chat, AI rivals, teams) | Yes (multipliers) | Free + Plus $4.99/mo, $49.99/yr | 4.9 (23) | 10+ |
| Wette | 2 | n/o (US page 404) | No (photo verification, per snippet) | Yes (per snippet) | n/o | n/o | n/o | n/o |
| Movva | 2 | iOS | No (manual / Apple Health) | Yes (prize challenges, chat) | n/o | Free; entry fees | n/o | n/o |
| Rival - Compete With Friends | 2 | iOS | No (proof upload / HealthKit) — "Most Push-Ups/Sit-Ups" modes | Yes (teams, head-to-head) | Yes | Free | 5.0 (25) | n/o |
| WeFit | 2 | iOS | No (steps/activity) | Yes (quests, groups, chat) | Yes | Free + WeFit+ $7.99/mo, $39.99/yr | 5.0 (10) | n/o |
| FitChallenge | 2 | iOS + Android | No (manual log) | Yes (1v1 duels, community, feed) | Yes | Free + $2.99/mo, $19.99/yr; ads on Play | n/o | 100+ (4.9) |
| Stridekick | 2 | iOS + Android | No (wearables/steps, manual allowed) | Yes (Leaderboard/Streak/Target, community, corporate) | Yes (mode) | Free + Pro $12.99–$549.99 | 4.6 (4.4K) | 100K+ (4.7) |
| StepBet | 2 | iOS + Android | No (steps from Health/wearables) | Money-stake step games | n/o | Free + membership $10.99/mo–$119.99 lifetime | 4.8 (23K) | 1M+ (4.5) |
| Strava | 3 | iOS + Android | No | Challenges, clubs | Yes | Free + $11.99/mo, $79.99/yr | 4.8 (377K) | 100M+ (4.6) |
| Nike Training Club | 3 | iOS + Android | No | n/o | n/o | Free | 4.8 (282K) | 10M+ (4.3) |
| Freeletics | 3 | iOS + Android | No | Community, badges | Yes | Free + Coach $34.99–$59.99 | 4.6 (22K) | 10M+ (4.2) |
| Fitbod | 3 | iOS + Android | No | n/o | n/o | Free + $12.99–$15.99/mo | 4.8 (287K) | 1M+ (4.5) |
| Hevy | 3 | iOS + Android | No | Follow friends | n/o | Free + Pro $2.99/mo, $23.99/yr, $74.99 | 4.9 (98K) | 5M+ (4.9) |
| adidas Running | 3 | iOS + Android | No | Global challenges, community | n/o | Free | 4.8 (109K) | 50M+ (4.6) |
| Home Workout - No Equipments | 3 | iOS + Android | No | n/o | n/o | Free + $9.99/mo, $39.99/yr; ads on Play | 4.9 (127K) | 100M+ (4.9) |
| Seven | 3 | iOS + Android | No | Daily challenge, compete with friends | Reviews mention | Free + 7 Club $4.99–$9.99 | 4.8 (138K) | 10M+ (4.5) |
| Zing AI | 3 | iOS (+ Android n/o) | Camera form feedback (no rep counting observable) | Monthly challenges, Fitness Circle | n/o | Free + Premium $18.99 | 4.8 (31K) | n/o |

---

## (b) Positioning gaps nobody in tier 1/2 owns

1. **One app, many exercises, both platforms.** Every tier-1 counter is push-up-only (Puuush, PushFit, PushApp, PushTrack, Pushup Club, Arena, Striga, AI Tracker, Push Up Boss, PoseUp) or one-app-per-exercise (GOLDEN). The only multi-exercise counters are Neon Pose (Android, 50+ installs, 3 moves) and Orbit (iOS-only, push-ups/squats/punches). Nobody on either store counts **jumping jacks, lunges, burpees or high knees** inside a social app; the "cardio bodyweight" counting space is empty.
2. **Camera-verified friend challenges.** Tier 2 verifies with selfies (GymRats, Wette), self-report + proof uploads (Rival, Fitness Pact, FitChallenge, Movva) or wearable/Health data (Challenges, Steps, Stridekick, StepBet, WeFit). Tier 1 social features are mostly leaderboards (plus 1v1 duels in PushApp/Orbit/Push Up Boss). "The camera is the referee for the whole group" is unclaimed — and directly answers the cheating complaints found in PushFit, Stridekick and Fitness Pact reviews.
3. **Reps + steps in one social loop.** Step-challenge apps don't count reps; rep counters don't track steps. A single streak that mixes "10 min of moves + 6k steps" is unowned.
4. **Free core counting without a subscription wall on iOS *and* Android.** Striga requires Pro; PushApp, Orbit, GOLDEN, Puuush and Arena push subscriptions/lifetime; the free ones (Pushup Club, PushTrack, Push Up Boss, PoseUp) are single-platform or push-up-only. "Free, no account required to start, both platforms" is only claimed by Push Up Boss (push-ups).
5. **Cross-platform friend play for bodyweight reps.** Only Push Up Boss advertises iOS↔Android crossplay for camera-counted reps. Buzzend's iOS+Android friend groups are a differentiator versus every iOS-only counter (Puuush, Orbit, Arena, Striga, Pushup Club, PushTrack, Squat Counter).
6. **No wearable needed, anywhere.** PushFit says "No hands. No wearable."; the social apps require Apple Watch/rings (Challenges), trackers (Stridekick, StepBet) or Health data. "Works in a hotel room with a phone leaned against a wall, with your friends" is open to own.
7. **Family / all-ages group play.** Push Up Boss and the tier-1 counters are rated 4+/Everyone, but no one positions for families or mixed-ability groups; fitnesschallenge.club targets family *step* challenges only.
8. **Risk, not a gap:** localization. Tier-1 counters ship 12–26 languages (Puuush 12, PushFit 21, GOLDEN 26, Squat Counter 19, Striga 18). Buzzend's English-only listing is a disadvantage on non-US storefronts; Orbit, PushApp and PushTrack are also English-only, so English-only is survivable in the US but blocks the rest.

## (c) Content gaps (informational topics competitor blogs do not cover)

Observed blog coverage: PushApp (~300 push-up posts: form, variations, programs, norms, app comparisons, 4-week challenge); fitnesschallenge.club (6 posts on step/workplace/family challenges and peer accountability); Stridekick (blog exists, titles n/o); GymRats (one 2020 news post); Freeletics (gym/kettlebell/nutrition); Fitbod (strength programming, bulking/cutting); Hevy (gym beginner, plateaus); Strava Stories (product/community/running). Not covered by anyone observed:

1. **How camera rep counting works / setup**: "how to count push-ups with your phone camera", "how to count squats with your phone", where to prop the phone, lighting, distance, portrait vs landscape, "why didn't my rep count" (answers Puuush/PushFit/Striga accuracy complaints). PushFit's user-guide chapter is the only thing close, and it is push-up-only.
2. **Per-exercise counter intent beyond push-ups**: "squat counter app", "sit-up counter app", "jumping jack counter", "burpee counter app", "lunge counter", "high knees counter" — no landing pages or posts anywhere in tiers 1–3.
3. **Bodyweight challenges with friends at home**: ideas, rules, fair scoring for mixed fitness levels (PushApp has one push-up rules post; fitnesschallenge.club covers steps only). E.g., "fitness challenges with friends at home (no equipment)", "remote workout challenge for long-distance friends", "office fitness challenge without wearables".
4. **30-day challenge plans and trackers for squats, sit-ups, burpees, jumping jacks, lunges** (only `/30-day-pushup-challenge` and `/30-day-step-challenge` exist).
5. **Norms/tests**: "how many squats should I be able to do", "sit-up test standards by age" (PushApp covers push-up norms only; Hevy/Fitbod cover lifts).
6. **Android-intent queries**: "push up counter app for Android", "squat counter Android" — PushApp's meta says "for iPhone and web", Puuush/Arena are iPhone-only, PushFit's Android app is stale.
7. **Privacy explainers**: "does a rep counter app record you?", "on-device AI vs cloud for workout video" — competitors state it on product pages but no one educates.
8. **Streak/habit science for daily bodyweight minimums** ("2-minute daily squat streak"), and **steps + reps hybrid routines** for desk workers.
9. **Form cues for burpees, lunges, high knees, jumping jacks** (tier-3 blogs cover gym lifts; PushApp covers push-up form only).
10. **Comparison/"best of" pages**: "best squat counter app", "best fitness challenge app with friends" (fitnesschallenge.club owns "best step challenge app"; PushApp owns "best push-up counter apps 2026").

## (d) Trust / privacy messaging examples about camera data (verbatim, with source)

1. "Nothing is recorded and nothing leaves your iPhone." — PushFit homepage, https://pushfit.app/
2. "The camera feed is used to derive one distance and is never written to disk, never uploaded, and never shown to anyone." — PushFit user guide, https://pushfit.app/guide/counting
3. "There is no photo, no video and no face data leaving your iPhone." — PushFit user guide, https://pushfit.app/guide/counting
4. "No photo or video is ever saved, and no face data ever leaves your iPhone." — PushFit App Store description, https://apps.apple.com/us/app/id551162217
5. "Runs locally on iOS & Android. Your video never leaves the phone." — GOLDEN Sports-Apps homepage, https://goldensportsapps.com/
6. "We don't collect any of your data. All your workouts are stored locally on your device only." — GOLDEN Sports-Apps homepage, https://goldensportsapps.com/
7. "Camera input—including images, video frames, and intermediate pose or exercise-recognition data derived from them" is processed on the device; "It is never transmitted to or stored on our servers." — GOLDEN privacy policy, https://goldensportsapps.com/privacy.html
8. "This information is processed only on your device and is not sent to our servers or shared." — GOLDEN Push-Ups Google Play description, https://play.google.com/store/apps/details?id=com.stephanduechtel.goldenpushups
9. "No photo, video or face data is recorded, stored or sent" / "This happens on your device." — Puuush privacy policy, https://puuush.app/privacy
10. "Counting happens on your device — nothing is uploaded just to count." and "Video only leaves your phone if you choose to render a shareable clip while signed in" — PushApp homepage, https://trypushapp.com/ ; "Rep counting runs on-device." — PushApp App Store, https://apps.apple.com/us/app/id6778940787
11. "All of the vision processing happens on your device, so your video never leaves your phone." / "Your video is never uploaded." — PushTrack App Store, https://apps.apple.com/us/app/id6780742603
12. "Your camera feed is processed entirely on your device." / "No video is recorded, stored, or transmitted." — Pushup Club App Store, https://apps.apple.com/us/app/id6761735214
13. "The developer does not collect any data from this app." — Push Up Counter: AI Tracker, App Store privacy label, https://apps.apple.com/us/app/id6760224222
14. "Photos are promptly deleted for privacy." (body-scan images) — Zing AI App Store, https://apps.apple.com/us/app/id1552207792
15. Anti-cheat framed as trust: "Manually entered step logs in Apple Health or Google Health Connect are automatically ignored." / "Pure, honest competition for your family, friends, and coworkers." — fitnesschallenge.club, https://www.fitnesschallenge.club/
16. Honest-limits framing: "(Recognition may vary depending on lighting, camera angle, device performance, and your environment.)" and "Workout history (stored on-device)" — SQUATUP Google Play, https://play.google.com/store/apps/details?id=com.flowbitlabs.squatup

Counter-signals worth noting (privacy labels that may deter users): Striga declares "Body (Hands, Head)" data linked to the user; GOLDEN (iOS) and PushApp declare "Photos or Videos" linked to the user (video journaling / share clips); Arena, Puuush and Squat Counter declare cross-app tracking identifiers; Arena tracks location. Buzzend should check its own App Privacy / Data safety labels match whatever "on-device" claim it makes, since every direct competitor has already made the "video never leaves your phone" statement — it is table stakes, not a differentiator, unless Buzzend pairs it with *social* features (the social apps — GymRats, Steps, Stridekick — all collect photos, location or messages).

---

## Appendix — source index
App Store (US): id6470828037, id551162217, id6657950305, id6755665178, id6754952234, id6448385157, id6778940787, id1609456321, id6760224222, id6780742603, id6761735214, id1453444814, id1051342211, id1667620204, id6760107862, id6757069803, id6464426060, id6740943229, id6498945419, id1484402218, id1056175729, id1552207792, id426826309, id301521403, id654810212, id1041517543, id1458862350, id336599882, id1313192037, id650276551. Failed: id6756288037 (Wette, 404), id6484504666 (404), id1512473074 (wrong id, 404).
Google Play: com.pushfit, app.pushupboss.android, com.mfnd.GymCam, com.justwitworks.neonpose, com.hanhyo.poseup, com.stephanduechtel.goldenpushups, com.stephanduechtel.goldensitups, com.flowbitlabs.squatup, com.eliamove.pushapp, com.hasz.gymrats.app, com.fitnow.challenges, com.fitnesspact, com.michaelyoussef.fitnesschallenge, io.fitchallenge.FitChallenge, com.stridekick.Stridekick, com.stepbet.app, com.strava, com.nike.ntc, com.freeletics.lite, com.fitbod.fitbod, com.hevy, com.runtastic.android, homeworkout.homeworkouts.noequipment, se.perigee.android.seven.
Websites: puuush.app, pushfit.app (+/guide/counting, /privacy), goldensportsapps.com (+/privacy.html), app.eumplus.kr, trypushapp.com (+/blog), pushupchampion.com, gymrats.app (+/pricing, /news), challenges.app (+/pricing), fitnesspact.com, fitnesschallenge.club (+/blog), movva.app/en, rival.framer.ai, wefitlabs.com, fitchallenge.io, stridekick.com, stepbet.com, strava.com, stories.strava.com, nike.com/ntc-app, freeletics.com/en/blog, fitbod.me/blog, hevyapp.com/blog, leaphealth.fitness, seven.app/perigee.se, zing.coach.
