# Live store listings audit (observed 2026-10-15)

Sources: iTunes Lookup API (storefronts us, np, in, gb, au, ca), the public App Store web page, the public Google Play web page (gl=US and gl=NP). Fields that only exist inside App Store Connect / Play Console (keyword field, promotional text if unset, support/marketing URLs, Data safety detail, acquisition reports) are marked **not observable** and must be exported by you.

## Apple App Store — field by field

| Field | Live value | Chars / limit | Notes |
|---|---|---|---|
| App name | Buzzend: Fitness Challenges | 27/30 | 3 chars unused. Words: Buzzend, Fitness, Challenges |
| Subtitle | AI Workout Rep Counter | 22/30 | 8 chars unused. Words: AI, Workout, Rep, Counter |
| Promotional text | not observable on the public page (no promo paragraph precedes the description) | ?/170 | Confirm in ASC; Sept notes recorded an older promo text |
| Description | see below | 1635/4000 | 2365 chars unused; first sentence carries the positioning |
| Keyword field | not observable (ASC only) | ?/100 | Sept 2 log: old field was quoted phrases wasting ~40% of chars; Sept proposal may not have been applied |
| Primary / secondary category | Health & Fitness / ['Social Networking'] | — | both indexed by App Store search (Apple, App Store search page) |
| Version / released | 3.1.14 / 2026-10-11 | — | first release 2022-12-28 |
| What's New | • Two new workouts: burpees and high knees • Proper feedback on why a rep didn't count • Challenges now show prizes, winners and time left • Quick-start options to set up a challenge in one tap • A clearer stats card when you share your day • Many smaller fixes and improvements. | 279/4000 | confirms burpees + high knees shipped |
| Age rating | 13+ on web page (lookup API reports 12+) | — | reasons shown: Frequent Contests; Infrequent Profanity or Crude Humor; Messaging and Chat; User-Generated Content; Health or Wellness Topics |
| Languages | ['EN'] | — | English only, no localizations |
| Screenshots | 5 iPhone, 3 iPad | ≤10 per size | 5 of 10 iPhone slots used |
| Size / min OS | 90.3 MB / iOS 17.6 | — | iPad supported (yes); Mac (Apple silicon) listed as compatible |
| Seller / seller URL | INVENTECH GROUP LLC / https://buzzend.com | — | |
| Support URL / Marketing URL / Privacy URL | not parsed from page (see discovery summary) | — | confirm in ASC; website pages currently 404 |
| Ratings by storefront | US 4.5★ (4), NP 5★ (2), IN 5★ (1), GB 0★ (0), AU 5★ (1), CA 0★ (0) | — | 8 ratings worldwide; GB and CA have none |
| Custom product pages / PPO tests / in-app events | not observable | — | Sept baseline notes a PPO test running since May 6 with 15–29 impressions per treatment (inconclusive) |

### Live App Store description (verbatim)

```
Buzzend makes fitness fun, social and impossible to quit. Challenge your friends, keep your daily streak alive and climb the live leaderboard, while the AI camera counts every rep for you.

Working out alone gets boring. Buzzend turns every workout into a friendly competition, so you stay motivated and actually show up every day.

WHY YOU'LL LOVE BUZZEND

• AI rep counting

Just place your phone and start moving. The AI camera counts your reps automatically, so you can focus on your workout. Every rep is verified, so every challenge is fair.

• Fitness challenges with friends

Create a challenge or join one in seconds. Invite your friends, compete together and see who comes out on top.

• Daily streaks

Build a habit that sticks. Your streak grows every day you stay active, and you won't want to break it.

• Live leaderboards

See where you rank against your friends in real time. One more rep could move you to the top.

• Step and activity tracking

Track your daily steps and activity automatically, even on rest days.

• Social feed and stories

Share your progress, photos and workout videos. Cheer on your friends and get inspired by the community.

PERFECT FOR

• Friends and gym buddies who love a little competition

• Beginners starting their fitness journey at home

• Anyone who needs extra motivation to stay consistent

• Groups, teams and communities doing fitness challenges together

NO GYM NEEDED

All you need is your phone. Work out at home, in the park or at the gym. Buzzend works wherever you do.

Free to download. Start your first challenge today, invite your friends and let the AI count every rep
```

## Google Play — field by field

| Field | Live value | Chars / limit | Notes |
|---|---|---|---|
| App name | Buzzend: Fitness Challenges | 27/30 | identical to iOS |
| Short description | Challenge friends, keep your streak & let AI count every rep. Free workout app! | 79/80 | contains 'Free' and an exclamation; no exercise names, no 'camera' |
| Full description | see below | 1788/4000 | typo 'High knes'; burpees missing from the exercise list although shipped |
| Category | Health & Fitness (page also shows a FAMILY chip — verify in Console) | — | |
| Content rating | Teen | — | |
| Downloads | 100+ | — | public bucket |
| Rating | not displayed on the public page (too few ratings) | — | |
| Developer / email / website | InvenTech Group / hello@buzzend.com / https://buzzend.com | — | |
| Privacy policy URL | https://buzzend.com/#/privacy | — | legacy hash URL; `/privacy` currently returns 404 |
| Promo video | https://www.youtube.com/watch?v=XQwKppQIaRA — title 'Scrolling is outdated, workout now with phone😉 #buzzend #ai #challenge #workout' (channel 'Buzzend Fitness', @buzzend.official) | — | vertical short; first 30 s autoplay matters |
| Data safety (summary visible) | No data shared with third parties; may collect: Personal info, Messages (list truncated on page) | — | compare with manifest permissions: camera, mic, contacts, activity recognition, notifications |
| Updated on | Oct 11, 2026 | — | matches iOS 3.1.14 |
| Screenshots | ~14 phone-size images detected on page (phone + tablet sets) | 2–8 per device type | verify exact count per slot in Console |
| Store listing experiments / custom store listings | not observable | — | Console only |

### Live Google Play full description (verbatim)

```
Buzzend makes fitness fun, social and impossible to quit. Challenge your friends, keep your daily streak alive and climb the live leaderboard, while the AI camera counts every rep for you.

Working out alone gets boring. Buzzend turns every workout into a friendly competition, so you stay motivated and actually show up every day.

WHY YOU'LL LOVE BUZZEND

• AI rep counting
Just place your phone and start moving. The AI camera counts your reps automatically, so you can focus on your workout. Every rep is verified, so every challenge is fair.

- Squat counter with automatic counting
- Push up counter — no tapping, no proximity sensor
- Sit up counter
- Lunge counter
- Jumping jack counter
- High knes

• Fitness challenges with friends
Create a challenge or join one in seconds. Invite your friends, compete together and see who comes out on top.

• Daily streaks
Build a habit that sticks. Your streak grows every day you stay active, and you won't want to break it.

• Live leaderboards
See where you rank against your friends in real time. One more rep could move you to the top.

• Step and activity tracking
Track your daily steps and activity automatically, even on rest days.

• Social feed and stories
Share your progress, photos and workout videos. Cheer on your friends and get inspired by the community.

PERFECT FOR

• Friends and gym buddies who love a little competition
• Beginners starting their fitness journey at home
• Anyone who needs extra motivation to stay consistent
• Groups, teams and communities doing fitness challenges together

NO GYM NEEDED

All you need is your phone. Work out at home, in the park or at the gym. Buzzend works wherever you do.

Free to download. Start your first challenge today, invite your friends and let the AI count every rep.
```

## Cross-store observations

- Title/subtitle vocabulary indexed by Apple right now: *Buzzend, Fitness, Challenges, AI, Workout, Rep, Counter*. Not in name/subtitle: *friends, squat, push up, camera, streak, leaderboard, home* — these must live in the 100-char keyword field (unknown) or be lost.
- The September 2 proposal ("Buzzend: AI Squat Rep Counter" / "Workout Challenges w/ Friends") was **not** what shipped; the live pair is more generic ("Fitness Challenges" / "AI Workout Rep Counter"). Both stores and the website now share the same first sentence, which is good for consistency.
- Google Play description is the only place that lists exercises; iOS description lists none. Neither mentions high knees/burpees consistently (Play lists 'High knes', omits burpees; iOS omits all exercise names).
- Play short description spends 18 of 80 characters on 'Free workout app!' — Google's preview-assets guidance says not to use price/promotional language in the short description (observed 2026-10-15).
- Both listings are English-only even though the app is available in NP and IN storefronts (ratings exist there).
- Apple shows 5 iPhone screenshots (limit 10) and no app preview video; Play has a vertical YouTube video.
