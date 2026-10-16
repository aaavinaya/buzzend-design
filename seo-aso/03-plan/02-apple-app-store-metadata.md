# Apple App Store metadata package (prepared 2026-10-15, not submitted)

Decisions applied: counter-first name (Q1), all English storefronts share one listing (Q2), seven exercises (Q3), truthful privacy line only (Q4). Limits verified against Apple's documentation on 2026-10-15 (see `../01-discovery/03-platform-rules-verified-2026-10-15.md`). Counts below are computed programmatically from this file's source of truth; re-run `build_metadata.py` after any edit.

## Field summary

| Field | Kind | Count / limit | Policy check |
|---|---|---|---|
| App name | final | 23/30 | ok |
| App name | alternate | 29/30 | ok |
| App name | alternate | 27/30 | ok |
| App name | alternate | 28/30 | ok |
| Subtitle | final | 29/30 | ok |
| Subtitle | alternate | 29/30 | ok |
| Subtitle | alternate | 30/30 | ok |
| Subtitle | alternate | 26/30 | ok |
| Promotional text | final | 166/170 | ok |
| Promotional text | alternate | 144/170 | ok |
| Keywords | final | 100/100 | ok |
| Description | final | 1959/4000 | ok |
| What's New (template) | final | 263/4000 | ok |

## App name

**Final:** `Buzzend: AI Rep Counter` (23/30)

Why (agreed 2026-10-16): 'Buzzend' first (brand, Apple guidance), then the exact phrase `ai rep counter` (Buzzend already #1 US with the live subtitle) which also covers `rep counter`. `squat` moves to the first position of the keyword field so `squat counter` is still fully covered. Coverage check (variant V4 in the keyword notes): with the subtitle and keyword field below it covers all key terms except `group fitness challenge`.

Alternates (same length budget):
- `Buzzend: AI Squat Rep Counter` (29/30)
- `Buzzend: Camera Rep Counter` (27/30)
- `Buzzend: Squat & Rep Counter` (28/30)

## Subtitle

**Final:** `Fitness Challenges w/ Friends` (29/30)

Why: keeps the words that already rank (`fitness challenge`, `group fitness challenge` #15 US / #2 NP, `fitness challenge with friends` #52 US) and adds `friends`, the social wedge. 'w/' keeps it inside 30 characters; 'with' spelled out is 31 and is rejected.

Alternates:
- `Workout Challenges w/ Friends` (29/30)
- `Count Reps. Challenge Friends.` (30/30)
- `Squat & Push Up Challenges` (26/30)

## Promotional text (170, editable any time, not indexed)

**Final (166/170):** Your phone camera counts your squats, push-ups, sit-ups, lunges, jumping jacks, burpees and high knees. Challenge friends, keep your streak and climb the leaderboard.

Alternate (144/170): Prop your phone up and start moving. Buzzend counts your reps out loud, coaches your form and turns every workout into a challenge with friends.

## Keyword field (100 bytes)

**Final (100/100 bytes):**

```
squat,push up,sit up,jumping jack,lunge,burpee,high knees,workout,streak,leaderboard,camera,exercise
```

Inclusion logic, in priority order:
- `push up`, `sit up`, `jumping jack`, `lunge`, `burpee`, `high knees`: the six exercises not already in the name; each completes an exercise-counter phrase with `counter` from the name (`push up counter`, `sit up counter`, `jumping jack counter`, `burpee counter`, `lunge counter`).
- `workout`: completes `workout challenge`, `workout streak`, `ai workout`, `camera workout`, `workout with friends` (with `friends` from the subtitle).
- `streak`, `leaderboard`: streak and leaderboard intents (`fitness streak` #21 NP, `fitness leaderboard` #5 NP already).
- `camera`, `exercise`, `home`, `group`: `camera rep counter`, `exercise counter`, `home workout`, `group fitness challenge`.
- Dropped for space: ['group', 'home', 'pushup', 'coach'] (`pushup` single-word spelling, `coach`). Add them when a future name/subtitle frees bytes.
- Words already in name/subtitle and therefore excluded: ['ai', 'buzzend', 'challenge', 'counter', 'fitnes', 'friend', 'rep', 'w']. Duplicate check: none.
- Excluded on policy: `free`, `app`, competitor names, plurals of included words.

## Description (4000)

(1959/4000 characters)

```
Buzzend uses your phone camera to count your workout reps and coach you while you exercise. Prop your phone up, pick an exercise and start moving: the count goes up by itself, out loud, with no wearable and no tapping.

COUNTS SEVEN BODYWEIGHT EXERCISES
• Squats
• Push-ups
• Sit-ups
• Lunges
• Jumping jacks
• Burpees
• High knees
Every exercise has a short how-to video, and the coach tells you when a rep did not count and what to change.

HOW IT WORKS
1. Prop your phone up two or three steps away.
2. Pick an exercise and tap start.
3. Move. Buzzend counts each rep and speaks the number.
Counting happens on your phone. Your workout video is never uploaded unless you choose to post it.

FITNESS CHALLENGES WITH FRIENDS
• Create a challenge in seconds or join one with a code or an invite link
• Pick the exercise, the length (7, 14, 30 or 60 days, or your own) and optional prizes
• Reps are counted by the camera, not typed in, so the leaderboard reflects real sets
• Live leaderboards and member statistics show who is putting in the work

BEAT-IT
Post your best set and friends get one shot to top it. Beat-It attempts rank by score, then by time.

STREAKS AND DAILY GOALS
• Keep your streak alive with one qualifying workout a day: 10 reps of most exercises, 20 jumping jacks or 3,000 steps
• Missed a day? Restore your streak with a workout or by inviting friends
• Daily step goal tracked from your phone's step data

SHARE AND STAY CONNECTED
• Post your set with the rep count burned into the clip
• A community feed, follows, likes and chat with your training group
• Reminders when a challenge is about to start

A NOTE ON ACCURACY
Counting works best with your whole body in frame and decent lighting. Side-on for squats, lunges and sit-ups; facing the camera for push-ups, jumping jacks, burpees and high knees. The coach tells you when it cannot see you.

Buzzend is free to download. Works on iPhone and iPad.

Questions? hello@buzzend.com
```

Changes versus the live description: removes "Every rep is verified" (no server verification exists) and "stories" (not shipped); adds the seven exercises, the how-it-works steps, Beat-It, streak thresholds and the truthful privacy line (counting on-device; video uploaded only when posted). No prices, no superlatives, no accuracy percentages.


## What's New template (4000)

```
• [Headline change users will notice, in plain words]
• [New exercise or challenge feature, if any]
• [Counting or coaching improvement: say what changed for the user]
• Fixes and performance improvements
Keep your streak going — open Buzzend and log today's set.
```

## Categories, URLs, availability

- Primary: Health & Fitness. Secondary: Social Networking (keep; both are indexed).
- Support URL: `https://buzzend.com/contact-us` once the site deploy returns 200 (until then `https://buzzend.com/`). Marketing URL: `https://buzzend.com/`. Privacy policy URL: `https://buzzend.com/privacy` after the deploy (the current `#/privacy` link relies on client-side JavaScript).
- Storefronts: all English-speaking storefronts share this single English (US) localization per decision Q2. No additional localizations in the first 90 days.

## Screenshot storyboard (iPhone 6.9" 1320×2868 or 1290×2796; also upload the 6.5" set 1284×2778; iPad 13" 2064×2752)

Rule: real app screens only (`assets/screens-clean/` or fresh captures with demo accounts), one short headline per shot, headline ≤ 20 % of the image, no price or ranking words.

| # | User problem | Headline | Supporting line | Screen to capture | Audience | Conversion hypothesis |
|---|---|---|---|---|---|---|
| 1 | "I lose count / I hate counting" | Your camera counts your reps | Squats, push-ups, sit-ups and more, out loud | AI counter mid-set with a visible count | all | proof-first opening lifts page-view→download (the Sept 15 variant B shot was built for this and never tested) |
| 2 | "Which exercises?" | Seven exercises, one app | Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees | exercise picker | counter searchers | exercise words match the search that brought them |
| 3 | "Working out alone is boring" | Challenge your friends | Create or join with a code in seconds | challenge detail with members | social searchers | shows the differentiator vs single-exercise counters |
| 4 | "Who's winning?" | Live leaderboard | Reps counted by the camera, not typed in | leaderboard | social | trust: counted, not self-reported |
| 5 | "I quit after a week" | Keep your streak | One quick set a day; restore it if you slip | streak screen | habit seekers | retention promise |
| 6 | "Am I doing it right?" | Coaching while you move | Hear why a rep didn't count | form-cue overlay | beginners | reassures first-time users about accuracy |
| 7 | "Beat my best" | Beat-It | Post a set; friends get one shot to top it | Beat-It post/attempt | competitive | second social loop |
| 8 | "Rest days?" | Steps count too | Daily step goal from your phone | home daily goal | everyday users | shows daily value beyond workouts |
| 9 | "Show it off" | Share with the count burned in | Post your set to the feed | post composer with count badge | social | sharing loop |
| 10 | "Invite friends" | Join with a code or link | Private challenges with approval | join-with-code screen | groups | explains private groups |

## App preview (optional, up to 3 per size, 15–30 s, 886×1920 portrait)

Concept (25 s, captured app footage only, captions allowed): 0–3 s phone propped up and exercise picked · 3–12 s squats being counted with the spoken number audible · 12–18 s friend challenge leaderboard updating · 18–23 s streak screen · 23–25 s end card "Buzzend". Poster frame at ~6 s (a count on screen).


## Custom product pages (up to 70) — start with three

| CPP | Keywords to assign | Screenshot order | Promotional text |
|---|---|---|---|
| Squat counter | squat counter, squat tracker, squat challenge | 1, 2, 6, 3, 5 | leads with squats |
| Push-up counter | push up counter, pushup counter, push up challenge | 1 (push-up set), 2, 6, 3, 5 | leads with push-ups |
| Challenges with friends | fitness challenge with friends, workout with friends, group fitness challenge | 3, 4, 10, 1, 5 | leads with friends |

## Product page optimization

At roughly 340 impressions per period, a PPO test cannot reach Apple's recommended 90 % confidence in a useful time; the May test sat at 15–29 impressions per treatment. Sequence: ship the metadata + CPPs first, then run one PPO (current order vs counter-first order) once weekly impressions exceed ~500. Metadata changes need a release; promotional text and CPP copy do not.


## Ratings and reviews

The in-app prompt fires after three completed workouts (StoreKit on iOS). Keep it; add a reply to every review within a week; never incentivise ratings (Apple 5.6.4 / strategy rule).

