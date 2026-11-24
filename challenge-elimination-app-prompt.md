# Prompt: Create Challenge, Elimination detail and Join approval (iOS + Android)

> Paste this into the iOS session and the Android session. Each session finds its own file changes.
> **Match the design prototype exactly**: layout, copy, order, states and spacing.

---

You're updating three areas of the Challenges feature:

1. **Create Challenge:** the Duration picker is removed, "Require approval to join" is on by default, and Elimination becomes a toggle on step 2.
2. **Challenge detail** for **Elimination challenges:** a new **daily-target** concept replaces the old "lowest totals are cut" idea.
3. **"Require approval to join"** on the challenge detail page for **every** challenge (classic and elimination), plus the elimination version of the challenge **list cards**.

## Sources of truth

**Design prototype** (Buzzend Design repo, open the pages in a browser):

| Screen | Page | Code |
|---|---|---|
| Create Challenge | `docs/screens/home/create-challenge.html` | `docs/js/screens/create-challenge.js`, `docs/css/screens/create-challenge.css` |
| Challenge detail (classic + elimination) | `docs/screens/home/challenge-detail.html` | `docs/js/screens/challenge-detail.js`, `docs/js/screens/challenge-elim.js`, `docs/js/components/join-requests.js`, `docs/css/screens/challenge-detail.css` |
| Challenge list, Discover, My Challenges | `docs/screens/home/challenges.html`, `my-challenges.html` | `docs/js/screens/challenges.js`, `docs/js/components/challenge-list-card.js`, `docs/js/screens/social-data.js` |

Deep links to each state:
- `create-challenge.html?step=1` and `?type=elimination&step=1` (Elimination on).
- `challenge-detail.html?v=<state>&role=<viewer|requested|member|creator>`.
  - Classic states: `poster`, `winners`.
  - Elimination states: `upcoming`, `upcomingM`, `under`, `done`, `pending`, `out`, `viewer1`, `closed`, `won`, `finished`, `lostEnd`, `nowinner`, `steps`.
- The switcher at the top of the page also opens the result pop-ups.

**Backend app contract (read this first):** it's in the backend repo's **`docs/` folder** (`java-itg-gochall/docs/`):
- **`ELIMINATION_CHALLENGE_APP_GUIDE.md`:** the API contract for elimination. It covers:
  - create/update fields: `challengeType`, `eliminationMode` (STATIC / DYNAMIC), `dailyTarget`, `dailyTargetIncrease`, `days` 2–30, `winnerCount` 1–3;
  - challenge responses (`todayTarget` …);
  - `GET /v1/challenge/{id}/elimination` (summary, `me.todayScore`, `me.targetMetToday`, `days[].target`, `days[].status`);
  - `GET /v1/challenge/{id}/elimination/leaderboard` (live and per-day rows: `cumulativeScore`, `dayScore`, `targetMet`, `outcome`);
  - notifications, the feature gate (`X-App-Version` / `X-Platform`), and the test checklist.
- **`ELIMINATION_CHALLENGE_PLAN.md`:** the business rules.
- **`CHALLENGE_JOIN_REQUESTS.md`:** the join-request API behind "Require approval to join".

**Use only the fields the contract provides.** If the design needs something the contract doesn't have, **ask; don't invent it**.

**Remove** everything from the old elimination concept:
- cutoff lines, "Safe / At risk", "#9 of 27, cutoff #14", "reps to reach #14";
- "N survive today", the shrinking-field funnel, and the cut-plan preview on Create;
- the step-1 Classic / Elimination type picker;
- any copy saying "lowest totals are knocked out".

---

## 1. Create Challenge (3 steps)

Keep the current app screens as they are, except for these changes.

### Step 1: What's the challenge?
- **Order:** Exercise type grid → Quick start → Challenge name → Description.
- **Exercise grid:** 3 columns, with the **NEW** badge on Burpee and High Knee. The quick-start chips are unchanged.
- **Field limits:** name max **250**, description max **3000**, with the counters shown.
- **No Classic / Elimination picker on step 1.** Remove it if it exists.

### Step 2: When & who can join?
**Order:**
1. **Who can join?** Public / Private.
2. **Joining:** the "Require approval to join" toggle card. It's now **ON by default for every new challenge**.
3. **Challenge type:** a new toggle card in the **same style** as the approval card:
   - shield → target icon;
   - title **"Elimination challenge"**;
   - subtitle **"Everyone gets a daily target. Miss it once and you're out."**;
   - a switch, OFF by default.
4. **Dates:**
   - **Elimination OFF:** "Start & end date", the same as today (two date fields + "Choose the start and end dates for your challenge.").
   - **Elimination ON:** "Start & days", made of:
     - a **Start** date field and a **Days** stepper (− N +), range **2–30**, default **7**;
     - the line "Starts at midnight on 27 Oct 2026 · ends 2 Nov 2026 · 2–30 days. Joining closes when day 1 ends.";
     - the end date is **shown, not picked**.
5. **Daily target** (Elimination ON only):
   - Two pick cards:
     - **Same every day** (flag icon, "e.g. 20 a day") = STATIC;
     - **Goes up daily** (activity icon, "e.g. 20 → 25 → …") = DYNAMIC, the default.
   - A stepper row **"Day 1 target"** (or **"Target"** for STATIC), followed by the unit (e.g. "burpees", "steps").
   - **DYNAMIC only:** a stepper row **"Goes up by" … "every day"**, then a **"Day by day"** box with a grid of each day's target (Day 1: 20, Day 2: 25 …) and "Reach the day's target to stay in. Miss it once and you're out."
   - **STATIC:** no grid, just the line "Everyone needs 20 burpees every day. Miss it once and you're out."
   - **Defaults follow the exercise:** reps start at 20 (target ±5, increase ±1); steps start at 6,000 (target ±500, increase ±250). Changing the exercise resets them.
6. **Winner selection** (None / Top Score / Random) and **Prizes**: unchanged, for both challenge types.

**Remove the Duration section** (Daily · Every Other Day · Twice a Week · Weekly · One Time) for **all** challenges. The request always sends `frequency: "DAILY"`.

### Step 3: Review
**Preview card meta:** "Daily · Public · 7 days", or for elimination "Elimination · Public · 7 days".

**Summary rows:**
- **Classic:** Exercise · Schedule (Daily) · Visibility · Joining ("Approval required" / "Open to all") · Duration · Winner · Prizes (if any).
- **Elimination:** Exercise · **Type: Elimination** · Visibility · Joining · **Start: "Midnight, 27 Oct 2026"** · Duration · **Daily target** ("20 → 50 (+5/day)" or "20 burpees a day") · Winner · Prizes.

**Notes:**
- **Elimination:** add "Miss a day's target and you're out. Joining closes when day 1 ends." above the existing camera / steps note.

### Request
**Classic:** today's body with `frequency: "DAILY"` and `joinApproval` from the toggle.

**Elimination adds:**
- `challengeType: "ELIMINATION"`;
- `eliminationMode`, `dailyTarget`, `dailyTargetIncrease` (0 or omitted for STATIC);
- `days` (2–30);
- `startDate` (date only).

Follow the guide's create rules and show the server's error `message` on a 400.

**⚠️ Open question: ask before implementing.** The contract requires **`winnerCount` 1–3** for elimination, but the design keeps the classic **None / Top Score / Random** winner selection. How `winnerCount` is derived (and what "None" means for elimination) **isn't decided**. Confirm with product/backend; don't guess.

---

## 2. Challenge detail: Elimination (daily target)

**It's the classic challenge detail page with a few extra pieces, not a new screen.** Keep the same hero, info grid, prizes, Record and chat buttons, Members / Posts tabs, ⋯ menu, cards and spacing.

**The concept users must understand:** every day has a **target**, and all of today's sessions add up. Reach it and you stay in; **miss it once and you're out**. People who make it to the end are ranked by total; the top 1–3 win.

**Hero:**
- an **"Elimination"** pill (target icon) next to the status badge.

**Info grid** (the same 4 cells):

| When | Cell 1 | Cell 2 | Cell 3 | Cell 4 |
|---|---|---|---|---|
| Running | Exercise | **Today's target** "30 squats" | **Still in** "9 of 12" | **Days left** |
| Not started | Exercise | "Day 1 target" | "Joined" | "Starts in" |
| Finished | Exercise | "Final target" | "Made it 5 of 12" | "Ran for 7 days" |

**Today card** (the one new block; members, while running), placed after the info grid:
- **Header:** "Today · Day 3 of 7" on the left, "⏱ ends in 4h 10m" on the right (the user's local time).
- **Big number:** "**12** / 30 squats today", then a progress bar.
- **Footer, left:** "**18 more** to stay in"; once reached, "✓ Done for today · come back tomorrow" in green, and the card turns green.
- **Footer, right:** "Tomorrow: 35"; STATIC shows "Same target every day"; the last day shows "Last day!".
- **Results pending** (previous day ended): a grey bar with the final count, "Results in about an hour", and "Day 4 is already open: 35 squats".
- **Out:** the card becomes a muted note, "You're out · Lasted 2 days · 85 squats · out on day 3". A user who missed day 3 is shown as out on day 4.
- **Not started (member):** "Starts in 1d 6h", "Day 1 target · **20** squats", and "You're in. Reach it on day 1 to stay in."
- **Steps challenge:** units in steps ("4,200 / 6,000 steps today"). There's **no Record button**: show "👣 Steps count automatically" (one line, centred, same height as the chat button) plus the chat button.

**About chips:** the mode ("Target +5 every day" / "Same target every day") · Public/Private · "Approval required" / "Open to join". The description ends with an inline **"ⓘ How it works"** link.

**"How it works" sheet:**
- 4 plain bullets:
  - "Every day has a target. All your sessions that day add up.";
  - "Reach it to stay in. Miss it once and you're out.";
  - "Make it through the last day and you're ranked by total reps. Top N win; on a tie, whoever got there first.";
  - "Join until the end of day 1. Results come about an hour after each day ends, and we'll remind you at 8 PM if you're still short."
- Then the **day-by-day target list**, with today highlighted and past days dimmed. This is the only place the full schedule appears.

**Prizes block:** the same as classic while the challenge isn't finished.

**CTA:**

| State | Buttons |
|---|---|
| Member, running | "📷 Record <exercise>" + chat |
| Not started (member) | Disabled "Starts in …" + chat |
| Out | Disabled "You're out · great effort!" + chat |
| Finished | Disabled "Challenge ended" |
| Viewer, joining open (not started or day 1) | "Request to join · closes end of day 1" (approval on) or "Join Challenge" (approval off). Under it: "Join today and reach 20 squats to stay in." on day 1, or "Joining stays open until the end of day 1." before start |
| Viewer after day 1 | Disabled "🔒 Joining closed" |

**Members tab** (same row style as classic):
- **Running:**
  - **"STILL IN" (count) "Ranked by total reps":** rank · avatar · name · total; under the name, "Today 18/30", which turns green with ✓ once met.
  - **"OUT" (count):** muted rows with "Out on day 2", no rank.
  - **On day 1** everyone is still in, and there's no Out section.
- **Not started:** "N joined · ranking starts on day 1", rows without numbers.
- **Finished:** **Winners** (medals 🥇🥈🥉), then **Finished**, then **Out**.
- **No winner:** the Winners card reads "No winner this time · Nobody made it to the end."

**Winners card** when finished: the same as classic.

**Result pop-ups** (shown once, on the first open after a day's results), in the app's modal style:

| Pop-up | Title | Body | Stats | Button |
|---|---|---|---|---|
| Made it | "You hit day 2's target!" | "Tomorrow: 30 squats" | days survived, total reps | Got it |
| Out | "You missed day 3's target (30)" | "You're out. Great effort!" | days survived, total reps | View challenge |
| Won | "You won! 1st place" | Prize | total reps | View challenge |
| Finished | "You made it to the end!" | "You finished 4th." | total reps | View challenge |

**Copy tone:** short, friendly, no blame. Status is never shown by colour alone.

---

## 3. "Require approval to join" on the detail page (classic AND elimination)

This follows the current iOS implementation (ChallengeDetailView `ctaRow`, `joinRequestsEntry`, `ChallengeJoinRequestsView`). Android must match it.

- **About chips:** "Approval required" with a shield, when `joinApproval` is true.
- **Viewer + approval ON:** the primary button reads **"Request to join"** (elimination: "Request to join · closes end of day 1").
  - Tapping it shows the **"Request sent"** dialog: "The creator of “<title>” will review your request to join."
  - The state then becomes a disabled **"Requested — waiting for approval"** pill next to a **Cancel** button (outline, 92 wide).
  - Cancel goes back to "Request to join".
- **Viewer + approval OFF:** "Join Challenge", as today.
- **Creator:** under the CTA row, a **"Join requests"** card, shown only when there are pending requests:
  - icon · "Join requests" · "N waiting for your review" · a count pill · chevron.
  - It opens the queue: oldest first, one user card per request (avatar · name · @username), with **Reject** (outline) and **Approve** (filled).
  - Empty state: "No pending requests" / "When someone asks to join, they'll show up here for you to approve."
  - For elimination, show the entry only while joining is open (before the start and on day 1). An elimination request still pending when day 1 ends becomes `EXPIRED`; show it like a rejection, "Joining closed".
- **The creator is always a member.** Never show them "Request to join".

---

## 4. Challenge list cards (elimination)

| Where | What it shows |
|---|---|
| Any card | An **"◎ ELIMINATION"** tag (orange pill) |
| Challenges · Active card | "Day 3/7" pill. Progress row: "Today · **12**/30 push-ups" with "9 of 12 still in" on the right and a bar of today's progress vs today's target. Footer: a status chip ("18 more to stay in", or green "✓ Done today", or "Out on day 2") + Record |
| Needs your reps today | "Day 3/7 · 12/30 today · 18 more to stay in" |
| Discover (open, not joined) | Tag · "38 joined" · "🕒 Join closes in 5h" · Join |
| Ended | "🏆 You won · 1st of 40" or "Winner: <name>" |
| My Challenges / Profile rows | An **ELIMINATION** tag; meta "Day 3/7 · today 12/30" / "38 joined · join closes in 5h" / "You won · 1st of 40" |

Opening an elimination card goes to its detail page.

---

## 5. Acceptance checks

1. **Create:**
   - no Duration section anywhere; the request always carries `frequency: "DAILY"`;
   - "Require approval to join" starts ON;
   - Elimination is a toggle on step 2, right after Joining.
2. **Elimination ON:**
   - start + Days stepper (2–30), with the end date shown;
   - Daily target: STATIC shows no grid, DYNAMIC shows the day-by-day grid;
   - Winner and Prizes are unchanged;
   - Review shows Type, Start (midnight), Daily target.
3. **Server errors:** a 400 from create (days, winners, past date, target) shows the server's message.
4. **Detail, under target vs done:** the Today card shows "N more to stay in" vs green "Done for today".
5. **Detail, results pending:** the Today card shows "Results in about an hour", and the next day's target.
6. **Out / finished / no winner:** the correct Today note, CTA, member sections and Winners card.
7. **Steps challenge:** step units everywhere; no Record button; "Steps count automatically".
8. **Approval:** Request to join → Request sent → Requested + Cancel → Cancel works. The creator sees the Join requests card, and Approve / Reject update the count. The empty queue shows "No pending requests".
9. **Elimination joining:** closed after day 1, for both the viewer CTA and the creator's Join requests entry.
10. **Feature gate:** old app versions never see elimination challenges.
11. **Pop-ups:** each result pop-up shows once per finalized day.
12. **Theme:** light and dark both work, and no old-concept copy appears anywhere.

If anything in the design is unclear or conflicts with the contract or your codebase, **ask before assuming**.
