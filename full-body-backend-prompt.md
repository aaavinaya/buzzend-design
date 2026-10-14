# Backend prompt: Full Body routines in Workouts, Feed, My Activities and Share

> Paste this into the backend session (or hand it to the backend engineer) working in
> `java-itg-gochall`. It states **what the apps need and why**. Table names, endpoint paths and
> class layout are suggestions: **the backend decides the final shape**, as long as the
> requirements and acceptance criteria below hold. Please reply with the final contract
> (endpoints + JSON) so Android and iOS can integrate.

---

## 0. Context: what's being built

Buzzend is adding **Full Body routines**: guided sessions that run several AI-counted exercises back to back with rest in between. The design prototype lives in the Buzzend Design repo:

| What | Where |
|---|---|
| Routine definitions, scoring formula | `docs/js/screens/full-body-data.js` |
| Workout flow (preview → session → results) | `docs/screens/workout/full-body.html` |
| Feed card, My Activities, detail sheet, Share card | `docs/screens/home/full-body-cards.html` |
| App-side plan | `full-body-workout-implementation-plan.md` |

**Routines (client-defined config):**

| `routineId` | Name | Exercises (in order) |
|---|---|---|
| `total-body` | Total Body | SQUATS → PUSHUPS → BURPEES → JUMPING_JACKS → HIGH_KNEES |
| `lower-power` | Lower Power | SQUATS → BURPEES |
| `cardio-blast` | Cardio Blast | JUMPING_JACKS → HIGH_KNEES |

Each routine has three levels, `beginner`, `intermediate` and `expert`. A level sets the per-exercise rep **target**, the time target per exercise, the rest length and the number of rounds.

**One routine run produces:**
- **Per exercise:** reps `done`, rep `target`, seconds taken, and the target seconds.
- **For the run:**
  - a **score** from 0 to 100, plus stars;
  - a **status**: `COMPLETED` (every target met), `PARTIAL` (finished, some targets missed) or `ENDED` (the user ended early);
  - start time, duration and level.

**Surfaces that need data from the backend:**
1. **Community feed:** **one card per user per day** that shows single AI workouts **and** routine runs together (design states A / B / C, see §3).
2. **Video posts** recorded during a routine, which keep the routine context (name, level, score, per-exercise reps).
3. **Home · My Activities:**
   - one tile per routine run (score ring, reps, name, time) next to the single-workout tiles;
   - tapping a routine tile opens a **detail sheet**: per exercise done/target, duration, level, status, stars.
4. **My Activities → Share your day:** a 4:5 image built on the device from the **same day data**.

---

## 1. What exists today (verified in the code)

- **Saving reps.** `POST v1/workouts` (`WorkoutController` → `WorkoutStatsServiceImpl.saveDailyWorkoutStats`) takes `List<WorkoutStatsRequest{count, workoutDate, workoutType, durationSeconds?}>`.
  - It writes **`workout_stats`**, one row per `(user_id, workout_type, workout_date)` (`uq_user_workout_date`).
  - Rep types **add** to the row, while STEPS keeps the highest value.
  - There is **no idempotency key**, so a retried request is counted twice.
- **What runs after each save, inline:** `ActivityTracker.touch`, then `ensureActivityPosts`, then `syncStreak`.
  - `ensureActivityPosts` creates or bumps the **ACTIVITY post**: `activity_post(user_id, activity_date)` is unique, and `bumpLastActivity` moves the card to the top and keeps its likes and views.
  - `syncStreak` → `evaluateStreakAfterWorkout` credits a day when a type's `count >= streakThreshold`, and publishes `StreakDayCreditedEvent`.
- **The feed.** `GET v2/post-contents/feed` builds `ActivityPostSummaryResponse` **live** from that day's `workout_stats`. It holds `activityDate`, `totalReps`, `totalDurationSeconds` and `exercises[{workoutType, count, durationSeconds}]`, sorted by count desc, with STEPS excluded.
- **Everything else reads `workout_stats`** and must keep working unchanged: challenges (`MemberServiceImpl`), elimination (`EliminationQueryRepository`, `EliminationDayFinalizer`), rankings (`WorkoutRankingRepository`, `v2/workouts/users/...`), stats (`v1/workouts/stat`) and reminders.
- **Missing pieces:**
  - There is **no session, routine, score or level concept** anywhere.
  - Media posts (`PostCreationRequest`) carry no workout context. PostKind is computed as GENERAL or COMPETITION.
  - Calories, distance and active time are **not stored**; the client computes them.
- **How iOS saves a Full Body run today:** it calls `POST v1/workouts` once per exercise type, sends score and level only to analytics, and posts the clip as a plain GENERAL video. So the routine is lost after saving.

---

## 2. Requirements

### R1. Record a routine run as one session (new write path)

The app must be able to save **one routine run in one request**. That request must:

1. **Store the run**:
   - `routineId` and a snapshot of the routine name;
   - `level` and `status`;
   - `startedAt` (UTC), the user's local date, timezone and `durationSeconds`;
   - `score`;
   - the ordered exercises, each with `workoutType`, `done`, `target`, `durationSeconds` and `targetSeconds`.
2. **Add the reps to `workout_stats`** per type, in the **same transaction**, exactly as `POST v1/workouts` does today. Then streaks, challenges, elimination, rankings and stats keep counting routine reps with **no changes**. The app will **stop** making the separate per-type `v1/workouts` calls for routine reps, so they must not be counted twice.
3. **Run the same side effects** as a normal save: `ActivityTracker.touch`, `ensureActivityPosts` (create or bump today's card) and `syncStreak`.
4. **Be idempotent.** The client sends a `clientSessionId` (a UUID). Re-sending the same id returns the stored session and **must not add reps again**. Mobile retries on flaky networks are expected.
5. **Validate**:
   - `routineId` and `level` are on a server-side allowlist, which can be config;
   - every `workoutType` passes `SupportedWorkouts` / `ClientFeature` gating (BURPEES and HIGH_KNEES are already gated);
   - `done` is 0 or more, `target` is more than 0, durations are within `MAX_WORKOUT_SESSION_SECONDS` limits, and score is 0–100.
6. **Score.** The **server recomputes the score** from the exercise data and stores the server value. If the client's value differs, log it and use the server's. The formula is in §5. The backend can decide to trust the client instead, but the formula must be identical on all sides.
7. **ENDED runs are stored too.** Their reps count toward `workout_stats`, so the work counts for streaks and challenges. They are **excluded from the feed card and from My Activities' routine tiles** (see R2 and R4). A run with 0 reps is stored but changes nothing in `workout_stats`.
8. **Session date.** A run belongs to the **local date it started**, even if it crosses midnight.

**Suggested contract (backend decides):**

```http
POST /v1/workouts/routines
```
```json
{
  "clientSessionId": "6f1c…-uuid",
  "routineId": "total-body",
  "routineName": "Total Body",
  "level": "INTERMEDIATE",
  "status": "COMPLETED",
  "startedAt": "2026-10-14T01:55:00Z",
  "workoutDate": "2026-10-14",
  "timezone": "Asia/Kathmandu",
  "durationSeconds": 252,
  "clientScore": 94,
  "exercises": [
    { "workoutType": "SQUATS",        "done": 18, "target": 18, "durationSeconds": 38, "targetSeconds": 40 },
    { "workoutType": "PUSHUPS",       "done": 12, "target": 12, "durationSeconds": 31, "targetSeconds": 34 },
    { "workoutType": "BURPEES",       "done": 10, "target": 10, "durationSeconds": 35, "targetSeconds": 36 },
    { "workoutType": "JUMPING_JACKS", "done": 30, "target": 30, "durationSeconds": 37, "targetSeconds": 40 },
    { "workoutType": "HIGH_KNEES",    "done": 40, "target": 40, "durationSeconds": 39, "targetSeconds": 40 }
  ]
}
```
Response `201` (or `200` on an idempotent replay):
```json
{
  "sessionId": 81234,
  "clientSessionId": "6f1c…-uuid",
  "routineId": "total-body", "routineName": "Total Body", "level": "INTERMEDIATE",
  "status": "COMPLETED", "score": 94, "stars": 5,
  "workoutDate": "2026-10-14", "startedAt": "2026-10-14T01:55:00Z", "localTime": "07:40",
  "durationSeconds": 252, "totalReps": 110, "targetReps": 110,
  "exercises": [ { "workoutType": "SQUATS", "done": 18, "target": 18, "durationSeconds": 38 } ]
}
```

**Suggested storage:** add `routine_session` and `routine_session_exercise` tables, with a hand-written migration in `db-manual-migrations/2026-10-xx__routine_session.sql`. JPA uses `ddl-auto=validate`, so the migration must run before deploy.

### R2. Feed: one card per user per day, covering routines and single workouts

The rule **stays one ACTIVITY card per user per day** (`activity_post`), and it must now represent both kinds of workout. The client picks its layout from the data:

| Day contains | Card layout (client) |
|---|---|
| Only single AI workouts | **A**: today's card (total reps + one row per exercise) |
| Exactly one non-ENDED routine run, nothing else | **B**: routine card (score ring as the hero, stats, exercise bars) |
| A routine + any single workout, or 2+ routines | **C**: day total reps + one panel per routine + single-workout rows |

So `ActivityPostSummaryResponse` must additionally provide:

1. **`routines[]`**: the day's routine runs, **newest first**, **excluding `ENDED`**. Each run has `sessionId`, `routineId`, `routineName`, `level`, `status`, `score`, `stars`, `localTime` (e.g. `"07:40"`), `durationSeconds`, `totalReps`, `targetReps` and `exercises[{workoutType, done, target}]`.
2. **`singles[]`**: the reps done **outside routines**, per type. That is the day total for the type minus the reps from that day's routine runs of that type (including ENDED runs). Each entry has `workoutType`, `count`, `durationSeconds` and `lastAt` (the local time of the latest single session, used for "12:30 PM" and the client-side "New" tag). Types that come out at 0 are left out.
3. **No double counting.** Routine reps appear only inside `routines[]`, and `singles[]` holds only standalone reps. `totalReps` stays the **whole day** (routines and singles together).
4. **Backward compatibility.** **Keep `exercises[]` and `totalReps` exactly as today** (full per-type day totals), so older apps keep rendering their current card. `routines[]` and `singles[]` are **additive**.
   - Check whether the Android kotlinx-serialization and iOS Codable decoders ignore unknown keys.
   - If either doesn't, gate the new fields behind a new `ClientFeature` (e.g. `FULL_BODY_ROUTINES`), the same way `BURPEES_HIGH_KNEES` is gated.
5. **Updates.** A routine save must **bump** the same day card (`bumpLastActivity`), so it moves to the top and keeps its loves.
6. **Edge cases:**
   - A day whose only activity is an ENDED run with reps still gets a card. It shows those reps as singles-style totals with no routine panel, so the work isn't lost.
   - If the reps add up to 0, there is no card.
7. **Engagement.** ACTIVITY cards in the new design show **Love only**, with no view count and no Share button. This needs no backend change: keep returning `likeCount`/`isLiked`, and the client hides views and share for ACTIVITY.
   - *Optional:* stop recording views for ACTIVITY posts.

Example `activitySummary` for state C:
```json
{
  "activityDate": "2026-10-14",
  "totalReps": 175,
  "totalDurationSeconds": 427,
  "exercises": [ { "workoutType": "SQUATS", "count": 58, "durationSeconds": 143 } ],
  "routines": [
    { "sessionId": 81234, "routineId": "total-body", "routineName": "Total Body", "level": "INTERMEDIATE",
      "status": "COMPLETED", "score": 94, "stars": 5, "localTime": "07:40", "durationSeconds": 252,
      "totalReps": 110, "targetReps": 110,
      "exercises": [ { "workoutType": "SQUATS", "done": 18, "target": 18 } ] }
  ],
  "singles": [
    { "workoutType": "PUSHUPS", "count": 25, "durationSeconds": 70,  "lastAt": "18:05" },
    { "workoutType": "SQUATS",  "count": 40, "durationSeconds": 105, "lastAt": "12:30" }
  ]
}
```

> **Telling standalone reps apart.** `workout_stats` is a single per-type total for the day, so it can't say which reps came from routines. You can get the singles by subtracting the routine-session totals from it.
>
> However, `lastAt` per single type, and idempotency for single saves, both need a **per-save session log**. For example, a `workout_session` row per save: `user`, `type`, `count`, `duration`, `startedAt`, `source = SINGLE | ROUTINE` and `routineSessionId?`. That's the cleanest way to do it. The backend decides.

### R3. Video posts recorded during a routine

When the user posts the clip recorded in a routine, the post should keep the routine context. The design shows "recorded **Total Body**", a score badge on the media, a colour strip, and per-exercise rep chips.

- **Create:** add an optional `routineSessionId` to `PostCreationRequest`. Validate that the session belongs to the poster.
- **Read:** `PostResponse` gains an optional `routineSummary`, with the same shape as one entry of `routines[]` in R2.
- **Kind:** `postKind` stays `GENERAL`, so old apps render a normal video post. The media still gets likes, views and share as today; views and share stay on media posts.

### R4. Home · My Activities (the user's own day)

The card shows:
- the steps-goal tile;
- one tile **per non-ENDED routine run** (score, total reps, routine name, local time), newest first;
- one tile per **single-workout type** (standalone reps only);
- the "Start workout" tile;
- **Calories · Distance · Active** (computed on the device).

**What's needed:** one call that returns **my day** in the same split as R2: `steps`, `routines[]` and `singles[]`.
- Either extend an existing endpoint, or add, for example, `GET /v1/workouts/day?date=YYYY-MM-DD` (me, local date) → `{ date, steps: {count}, totalReps, routines[], singles[] }`.
- The **Share your day** image is drawn on the device from this same response, so the card and the image always agree.

**The Share icon in My Activities** is shown when there are steps above 0 **or** at least one workout, and hidden on a completely empty day. The client decides this from the response.

### R5. Routine detail (detail sheet and history)

Tapping a routine tile opens a sheet. The sheet shows:
- the ring with the score, name, level, local time and duration;
- total reps and kcal (kcal computed on the device);
- per exercise, done/target with a check mark when the target was met;
- the status pill and stars.

**What's needed:**
- `GET /v1/workouts/routines/{sessionId}` (owner only, or anyone who can see the user's feed: backend decides). Same shape as the R1 response.
- *Optional, for a future history screen:* `GET /v1/workouts/routines?from&to&cursor` (mine, paged).

### R6. Unchanged behaviour (must keep working)

- **Streaks:** routine reps flow into `workout_stats`, so `evaluateStreakAfterWorkout` credits days exactly as today, per type, with the existing thresholds.
- **Challenges, elimination, competitions, rankings, Top activities, `v1/workouts/stat` and reminders:** no change in behaviour. Routine reps count like any other reps of that type.
- **Activity-card deletion:** tombstones (`deleted`, `post_id` set to null) behave as today, and a deleted day is never recreated.
- **STEPS:** unchanged (highest value wins, not ranked, not in the feed).

---

## 3. Product rules the backend must respect

| Rule | Detail |
|---|---|
| One feed card per user per day | `activity_post` stays the single source; routine runs live inside it |
| Scores belong to routine runs, never to a day | No day-level score anywhere |
| ENDED runs are private | Excluded from `routines[]` in feed / My Activities; reps still count |
| Same routine twice a day | Two separate runs, each with its own score and time |
| No double counting | `singles` = day total − routine reps for the type; `totalReps` = everything |
| Old apps unaffected | New fields additive or feature-gated; `exercises[]` / `totalReps` unchanged |
| Love only on ACTIVITY cards | Client hides views and share; media posts keep them |

---

## 4. Data definitions

| Field | Values |
|---|---|
| `routineId` | `total-body`, `lower-power`, `cardio-blast` (allowlist; more routines may be added later, so keep it configurable) |
| `level` | `BEGINNER`, `INTERMEDIATE`, `EXPERT` |
| `status` | `COMPLETED` (all targets met), `PARTIAL` (finished, some targets missed), `ENDED` (user ended early) |
| `workoutType` | Existing enum: `SQUATS`, `PUSHUPS`, `BURPEES`, `JUMPING_JACKS`, `HIGH_KNEES` for routines; singles may be any rep type (incl. `SITUPS`, `LUNGES`) |
| `stars` | Derived from score: ≥90 → 5, ≥75 → 4, ≥60 → 3, ≥40 → 2, else 1 |
| `localTime` / `lastAt` | User-local `HH:mm` (the client formats it as "7:40 AM") |

## 5. Score formula (must match the apps exactly)

With one row per exercise attempted, `{done, target, durationSeconds (sec), targetSeconds (targetSec)}`:

```
repScore  = Σ min(done, target) / Σ target
setScore  = (# rows with done ≥ target) / (# rows)
paceScore = (# rows with done ≥ target AND sec ≤ targetSec × 1.15) / (# rows)
score     = round(100 × (0.55 × repScore + 0.25 × setScore + 0.20 × paceScore))
status    = ENDED if the user ended early
            else COMPLETED if every planned exercise has done ≥ target
            else PARTIAL
```
The reference implementation is `score()` / `stars()` / `status()` in `docs/js/screens/full-body-data.js`.

---

## 6. Acceptance criteria

1. **Saving a run.** Saving a Total Body run (18/12/10/30/40) adds exactly those reps to today's `workout_stats` rows for the 5 types, creates or bumps today's ACTIVITY card, and credits streaks as a normal save would.
2. **Retries.** Re-sending the same `clientSessionId` returns the same session and leaves `workout_stats` unchanged.
3. **Mixed day.** Total Body at 07:40, then 40 single squats at 12:30 and 25 single push-ups at 18:05, gives a feed card with:
   - `totalReps = 175`;
   - `routines` = [Total Body 94];
   - `singles` = [PUSHUPS 25 @18:05, SQUATS 40 @12:30];
   - `exercises` (legacy) = full day totals (e.g. SQUATS 58).
4. **Same routine twice.** Two Total Body runs on one day give two entries in `routines[]`, newest first, each with its own score.
5. **Ended run.** An ENDED run with 39 reps adds 39 reps to `workout_stats`, does **not** appear in `routines[]`, and still counts toward that day's `totalReps`.
6. **Old app.** An old app build reading the feed sees the same card as before: `exercises[]` and `totalReps` are unchanged, and nothing fails to decode.
7. **Validation.** An unknown `routineId`, a level not on the list, or a gated `workoutType` for that app version is rejected with 400, and nothing is written.
8. **Video post.** A video post created with `routineSessionId` returns `routineSummary` in the feed, and still has `postKind = GENERAL`.
9. **My Activities.** `GET` my day returns `routines[]` (non-ENDED) and `singles[]`, consistent with the feed card for the same date.
10. **Untouched counting.** Challenges, elimination, rankings and stats totals for a day with routine runs equal the per-type sums. No double counting anywhere.

## 7. Deliverables I need back

- The final **endpoints and JSON contracts** (request/response), with field names.
- The migration SQL file names, and the deploy order (the migration runs before the app deploy).
- Whether new feed fields are **feature-gated** (and the `ClientFeature` name and minimum app versions), or plain additive fields.
- A short doc in the backend repo, e.g. `docs/FULL_BODY_ROUTINES_API.md`, in the style of `COMMUNITY_FEED_V2_API.md`.

## 8. Open questions for backend and product

1. **Detail access.** Can other users open a routine's detail (from the feed), or only its owner?
2. **Streak credit for routines.** Should a **COMPLETED routine** credit a streak day on its own, even if no single type reaches its threshold? Today streaks are per type: 10 burpees may be below the BURPEES threshold.
3. **Per-save session log.** Should we add one for *all* saves (singles too), which gives idempotency for `v1/workouts` and `lastAt` per single? Or only log routine sessions?
4. **History screen.** Is the routine-history list (R5, optional) needed now, or later?
5. **Routine catalog.** Should routines move from client config to a server catalog (name, exercises, level targets), so new routines ship without an app release?
