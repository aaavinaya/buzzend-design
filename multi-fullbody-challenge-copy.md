# Copy: Multi-workout and Full Body challenges

The final text for the design brief's screens, push messages and in-app messages. It matches the prototype in
`docs/screens/home/create-challenge.html` and `challenge-detail.html` (Multi / Full Body states).

**Wording rules**
- **Levels:** always Easy / Medium / Hard.
- **Full Body:** say "finish the routine" or "session", never "run".
- **Units:** "reps" everywhere. "Points" appears only on the Multi-workout Standard overall board.
- **Placeholders:** `{…}` marks a value the app fills in. `{routine}` is the full name ("Penta · Ultimate"), and `{routineShort}` is the first part ("Penta").

---

## 1. Create challenge

| Where | Copy |
|---|---|
| Step 1 title / subtitle | What's the challenge? / Pick one exercise, a few of them, or a full routine |
| Full Body card | Full Body / A full routine |
| Summary line, single | Single workout · tap more exercises to make it a Multi-workout |
| Summary line, multi | Multi-workout · {n} workouts, in this order: 1 {Squat} · 2 {Push Up} · 3 {Burpee} |
| Summary line, Full Body | Full Body · pick a routine and a level |
| Walking picked | Walking can't be combined with other workouts. |
| Errors | Pick a workout to continue. · Pick a routine to continue. · Pick a level to continue. |
| Routine card | {Penta · Ultimate} / {5} exercises |
| Level card | {Medium} / 1 round · {40} jumping jacks · {40} high knees · {30} squats · {20} push-ups · {15} burpees |
| Step 2 | Name your challenge / Give it a name people will want to join |
| Elimination toggle, Multi | Every workout gets a daily target. Miss any one and you're out. |
| Elimination toggle, Full Body | Finish the routine every day. Miss a day and you're out. |
| Fixed-target label | Fixed daily target only for this challenge |
| Multi target summary | Every day: {20 squats + 15 push-ups}. Miss any one and you're out. |
| Full Body target (read-only) | Finish {Penta · Ultimate} on {Medium} (or {Hard}) once a day. / This comes from the level you picked. Fixed daily target only for this challenge. |
| Standard note, Multi | Each workout has its own leaderboard. Your places are added up into points, and the lowest points lead. |
| Standard note, Full Body | Only sessions on {Medium} count. You don't need to finish the routine, every rep counts. |
| Winners hint | The top {3} by {fewest points / combined reps / total reps} win. On a tie, whoever got there first. |
| Elimination dates | Starts at midnight on {date} · ends {date} · 2–30 days. Joining closes when the challenge starts. |
| Review: How it works | The rules from §3 below, one line each |

## 2. Challenge cards

| Card | Copy |
|---|---|
| Kind, Multi | Multi · {3} workouts (with small stacked workout icons) |
| Kind, Full Body | Full Body · {Penta} · {Medium} |
| Active, Multi Standard | #{7} · {18} points |
| Active, Full Body Elimination | Total · {435} reps · {8} of {12} still in / Done for today · Stopped partway — finish to stay in · Not finished today |
| Needs your reps | Day {5}/{14} · #{7} on points / Day {3}/{7} · finish {routine} to stay in / Every rep counts · {Medium} only |
| Discover | {9} joined · Join closes in {2d} |

## 3. Detail: "How it works" rules

| Challenge | Lines |
|---|---|
| Multi · Standard | Each workout has its own leaderboard. · Your places on all of them are added up into points, and the lowest points lead. · The top {3} win. |
| Multi · Elimination | Every day: {20 squats + 15 push-ups + 10 burpees}. Miss any one and you're out. · Everyone still in at the end is ranked by combined reps. The top {3} win. |
| Full Body · Standard | Every rep counts, even if you don't finish the routine. Only sessions on {Medium} count. · Ranked by total reps. The top {3} win. |
| Full Body · Elimination | Each day, finish {routine} once on {Medium} or harder. Miss a day and you're out. · Everyone still in at the end is ranked by total reps. The top {3} win. |

## 4. Detail: other text

| Where | Copy |
|---|---|
| How it's done, header | Tap one to watch the demo / {routine} · {Medium} · 1 round |
| How it's done, footer (Full Body) | {145} reps in one full session |
| Main button, Multi | Start a workout |
| Main button, Full Body | Start {routine} ({Medium}) |
| Under the main button | Full Body Standard: Level locked to {Medium} for this challenge. / Full Body Elimination: Hard counts too. |
| Points tooltip | Your place on each workout, added up. Lowest leads. |
| Full Body banner | Every rep counts. You don't need to finish. Only {Medium} sessions count. |
| My card | {12} reps behind #{2} · Catch {name} / You're leading! / You haven't started yet · Start a session — every rep counts. |
| Multi Today card | {2} workouts left / Safe for today · Finish every workout to stay in. / Come back tomorrow — same targets. |
| Full Body Today card | Not finished today · {5h 20m} left / You stopped at {push-ups}. Finish one full routine to stay in. / Done for today ✓ ({Medium}) |
| Out note | Lasted {2} days · {96} reps · missed {push-ups} on day {3} / didn't finish on day {3} |
| Leaderboard rows | Safe for today ✓ · Today {2} / {3} done · Out on day {3} · missed {push-ups} / Done today ✓ · Stopped partway today · Not finished today |
| Nobody started | Nobody has started yet · Places start counting with the first workout. Be the first on the board. |
| Not started | The leaderboard opens when the challenge starts · {12} people have joined so far. |
| Private and full | Challenge is full · {10} / {10} |
| Joining closed | Joining closed (Elimination, after the start) |
| Winners | Champion · {7} points / {504} combined reps / {1,015} total reps |

## 5. Push and in-app messages

| When | Multi-workout Elimination | Full Body Elimination |
|---|---|---|
| **4 h before the deadline** | Still to do today: {6 push-ups, 10 squats} | Finish {Penta · Ultimate} on {Medium} today to stay in |
| **1 h before (last call)** | Last call: {6 push-ups} left. Finish within the hour to stay in. | Last call: 1 hour to finish {Penta · Ultimate} on {Medium}. |
| **Made it through the day** | Day {3} done. Same targets tomorrow. | Day {3} done. Finish {Penta} on {Medium} again tomorrow. |
| **Out** | You missed {push-ups} yesterday and you're out. Great effort! | You didn't finish the routine yesterday and you're out. Great effort! |
| **Won** | You won "{challenge}" — 1st place! | You won "{challenge}" — 1st place! |
| **Finished** | "{challenge}" is over — you finished {2nd}. | "{challenge}" is over — you finished {2nd}. |

**Multi-workout Standard** (no deadline pushes):

| When | Copy |
|---|---|
| Ended | "{challenge}" is over — you finished {2nd} with {7} points. |

**Result pop-ups** (in app, shown on the first open after the results):

| Pop-up | Title | Body |
|---|---|---|
| Multi, made it | Day {3} done! | Same targets tomorrow: {20 squats + 15 push-ups + 10 burpees}. |
| Multi, out | You missed {push-ups} yesterday | You did {9} of {15}, so you're out. Great effort! |
| Full Body, made it | Day {3} done! | Tomorrow: finish {routine} on {Medium} (or Hard) again. |
| Full Body, out | You didn't finish the routine yesterday | You're out. Great effort! |
| Won | You won! 1st place | Prize: {prize} |
| Finished | You made it to the end! | You finished {2nd} on {points / combined reps / total reps}. |
