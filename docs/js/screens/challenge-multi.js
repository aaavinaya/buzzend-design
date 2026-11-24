/* Challenge Detail — MULTI-WORKOUT and FULL BODY challenges, Standard and Elimination
   (design brief 2026-11-04 "Multi-workout and Full Body challenges").

   The same page as a classic / elimination challenge — hero, info grid, prizes, CTA + chat,
   Leaderboard / Posts tabs, cards and spacing — plus, for these kinds:
     · badges in the hero: "Multi · 3 workouts" or "Full Body", and "Elimination";
     · "How it works" — an inline link after the description that opens a bottom sheet with this
       challenge's rule in plain lines (same as the Elimination page);
     · a "How it's done" card — the workouts in order (Multi) or the routine at its level (Full Body),
       each row opens the existing exercise demo;
     · Multi Standard:      Overall (points, lowest leads) + one board per workout, my row pinned;
     · Multi Elimination:   a checklist Today card (one line per workout + Start) and still in / out
                            ("Out on day 2 · missed push-ups"), with a day picker;
     · Full Body Standard:  my card (total, place, gap to the next place);
     · Full Body Elimination: Today card (not finished / stopped partway / done (Medium));
     · tap a member → member stats sheet; winners show the number that decided the order;
     · result pop-ups (made it / out — with the missed workout — / won / finished).
   Wording: levels are Easy / Medium / Hard; Full Body is a "session" / "finish the routine" (never "run");
   "reps" everywhere, "points" only on the Multi Standard overall board.
   Reuses cd-* / cd7-* / el-* styles (challenge-detail.css); new pieces are mw-*. */
window.CMulti = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, grad = S.grad;
  const W = (k, s, fam) => window.Icons.workout(k, s, fam || "real");
  const num = (n) => n.toLocaleString("en-US");
  const AVS = S.PEOPLE.slice(1).map((p) => p.av);
  const NAMES = ["Asha Shah", "Ravi Gurung", "Sita Sharma", "Kiran Joshi", "Anita Rai", "Maya Karki", "Lauren Basnet", "Drake Thapa",
    "Joseph Malan", "Priya Lama", "Sam Shah", "Om Joshi"];
  const EXN = { squat: ["Squats", "squat", "squats"], pushup: ["Push-ups", "pushup", "push-ups"], burpee: ["Burpees", "burpee", "burpees"],
    jumping: ["Jumping Jacks", "jumping", "jumping jacks"], highknee: ["High Knees", "high-knee", "high knees"] };
  const exN = (k) => EXN[k][0], exI = (k) => EXN[k][1], exL = (k) => EXN[k][2];

  // ── the two challenges this canvas draws ──
  const MULTI = { kind: "MULTI", title: "14-Day Leg & Push Mix", by: "Adesh Pokhrel", byAv: "#9bb7c9,#5e7d99",
    cover: "linear-gradient(135deg,#7a3a1a,#e0922a)", vis: "Public", approval: true, range: "1–14 Nov", days: 14, winnerCount: 3,
    prizes: ["Rs. 5,000 cash", "Buzzend hoodie", "1-month Pro"],
    workouts: [{ k: "squat", t: 20 }, { k: "pushup", t: 15 }, { k: "burpee", t: 10 }],
    desc: "Squats, push-ups and burpees. Show up for all three." };
  const FB = { kind: "FULL_BODY", title: "Penta Week", by: "Sita Rai", byAv: "#a6c9b5,#5e996f",
    cover: "linear-gradient(135deg,#3a2a6a,#2F80ED)", vis: "Public", approval: true, range: "3–9 Nov", days: 7, winnerCount: 3,
    prizes: ["Rs. 3,000 cash", "Buzzend hoodie", "Water bottle"],
    routine: "Penta · Ultimate", level: "Medium",
    steps: [["jumping", 40], ["highknee", 40], ["squat", 30], ["pushup", 20], ["burpee", 15]],
    desc: "Finish the Penta routine every day for a week." };
  const fbReps = () => FB.steps.reduce((a, x) => a + x[1], 0);   // reps in one full session (145)

  /* states — the switcher on challenge-detail.html (`?v=…`) */
  const STATES = {
    // Multi-workout · Standard
    mStd:      { c: "MULTI", elim: false, phase: "RUNNING", day: 5, me: { place: 4 } },
    mStd0:     { c: "MULTI", elim: false, phase: "RUNNING", day: 1, nobody: true, me: { place: null } },
    mStdEnd:   { c: "MULTI", elim: false, phase: "FINISHED", day: 14, me: { place: 2 } },
    // Multi-workout · Elimination
    mEl:       { c: "MULTI", elim: true, phase: "RUNNING", day: 3, me: { status: "ACTIVE", today: { squat: 14, pushup: 15, burpee: 0 } } },
    mElSafe:   { c: "MULTI", elim: true, phase: "RUNNING", day: 3, me: { status: "ACTIVE", today: { squat: 22, pushup: 15, burpee: 10 } } },
    mElOut:    { c: "MULTI", elim: true, phase: "RUNNING", day: 4, me: { status: "OUT", outDay: 3, missed: "pushup", lasted: 2, total: 96 } },
    mElClosed: { c: "MULTI", elim: true, phase: "RUNNING", day: 3, me: null },
    mElEnd:    { c: "MULTI", elim: true, phase: "FINISHED", day: 14, me: { status: "FINISHED", place: 2 } },
    // Full Body · Standard
    fStd:      { c: "FULL_BODY", elim: false, phase: "RUNNING", day: 4, me: { total: 398 } },
    fStd0:     { c: "FULL_BODY", elim: false, phase: "RUNNING", day: 2, me: { total: 0 } },
    fStdUp:    { c: "FULL_BODY", elim: false, phase: "NOT_STARTED", startsIn: "2d 4h", me: null },
    fStdFull:  { c: "FULL_BODY", elim: false, phase: "RUNNING", day: 2, full: true, me: null },
    // Full Body · Elimination
    fEl:       { c: "FULL_BODY", elim: true, phase: "RUNNING", day: 3, me: { status: "ACTIVE", session: "none" } },
    fElStop:   { c: "FULL_BODY", elim: true, phase: "RUNNING", day: 3, me: { status: "ACTIVE", session: "stopped", stoppedAt: "pushup" } },
    fElDone:   { c: "FULL_BODY", elim: true, phase: "RUNNING", day: 3, me: { status: "ACTIVE", session: "done", doneLevel: "Medium" } },
    fElOut:    { c: "FULL_BODY", elim: true, phase: "RUNNING", day: 4, me: { status: "OUT", outDay: 3, lasted: 2, total: 290 } },
    fElEnd:    { c: "FULL_BODY", elim: true, phase: "FINISHED", day: 7, me: { status: "WINNER", place: 1 } },
  };
  let st, C, root, tab = "board", sub = "overall", dayView = "live", role = "viewer";
  const isM = () => C.kind === "MULTI";
  const people = () => NAMES.map((n, i) => ({ name: n, av: AVS[i % AVS.length], id: i }));
  const ME = () => ({ name: "You", av: S.ME.av, me: true, id: "me" });

  /* ── Multi Standard board: each workout ranks on its own; points = sum of places, lowest leads ── */
  function multiStd() {
    const P = people().slice(0, 9).concat(ME());
    P.forEach((p, i) => {
      const z = st.nobody;
      p.reps = { squat: z ? 0 : 260 - i * 15 + (i % 3) * 22, pushup: z ? 0 : 180 - ((i * 7) % 9) * 14, burpee: z ? 0 : 110 - ((i * 5) % 8) * 9 };
    });
    MULTI.workouts.forEach(({ k }) => {
      [...P].sort((a, b) => b.reps[k] - a.reps[k]).forEach((p, i, arr) => { p.pl = p.pl || {}; p.pl[k] = i && arr[i - 1].reps[k] === p.reps[k] ? arr[i - 1].pl[k] : i + 1; });
    });
    P.forEach((p) => { p.points = MULTI.workouts.reduce((a, w) => a + p.pl[w.k], 0); p.total = MULTI.workouts.reduce((a, w) => a + p.reps[w.k], 0); });
    P.sort((a, b) => a.points - b.points || b.total - a.total).forEach((p, i) => { p.place = i + 1; });
    return P;
  }
  /* ── Multi Elimination: still in (combined reps, today's checklist) / out (day + missed workout) ── */
  function multiEl() {
    const P = people(), still = [], out = [];
    const ended = st.phase === "FINISHED";
    for (let i = 0; i < (ended ? 5 : 8); i++) {
      const today = {}; MULTI.workouts.forEach((w, j) => { today[w.k] = i < 4 ? w.t + (i % 2) * 3 : j < 2 ? w.t : Math.round(w.t * 0.4); });
      still.push({ ...P[i], total: 420 - i * 23, today });
    }
    if (st.me && st.me.status === "ACTIVE") still[5] = { ...still[5], ...ME(), total: 301, today: st.me.today };
    if (st.me && st.me.status === "FINISHED") still[1] = { ...still[1], ...ME() };
    still.sort((a, b) => b.total - a.total).forEach((r, i) => { r.place = i + 1; });
    const missed = ["pushup", "burpee", "pushup", "squat"];
    for (let i = 0; i < (ended ? 7 : 4); i++) out.push({ ...P[(ended ? 5 : 8) + i] || P[i], name: NAMES[((ended ? 5 : 8) + i) % 12], total: 140 - i * 22, outDay: Math.max(1, (st.day - 1) - (i % 3)), missed: missed[i % 4] });
    if (st.me && st.me.status === "OUT") out.unshift({ ...ME(), total: st.me.total, outDay: st.me.outDay, missed: st.me.missed });
    return { still, out };
  }
  /* ── Full Body boards: total reps (Standard) / still in + out (Elimination) ── */
  function fbBoard() {
    const P = people(), ended = st.phase === "FINISHED";
    const still = [], out = [];
    const n = st.elim ? (ended ? 5 : 8) : 10;
    for (let i = 0; i < n; i++) still.push({ ...P[i], total: st.fStd0 ? 0 : 560 - i * 34 + (i % 2) * 12, session: i < 5 ? "done" : i === 5 ? "stopped" : "none" });
    if (st.me && st.me.total != null && !st.elim) { still[3] = { ...still[3], ...ME(), total: st.me.total }; }
    if (st.me && st.me.status === "ACTIVE") still[4] = { ...still[4], ...ME(), total: 435, session: st.me.session };
    if (st.me && st.me.status === "WINNER") still[0] = { ...still[0], ...ME(), total: 1015 };
    still.sort((a, b) => b.total - a.total).forEach((r, i) => { r.place = i + 1; });
    if (st.elim) for (let i = 0; i < (ended ? 7 : 4); i++) out.push({ ...P[n + i] || P[i], name: NAMES[(n + i) % 12], total: 260 - i * 31, outDay: Math.max(1, st.day - 1 - (i % 2)) });
    if (st.me && st.me.status === "OUT") out.unshift({ ...ME(), total: st.me.total, outDay: st.me.outDay });
    return { still, out };
  }

  // ── pieces ──
  const badge = () => {
    const s = st.phase === "NOT_STARTED" ? ["upcoming", "Upcoming"] : st.phase === "FINISHED" ? ["ended", "Ended"] : ["active", "Active"];
    return `<span class="cd-badge ${s[0]}">${s[1]}</span>`;
  };
  const kindTag = () => isM() ? `<span class="el-tag">${I("grid", 12)} Multi · ${MULTI.workouts.length} workouts</span>` : `<span class="el-tag">${I("activity", 12)} Full Body</span>`;
  const cell = (ic, k, v) => `<div class="cd7-cell"><div class="ic">${ic.startsWith("<") ? ic : I(ic, 17)}</div><div style="min-width:0"><div class="k">${k}</div><div class="val">${v}</div></div></div>`;
  const stillCount = () => isM() ? (st.phase === "FINISHED" ? 5 : 8) : (st.phase === "FINISHED" ? 5 : 8);
  // the private limit ("x / 10") is shown to the challenge's admin only; everyone else sees a plain count
  const members = () => st.full ? (role === "creator" ? "10 / 10" : "10") : "12";
  function grid() {
    const daysLeft = st.phase === "NOT_STARTED" ? ["Starts in", st.startsIn] : st.phase === "FINISHED" ? ["Ran for", C.days + " days"] : ["Days left", C.days - st.day + 1];
    if (st.elim && st.phase === "RUNNING") {
      return `<div class="cd7-grid">${cell("calendar", "Day", `${st.day} of ${C.days}`)}${cell("users", "Still in", `${stillCount()} of 12`)}${cell("clock", "Ends in", "5h 20m")}${isM()
        ? cell("grid", "Workouts", MULTI.workouts.length) : cell("activity", "Level", FB.level)}</div>`;
    }
    if (isM()) return `<div class="cd7-grid">${cell("grid", "Workouts", MULTI.workouts.map((w) => exN(w.k)).join(", "))}${cell("calendar", "Dates", C.range)}${cell("users", "Members", members())}${cell("clock", daysLeft[0], daysLeft[1])}</div>`;
    return `<div class="cd7-grid">${cell("activity", "Routine", FB.routine)}${cell("target", "Level", FB.level)}${cell("users", "Members", members())}${cell("clock", daysLeft[0], daysLeft[1])}</div>`;
  }
  // How it works — this challenge's rule in plain words
  function rules() {
    const W = C.winnerCount, top = `The top ${W} win.`;
    if (isM() && !st.elim) return ["Each workout has its own leaderboard.", "Your places on all of them are added up into points, and the lowest points lead.", top];
    if (isM()) return [`Every day: ${MULTI.workouts.map((w) => `${w.t} ${exL(w.k)}`).join(" + ")}. Miss any one and you're out.`, `Everyone still in at the end is ranked by combined reps. ${top}`];
    if (!st.elim) return [`Every rep counts, even if you don't finish the routine. Only sessions on ${FB.level} count.`, `Ranked by total reps. ${top}`];
    return [`Each day, finish ${FB.routine} once on ${FB.level} or harder. Miss a day and you're out.`, `Everyone still in at the end is ranked by total reps. ${top}`];
  }
  /* "How it works" — opened from the inline link at the end of the description, as on the Elimination page */
  function help() {
    const ic = isM() ? ["grid", "trophy", "clock"] : ["activity", "trophy", "clock"];
    const extra = st.elim ? "Joining closes when the challenge starts. Each day ends at the challenge's deadline, and we'll remind you 4 hours and 1 hour before it."
      : "A tie goes to whoever got there first.";
    window.Buzzend.sheet({ title: "How it works", html: `<div class="el-help-list">
      ${rules().map((t, i) => `<div>${I(ic[i] || "check", 16)}<span>${t}</span></div>`).join("")}
      <div>${I("clock", 16)}<span>${extra}</span></div></div>` });
  }
  // How it's done — the workouts in order, or the routine at its level; each row opens the exercise demo
  function doneCard() {
    if (isM()) return `<div class="mw-card"><div class="mw-card-h">${I("play", 15)} How it's done<span>Tap one to watch the demo</span></div>
      ${MULTI.workouts.map((w, i) => `<button class="mw-ex" onclick="CMulti.demo('${w.k}')"><span class="n">${i + 1}</span><span class="ic">${W(exI(w.k), 26)}</span>
        <span class="tx">${exN(w.k)}</span>${st.elim ? `<span class="t">${w.t} a day</span>` : ""}<span class="chev">${I("chevron", 16)}</span></button>`).join("")}</div>`;
    return `<div class="mw-card"><div class="mw-card-h">${I("play", 15)} How it's done<span>${FB.routine} · ${FB.level} · 1 round</span></div>
      ${FB.steps.map(([k, r], i) => `<button class="mw-ex" onclick="CMulti.demo('${k}')"><span class="n">${i + 1}</span><span class="ic">${W(exI(k), 26)}</span>
        <span class="tx">${exN(k)}</span><span class="t">${r} reps</span><span class="chev">${I("chevron", 16)}</span></button>`).join("")}
      <div class="mw-foot">${fbReps()} reps in one full session</div></div>`;
  }

  /* Today card — Elimination members while it runs */
  function todayCard() {
    const m = st.me;
    if (!st.elim || st.phase !== "RUNNING" || !m) return "";
    if (m.status === "OUT") return `<div class="el-today out"><div class="el-out-ic">${I("flag", 18)}</div>
      <div><b>You're out</b><span>Lasted ${m.lasted} days · ${num(m.total)} reps · ${isM() ? `missed ${exL(m.missed)} on day ${m.outDay}` : `didn't finish on day ${m.outDay}`}</span></div></div>`;
    const head = `<div class="el-today-h"><span>Today · Day ${st.day} of ${C.days}</span><span>${I("clock", 13)} 5h 20m left</span></div>`;
    if (isM()) {
      const left = MULTI.workouts.filter((w) => (m.today[w.k] || 0) < w.t).length;
      const lines = MULTI.workouts.map((w) => { const v = m.today[w.k] || 0, ok = v >= w.t, pct = Math.min(100, Math.round(v / w.t * 100));
        return `<div class="mw-chk${ok ? " ok" : ""}"><span class="ic">${W(exI(w.k), 24)}</span>
          <span class="mw-chk-m"><span class="l"><b>${exN(w.k)}</b><span>${v} / ${w.t}</span></span><span class="el-bar"><i style="width:${pct}%"></i></span></span>
          ${ok ? `<span class="mw-ok">${I("check", 16)}</span>` : `<button class="mw-go" onclick="CMulti.go('${w.k}')">Start</button>`}</div>`; }).join("");
      return `<div class="el-today mw-today${left ? "" : " ok"}">${head}
        <div class="mw-status${left ? "" : " ok"}">${left ? `${I("target", 15)} ${left} workout${left > 1 ? "s" : ""} left` : `${I("check", 15)} Safe for today`}</div>
        ${lines}<div class="el-today-f"><span>${left ? "Finish every workout to stay in." : "Come back tomorrow — same targets."}</span></div></div>`;
    }
    if (m.session === "done") return `<div class="el-today ok">${head}
      <div class="mw-fbstate">${I("check", 20)}<b>Done for today (${m.doneLevel})</b></div>
      <div class="el-today-f"><span class="ok">${I("check", 14)} You're through to tomorrow</span><span>${fbReps()} reps today</span></div></div>`;
    if (m.session === "stopped") return `<div class="el-today">${head}
      <div class="mw-fbstate warn">${I("alert", 20)}<b>You stopped at ${exL(m.stoppedAt)}. Finish one full routine to stay in.</b></div>
      ${progressDots(3)}<div class="el-today-f"><span>Reps still count toward your total.</span></div></div>`;
    return `<div class="el-today">${head}
      <div class="mw-fbstate">${I("activity", 20)}<b>Not finished today · 5h 20m left</b></div>
      ${progressDots(0)}<div class="el-today-f"><span>Finish ${FB.routine} on ${FB.level} once.</span></div></div>`;
  }
  const progressDots = (done) => `<div class="mw-dots">${FB.steps.map(([k], i) => `<span class="${i < done ? "on" : ""}">${W(exI(k), 18, "outlined")}</span>`).join("")}</div>`;
  // Full Body Standard: banner + my card (total, place, gap to the next place)
  function fbStdTop() {
    if (isM() || st.elim || st.phase === "NOT_STARTED") return "";
    const banner = "";   // the rule lives in the "How it works" sheet, not as a banner on the page
    if (!st.me || st.phase === "FINISHED") return banner;
    const B = fbBoard().still, me = B.find((r) => r.me);
    if (!me.total) return banner + `<div class="mw-mine"><div><b>0</b><span>reps</span></div><div class="t"><b>You haven't started yet</b><span>Start a session — every rep counts.</span></div></div>`;
    const ahead = B[me.place - 2];
    return banner + `<div class="mw-mine"><div><b>${num(me.total)}</b><span>reps</span></div><div><b>#${me.place}</b><span>of ${B.length}</span></div>
      <div class="t"><b>${ahead ? `${num(ahead.total - me.total)} reps behind #${me.place - 1}` : "You're leading!"}</b><span>${ahead ? `Catch ${ahead.name.split(" ")[0]}` : "Keep it up"}</span></div></div>`;
  }

  function prizes() {
    const tier = ["1st place", "2nd place", "3rd place"], cls = ["gold", "silver", "bronze"];
    return `<div class="cd7-prizes"><div class="cd7-sec"><span>${I("trophy", 15)} Prizes</span><span class="r">Top ${C.prizes.length} win</span></div>
      ${C.prizes.map((p, i) => `<div class="cd7-prow"><span class="cd7-rk ${cls[i]}">${i + 1}</span><div class="cd7-ptx"><span class="cd7-tier">${tier[i]}</span><span class="cd7-prize">${p}</span></div></div>`).join("")}</div>`;
  }
  // winners: the existing block, showing the number that decided the order
  function winnersBlock() {
    let w, unit;
    if (isM() && !st.elim) { w = multiStd().slice(0, 3).map((r) => ({ ...r, v: `${r.points} points` })); unit = "points"; }
    else if (isM()) { w = multiEl().still.slice(0, 3).map((r) => ({ ...r, v: `${num(r.total)} combined reps` })); }
    else { w = fbBoard().still.slice(0, 3).map((r) => ({ ...r, v: `${num(r.total)} total reps` })); }
    const cls = ["gold", "silver", "bronze"], champ = w[0];
    return `<div class="cd7-winners"><div class="cd7-win-top">${I("trophy", 16)} Winners<span>Challenge complete</span></div>
      <div class="cd7-champ"><div class="cd7-champ-av" style="background-image:${grad(champ.av)}"><span class="cd7-champ-badge">${I("trophy", 15)}</span></div>
        <div class="cd7-champ-nm">${champ.name}</div><div class="cd7-champ-meta">Champion · ${champ.v}</div>
        <div class="cd7-champ-prize">${I("medal", 14)} <span>${C.prizes[0]}</span></div></div>
      ${w.slice(1).map((b, k) => `<div class="cd7-ru"><span class="cd7-rk ${cls[k + 1]}">${k + 2}</span><div class="cd7-wav" style="background-image:${grad(b.av)}"></div>
        <div class="cd7-ru-tx"><div class="top"><b>${b.name}</b><span class="rp">${b.v}</span></div><div class="cd7-ru-prize">${I("medal", 12)} ${C.prizes[k + 1]}</div></div></div>`).join("")}</div>`;
  }

  function cta() {
    const m = st.me, chat = `<button class="cd-chatbtn" onclick="CMulti.toast('chat')">${I("comment", 20)}<span class="bdg">3</span></button>`;
    if (st.phase === "FINISHED") return `<button class="cd-primary" disabled>Challenge ended</button>`;
    if (!m) {
      if (st.elim && st.phase !== "NOT_STARTED") return `<button class="cd-primary" disabled>${I("lock", 16)} Joining closed</button>`;
      if (role === "requested") return `<button class="cd-primary" disabled>Requested — waiting for approval</button><button class="cd-cancelreq" onclick="CMulti.cancelRequest()">Cancel</button>`;
      return `<button class="cd-primary" onclick="CMulti.join()">${C.approval ? "Request to join" : "Join Challenge"}</button>`;
    }
    if (m.status === "OUT") return `<button class="cd-primary" disabled>You're out · great effort!</button>${chat}`;
    if (isM()) return `<button class="cd-primary" onclick="CMulti.pickWorkout()">${I("camera", 18)} Start a workout</button>${chat}`;
    return `<button class="cd-primary" onclick="CMulti.go()">${I("camera", 18)} Start ${FB.routine} (${FB.level})</button>${chat}`;
  }
  const ctaNote = () => !st.me && st.elim && st.phase === "NOT_STARTED" ? `<div class="el-ctanote">Joining closes when the challenge starts.</div>` : "";

  // ── Leaderboard ──
  const sec = (t, n) => `<div class="el-sec">${t}<span>${n}</span></div>`;
  function row(r, opts) {
    opts = opts || {};
    return `<div class="cd-m${r.me ? " el-me" : ""}${opts.muted ? " el-muted" : ""}" onclick="CMulti.stats('${r.id}')">
      <span class="rk">${opts.noRank ? "" : r.place || ""}</span><div class="av" style="background-image:${grad(r.av)}">${opts.medal ? `<span class="medal">${["🥇", "🥈", "🥉"][r.place - 1] || ""}</span>` : ""}</div>
      <span class="nm el-nm"><span>${r.name}${r.me ? '<span class="you">YOU</span>' : ""}</span>${opts.sub ? `<span class="el-msub${opts.subOk ? " ok" : ""}">${opts.sub}</span>` : ""}</span>
      ${opts.right || `<span class="reps"><span class="z">${I("zap", 13)}</span>${num(r.total)} <small>reps</small></span>`}</div>`;
  }
  function boardView() {
    if (st.phase === "NOT_STARTED") return `<div class="cd-empty">${I("trophy", 32)}<div class="t">The leaderboard opens when the challenge starts</div><div class="d">12 people have joined so far.</div></div>`;
    if (isM() && !st.elim) return multiStdBoard();
    if (isM()) return multiElBoard();
    return fbBoardView();
  }
  function multiStdBoard() {
    const P = multiStd(), ws = MULTI.workouts;
    const tabs = `<div class="mw-tabs"><button class="${sub === "overall" ? "on" : ""}" onclick="CMulti.sub('overall')">Overall</button>${ws.map((w) => `<button class="${sub === w.k ? "on" : ""}" onclick="CMulti.sub('${w.k}')">${exN(w.k)}</button>`).join("")}</div>`;
    if (st.nobody) return tabs + `<div class="cd-empty">${I("trophy", 30)}<div class="t">Nobody has started yet</div><div class="d">Places start counting with the first workout. Be the first on the board.</div></div>`
      + P.slice(0, 4).map((r) => row(r, { noRank: true, sub: "No reps yet", right: `<span class="mw-pts muted">—</span>` })).join("");
    let rows;
    if (sub === "overall") {
      rows = `<div class="mw-ptsh">Ranked by points <button class="mw-tip" onclick="CMulti.tip()" aria-label="What are points?">${I("info", 14)}</button><span>Lowest leads</span></div>`
        + P.map((r) => row(r, { medal: st.phase === "FINISHED" && r.place <= 3, sub: ws.map((w) => `${exN(w.k)} #${r.pl[w.k]}`).join(" · "),
          right: `<span class="mw-pts"><b>${r.points}</b><small>pts</small><em>${num(r.total)} reps</em></span>` })).join("");
    } else {
      const sorted = [...P].sort((a, b) => b.reps[sub] - a.reps[sub]);
      rows = sorted.map((r) => row({ ...r, place: r.pl[sub], total: r.reps[sub] })).join("");
    }
    // my row is pinned: it sticks to the bottom (or top) of the screen while it's scrolled out of view
    return tabs + rows.replace('class="cd-m el-me', 'class="cd-m el-me mw-stick') + `<div style="height:14px"></div>`;
  }
  function dayChips() {
    if (st.phase !== "RUNNING") return "";
    const past = Array.from({ length: Math.min(2, st.day - 1) }, (_, i) => st.day - 1 - i);
    return `<div class="mw-tabs"><button class="${dayView === "live" ? "on" : ""}" onclick="CMulti.day('live')">Live</button>${past.map((d) => `<button class="${dayView === d ? "on" : ""}" onclick="CMulti.day(${d})">Day ${d}</button>`).join("")}</div>`;
  }
  function multiElBoard() {
    const { still, out } = multiEl(), ended = st.phase === "FINISHED";
    const doneN = (r) => MULTI.workouts.filter((w) => (r.today[w.k] || 0) >= w.t).length;
    if (dayView !== "live") return dayChips() + still.map((r) => row(r, { sub: "Made it", subOk: true })).join("")
      + sec("Out on day " + dayView, 2) + out.slice(0, 2).map((r) => row(r, { noRank: true, muted: true, sub: `Missed ${exL(r.missed)}` })).join("") + `<div style="height:14px"></div>`;
    return dayChips() + (ended ? sec("Winners & finished", still.length) : sec("Still in", still.length) + `<div class="el-sechint">Ranked by combined reps</div>`)
      + still.map((r) => row(r, { medal: ended && r.place <= 3, sub: ended ? null : doneN(r) === MULTI.workouts.length ? "Safe for today ✓" : `Today ${doneN(r)} / ${MULTI.workouts.length} done`, subOk: !ended && doneN(r) === MULTI.workouts.length })).join("")
      + sec("Out", out.length) + out.map((r) => row(r, { noRank: true, muted: true, sub: `Out on day ${r.outDay} · missed ${exL(r.missed)}` })).join("") + `<div style="height:14px"></div>`;
  }
  function fbBoardView() {
    const { still, out } = fbBoard(), ended = st.phase === "FINISHED";
    if (!st.elim) return `<div class="el-sechint" style="padding-top:12px">Ranked by total reps · only ${FB.level} sessions count</div>`
      + still.map((r) => row(r, { medal: ended && r.place <= 3 })).join("") + `<div style="height:14px"></div>`;
    const sub = (r) => r.session === "done" ? ["Done today ✓", true] : r.session === "stopped" ? ["Stopped partway today", false] : ["Not finished today", false];
    if (dayView !== "live") return dayChips() + still.map((r) => row(r, { sub: "Finished the routine", subOk: true })).join("")
      + sec("Out on day " + dayView, 2) + out.slice(0, 2).map((r) => row(r, { noRank: true, muted: true, sub: "Didn't finish" })).join("") + `<div style="height:14px"></div>`;
    return dayChips() + (ended ? sec("Winners & finished", still.length) : sec("Still in", still.length) + `<div class="el-sechint">Ranked by total reps</div>`)
      + still.map((r) => row(r, { medal: ended && r.place <= 3, sub: ended ? null : sub(r)[0], subOk: !ended && sub(r)[1] })).join("")
      + sec("Out", out.length) + out.map((r) => row(r, { noRank: true, muted: true, sub: `Out on day ${r.outDay}` })).join("") + `<div style="height:14px"></div>`;
  }
  const postsView = () => `<div class="cd-empty">${I("play", 32)}<div class="t">No posts yet</div><div class="d">Clips from this challenge will show up here.</div></div>`;

  function render() {
    root.innerHTML = `<div class="cd7-hero"><div class="img" style="background:${C.cover}"></div><div class="scrim"></div>
        <div class="cd7-fabs"><button class="cd-fab back" onclick="location.href='challenges.html'">${I("back", 20)}</button><button class="cd-fab more" onclick="CMulti.toast('menu')">⋯</button></div>
        <div class="mw-tags">${kindTag()}${st.elim ? `<span class="el-tag">${I("target", 12)} Elimination</span>` : ""}</div>
        <div class="h1">${C.title}</div>
        <div class="cr"><div class="av" style="background-image:${grad(C.byAv)}"></div>by ${C.by} ${badge()}</div></div>
      ${st.phase === "FINISHED" ? winnersBlock() : ""}
      ${grid()}
      ${todayCard()}${fbStdTop()}
      ${doneCard()}
      <div class="cd-about"><div class="cd-about-meta"><span>${I("calendar", 13)} ${C.range}</span><span>${I(C.vis === "Public" ? "users" : "lock", 13)} ${st.full ? "Private" : C.vis}</span><span>${I("shield", 13)} ${C.approval ? "Approval required" : "Open to join"}</span></div>
        <div class="cd-desc2">${C.desc} <button class="el-link" onclick="CMulti.help()">${I("info", 14)} How it works</button></div></div>
      ${st.phase !== "FINISHED" ? prizes() : ""}
      <div class="cd7-cta">${cta()}</div>${ctaNote()}
      <div class="cd-tabs"><div class="cd-tab ${tab === "board" ? "on" : ""}" onclick="CMulti.tab('board')">Leaderboard</div><div class="cd-tab ${tab === "posts" ? "on" : ""}" onclick="CMulti.tab('posts')">Posts</div></div>
      <div class="cd-sub">${tab === "posts" ? postsView() : boardView()}</div>`;
    window.Icons.init(root);
  }

  // ── member stats (tap a member) ──
  function stats(id) {
    const P = people(), p = id === "me" ? ME() : P[+id] || P[0];
    const bars = (vals, max) => `<div class="mw-bars">${vals.map((v, i) => `<span><i style="height:${Math.max(4, Math.round(v / max * 48))}px"></i><em>D${i + 1}</em></span>`).join("")}</div>`;
    const days = Math.min(7, st.phase === "FINISHED" ? 7 : st.day || 1);
    let html;
    if (isM()) {
      const blocks = MULTI.workouts.map((w, j) => { const d = Array.from({ length: days }, (_, i) => w.t + ((i * 7 + j * 3) % 9));
        return `<div class="mw-sblock"><div class="mw-sblock-h">${W(exI(w.k), 24)}<b>${exN(w.k)}</b><span class="pl">#${1 + ((j + 2) % 4)}</span><span class="tot">${num(d.reduce((a, b) => a + b, 0))} reps</span></div>${bars(d, w.t + 9)}</div>`; }).join("");
      html = `<div class="mw-shead"><span class="av" style="background-image:${grad(p.av)}"></span><b>${p.name}</b></div>
        <div class="mw-stot"><b>${num(306 + (p.id === "me" ? 0 : 40))}</b><span>combined reps</span></div>${blocks}`;
    } else {
      const d = Array.from({ length: days }, (_, i) => i === days - 1 ? 92 : fbReps() + (i % 2) * 10);
      const ses = d.map((v, i) => ({ day: days - i, v: d[days - 1 - i], fin: days - 1 - i !== days - 1 })).slice(0, 4);
      html = `<div class="mw-shead"><span class="av" style="background-image:${grad(p.av)}"></span><b>${p.name}</b></div>
        <div class="mw-stot"><b>${num(d.reduce((a, b) => a + b, 0))}</b><span>total reps</span></div>
        <div class="mw-sblock"><div class="mw-sblock-h"><b>Reps per day</b></div>${bars(d, fbReps() + 20)}</div>
        <div class="mw-sblock"><div class="mw-sblock-h"><b>Sessions</b></div>
          ${ses.map((x) => `<div class="mw-ses"><span>Day ${x.day}</span><span class="lv">${FB.level}</span><span class="${x.fin ? "ok" : "stop"}">${x.fin ? I("check", 12) + " Finished" : "Stopped early"}</span><b>${x.v} reps</b></div>`).join("")}</div>`;
    }
    window.Buzzend.sheet({ html: `<div class="mw-stats">${html}</div>` });
  }

  // ── result pop-ups (shown once, on the first open after a day's results) ──
  function moment(kind) {
    const stat = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
    const btn = (t) => `<button class="cd-primary" onclick="Buzzend.closeTop()">${t}</button>`;
    const html = {
      mMade: `<div class="el-mo"><div class="el-mo-ic safe">${I("check", 30)}</div><div class="t">Day 3 done!</div>
        <div class="d">Same targets tomorrow: <b>20 squats + 15 push-ups + 10 burpees</b>.</div><div class="el-mo-st">${stat(3, "days survived")}${stat(171, "combined reps")}</div>${btn("Got it")}</div>`,
      mOut: `<div class="el-mo"><div class="el-mo-ic out">${I("flag", 30)}</div><div class="t">You missed push-ups yesterday</div>
        <div class="d">You did 9 of 15, so you're out. Great effort!</div><div class="el-mo-st">${stat(2, "days survived")}${stat(96, "combined reps")}</div>${btn("View challenge")}</div>`,
      fMade: `<div class="el-mo"><div class="el-mo-ic safe">${I("check", 30)}</div><div class="t">Day 3 done!</div>
        <div class="d">Tomorrow: finish <b>${FB.routine}</b> on <b>${FB.level}</b> (or Hard) again.</div><div class="el-mo-st">${stat(3, "days survived")}${stat(435, "total reps")}</div>${btn("Got it")}</div>`,
      fOut: `<div class="el-mo"><div class="el-mo-ic out">${I("flag", 30)}</div><div class="t">You didn't finish the routine yesterday</div>
        <div class="d">You're out. Great effort!</div><div class="el-mo-st">${stat(2, "days survived")}${stat(290, "total reps")}</div>${btn("View challenge")}</div>`,
      won: `<div class="el-mo"><div class="el-mo-ic gold">${I("trophy", 30)}</div><div class="t">You won! 1st place</div>
        <div class="d">Prize: <b>${FB.prizes[0]}</b></div><div class="el-mo-st">${stat(num(1015), "total reps")}</div>${btn("View challenge")}</div>`,
      finished: `<div class="el-mo"><div class="el-mo-ic safe">${I("medal", 30)}</div><div class="t">You made it to the end!</div>
        <div class="d">You finished <b>2nd</b> on points.</div><div class="el-mo-st">${stat(7, "points")}${stat(504, "combined reps")}</div>${btn("View challenge")}</div>`,
    }[kind];
    window.Buzzend.sheet({ html });
  }
  function pickWorkout() {   // Multi: "Start a workout" → pick which one (with today's progress in Elimination)
    const m = st.me;
    window.Buzzend.sheet({ title: "Start a workout", html: `<div class="mw-pick">${MULTI.workouts.map((w, i) => { const v = st.elim && m.today ? m.today[w.k] || 0 : null;
      return `<button class="mw-ex" onclick="Buzzend.closeTop();CMulti.go('${w.k}')"><span class="n">${i + 1}</span><span class="ic">${W(exI(w.k), 26)}</span><span class="tx">${exN(w.k)}</span>
        ${v != null ? `<span class="t${v >= w.t ? " ok" : ""}">${v} / ${w.t}</span>` : ""}<span class="chev">${I("chevron", 16)}</span></button>`; }).join("")}</div>` });
  }
  function startW(k) {
    const msg = isM() ? `Opens the AI workout for ${exN(k)}.` : `Opens Full Body set to ${FB.routine} · ${FB.level}${st.elim ? " (Hard is allowed too)" : " (level locked)"}.`;
    window.Buzzend.alert({ icon: "camera", title: isM() ? `Start ${exN(k)}` : `Start ${FB.routine}`, message: msg });
  }
  function toast(k) {
    const m = { chat: ["comment", "Group chat", "Opens the challenge group chat."], menu: ["more", "Menu", "Share · Report · Leave"],
      demo: ["play", "Exercise demo", "Opens the existing exercise demo."] }[k];
    window.Buzzend.alert({ icon: m[0], title: m[1], message: m[2] });
  }
  function join() {
    if (C.approval) { role = "requested"; render(); window.Buzzend.alert({ icon: "send", title: "Request sent", message: "The creator of “" + C.title + "” will review your request to join." }); return; }
    window.Buzzend.alert({ icon: "trophy", title: "You're in!", message: "You joined “" + C.title + "”." });
  }

  function startState(el, state, r) {
    root = el; st = STATES[state] || STATES.mStd; C = st.c === "MULTI" ? MULTI : FB;
    st.fStd0 = state === "fStd0";
    role = r || "viewer"; tab = "board"; sub = "overall"; dayView = "live";
    if (role === "creator" && !st.me && st.phase !== "FINISHED" && !st.full) st = Object.assign({}, st, { me: st.c === "MULTI" ? (st.elim ? { status: "ACTIVE", today: { squat: 0, pushup: 0, burpee: 0 } } : { place: 6 }) : (st.elim ? { status: "ACTIVE", session: "none" } : { total: 0 }) });
    render();
  }
  return {
    start: startState, moment, help, stats, pickWorkout, toast, join,
    cancelRequest() { role = "viewer"; render(); },
    go: startW, demo() { toast("demo"); },
    tip() { window.Buzzend.alert({ icon: "info", title: "Points", message: "Your place on each workout, added up. Lowest leads." }); },
    tab(t) { tab = t; render(); }, sub(s) { sub = s; render(); }, day(d) { dayView = d; render(); },
  };
})();
