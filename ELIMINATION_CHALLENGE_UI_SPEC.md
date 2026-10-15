# Elimination Challenge — Detail screen UI spec (iOS & Android)

**Audience:** iOS and Android engineers + designers building the Elimination challenge **detail / hub** screen.
**Design source of truth:** the approved prototype — `docs/js/screens/challenge-elim.js` (+ `docs/css/screens/challenge-detail.css`, the `.el-*` rules). Open `docs/screens/home/challenge-detail.html?v=<state>` to see any state live.
**Data / behaviour source of truth:** backend guide **`java-itg-gochall/docs/ELIMINATION_CHALLENGE_APP_GUIDE.md`** — this spec does **not** restate the API; read §3 (endpoints), §4 (client logic) and §2 (feature gate) there. This file pins down *how the screen looks and what changes per state*.

> **How to read this:** the screen is **one layout** reused for every state (same as a classic challenge detail). Only three regions are state-driven — the **Hub card**, the **My-status chip**, and the **Leaderboard body**. Everything else (hero, meta pills, description, prize, tabs) is constant. Build the layout once, then switch those three regions on `phase` + `me.status`.

---

## 1. The screen is a classic challenge detail + one hub

Reuse the existing **classic challenge detail** scaffold. Top to bottom, the elimination detail is:

| # | Region | State-driven? | Notes |
|---|---|---|---|
| 1 | **Hero** — cover image, back / ⋯ buttons, **`◎ Elimination` type badge**, title, "by {creator}" | No | Same hero as classic; the only addition is the Elimination type badge. |
| 2 | **Hub card** | **Yes** | The one new block. §3. |
| 3 | **Winners block** | Only when `phase == FINISHED` | Reuses the classic champion-spotlight block. §4.4 |
| 4 | **Meta pills** — `📅 {dateRange}` · `👥 Public`/`🔒 Private` · `🛡 Approval required`/`Open to join` | No | **Identical to a classic challenge — do not add extra pills.** |
| 5 | **Description** + "How it works" link | No | The link opens the help sheet (§6). |
| 6 | **Prize block** | Hidden when `phase == FINISHED` (the winner block replaces it) | Reuses the classic prize rows; label is "Last one standing". |
| 7 | **Primary CTA** | **Yes** | §5. |
| 8 | **Tabs** — Leaderboard · Posts | No | Posts is the normal challenge feed. |
| 9 | **Leaderboard body** | **Yes** | §4. |

Everything outside regions 2, 3, 5 (CTA), 4 (board) is byte-for-byte the classic layout. **Keep the meta pills identical to the classic challenge** — date, visibility, approval, nothing else.

---

## 2. The use cases (states)

Drive the UI from the summary endpoint `GET /v1/challenge/{id}/elimination` (guide §3.6) — `phase` + `me.status` + the `days[]` statuses. The nine prototype states map 1:1 to backend conditions:

| State (`?v=`) | `phase` | `me.status` | Also | What the user sees |
|---|---|---|---|---|
| `upcoming` | `NOT_STARTED` | — (`me` absent until joined) | `joinClosesAt` in future | Starts-in hub, **joined-members roster** |
| `safe` | `RUNNING` | `ACTIVE` | `aboveCutoff == true` | Day-N hub + funnel, **green "Safe"** chip, live board |
| `risk` | `RUNNING` | `ACTIVE` | `aboveCutoff == false` | Same hub, **amber "At risk"** chip, live board (my row below the cutoff line) |
| `locking` | `RUNNING` | `ACTIVE` | a day is `FINALIZING` | "Results coming soon" hub, **"Locking in"** chip, skeleton board |
| `out` | `RUNNING`/any | `ELIMINATED` | `eliminatedDay` set | **grey "Knocked out on day N"** chip, no Start button |
| `left` | `RUNNING`/any | `WITHDRAWN` | `eliminatedDay` set | **grey "You left on day N"** chip, no Start button |
| `won` | `FINISHED` | `WINNER` | — | Winners block, **gold "Winner"** chip |
| `final` | `FINISHED` | `FINISHED` | — | Winners block, **"Finished #N"** chip (made the final, didn't win) |
| `nowinner` | `FINISHED` | — | `noWinner` (everyone at 0) | "No winner this time" winners block |

A **creator who is also competing** gets exactly the same chip and board as any member (guide §5.6).

---

## 3. Hub card (region 2) — the one thing that changes most

A single rounded card under the hero. It answers *what day is it / how long left*, *how many are still in*, and *am I safe*. Three layouts by `phase`:

### 3.1 `NOT_STARTED` (upcoming)
- Calendar icon tile + **"Starts in {countdown}"** + sub: **"{remaining-or-joined} joined · joining closes at the end of day 1"**.
- **No funnel** here — before day 1 there are no results, so the all-`?` funnel is omitted. *(This is a deliberate change from an earlier build; do not render the funnel for NOT_STARTED.)*
- Countdown is to `days[0].startsAt` (guide §4), shown in the user's local time.

### 3.2 `RUNNING`
- **Lead:** a **countdown ring** (to `days[currentDay-1].endsAt`, local time) with "{Xh Ym} left" in the centre + **"Day {currentDay} of {totalDays}"** + sub **"{remaining} still in · {todayCutoffRemaining} survive today"**. A small `ⓘ` opens the help sheet.
- **Funnel graphic:** one column per day, height ∝ `days[d].participantsBefore`, value label on top; today's column highlighted; unknown future days show `?`; a final "Win" column shows `winnerCount` with a trophy. Build the numbers from `days[].participantsBefore` / `advanced` only — **never compute cuts on device** (preview formula is create-screen only, guide §4).
- **My-status chip** (§3.4) below the funnel.
- **While a day is `FINALIZING`** (`locking`): replace the ring with a clock + **"Day {k} results coming soon"**, keep the funnel (next day's field shows `?`), and the chip becomes the "Locking in" chip.

### 3.3 `FINISHED`
- Trophy tile + **"Finished"** + sub **"{startCount} started · {totalDays} days · {1 left standing | no winner}"**.
- Funnel (complete) + the "Finished #N" chip if `me.status == FINISHED`.

### 3.4 My-status chip — **icon + words, never colour alone** (guide §5.7)

| Condition | Style | Copy |
|---|---|---|
| `ACTIVE`, `aboveCutoff` | green, shield | **"Safe"** · "#{place} of {remaining}, cutoff #{cutoffPlace}" |
| `ACTIVE`, not `aboveCutoff` | amber, alert | **"At risk"** · "#{place} · {N} reps to reach #{cutoffPlace}" — N = cutoff-entry score − my score + 1, from the live board |
| day `FINALIZING` | neutral, clock | **"Locking in day {k}"** · "you were #{place}. Results within the hour." |
| `ELIMINATED` | grey, ✕ | **"Knocked out on day {eliminatedDay}"** · "{cumulativeScore} reps" |
| `WITHDRAWN` | grey, logout | **"You left on day {eliminatedDay}"** · "{cumulativeScore} reps" |
| `WINNER` | gold, trophy | **"Winner"** · "last one standing of {startCount}" |
| `FINISHED` (not winner) | neutral, medal | **"Finished #{place}"** · "you made the final" |

Prefer "knocked out / still in / cutoff" over "eliminated" in body copy (guide §5.7).

---

## 4. Leaderboard body (region 9)

Data: `GET /v1/challenge/{id}/elimination/leaderboard?day=&page=` (guide §3.7), 50/page with `hasMore`.

### 4.1 Constant row
`[place] [avatar] [name] [today delta "+{dayScore}"] [cumulative score]`. Ties share a place number (1, 1, 3). My row is highlighted.

### 4.2 `NOT_STARTED` → **joined-members roster** (not an empty state)
Header "**{joined} joined · board opens on day 1**", then one row per joined member: `[avatar] [name] [green "Joined" tag]` (no place, no score — nothing is ranked yet). *(This replaces the earlier "Board opens on day 1" empty card — show the people who joined.)*

### 4.3 `RUNNING` → live board with a cutoff line
- **Day tabs:** `Live · Day {k} · …` — `Live` is the board without `day`; past days use `?day=n` (frozen). A finished day tab shows each person's `outcome` (`ADVANCED` / `ELIMINATED`), with its own cutoff.
- **Cutoff divider** after place `cutoffPlace`, labelled **"▲ Advance / Cutoff #{n} / Knocked out ▼"**.
- Rows above the cutoff, the divider, rows below it.
- **"Knocked out ({count})"** collapsible section at the bottom; each out/withdrawn row shows "Day {eliminatedDay}" (or "Left Day {n}").
- **Pin my row** to the bottom when it's scrolled off-screen (guide §5.3).
- **`FINALIZING`:** show "Locking in day {k} results…" + skeleton rows instead of the board.

### 4.4 `FINISHED`
- **Winners block** (region 3) above: champion spotlight — avatar with gold ring + trophy badge, "Champion · {score} reps", prize chip; runners-up as `#n` rows if `winnerCount > 1` (ties share a place, so there can be more rows than `winnerCount`, guide §3.8).
- **No winner** (`noWinner`): winners block reads "**No winner this time** — nobody logged a workout on the last day."
- Board below: winner(s) then the full "Knocked out" section.

---

## 5. Primary CTA (region 7) — per state

| State | CTA |
|---|---|
| `RUNNING` + `ACTIVE` | **"Start workout"** (deep-links to the challenge workout) + a chat button. Daily-urgency format, keep it prominent. |
| `NOT_STARTED` | **"Join · closes end of day 1"** (hidden / "Joining closed" once `joinClosesAt` passes — guide §3.5). |
| `ELIMINATED` / `WITHDRAWN` | **"Open group chat"** (they stay in the chat). **No Start button.** |
| `FINISHED` | **"Open group chat"**. |

> **Removed on purpose** (do **not** add these): "Create the next knockout" on the finished screen, and "Find another challenge" on the knocked-out screen / knockout moment. The win moment keeps only **Share**; the knockout moment keeps **Keep watching** + **Share**.

---

## 6. Result moments & help (sheets)

Shown on the next open after a day finalizes, or from tapping an elimination push (guide §3.9, §5.4). Bottom sheets:

- **Through:** shield + "You're through to day {n}!" + "{left} left. Today's cutoff is #{k}, so stay in the top {k} tonight." + **Start workout**.
- **Knocked out:** flag + "Knocked out on day {n}" + stats (days survived · total reps · best day) + **Keep watching** + **Share**. *(No "find another challenge".)*
- **Won:** trophy + confetti + "You won! Last one standing of {startCount}. Prize: {prize}" + **Share** only. *(No "new knockout".)*

**Help sheet** ("How elimination works"): every day is a round; ranked by **total** reps since day 1; lowest totals knocked out each night, ties at the cutoff go through; results within an hour of midnight, sync before midnight; last {winnerCount} standing win. Say once that **"Days end at midnight {challenge time zone}"**, shown in the user's local time (guide §5.7).

---

## 7. State → data mapping (quick reference)

```
phase == NOT_STARTED                      → Hub 3.1 · Roster 4.2 · CTA Join · no funnel, no chip
phase == RUNNING  & me.ACTIVE & aboveCut  → Hub 3.2 · green "Safe"  · Start workout
phase == RUNNING  & me.ACTIVE & !aboveCut → Hub 3.2 · amber "At risk" · Start workout · my row under the cutoff line
phase == RUNNING  & days[k].FINALIZING    → Hub "Day k results coming soon" · "Locking in" chip · skeleton board
me.status == ELIMINATED                   → grey "Knocked out day N" chip · Open group chat · no Start
me.status == WITHDRAWN                     → grey "You left day N" chip · Open group chat · no Start
phase == FINISHED & me.WINNER             → Winners block + gold "Winner" chip
phase == FINISHED & me.FINISHED           → Winners block + "Finished #N" chip
phase == FINISHED & noWinner              → "No winner this time" winners block
```

Field sources (guide §3.6 / §3.7): `phase`, `currentDay`, `totalDays`, `remaining`, `todayCutoffRemaining`, `joinClosesAt`, `days[]` (`status`, `participantsBefore`, `advanced`, `startsAt`, `endsAt`), `me` (`status`, `place`, `cumulativeScore`, `aboveCutoff`, `eliminatedDay`), leaderboard `cutoffPlace` / `entries[]` (`place`, `cumulativeScore`, `dayScore`, `status`, `outcome`).

---

## 8. Platform / behaviour notes (both apps)

- **Countdown** runs to `days[currentDay-1].endsAt`, rendered in the **user's local time**; day boundaries are the **challenge's time zone** (guide §4). Use a single ticking timer that both the ring and any "Starts in" label share.
- **Finalizing window:** between a day's `endsAt` and finalization (≤ ~1h), show the "Results coming soon" / "Locking in" treatment — don't show a stale board as final.
- **Refresh** the summary on foreground, pull-to-refresh, and when an elimination notification arrives. **No websocket — don't poll faster than 60 s** (guide §4).
- **Deep links:** every elimination push (`type=challenge`, `id=<challengeId>`) opens this hub; route result-moment pushes to the matching sheet (guide §3.9).
- **Feature gate:** send `X-App-Version` + `X-Platform` on every request; treat a missing `challengeType` as `STANDARD`; never show elimination UI to gated builds (guide §2).
- **Accessibility:** cutoff and status use icon **and** text, never colour alone; "Safe" / "At risk" read as labels. Announce the status chip and cutoff position to screen readers.
- **Never compute eliminations on device.** The only client-side formula is the create-screen *preview* (guide §4/§5.1) — out of scope for this screen.

---

## 9. Reuse checklist (don't rebuild classic parts)

- ✅ Reuse the classic challenge **hero, meta pills, description, prize rows, tabs, Posts feed, member/avatar rows, winner champion-spotlight** — the elimination screen adds only the **type badge**, the **hub card**, the **status chip**, the **cutoff line / knocked-out section / day tabs / roster**, and the **result-moment sheets**.
- ✅ Standard challenges are unchanged — this screen only renders when `challengeType == ELIMINATION`.
- ✅ Validate against the prototype: `docs/screens/home/challenge-detail.html?v=upcoming|safe|risk|locking|out|left|won|final|nowinner`.
