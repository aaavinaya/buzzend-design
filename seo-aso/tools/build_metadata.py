#!/usr/bin/env python3
"""Single source of truth for store metadata → markdown packages + CSV workbook, with programmatic counts and policy checks."""
import csv, re, sys, json
D=sys.argv[1]; DATE="2026-10-15"
# ---------------- APPLE ----------------
APPLE_NAME="Buzzend: AI Rep Counter"
APPLE_NAME_ALT=["Buzzend: AI Squat Rep Counter","Buzzend: Camera Rep Counter","Buzzend: Squat & Rep Counter"]
APPLE_SUB="Fitness Challenges w/ Friends"
APPLE_SUB_ALT=["Workout Challenges w/ Friends","Count Reps. Challenge Friends.","Squat & Push Up Challenges"]
APPLE_PROMO="Your phone camera counts your squats, push-ups, sit-ups, lunges, jumping jacks, burpees and high knees. Challenge friends, keep your streak and climb the leaderboard."
APPLE_PROMO_ALT=["Prop your phone up and start moving. Buzzend counts your reps out loud, coaches your form and turns every workout into a challenge with friends."]
KW_CANDIDATES=["squat","push up","sit up","jumping jack","lunge","burpee","high knees","workout","streak","leaderboard","camera","exercise","group","home","pushup","coach"]
APPLE_DESC="""Buzzend uses your phone camera to count your workout reps and coach you while you exercise. Prop your phone up, pick an exercise and start moving: the count goes up by itself, out loud, with no wearable and no tapping.

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

Questions? hello@buzzend.com"""
WHATS_NEW_TEMPLATE="""• [Headline change users will notice, in plain words]
• [New exercise or challenge feature, if any]
• [Counting or coaching improvement: say what changed for the user]
• Fixes and performance improvements
Keep your streak going — open Buzzend and log today's set."""
# ---------------- PLAY ----------------
PLAY_TITLE=APPLE_NAME
PLAY_TITLE_ALT=APPLE_NAME_ALT
PLAY_SHORT_CANDIDATES=[
 "Your camera counts squats, push ups & sit ups. Fitness challenges with friends.",
 "Camera counts your squats, push ups & sit ups. Challenge friends, keep streaks.",
 "Count squats, push ups & sit ups with your camera. Challenges with friends.",
 "Your camera counts every rep. Fitness challenges with friends and streaks.",
]
PLAY_FULL="""Buzzend uses your phone camera to count your workout reps and coach you while you exercise. Prop your phone up, pick an exercise and start moving: the count goes up by itself, out loud, with no wearable and no tapping.

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

Questions or feedback? hello@buzzend.com"""
FEATURE_GRAPHIC={"headline":"Your camera counts your reps.","sub":"Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees","alt":"Phone propped up counting squats with the Buzzend rep counter on screen"}
# ---------------- helpers ----------------
STOP={"w/","with","and","&","the","a","for","to","your"}
def words(t): return {w.lower().strip(".,:!") for w in re.split(r"[\s/&:.!]+",t) if w and w.lower() not in STOP}
def norm(w): return w[:-1] if w.endswith("s") and len(w)>3 else w
BANNED_ALL=["the best","best app","best fitness","#1","top rated","top app","number one","guaranteed","perfect form","medical","world's first","most accurate","revolutionary","verified","stories","scientifically"]
def check_text(label, t, limit, allow_free=False, cta_check=False):
    issues=[]
    n=len(t)
    if n>limit: issues.append(f"OVER LIMIT {n}/{limit}")
    low=t.lower()
    for b in BANNED_ALL:
        if b in low: issues.append(f"banned word: {b.strip()}")
    if not allow_free and re.search(r"\bfree\b",low): issues.append("contains 'free' (price/promo wording)")
    if cta_check and re.search(r"(download|install|try|play) now",low): issues.append("call to action")
    if re.search(r"[\U0001F300-\U0001FAFF☀-➿★☆]",t): issues.append("emoji/symbol")
    caps=[w for w in re.findall(r"\b[A-Z]{3,}\b",t) if w not in ("AI","USA")]
    if caps and limit<=80: issues.append(f"ALL CAPS words: {caps}")
    if limit<=80 and t.count("!")>0: issues.append("exclamation mark")
    return n, issues
# keyword field: fill to ≤100 bytes, no duplicates with name/subtitle
name_sub_words={norm(w) for w in words(APPLE_NAME)|words(APPLE_SUB)}
kw=[]; 
for c in KW_CANDIDATES:
    if any(norm(w) in name_sub_words for w in c.split()): continue
    trial=",".join(kw+[c])
    if len(trial.encode())<=100: kw.append(c)
KW_FIELD=",".join(kw); KW_BYTES=len(KW_FIELD.encode())
dupes=sorted({norm(w) for c in kw for w in c.split()} & name_sub_words)
# ---------------- validation table ----------------
rows=[]
def add(platform, field, limit, content, kind="final", keyword="", notes="", allow_free=False, cta=False):
    n,iss=check_text(field,content,limit,allow_free,cta)
    rows.append({"platform":platform,"field":field,"kind":kind,"limit":limit,"count":n,"content":content,"target_keywords":keyword,"policy_check":"; ".join(iss) if iss else "ok","notes":notes})
add("Apple","App name",30,APPLE_NAME,keyword="ai rep counter, squat counter, rep counter, ai squat rep counter",notes="counter-first per decision Q1; brand first per Apple guidance")
for a in APPLE_NAME_ALT: add("Apple","App name",30,a,kind="alternate",keyword="ai rep counter / camera rep counter / squat counter")
add("Apple","Subtitle",30,APPLE_SUB,keyword="fitness challenge with friends, fitness challenge, challenge friends, group fitness challenge (with 'group' in keywords)")
for a in APPLE_SUB_ALT: add("Apple","Subtitle",30,a,kind="alternate")
add("Apple","Promotional text",170,APPLE_PROMO,keyword="(not indexed) conversion copy: 7 exercises + social",notes="editable any time without a release; does not affect search")
for a in APPLE_PROMO_ALT: add("Apple","Promotional text",170,a,kind="alternate")
add("Apple","Keywords",100,KW_FIELD,keyword="push up counter, sit up counter, jumping jack counter, lunge counter, burpee counter, high knees, workout streak, fitness leaderboard, camera workout, exercise counter, home workout, group fitness challenge",notes=f"{KW_BYTES} bytes; no word repeats name/subtitle; no plurals; no 'app'/'free'")
add("Apple","Description",4000,APPLE_DESC,allow_free=True,keyword="first sentence = positioning; exercise names; challenges with friends; streak; beat-it",notes="no 'verified', no 'stories'; accuracy note; truthful privacy line")
add("Apple","What's New (template)",4000,WHATS_NEW_TEMPLATE,allow_free=True)
add("Play","App name",30,PLAY_TITLE,keyword="ai rep counter, squat counter, rep counter",notes="identical to iOS for brand consistency")
for a in PLAY_TITLE_ALT: add("Play","App name",30,a,kind="alternate")
for i,c in enumerate(PLAY_SHORT_CANDIDATES): add("Play","Short description",80,c,kind=("final" if i==0 else "alternate"),cta=True,keyword="camera counts reps, squats, push ups, sit ups, challenge friends",notes="no price/promo words, no CTA, no caps, no exclamation")
add("Play","Full description",4000,PLAY_FULL,allow_free=True,keyword="squat counter, push up counter, sit up counter, lunge counter, jumping jack counter, burpee counter, high knees, workout challenges with friends, workout streak, home workout no equipment",notes="exercise list as 'X counter' lines; no 'verified'/'stories'")
add("Play","Feature graphic headline",60,FEATURE_GRAPHIC["headline"],keyword="(graphic) camera counts reps")
add("Play","Feature graphic subline",120,FEATURE_GRAPHIC["sub"])
# ---------------- CSV workbook ----------------
with open(f"{D}/data/metadata-workbook.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=["platform","field","kind","limit","count","content","target_keywords","policy_check","notes"]); w.writeheader()
    for r in rows: w.writerow(r)
# ---------------- markdown: Apple ----------------
def row_md(r): return f"| {r['field']} | {r['kind']} | {r['count']}/{r['limit']} | {r['policy_check']} |"
A=[f"# Apple App Store metadata package (prepared {DATE}, not submitted)\n",
"Decisions applied: counter-first name (Q1), all English storefronts share one listing (Q2), seven exercises (Q3), truthful privacy line only (Q4). Limits verified against Apple's documentation on 2026-10-15 (see `../01-discovery/03-platform-rules-verified-2026-10-15.md`). Counts below are computed programmatically from this file's source of truth; re-run `build_metadata.py` after any edit.\n",
"## Field summary\n","| Field | Kind | Count / limit | Policy check |","|---|---|---|---|"]
A+= [row_md(r) for r in rows if r["platform"]=="Apple"]
A+=["\n## App name\n",f"**Final:** `{APPLE_NAME}` ({len(APPLE_NAME)}/30)\n",
"Why (agreed 2026-10-16): 'Buzzend' first (brand, Apple guidance), then the exact phrase `ai rep counter` (Buzzend already #1 US with the live subtitle) which also covers `rep counter`. `squat` moves to the first position of the keyword field so `squat counter` is still fully covered. Coverage check (variant V4 in the keyword notes): with the subtitle and keyword field below it covers all key terms except `group fitness challenge`.\n",
"Alternates (same length budget):", *[f"- `{a}` ({len(a)}/30)" for a in APPLE_NAME_ALT],
"\n## Subtitle\n",f"**Final:** `{APPLE_SUB}` ({len(APPLE_SUB)}/30)\n",
"Why: keeps the words that already rank (`fitness challenge`, `group fitness challenge` #15 US / #2 NP, `fitness challenge with friends` #52 US) and adds `friends`, the social wedge. 'w/' keeps it inside 30 characters; 'with' spelled out is 31 and is rejected.\n",
"Alternates:", *[f"- `{a}` ({len(a)}/30)" for a in APPLE_SUB_ALT],
"\n## Promotional text (170, editable any time, not indexed)\n",f"**Final ({len(APPLE_PROMO)}/170):** {APPLE_PROMO}\n", *[f"Alternate ({len(a)}/170): {a}" for a in APPLE_PROMO_ALT],
"\n## Keyword field (100 bytes)\n",f"**Final ({KW_BYTES}/100 bytes):**\n\n```\n{KW_FIELD}\n```\n",
"Inclusion logic, in priority order:", 
"- `push up`, `sit up`, `jumping jack`, `lunge`, `burpee`, `high knees`: the six exercises not already in the name; each completes an exercise-counter phrase with `counter` from the name (`push up counter`, `sit up counter`, `jumping jack counter`, `burpee counter`, `lunge counter`).",
"- `workout`: completes `workout challenge`, `workout streak`, `ai workout`, `camera workout`, `workout with friends` (with `friends` from the subtitle).",
"- `streak`, `leaderboard`: streak and leaderboard intents (`fitness streak` #21 NP, `fitness leaderboard` #5 NP already).",
"- `camera`, `exercise`, `home`, `group`: `camera rep counter`, `exercise counter`, `home workout`, `group fitness challenge`.",
f"- Dropped for space: {[c for c in KW_CANDIDATES if c not in kw]} (`pushup` single-word spelling, `coach`). Add them when a future name/subtitle frees bytes.",
f"- Words already in name/subtitle and therefore excluded: {sorted(name_sub_words)}. Duplicate check: {'none' if not dupes else dupes}.",
"- Excluded on policy: `free`, `app`, competitor names, plurals of included words.",
"\n## Description (4000)\n",f"({len(APPLE_DESC)}/4000 characters)\n","```\n"+APPLE_DESC+"\n```",
"\nChanges versus the live description: removes \"Every rep is verified\" (no server verification exists) and \"stories\" (not shipped); adds the seven exercises, the how-it-works steps, Beat-It, streak thresholds and the truthful privacy line (counting on-device; video uploaded only when posted). No prices, no superlatives, no accuracy percentages.\n",
"\n## What's New template (4000)\n","```\n"+WHATS_NEW_TEMPLATE+"\n```",
"\n## Categories, URLs, availability\n",
"- Primary: Health & Fitness. Secondary: Social Networking (keep; both are indexed).",
"- Support URL: `https://buzzend.com/contact-us` once the site deploy returns 200 (until then `https://buzzend.com/`). Marketing URL: `https://buzzend.com/`. Privacy policy URL: `https://buzzend.com/privacy` after the deploy (the current `#/privacy` link relies on client-side JavaScript).",
"- Storefronts: all English-speaking storefronts share this single English (US) localization per decision Q2. No additional localizations in the first 90 days.",
"\n## Screenshot storyboard (iPhone 6.9\" 1320×2868 or 1290×2796; also upload the 6.5\" set 1284×2778; iPad 13\" 2064×2752)\n",
"Rule: real app screens only (`assets/screens-clean/` or fresh captures with demo accounts), one short headline per shot, headline ≤ 20 % of the image, no price or ranking words.\n",
"| # | User problem | Headline | Supporting line | Screen to capture | Audience | Conversion hypothesis |","|---|---|---|---|---|---|---|",
"| 1 | \"I lose count / I hate counting\" | Your camera counts your reps | Squats, push-ups, sit-ups and more, out loud | AI counter mid-set with a visible count | all | proof-first opening lifts page-view→download (the Sept 15 variant B shot was built for this and never tested) |",
"| 2 | \"Which exercises?\" | Seven exercises, one app | Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees | exercise picker | counter searchers | exercise words match the search that brought them |",
"| 3 | \"Working out alone is boring\" | Challenge your friends | Create or join with a code in seconds | challenge detail with members | social searchers | shows the differentiator vs single-exercise counters |",
"| 4 | \"Who's winning?\" | Live leaderboard | Reps counted by the camera, not typed in | leaderboard | social | trust: counted, not self-reported |",
"| 5 | \"I quit after a week\" | Keep your streak | One quick set a day; restore it if you slip | streak screen | habit seekers | retention promise |",
"| 6 | \"Am I doing it right?\" | Coaching while you move | Hear why a rep didn't count | form-cue overlay | beginners | reassures first-time users about accuracy |",
"| 7 | \"Beat my best\" | Beat-It | Post a set; friends get one shot to top it | Beat-It post/attempt | competitive | second social loop |",
"| 8 | \"Rest days?\" | Steps count too | Daily step goal from your phone | home daily goal | everyday users | shows daily value beyond workouts |",
"| 9 | \"Show it off\" | Share with the count burned in | Post your set to the feed | post composer with count badge | social | sharing loop |",
"| 10 | \"Invite friends\" | Join with a code or link | Private challenges with approval | join-with-code screen | groups | explains private groups |",
"\n## App preview (optional, up to 3 per size, 15–30 s, 886×1920 portrait)\n",
"Concept (25 s, captured app footage only, captions allowed): 0–3 s phone propped up and exercise picked · 3–12 s squats being counted with the spoken number audible · 12–18 s friend challenge leaderboard updating · 18–23 s streak screen · 23–25 s end card \"Buzzend\". Poster frame at ~6 s (a count on screen).\n",
"\n## Custom product pages (up to 70) — start with three\n",
"| CPP | Keywords to assign | Screenshot order | Promotional text |","|---|---|---|---|",
"| Squat counter | squat counter, squat tracker, squat challenge | 1, 2, 6, 3, 5 | leads with squats |",
"| Push-up counter | push up counter, pushup counter, push up challenge | 1 (push-up set), 2, 6, 3, 5 | leads with push-ups |",
"| Challenges with friends | fitness challenge with friends, workout with friends, group fitness challenge | 3, 4, 10, 1, 5 | leads with friends |",
"\n## Product page optimization\n",
"At roughly 340 impressions per period, a PPO test cannot reach Apple's recommended 90 % confidence in a useful time; the May test sat at 15–29 impressions per treatment. Sequence: ship the metadata + CPPs first, then run one PPO (current order vs counter-first order) once weekly impressions exceed ~500. Metadata changes need a release; promotional text and CPP copy do not.\n",
"\n## Ratings and reviews\n",
"The in-app prompt fires after three completed workouts (StoreKit on iOS). Keep it; add a reply to every review within a week; never incentivise ratings (Apple 5.6.4 / strategy rule).\n",
]
open(f"{D}/03-plan/02-apple-app-store-metadata.md","w").write("\n".join(A)+"\n")
# ---------------- markdown: Play ----------------
P=[f"# Google Play metadata package (prepared {DATE}, not published)\n",
"Decisions applied: same counter-first title as iOS (Q1), one English listing (Q2), seven exercises (Q3). Limits and policy wording verified against Play Console Help on 2026-10-15. Counts are programmatic.\n",
"## Field summary\n","| Field | Kind | Count / limit | Policy check |","|---|---|---|---|"]
P+= [row_md(r) for r in rows if r["platform"]=="Play"]
P+=["\n## App name\n",f"**Final:** `{PLAY_TITLE}` ({len(PLAY_TITLE)}/30). Alternates: "+", ".join(f"`{a}` ({len(a)})" for a in PLAY_TITLE_ALT)+".\n",
"Why: Play weights the title most. The September data point — Nepal rank #36 for `rep counter` while the title was \"Buzzend: AI Rep Counter\", gone after the Oct 11 change — plus today's Play results (the `ai rep counter` and `squat counter` result sets are small apps with 100+ to 1K+ installs) make the exact phrases `ai rep counter` and `squat counter` the best title bet. `fitness challenge` on Play is held by Leap's 30 Day Fitness Challenge (550K reviews) and belongs in the short and full description instead.\n",
"\n## Short description (80)\n",*[f"- {'**Final**' if i==0 else 'Alternate'} ({len(c)}/80): {c}" for i,c in enumerate(PLAY_SHORT_CANDIDATES)],
"\nWhy: names the exercises and the camera (the words people search), keeps the social hook, and drops \"Free workout app!\" (price/promo wording and an exclamation mark that Play's short-description guidance discourages).\n",
"\n## Full description (4000)\n",f"({len(PLAY_FULL)}/4000 characters)\n","```\n"+PLAY_FULL+"\n```",
"\nChanges versus live: fixes \"High knes\", adds burpees, removes \"Every rep is verified\" and \"stories\", lists each exercise as an \"X counter\" line (Play indexes the full description), adds how-it-works, Beat-It, streak thresholds, home-workout section and the truthful privacy line. Unattributed testimonials and superlatives stay out (Play metadata policy).\n",
"\n## Graphics\n",
f"- Feature graphic 1024×500 (JPEG/24-bit PNG): headline \"{FEATURE_GRAPHIC['headline']}\" + subline \"{FEATURE_GRAPHIC['sub']}\"; central focal point (phone with the counter UI), no device frame clutter, no Play badges, alt text \"{FEATURE_GRAPHIC['alt']}\". It also serves as the video cover.",
"- Phone screenshots (2–8, 1080×1920): use storyboard shots 1–8 from the Apple package in that order. Tablet 7\"/10\" slots: shots 1–4 at 1080×1920 / 1440×2560 (≥4 needed for large-screen placements).",
"- Icon 512×512 32-bit PNG: unchanged unless an icon experiment is run.",
"- Video: replace the hashtag-titled Short with a 20–30 s captured-UI video (counting visible in the first 10 s, since only 30 s autoplay); unlisted is fine; monetisation off.",
"\n## Store listing experiments (one default-graphics experiment at a time, up to 2 variants)\n",
"| # | Hypothesis | A (current) | B | Primary metric | Secondary | Minimum period | Decision rule | Confounders |","|---|---|---|---|---|---|---|---|---|",
"| E1 | A proof-first first screenshot lifts installs among listing visitors | current order | shot 1 = counter mid-set, shot 2 = seven exercises | first-time installers (Play's estimate of required time) | retained installers 7d | until Play reports a result; at ~2 acquisitions/day expect 6–10 weeks | adopt B only if Play shows B ≥ A with its stated confidence | title change shipped at the same time; seasonal campaigns |",
"| E2 | A feature graphic that names the exercises beats the generic one | current | new graphic above | first-time installers | — | same | same | video cover changes with it |",
"Experiments change conversion, not search ranking; keep metadata changes and experiments in separate weeks so effects can be told apart.\n",
"\n## Custom store listings (later, optional)\n",
"Per decision Q2 no country-specific listing in the first 90 days. When ready: a keyword-targeted listing for `fitness challenge with friends` (social-first screenshots) and a Nepal listing (same English text, Nepal-relevant screenshots). URL format `…&listing=<id>`.\n",
"\n## Other Console fields\n",
"- Contact email `hello@buzzend.com`; website `https://buzzend.com`; privacy policy URL → `https://buzzend.com/privacy` after the site deploy.",
"- Data safety: update per `05-privacy-disclosures.md` before or with the listing change.",
"- Category: Health & Fitness. Tags: pick from Console's list (fitness, workout, exercise) — tags do not accept free text.",
]
open(f"{D}/03-plan/03-google-play-metadata.md","w").write("\n".join(P)+"\n")
print(f"{'platform':6} {'field':24} {'kind':9} {'count':>5}/{'lim':<4} check")
for r in rows: print(f"{r['platform']:6} {r['field'][:24]:24} {r['kind']:9} {r['count']:>5}/{r['limit']:<4} {r['policy_check']}")
print("\nkeyword field:", KW_FIELD, KW_BYTES, "bytes; dupes:", dupes)
