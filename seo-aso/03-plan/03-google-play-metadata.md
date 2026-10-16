# Google Play metadata package (prepared 2026-10-15, not published)

Decisions applied: same counter-first title as iOS (Q1), one English listing (Q2), seven exercises (Q3). Limits and policy wording verified against Play Console Help on 2026-10-15. Counts are programmatic.

## Field summary

| Field | Kind | Count / limit | Policy check |
|---|---|---|---|
| App name | final | 23/30 | ok |
| App name | alternate | 29/30 | ok |
| App name | alternate | 27/30 | ok |
| App name | alternate | 28/30 | ok |
| Short description | final | 79/80 | ok |
| Short description | alternate | 79/80 | ok |
| Short description | alternate | 75/80 | ok |
| Short description | alternate | 74/80 | ok |
| Full description | final | 2102/4000 | ok |
| Feature graphic headline | final | 29/60 | ok |
| Feature graphic subline | final | 75/120 | ok |

## App name

**Final:** `Buzzend: AI Rep Counter` (23/30). Alternates: `Buzzend: AI Squat Rep Counter` (29), `Buzzend: Camera Rep Counter` (27), `Buzzend: Squat & Rep Counter` (28).

Why: Play weights the title most. The September data point — Nepal rank #36 for `rep counter` while the title was "Buzzend: AI Rep Counter", gone after the Oct 11 change — plus today's Play results (the `ai rep counter` and `squat counter` result sets are small apps with 100+ to 1K+ installs) make the exact phrases `ai rep counter` and `squat counter` the best title bet. `fitness challenge` on Play is held by Leap's 30 Day Fitness Challenge (550K reviews) and belongs in the short and full description instead.


## Short description (80)

- **Final** (79/80): Your camera counts squats, push ups & sit ups. Fitness challenges with friends.
- Alternate (79/80): Camera counts your squats, push ups & sit ups. Challenge friends, keep streaks.
- Alternate (75/80): Count squats, push ups & sit ups with your camera. Challenges with friends.
- Alternate (74/80): Your camera counts every rep. Fitness challenges with friends and streaks.

Why: names the exercises and the camera (the words people search), keeps the social hook, and drops "Free workout app!" (price/promo wording and an exclamation mark that Play's short-description guidance discourages).


## Full description (4000)

(2102/4000 characters)

```
Buzzend uses your phone camera to count your workout reps and coach you while you exercise. Prop your phone up, pick an exercise and start moving: the count goes up by itself, out loud, with no wearable and no tapping.

AN AI REP COUNTER FOR SEVEN EXERCISES
• Squat counter
• Push up counter
• Sit up counter
• Lunge counter
• Jumping jack counter
• Burpee counter
• High knees counter
Every exercise has a short how-to video. When a rep does not count, the coach says why and what to change.

HOW IT WORKS
1. Prop your phone up two or three steps away.
2. Pick an exercise and tap start.
3. Move. Buzzend counts each rep and speaks the number.
Counting happens on your phone. Your workout video is never uploaded unless you choose to post it.

FITNESS CHALLENGES WITH FRIENDS
• Create a challenge in seconds or join one with a code or an invite link
• Choose the exercise, the length (7, 14, 30 or 60 days, or your own) and optional prizes
• Reps are counted by the camera, not typed in, so the leaderboard reflects real sets
• Live leaderboards and member statistics show who is putting in the work

BEAT-IT
Post your best set and friends get one shot to top it. Attempts rank by score, then by time.

BUILD A WORKOUT STREAK
• One qualifying workout a day keeps your streak alive: 10 reps of most exercises, 20 jumping jacks or 3,000 steps
• Missed a day? Restore your streak with a workout or by inviting friends
• Daily step goal tracked from your phone's step sensor

SHARE AND STAY CONNECTED
• Post your set with the rep count burned into the clip
• Community feed, follows, likes and chat with your training group
• Reminders when a challenge is about to start

HOME WORKOUT, NO EQUIPMENT
All you need is your phone and a little space. Works at home, in the park or at the gym.

A NOTE ON ACCURACY
Counting works best with your whole body in frame and decent lighting. Side-on for squats, lunges and sit-ups; facing the camera for push-ups, jumping jacks, burpees and high knees. The coach tells you when it cannot see you.

Buzzend is free to download.

Questions or feedback? hello@buzzend.com
```

Changes versus live: fixes "High knes", adds burpees, removes "Every rep is verified" and "stories", lists each exercise as an "X counter" line (Play indexes the full description), adds how-it-works, Beat-It, streak thresholds, home-workout section and the truthful privacy line. Unattributed testimonials and superlatives stay out (Play metadata policy).


## Graphics

- Feature graphic 1024×500 (JPEG/24-bit PNG): headline "Your camera counts your reps." + subline "Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees"; central focal point (phone with the counter UI), no device frame clutter, no Play badges, alt text "Phone propped up counting squats with the Buzzend rep counter on screen". It also serves as the video cover.
- Phone screenshots (2–8, 1080×1920): use storyboard shots 1–8 from the Apple package in that order. Tablet 7"/10" slots: shots 1–4 at 1080×1920 / 1440×2560 (≥4 needed for large-screen placements).
- Icon 512×512 32-bit PNG: unchanged unless an icon experiment is run.
- Video: replace the hashtag-titled Short with a 20–30 s captured-UI video (counting visible in the first 10 s, since only 30 s autoplay); unlisted is fine; monetisation off.

## Store listing experiments (one default-graphics experiment at a time, up to 2 variants)

| # | Hypothesis | A (current) | B | Primary metric | Secondary | Minimum period | Decision rule | Confounders |
|---|---|---|---|---|---|---|---|---|
| E1 | A proof-first first screenshot lifts installs among listing visitors | current order | shot 1 = counter mid-set, shot 2 = seven exercises | first-time installers (Play's estimate of required time) | retained installers 7d | until Play reports a result; at ~2 acquisitions/day expect 6–10 weeks | adopt B only if Play shows B ≥ A with its stated confidence | title change shipped at the same time; seasonal campaigns |
| E2 | A feature graphic that names the exercises beats the generic one | current | new graphic above | first-time installers | — | same | same | video cover changes with it |
Experiments change conversion, not search ranking; keep metadata changes and experiments in separate weeks so effects can be told apart.


## Custom store listings (later, optional)

Per decision Q2 no country-specific listing in the first 90 days. When ready: a keyword-targeted listing for `fitness challenge with friends` (social-first screenshots) and a Nepal listing (same English text, Nepal-relevant screenshots). URL format `…&listing=<id>`.


## Other Console fields

- Contact email `hello@buzzend.com`; website `https://buzzend.com`; privacy policy URL → `https://buzzend.com/privacy` after the site deploy.
- Data safety: update per `05-privacy-disclosures.md` before or with the listing change.
- Category: Health & Fitness. Tags: pick from Console's list (fitness, workout, exercise) — tags do not accept free text.
