# Full Body Workout — iOS & Android Implementation Plan

**Design prototype:** `docs/screens/workout/full-body.html`
**Source of truth for numbers and scoring:** `docs/js/screens/full-body-data.js`
**Prototype UI and state machine:** `docs/js/screens/full-body.js`

---

## 1. What we're building

A guided workout that runs several AI-counted exercises back to back in **one camera session**. Rest periods sit between the sets.

```
Routine list → Preview (choose difficulty, see the plan) → Session → Results
                                                        prep → exercise → rest → exercise → … → done
```

| Routine | Exercises | Camera setup |
|---|---|---|
| **Total Body** *(new, shown first, default)* | Squats → Push-ups → Burpees → Jumping Jacks → High Knees | Mixed: side-on and front-on. The user is cued during rest. |
| Lower Power | Squats → Burpees | Side-on, knee height |
| Upper Press | Push-ups × 2–3 rounds | Side-on, on the floor |
| Cardio Blast | Jumping Jacks → High Knees | Front-on |

- Each routine has three difficulty levels: **Beginner**, **Intermediate** and **Expert**. A level sets the reps, the time target per set, the rest length and the number of rounds.
- **Sit-ups and lunges are not part of this feature.** They stay in the existing single-exercise picker.

### Session rules
These match the prototype. Both platforms must behave the same way.

1. **Prep.** A 3-2-1 countdown, the first exercise's name, and the camera framing hint.
2. **Exercise.**
   - Reps count only during this phase.
   - A **circular countdown ring** shows the time left. It is drawn in the exercise's colour and turns red in the last 5 seconds.
   - The set **completes automatically** when the rep count reaches the target.
3. **Time runs out before the target is reached.**
   - The set never completes on its own.
   - Show **Skip**, **Keep going** and **End**.
   - *Keep going* keeps counting with no time limit.
4. **Rest.**
   - A ring in the rest colour counts down the seconds, with a *Skip rest* button.
   - A *Next up* card shows the next exercise, drawn in its colour.
   - If the next exercise uses a different camera framing, show **"Move your phone: …"**.
5. **Pause.** Stops the timer and rep counting. The camera stays live.
6. **Leaving the session.**
   - **✕ (exit):** ask for confirmation, then show results as *Interrupted*.
   - **End (from the time's-up bar):** record the reps done so far and show results.
7. **Results.**
   - A score from 0 to 100, stars, and a short verdict (e.g. "Strong effort").
   - The status: completed, partially completed or interrupted.
   - Totals for reps, sets fully completed, calories and time, plus one row per set.

### Scoring
Port the scoring from `full-body-data.js` exactly. `score()` is a weighted sum of three parts:

| Weight | Part |
|---|---|
| 55% | Reps done ÷ target (each set capped at its target) |
| 25% | Sets fully completed ÷ sets attempted |
| 20% | Sets fully completed within 115% of their time target |

- **Stars:** 90 or more → 5, 75 → 4, 60 → 3, 40 → 2, below that → 1.
- **Status:**
  - *Interrupted* if the user ended early.
  - *Completed* if every planned set met its target.
  - *Partially completed* otherwise.

### Exercise colours
Add these as fixed tokens. They must not change with the user's theme palette.

| Exercise | Colour |
|---|---|
| Squats | `#C56DE2` |
| Burpees | `#2F80ED` |
| Push-ups | `#F5A623` |
| Jumping Jacks | `#166E7A` |
| High Knees | `#A1663A` |
| **Rest** | `#64748B` |

---

## 2. Shared decisions (both platforms)

### 2.1 Routine config as JSON
- Ship one file, `full_body_routines.json`, in both apps: Android `assets/`, iOS bundle `Resources/`.
- Generate it from `full-body-data.js`, so the web prototype, Android and iOS cannot drift apart.
- It can move to remote config later without any code change.

```json
{
  "version": 1,
  "restColor": "#64748B",
  "exercises": {
    "squat":    { "color": "#C56DE2", "kcalPerRep": 0.45, "framing": "side_knee" },
    "pushup":   { "color": "#F5A623", "kcalPerRep": 0.35, "framing": "side_floor" },
    "burpee":   { "color": "#2F80ED", "kcalPerRep": 0.75, "framing": "side_low" },
    "jumping":  { "color": "#166E7A", "kcalPerRep": 0.25, "framing": "front" },
    "highknee": { "color": "#A1663A", "kcalPerRep": 0.22, "framing": "front" }
  },
  "routines": [
    {
      "id": "total-body", "name": "Total Body", "focus": "Full body", "mixedFraming": true,
      "steps": ["squat", "pushup", "burpee", "jumping", "highknee"],
      "levels": {
        "beginner": { "rest": 25, "rounds": 1,
          "reps": { "squat": 12, "pushup": 8, "burpee": 6, "jumping": 20, "highknee": 24 },
          "sec":  { "squat": 30, "pushup": 24, "burpee": 24, "jumping": 30, "highknee": 28 } }
      }
    }
  ]
}
```

**Exercise key mapping:**

| JSON key | Android `WorkoutExercise` | iOS `WorkoutExercise` | Backend type |
|---|---|---|---|
| `squat` | `SQUAT` | `.squat` | `SQUATS` |
| `pushup` | `PUSHUP` | `.pushup` | `PUSHUPS` |
| `burpee` | `BURPEE` | `.burpee` | `BURPEES` |
| `jumping` | `JUMPING` | `.jumpingJacks` | `JUMPING_JACKS` |
| `highknee` | `HIGH_KNEES` | `.highKnees` | `HIGH_KNEES` |

### 2.2 Pure-logic module (no UI)
Write this the same way on both platforms and unit-test it with the **same JSON fixtures**:

- `buildSequence(routine, level)`: a flat list of `Exercise` and `Rest` items, with rest between sets but not after the last one. Each rest links to the exercise that follows it.
- `estimatedSeconds`, `totalReps`, `totalSets`.
- `score(results)`, `stars`, `band`, `status`.

### 2.3 One camera session, switching exercise in place
- Keep a single camera and pose pipeline running for the whole routine.
- At each exercise boundary, **switch the controller's exercise type**. This resets the smoother, state machine and rep counter.
  - Android already has this: `PoseCameraViewModel.selectExercise(type)`, which calls the controller's switch method.
  - iOS needs it added to `PoseKitRepEngine`.
- During **rest** and **prep**, keep running pose detection so the framing and tracking state stays current. Do not count reps.
- After a **framing change** in Total Body, the rest countdown can end before the user has moved the phone. In that case, hold on a short *Get ready* screen until tracking locks again, using the existing auto-arm. Then start the exercise timer. This keeps time from being lost while the user moves the phone.

### 2.4 Timer
- Use a **monotonic clock** (`SystemClock.elapsedRealtime()` on Android, `ContinuousClock` / `CACurrentMediaTime()` on iOS). Do not count timer ticks.
- Store a phase deadline. When paused, store the remaining time instead.
- If the app goes to the background or the phone gets an interruption, **pause automatically**.

### 2.5 Saving results
The backend **adds** the count on every save call; the iOS code already relies on this. So:

- Save **once at the end of the routine**, with **one call per exercise type**, using that type's total reps across all rounds. Do not save after each set.
  - Android: `WorkoutSessionWriter.save(...)`
  - iOS: `WorkoutSync.saveExercise(...)`
- **Interrupted sessions:** save the reps already completed. This needs a product decision; see §6.
- **Optional (later):** add a `routineId`, `level`, `score` and `sessionId` field, so the backend can group the sets into one "Full Body" activity in the feed and stats.
- Upload rep-log traces for each set through the existing trace uploaders, tagged with `routineId` and the set index.

### 2.6 Coach voice
Reuse the existing coaching stack. These are new triggers:

| Moment | Cue |
|---|---|
| Set completed | Existing "nice set" clip |
| Rest starts | "Rest. Next up: {exercise}" |
| Rest at 3 seconds | 3-2-1 countdown beats (reuse the countdown clips) |
| Framing change | "Turn your phone: {framing}" |
| Time's up | "Time's up — keep going or skip" |
| Routine finished | Completion clip |

The new clips needed are the "Next up" lines (one per exercise), the framing-change lines (one per framing) and the time's-up line. Add them to `COACH_VOICE_SCRIPTS.md` and the `coach-voice/` pipeline.

### 2.7 Release gating
- Put the feature behind a flag, `FULL_BODY_WORKOUT`.
- Burpees and high knees are already behind `NEW_EXERCISES` on Android. They also have no iOS calibration yet, so this feature should depend on that work too.

---

## 3. Android

**Stack:** Jetpack Compose, Hilt, navigation-compose, StateFlow, CameraX and MediaPipe.

### 3.1 New package: `feature/fullbody/`

```
feature/fullbody/
  domain/
    FullBodyRoutine.kt        // data classes: Routine, Level, ExerciseSpec
    RoutineRepository.kt      // reads assets/full_body_routines.json (kotlinx.serialization)
    SessionSequence.kt        // buildSequence(), SeqItem.Exercise / SeqItem.Rest
    FullBodyScoring.kt        // score(), stars(), band(), status()
  presentation/
    FullBodyFlow.kt           // nested nav graph
    RoutineListScreen.kt
    RoutinePreviewScreen.kt
    FullBodySessionViewModel.kt
    FullBodySessionScreen.kt  // hosts the camera + session HUD
    FullBodyResultsScreen.kt
    components/
      CountdownRing.kt
      SetProgressStrip.kt
      NextUpCard.kt
```

### 3.2 Navigation
- Add a `fullbody` nested graph with the routes `fullbody/list`, `fullbody/preview/{routineId}`, `fullbody/session/{routineId}/{level}` and `fullbody/results`.
- Register it next to `AiWorkoutFlow` and launch it from `MainShell` / the create menu.
- Reuse the existing permission and camera-privacy routes from `AiWorkoutFlow` before entering the session.

### 3.3 Session engine
`FullBodySessionViewModel` (`@HiltViewModel`) wraps the existing `PoseCameraViewModel` / `ExerciseController`. It should not fork them.

```kotlin
sealed interface Phase {
    data class Prep(val secondsLeft: Int) : Phase
    data class Exercise(val item: SeqItem.Exercise, val reps: Int, val remainingMs: Long, val overtime: Boolean) : Phase
    data class Rest(val item: SeqItem.Rest, val remainingMs: Long, val needsReframe: Boolean) : Phase
    data class Reframe(val next: SeqItem.Exercise) : Phase   // waiting for tracking to lock again
    object Finished : Phase
}
data class SessionUiState(val phase: Phase, val paused: Boolean, val setIndex: Int, val totalSets: Int, val results: List<SetResult>)
```

- **Rep counting:** collect the controller's rep count, and ignore it unless the phase is `Exercise` and the session isn't paused.
- **Moving to the next exercise:** call `selectExercise(next.engineType)` and then `clearRepHistory()`.
- **Clock:** a coroutine loop on `viewModelScope` ticks every 100 ms against a monotonic deadline. Show whole seconds in the UI.
- **Auto-pause:** a `Lifecycle` observer (`ON_STOP`) pauses the session.
- **Per-set results:** store `SetResult(exercise, target, done, durationSec, targetSec)`. The existing per-set `SetReport` from `feedback/SetReport.kt` can be attached for form data.
- **Finishing:** compute the score, call `WorkoutSessionWriter.save()` once per exercise type, then navigate to results.

### 3.4 UI components
- **`CountdownRing`:**
  - A `Canvas` with a `drawArc` track (colour at 16% alpha) and a progress arc (`StrokeCap.Round`, start angle −90°).
  - Animate progress with `animateFloatAsState(tween(1000, easing = LinearEasing))`.
  - Turn red (`colorScheme.error`) when 5 seconds or less remain.
  - The time text uses tabular figures (`fontFeatureSettings = "tnum"`).
- **`SetProgressStrip`:** a `Row` of weighted `Box`es, one per set. Done sets are filled with their exercise colour, the current set is half-filled, upcoming sets use the colour at 22% alpha.
- **Exercise colours:** add an `ExerciseColors` object to `core/designsystem/theme/Color.kt`, with `fun of(WorkoutExercise)` and `Rest`.
- **Artwork:** reuse `WorkoutArtwork` from `core/designsystem/icon/WorkoutArtwork.kt`.
- **Camera layer:** reuse `CameraFeed` and the `TrackingStatus` edge cues. The session HUD is drawn on top of the camera preview.

### 3.5 Coach voice
Add the new clips to `CoachClip.kt` and trigger them from `CoachingScheduler` when the session phase changes. The voice-coaching setting is respected automatically through `SettingsRepository`.

---

## 4. iOS

**Stack:** SwiftUI with `@Observable` (iOS 17), FactoryKit DI, coordinators with a `Step` enum, AVFoundation and MediaPipe through `PoseKit`.

### 4.1 New feature folder: `Features/FullBody/`

```
Features/FullBody/
  Domain/
    FullBodyRoutine.swift        // Codable: Routine, Level, ExerciseSpec
    RoutineStore.swift           // loads full_body_routines.json from the bundle
    SessionSequence.swift        // buildSequence(), enum SeqItem { case exercise, rest }
    FullBodyScoring.swift
  Presentation/
    FullBodyCoordinator.swift    // enum Step { list, preview, permission, session, results }
    FullBodyFlowView.swift
    RoutineListView.swift
    RoutinePreviewView.swift
    FullBodySessionViewModel.swift  // @Observable
    FullBodySessionView.swift
    FullBodyResultsView.swift
    Components/
      CountdownRing.swift
      SetProgressStrip.swift
      NextUpCard.swift
  FullBodyContainer.swift        // FactoryKit registrations
```

### 4.2 Navigation
- Present `FullBodyFlowView` as a `.fullScreenCover` from `MainTabView` / the create menu, the same way `AIWorkoutFlowView` is presented.
- Reuse the AIWorkout permission step.

### 4.3 Session engine
- **Switching exercise:** `PoseKitRepEngine` is built for a single exercise today. Add `func switchExercise(to: WorkoutExercise)`, which resets the PoseKit `ExerciseController` (smoother, state machine and counter), to match Android's switch method.
- **Camera:** keep one `CameraController` for the whole routine. On each switch, update `requiredJoints(for:)` so `TrackingQuality` checks against the joints the new exercise needs.
- **View model:** `FullBodySessionViewModel` holds a `phase` enum that mirrors Android's: `prep`, `exercise`, `rest`, `reframe`, `finished`.
- **Clock:** a `Task` loop using `ContinuousClock` with a deadline, ticking every 100 ms. Do not reuse the 1-second `startTimer()` loop.
- **Rep counting:** only while the phase is `.exercise`, tracking is `.locked` and the session isn't paused, matching the existing locked-only rule.
- **Auto-pause:** observe `scenePhase` and pause on `.background`.
- **Finishing:** call `WorkoutSync.saveExercise(workoutType:count:on:durationSeconds:)` **once per exercise type** at the end.

### 4.4 UI components
- **`CountdownRing`:** reuse or extend `Shared/Components/WorkoutProgressRing.swift`.
  - `Circle().trim(from: 0, to: progress)`, `.rotationEffect(.degrees(-90))`, `StrokeStyle(lineWidth: 16, lineCap: .round)`.
  - Animate with `.animation(.linear(duration: 1), value: progress)`.
  - Use `.monospacedDigit()` for the time.
- **`SetProgressStrip`:** an `HStack` of `Capsule`s.
- **Exercise colours:** add `BZPalette.exercise(_:)` and `BZPalette.rest` to `ThemeColors.swift`, independent of the active theme.
- **Artwork:** the existing `ic_*` assets through `BZIcon`.

### 4.5 Coach voice
Add the clips to `Resources/CoachVoice/`, map them in `RecordedVoicePack`, and trigger them from `CoachingScheduler`. Respect the existing audio settings.

### 4.6 Prerequisite
The burpee and high-knee thresholds on iOS are Android ports that have never been calibrated against an iOS capture. **Calibrate them before release**, because Total Body depends on both exercises.

---

## 5. Delivery plan

| Phase | Work | Android | iOS |
|---|---|---|---|
| 0 | Generate the routine JSON from `full-body-data.js`; agree on the backend save format (§2.5) | — | — |
| 1 | Domain logic: models, JSON loader, `buildSequence`, scoring, unit tests on shared fixtures | 2 d | 2 d |
| 2 | Routine list and preview screens; navigation; feature flag | 2 d | 2 d |
| 3 | Session engine: phase machine, clock, exercise switching, pause and background handling | 4 d | 5 d (includes `switchExercise` in PoseKit) |
| 4 | Session UI: countdown ring, progress strip, next-up card, time's-up bar, reframe hold | 3 d | 3 d |
| 5 | Results screen; saving; trace tagging | 2 d | 2 d |
| 6 | Coach voice cues (once the clips are recorded) | 1 d | 1 d |
| 7 | QA on real devices; iOS burpee and high-knee calibration | 3 d | 4 d |
| | **Total (estimate)** | **~17 d** | **~19 d** |

The two platforms can be built in parallel. Phase 1 should merge first on both, so the fixtures are locked before the UI work starts.

### Testing
- **Unit tests:**
  - `buildSequence` for every routine and level.
  - Scoring edge cases: zero reps, overtime, skipped sets, ended early.
  - The same expected-output JSON fixtures on both platforms.
- **Session state tests:** use a fake rep source and a fake clock to check auto-complete, time's-up, keep going, skip, skip rest, pause, background and exit.
- **On device:** run Total Body end to end in each difficulty. Check that the framing-change hold works, and that each exercise type is saved exactly once with the right totals.
- **Parity:** record the same routine on both platforms and compare the scores and the saved payloads.

---

## 6. Open questions

1. **Exiting with ✕.** Should completed sets be saved when the user exits early? The prototype dialog says "won't be saved", but **End** records them.
2. **Feed and stats.** Should a routine appear as one "Full Body" activity in the feed and stats? If so, the backend needs a `sessionId` / `routineId`.
3. **Video recording.** Should the camera record the whole routine, or nothing? It records a clip today, but a single 5–10 minute clip may be too large to upload.
4. **Waiting for re-lock.** Should Total Body also wait for tracking to re-lock after a framing change, or should rest end strictly on time?
5. **Points.** Are points or kcal for a routine just the sum over its sets, or is there a completion bonus?
