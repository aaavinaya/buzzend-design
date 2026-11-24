# Prompt: Full Body: Feed card, My Activities and Share (iOS + Android)

> Paste this into the iOS session and the Android session. Each session works out its own file changes in its own codebase.

---

You're updating how **Full Body workouts** (multi-exercise routines) appear **outside the workout itself**: the community feed, Home's My Activities card, the routine detail sheet, and the "Share your day" image. Match the design prototype exactly.

**Design reference (source of truth):** `Buzzend Design/docs/screens/home/full-body-cards.html`. The logic is in `docs/js/screens/full-body-cards.js` and the styles in `docs/css/screens/full-body-cards.css`. Open it in a browser. Every state is shown, and two hash links open the sheets directly:
- `#detail=tb1` (also `tb2`, `cb1`) opens the routine detail sheet.
- `#share=mixed` (also `steps`, `single1`, `singles`, `all7`, `routine`, `cardio`, `two`, `same`) opens the share sheet.

Look at the code first and find what's already there. An earlier version of these cards may already exist (e.g. a routine card with a score ring and a "Try …" button). **Replace it with the design below; don't keep both.**

## 0. Names and colours

**Routines.** They're defined in the shared `full_body_routines.json`, so use the names from config:

| id | Name | Exercises |
|---|---|---|
| `basics` | Full Body Basics | Push-ups, Squats, Jumping Jacks |
| `cardio-blast` | Full Body Burn | Jumping Jacks, High Knees |
| `lower-power` | Full Body Strength | Squats, Burpees |
| `total-body` | Full Body Max | Squats, Push-ups, Burpees, Jumping Jacks, High Knees |

**Routine icons.** Each routine type has its own line icon. **Never use the target icon** for a routine; target belongs to Elimination challenges.

| Routine | Icon | SVG |
|---|---|---|
| Full Body Basics | stacked foundation blocks | `docs/assets/routine-icons/fb-basics.svg` |
| Full Body Burn | heart with a pulse line | `docs/assets/routine-icons/fb-burn.svg` |
| Full Body Strength | kettlebell | `docs/assets/routine-icons/fb-strength.svg` |
| Full Body Max | mountain peak with a flag | `docs/assets/routine-icons/fb-max.svg` |

They're 24×24 with a 2px stroke, round caps and joins, and `currentColor`, the same family as the app's other line icons. Tint them like the other line icons. Add them as vector assets on both platforms, and map them from the routine id (`basics` → fb-basics, `cardio-blast` → fb-burn, `lower-power` → fb-strength, `total-body` → fb-max). Ideally add an `icon` field to `full_body_routines.json` as well.

**Exercise colours:**

| Exercise | Colour |
|---|---|
| Steps | `#34D094` |
| Push-ups | `#F5A623` |
| Squats | `#C56DE2` |
| Sit-ups | `#6466E3` |
| Jumping Jacks | `#166E7A` |
| Lunges | `#E74F5E` |
| Burpees | `#2F80ED` |
| High Knees | `#A1663A` |

These are fixed and don't change with the theme palette.

## 1. Community feed: one card per user per day

**Rule:** a user has **one** activity card per day. It holds that day's single AI workouts **and** Full Body workouts, in **one design**: today's AI-workout card. Single-workout-only days must look exactly as they do today.

**Layout, top to bottom:**
1. **Header:** avatar · name · time ago, a subtitle, and **TOTAL REPS** on the right (all reps that day, single + Full Body).
   - Subtitle for 1 exercise: "Completed Squats".
   - Otherwise: "Completed a N-exercise session", counting every row on the card. Use "an" for 8, 11 and 18.
2. **Full Body groups**, one per Full Body workout that day:
   - **Group heading row** (a real title, not a small caption):
     - the routine's own icon (see §0) in a small tinted rounded tile;
     - the routine name in bold, normal case, primary text colour, the same weight as the card's exercise names (e.g. "Full Body Max");
     - on the right, a small neutral pill "94 · Intermediate" (score · level).
   - The "AI workouts" label stays a small subtle caption, so the Full Body heading is the focus.
   - **Exercise rows:** the normal exercise row (coloured icon tile + name), followed by a **progress bar** in the exercise colour, then **done/target** (e.g. "18/18"), then a **✓** when done ≥ target. A missed target has no ✓ and no red.
3. **AI workouts:** the normal rows (icon tile · name · "N reps"), unchanged.
   - When the day also has a Full Body workout, these rows get their own label: "📷 AI WORKOUTS".
   - On an AI-only day there's no label, exactly as today.
4. **Action bar:** **Love only.** That's the heart with its count, plus the round "who loved" button on the right. **No view count and no Share** on activity cards.

**Order and folding:**
- Full Body groups come first, ordered by the time each workout was done, **newest first**. AI workouts come after.
- **One Full Body workout:** always expanded, no chevron.
- **Two or more** (different routines, or the same routine twice):
  - each group's label row becomes **tappable**, with a chevron;
  - the **newest starts expanded** and older ones start **collapsed** (label row only);
  - tapping a label toggles that group, and the chevron flips.
- **Every exercise is always listed.** No "+N more".

**Remove** from any earlier version:
- the score ring as the card hero, and stars;
- the REPS / TIME / AT TARGET stat boxes;
- level and "AI-counted" chips;
- the "Try <routine>" button;
- the **New** pill;
- the coloured segment strip and the "Breakdown" button;
- the "7:40 AM · 4:12 · 5/5 at target" row;
- the "active · kcal · workouts" meta row under the header;
- every "+N more" collapse.

**Data rules:**
- **No double counting.** A Full Body workout's reps appear only in its group. AI-workout rows show only reps done outside Full Body workouts. TOTAL REPS is both.
- **Ended-early Full Body workouts** get no group (they stay in the user's own log). Their reps still count in TOTAL REPS.
- **Updates.** The card updates during the day and moves back to the top of the feed when a new workout lands. Loves stay with the card.
- **Data source.** Read it from the activity summary's `routines[]` and `singles[]` (see the backend prompt `full-body-backend-prompt.md`).
  - Each `routines[]` entry: name, level, score, local start time, exercises with done/target.
  - When `routines[]` is missing or empty, render exactly today's card.

**Video posts recorded during a Full Body workout** keep their design:
- the header reads "recorded Full Body Max";
- a score badge on the media ("◎ 91 Full Body Max · Expert");
- a strip in the exercise colours plus rep chips under the media;
- the **full** action bar (Love · views · Share).

## 2. Home · My Activities card

This matches the shipping card, with routine runs added:
- **Header:** "My Activities" and a **Share icon only**. No "+" in the header.
  - The Share icon is visible when the day has **steps > 0 or any workout**.
  - It's hidden on a completely empty day.
- **Tile rail, left to right:**
  1. the steps-goal tile (ring, step count, "of 8,000" with the edit pencil);
  2. **one tile per Full Body run**, newest first: a mini routine ring with the score in the centre, "110 reps", the routine name, and the local time (e.g. "7:40 AM"). The time is what tells two runs of the same routine apart;
  3. the single AI-workout tiles, unchanged;
  4. the dashed **"+ Start workout"** tile.
- **Below:** a divider, then **Calories · Distance · Active** cards.
- **The routine ring:** one arc per exercise in the exercise colour, each filled to done/target, with small gaps between arcs.
- **Tapping a Full Body tile** opens the **detail sheet** (§3).

## 3. Routine detail sheet

Open it from a My Activities Full Body tile, using the standard bottom sheet:
- **Header row:** routine ring with the score · name + "AI" pill · level · time and duration · total reps and kcal on the right.
- **Exercise rows:** a colour dot · name · done/target · ✓ when met.
- **Footer:** a status pill on the left, stars on the right.
  - "✓ All targets hit" (green), or "N of M at target" (neutral). Never red.

## 4. My Activities → "Share your day" image

Use the existing share sheet: title "Share your day", the **4:5 image (1080×1350)**, then **Post · Save · Share**, same buttons and behaviour as today.

**The image:**
- Always dark: a deep purple radial gradient.
- Header: the Buzzend mark + date, then a kicker line.
- A body block **vertically centred** between the header and the footer, so leftover space is split evenly.
- A footer with 3 stats, then the line "📷 Reps counted by AI camera" whenever there are reps.
- **No streak** on the image.
- Size everything relative to the image width, so the preview and the export match.

**Layout by day:**

| Day | Image |
|---|---|
| Nothing (0 steps, no workouts) | No Share icon at all |
| Steps only | Green steps-goal ring (% inside) + step count; a goal bar with "N steps to your 8,000 goal" (or "Daily goal reached"); footer: distance · active · kcal; no AI line |
| AI workouts only | Day ring (one arc per exercise, **sized by reps**, workout count in the centre) + "N reps today"; one bar per exercise; footer: steps · active · kcal |
| Exactly one Full Body workout | Kicker "FULL BODY MAX · INTERMEDIATE"; centred score ring with the score + band word ("Outstanding"), stars; one bar per exercise with done/target; footer: reps · time · kcal |
| Full Body + AI workouts, or 2+ Full Body | Day ring + "N reps today"; one panel per Full Body run (mini ring with score · name · level · time · reps); then the AI-workout bars; footer: steps · active · kcal |

**Everything the user did is on the image. Never "+N more".** Instead, pick a density so the content fits inside the 4:5 frame:
- **Roomy** (little data: total load ≤ 3, or a Full Body-only day with ≤ 3 exercises, or steps only): everything one size up, so the card is full rather than empty.
- **Normal** (load 4).
- **Dense** (load ≥ 5, or a Full Body-only day with 4–5 exercises):
  - smaller hero ring;
  - compact routine panels;
  - single AI workouts as a **two-column grid of tiles** (colour dot · name · reps).

Load = (Full Body runs × 2) + (number of single AI workouts).

Hero numbers of 4+ digits step down a size, so they never hit the edge.

## 5. Acceptance checks

1. **AI-only day:** the feed card is pixel-identical to today's card.
2. **Full Body-only day:** the same card, with one labelled Full Body group of progress rows; no chevron.
3. **Mixed day:** a Full Body group, then an "AI WORKOUTS" group; TOTAL REPS = both; no double counting.
4. **Two Full Body runs** (different, or same routine twice): newest first; newest expanded, older collapsed; tapping a label toggles it.
5. **Feed activity cards** show Love only: no views, no Share.
6. **None of the removed items** in §1 appear anywhere on the feed card.
7. **My Activities:**
   - one tile per Full Body run, with time, newest first;
   - tapping a tile opens the detail sheet;
   - Share is hidden only on an empty day.
8. **Share image:** no state ever shows "+N more" or overflows the 4:5 frame (test: 2 Full Body runs + 4 AI workouts, and all 7 exercises).
9. **Light and dark theme:** the cards follow the theme; the share image is always dark.
10. **Old backend** (no `routines[]`): everything falls back to today's behaviour without errors.

If anything in the design is unclear or seems to contradict your codebase, **ask before assuming**.
