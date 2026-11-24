/* Challenge Detail — ELIMINATION (target-based; backend: docs/ELIMINATION_CHALLENGE_APP_GUIDE.md).
   Concept: every day has a TARGET ("30 squats"); all of today's sessions add up. Reach it and
   you stay in; miss it once and you're out. Same target every day (STATIC) or it goes up every
   day (DYNAMIC). Whoever makes it through the last day is ranked by total reps; top 1–3 win.
   It is a CLASSIC challenge page with a few extra pieces — same hero, info grid, prizes,
   Join / Record + chat, Members / Posts tabs, ⋯ menu — plus:
     · an "Elimination" label next to the status badge,
     · the info grid's values (Exercise · Today's target · Still in · Days left),
     · ONE new block, the Today card (members, while running): "12 / 30 squats today",
     · Members tab: still in (with today's progress) → Out; at the end Winners → Finished → Out,
     · "How it works" sheet (the only place with the day-by-day target list),
     · result pop-ups: made it · out · won · finished.
   Reuses cd-* / cd7-* styles from challenge-detail.css; new pieces are el-*. */
window.CElim = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, fmt = S.fmt, grad = S.grad;
  const AVS = S.PEOPLE.slice(1).map((p) => p.av);
  const NAMES = ["Asha Shah", "Ravi Gurung", "Sita Sharma", "Kiran Joshi", "Anita Rai", "Maya Karki", "Lauren Basnet", "Drake Thapa",
    "Joseph Malan", "Priya Lama", "Sam Shah", "Om Joshi"];
  const num = (n) => n.toLocaleString("en-US");

  // ── the two challenges this canvas draws (shape of the challenge + summary response) ──
  const REPS_CH = { title: "7-Day Squat Elimination", ex: "squat", exName: "Squats", unit: "squats", by: "Adesh Pokhrel", byAv: "#9bb7c9,#5e7d99",
    cover: "linear-gradient(135deg,#3a2a6a,#c0436a)", vis: "Public", approval: true, mode: "DYNAMIC", dailyTarget: 20, dailyTargetIncrease: 5,
    totalDays: 7, winnerCount: 3, prizes: ["Rs. 5,000 cash", "Buzzend hoodie", "1-month Pro"],
    desc: "Squats every day for a week. The target goes up by 5 each day. Hit it to stay in." };
  const STEPS_CH = { title: "6K Steps a Day", ex: "steps", exName: "Walking", unit: "steps", by: "Sita Rai", byAv: "#a6c9b5,#5e996f",
    cover: "linear-gradient(135deg,#155e63,#22a39a)", vis: "Public", approval: true, mode: "STATIC", dailyTarget: 6000, dailyTargetIncrease: 0,
    totalDays: 7, winnerCount: 1, prizes: ["Buzzend water bottle"],
    desc: "Walk 6,000 steps every day for a week. Miss a day and you're out." };
  const targetOn = (C, d) => C.dailyTarget + C.dailyTargetIncrease * (d - 1);

  /* states — `me` mirrors the summary's me block (status, todayScore, total, place, outDay).
     `pending` = the previous day has ended and its results are not in yet (≤ ~1 h). */
  const STATES = {
    upcoming:  { phase: "NOT_STARTED", startsIn: "1d 6h", joined: 12, me: null },
    upcomingM: { phase: "NOT_STARTED", startsIn: "1d 6h", joined: 12, me: { status: "ACTIVE", today: 0, total: 0 } },
    under:     { phase: "RUNNING", day: 3, me: { status: "ACTIVE", today: 12, total: 57 } },
    done:      { phase: "RUNNING", day: 3, me: { status: "ACTIVE", today: 32, total: 77 } },
    pending:   { phase: "RUNNING", day: 4, pending: 3, me: { status: "ACTIVE", today: 0, total: 77, lastDay: 31 } },
    out:       { phase: "RUNNING", day: 4, me: { status: "ELIMINATED", outDay: 3, lasted: 2, total: 85 } },   // day 3's result is in → now day 4
    viewer1:   { phase: "RUNNING", day: 1, me: null },
    closed:    { phase: "RUNNING", day: 3, me: null },
    won:       { phase: "FINISHED", day: 7, me: { status: "WINNER", place: 1, total: 312 } },
    finished:  { phase: "FINISHED", day: 7, me: { status: "FINISHED", place: 4, total: 268 } },
    lostEnd:   { phase: "FINISHED", day: 7, me: { status: "ELIMINATED", outDay: 4, lasted: 3, total: 104 } },
    nowinner:  { phase: "FINISHED", day: 7, noWinner: true, me: null },
    steps:     { phase: "RUNNING", day: 3, steps: true, me: { status: "ACTIVE", today: 4200, total: 16400 } },
  };
  let st, C, root, tab = "members", role = "viewer";
  /* "Require approval to join" (ON by default): viewers send a request instead of joining; the creator
     reviews them from the "Join requests" card while joining is open (until the challenge starts). */
  const REQS0 = [
    { id: "r1", name: "Priya Lama", username: "priya.lama", av: "#c9a6a6,#a87766" },
    { id: "r2", name: "Om Joshi", username: "omjoshi", av: "#a6c9b5,#5e996f" },
  ];
  let REQS = REQS0.slice();
  const joiningOpen = () => st.phase === "NOT_STARTED";   // every Elimination challenge closes joining when it starts

  /* Members: 12 joined. Running day 3 → 9 still in, 3 out (day 1, day 2, day 2). Finished →
     3 winners + 2 finished + 7 out. Totals and today's progress are what the list endpoint returns. */
  function members() {
    const T = st.phase === "RUNNING" ? targetOn(C, st.pending || st.day) : 0;
    const steps = !!st.steps, k = steps ? 200 : 1;
    const people = NAMES.map((n, i) => ({ name: n, av: AVS[i % AVS.length] }));
    if (st.phase === "NOT_STARTED") {
      const list = people.slice(0, st.me ? st.joined - 1 : st.joined).map((p) => ({ ...p }));
      if (st.me) list.unshift({ name: "You", av: S.ME.av, me: true });
      return { joined: list };
    }
    if (st.phase === "FINISHED") {
      const fin = [312, 298, 287, 268, 251].map((t, i) => ({ ...people[i], total: t, place: i + 1 }));
      const out = [[104, 4], [96, 4], [77, 3], [70, 3], [44, 2], [41, 2], [18, 1]].map(([t, d], i) => ({ ...people[i + 5], total: t, outDay: d }));
      if (st.noWinner) return { out: fin.map((p, i) => ({ ...p, outDay: 7 })).concat(out) };
      const meRow = st.me && { name: "You", av: S.ME.av, me: true };
      if (st.me && st.me.status === "WINNER") fin[0] = { ...fin[0], ...meRow };
      if (st.me && st.me.status === "FINISHED") fin[3] = { ...fin[3], ...meRow };
      if (st.me && st.me.status === "ELIMINATED") out[0] = { ...out[0], ...meRow };
      return { winners: fin.slice(0, C.winnerCount), finished: fin.slice(C.winnerCount), out };
    }
    // running
    const still = [], day1 = st.day === 1 && !st.pending;   // nobody can be out before day 1 ends
    for (let i = 0; i < (day1 ? 12 : 9); i++) {
      const today = i < 5 ? T + (i % 3) * (steps ? 250 : 2) : Math.round(T * (0.3 + 0.1 * i) * 0.6 / (steps ? 100 : 1)) * (steps ? 100 : 1);
      still.push({ ...people[i], total: day1 ? today : (118 - i * 7) * k, today });
    }
    if (st.me && st.me.status === "ACTIVE") {
      const myToday = st.pending ? st.me.lastDay : st.me.today;
      const idx = st.me.today >= T ? 3 : 6;
      still[idx] = { ...still[idx], name: "You", av: S.ME.av, me: true, total: st.me.total, today: myToday };
    }
    still.sort((a, b) => b.total - a.total).forEach((r, i) => { r.place = i + 1; });
    if (day1) { still.sort((a, b) => b.total - a.total).forEach((r, i) => { r.place = i + 1; }); return { still, out: [], target: T }; }
    const out = [[63, 2], [48, 2], [14, 1]].map(([t, d], i) => ({ ...people[9 + (i % 2)], name: NAMES[(9 + i) % NAMES.length], total: t * k, outDay: d }));
    if (st.me && st.me.status === "ELIMINATED") out.unshift({ name: "You", av: S.ME.av, me: true, total: st.me.total, outDay: st.me.outDay });
    return { still, out, target: T };
  }
  const stillIn = () => st.phase === "NOT_STARTED" ? st.joined : st.phase === "FINISHED" ? (st.noWinner ? 0 : 5) : st.day === 1 ? 12 : 9;
  const joinedTotal = 12;

  // ── pieces ──
  const badge = () => {
    const s = st.phase === "NOT_STARTED" ? ["upcoming", "Upcoming"] : st.phase === "FINISHED" ? ["ended", "Ended"] : ["active", "Active"];
    return `<span class="cd-badge ${s[0]}">${s[1]}</span>`;
  };
  const cell = (ic, k, v, sz) => `<div class="cd7-cell"><div class="ic">${ic.startsWith("<") ? ic : I(ic, sz || 17)}</div><div style="min-width:0"><div class="k">${k}</div><div class="val">${v}</div></div></div>`;
  function grid() {
    const exIc = C.ex === "steps" ? I("footprints-line", 18) : window.Icons.workout(C.ex, 28);
    let tgt, still, days;
    if (st.phase === "NOT_STARTED") { tgt = ["Day 1 target", `${num(C.dailyTarget)} ${C.unit}`]; still = ["Joined", st.joined]; days = ["Starts in", st.startsIn]; }
    else if (st.phase === "FINISHED") { tgt = ["Final target", `${num(targetOn(C, C.totalDays))} ${C.unit}`]; still = ["Made it", `${stillIn()} of ${joinedTotal}`]; days = ["Ran for", C.totalDays + " days"]; }
    else { tgt = ["Today's target", `${num(targetOn(C, st.day))} ${C.unit}`]; still = ["Still in", `${stillIn()} of ${joinedTotal}`]; days = ["Days left", C.totalDays - st.day + 1]; }
    return `<div class="cd7-grid">${cell(exIc, "Exercise", C.exName)}${cell("target", tgt[0], tgt[1])}${cell("users", still[0], still[1])}${cell("clock", days[0], days[1])}</div>`;
  }

  // the Today card — the one new block (members only, while it runs)
  function todayCard() {
    const m = st.me;
    if (!m) return "";
    if (st.phase === "NOT_STARTED") return `<div class="el-today">
        <div class="el-today-h"><span>${I("calendar", 13)} Starts in ${st.startsIn}</span></div>
        <div class="el-today-big">Day 1 target · <b>${num(C.dailyTarget)}</b> ${C.unit}</div>
        <div class="el-today-f"><span>You're in. Reach it on day 1 to stay in.</span></div></div>`;
    if (st.phase !== "RUNNING") return "";
    if (m.status === "ELIMINATED") return `<div class="el-today out">
        <div class="el-out-ic">${I("flag", 18)}</div>
        <div><b>You're out</b><span>Lasted ${m.lasted} day${m.lasted > 1 ? "s" : ""} · ${num(m.total)} ${C.unit} · out on day ${m.outDay}</span></div></div>`;
    if (st.pending) {
      const T = targetOn(C, st.pending), pct = Math.min(100, Math.round((m.lastDay / T) * 100));
      return `<div class="el-today wait">
        <div class="el-today-h"><span>Day ${st.pending} of ${C.totalDays} · ended</span><span>${I("clock", 13)} Results in about an hour</span></div>
        <div class="el-today-big"><b>${num(m.lastDay)}</b> / ${num(T)} ${C.unit}</div>
        <div class="el-bar"><i style="width:${pct}%"></i></div>
        <div class="el-today-f"><span>Day ${st.day} is already open: ${num(targetOn(C, st.day))} ${C.unit}</span></div></div>`;
    }
    const T = targetOn(C, st.day), done = m.today >= T, pct = Math.min(100, Math.round((m.today / T) * 100));
    const next = st.day === C.totalDays ? "Last day!" : C.mode === "STATIC" ? "Same target every day" : `Tomorrow: ${num(targetOn(C, st.day + 1))}`;
    return `<div class="el-today${done ? " ok" : ""}">
        <div class="el-today-h"><span>Today · Day ${st.day} of ${C.totalDays}</span><span>${I("clock", 13)} ends in 4h 10m</span></div>
        <div class="el-today-big"><b>${num(m.today)}</b> / ${num(T)} ${C.unit} today</div>
        <div class="el-bar"><i style="width:${pct}%"></i></div>
        <div class="el-today-f">${done ? `<span class="ok">${I("check", 14)} Done for today · come back tomorrow</span>` : `<span><b>${num(T - m.today)} more</b> to stay in</span>`}<span>${next}</span></div></div>`;
  }

  function prizes() {   // same block as a classic challenge (shown while it hasn't finished)
    const tier = ["1st place", "2nd place", "3rd place"], cls = ["gold", "silver", "bronze"];
    return `<div class="cd7-prizes">
      <div class="cd7-sec"><span>${I("trophy", 15)} Prizes</span><span class="r">Top ${C.prizes.length} win</span></div>
      ${C.prizes.map((p, i) => `<div class="cd7-prow"><span class="cd7-rk ${cls[i]}">${i + 1}</span><div class="cd7-ptx"><span class="cd7-tier">${tier[i]}</span><span class="cd7-prize">${p}</span></div></div>`).join("")}</div>`;
  }
  function winnersBlock(M) {   // same Winners block as a classic challenge, or the no-winner note
    if (st.noWinner) return `<div class="cd7-winners el-nowin"><div class="cd7-win-top">${I("trophy", 16)} No winner this time</div>
      <div class="el-nowin-b">Nobody made it to the end.</div></div>`;
    const cls = ["gold", "silver", "bronze"], w = M.winners, champ = w[0];
    const ru = w.slice(1).map((b, k) => `<div class="cd7-ru"><span class="cd7-rk ${cls[k + 1]}">${k + 2}</span>
        <div class="cd7-wav" style="background-image:${grad(b.av)}"></div>
        <div class="cd7-ru-tx"><div class="top"><b>${b.name}</b><span class="rp">${num(b.total)} ${C.unit}</span></div>
          ${C.prizes[k + 1] ? `<div class="cd7-ru-prize">${I("medal", 12)} ${C.prizes[k + 1]}</div>` : ""}</div></div>`).join("");
    return `<div class="cd7-winners">
      <div class="cd7-win-top">${I("trophy", 16)} Winners<span>Challenge complete</span></div>
      <div class="cd7-champ"><div class="cd7-champ-av" style="background-image:${grad(champ.av)}"><span class="cd7-champ-badge">${I("trophy", 15)}</span></div>
        <div class="cd7-champ-nm">${champ.name}</div><div class="cd7-champ-meta">Champion · ${num(champ.total)} ${C.unit}</div>
        ${C.prizes[0] ? `<div class="cd7-champ-prize">${I("medal", 14)} <span>${C.prizes[0]}</span></div>` : ""}</div>
      ${ru}</div>`;
  }

  function cta() {
    const m = st.me, rec = `<button class="cd-primary" onclick="location.href='../workout/moment.html'">${I("camera", 18)} Record ${C.exName}</button>`;
    const chat = `<button class="cd-chatbtn" onclick="CElim.toast('chat')">${I("comment", 20)}<span class="bdg">3</span></button>`;
    if (st.phase === "FINISHED") return `<button class="cd-primary" disabled>Challenge ended</button>`;
    if (!m) {
      if (!joiningOpen()) return `<button class="cd-primary" disabled>${I("lock", 16)} Joining closed</button>`;
      // same as the app: approval ON → request, then "Requested — waiting for approval" + Cancel
      if (role === "requested") return `<button class="cd-primary" disabled>Requested — waiting for approval</button>
        <button class="cd-cancelreq" onclick="CElim.cancelRequest()">Cancel</button>`;
      return `<button class="cd-primary" onclick="CElim.join()">${C.approval ? "Request to join · closes when it starts" : "Join Challenge"}</button>`;
    }
    if (m.status === "ELIMINATED") return `<button class="cd-primary" disabled>You're out · great effort!</button>${chat}`;
    if (st.phase === "NOT_STARTED") return `<button class="cd-primary" disabled>${I("calendar", 16)} Starts in ${st.startsIn}</button>${chat}`;
    if (C.ex === "steps") return `<div class="el-auto">${I("footprints-line", 18)}<span>Steps count automatically</span></div>${chat}`;
    return rec + chat;
  }
  const ctaNote = () => role === "requested" ? "" : !st.me && st.phase === "NOT_STARTED"
    ? `<div class="el-ctanote">Joining closes when the challenge starts.</div>` : "";

  // ── Members tab ──
  function mrow(r, opts) {
    opts = opts || {};
    const T = opts.target;
    const medal = opts.medal ? `<span class="medal">${["🥇", "🥈", "🥉"][r.place - 1]}</span>` : "";
    let sub = "";
    if (T != null) { const ok = r.today >= T;
      sub = `<span class="el-msub${ok ? " ok" : ""}">Today ${num(r.today)}/${num(T)}${ok ? " " + I("check", 12) : ""}</span>`; }
    if (opts.outDay) sub = `<span class="el-msub">Out on day ${r.outDay}</span>`;
    if (opts.joined) sub = "";
    return `<div class="cd-m${opts.muted ? " el-muted" : ""}${r.me ? " el-me" : ""}"><span class="rk">${opts.noRank ? "" : (r.place || "")}</span>
      <div class="av" style="background-image:${grad(r.av)}">${medal}</div>
      <span class="nm el-nm"><span>${r.me ? "You" : r.name}${r.me ? '<span class="you">YOU</span>' : ""}</span>${sub}</span>
      ${opts.joined ? "" : `<span class="reps"><span class="z">${I(C.ex === "steps" ? "footprints-line" : "zap", 13)}</span>${num(r.total)} <small>${C.unit === "steps" ? "" : "reps"}</small></span>`}</div>`;
  }
  const sec = (t, n) => `<div class="el-sec">${t}<span>${n}</span></div>`;
  function membersView() {
    const M = members();
    if (M.joined) return `<div class="cd-attempts" style="padding-top:14px">${M.joined.length} joined · ranking starts on day 1</div>${M.joined.map((r) => mrow(r, { joined: true, noRank: true })).join("")}<div style="height:14px"></div>`;
    if (st.phase === "FINISHED") {
      return (M.winners ? sec("Winners", M.winners.length) + M.winners.map((r) => mrow(r, { medal: true })).join("") : "")
        + (M.finished && M.finished.length ? sec("Finished", M.finished.length) + M.finished.map((r) => mrow(r)).join("") : "")
        + sec("Out", M.out.length) + M.out.map((r) => mrow(r, { outDay: true, muted: true, noRank: true })).join("") + `<div style="height:14px"></div>`;
    }
    return sec("Still in", M.still.length) + `<div class="el-sechint">Ranked by total ${C.unit === "steps" ? "steps" : "reps"}</div>`
      + M.still.map((r) => mrow(r, { target: M.target })).join("")
      + (M.out.length ? sec("Out", M.out.length) + M.out.map((r) => mrow(r, { outDay: true, muted: true, noRank: true })).join("") : "") + `<div style="height:14px"></div>`;
  }
  function postsView() { return `<div class="cd-empty">${I("play", 32)}<div class="t">No posts yet</div><div class="d">Clips from this challenge will show up here.</div></div>`; }

  function render() {
    const M = st.phase === "FINISHED" ? members() : null;
    root.innerHTML = `<div class="cd7-hero"><div class="img" style="background:${C.cover}"></div><div class="scrim"></div>
        <div class="cd7-fabs"><button class="cd-fab back" onclick="location.href='challenges.html'">${I("back", 20)}</button><button class="cd-fab more" onclick="CElim.toast('menu')">⋯</button></div>
        <div class="h1">${C.title}</div>
        <div class="cr"><div class="av" style="background-image:${grad(C.byAv)}"></div>by ${C.by} ${badge()}<span class="el-tag">${I("target", 12)} Elimination</span></div></div>
      ${M ? winnersBlock(M) : ""}
      ${grid()}
      ${todayCard()}
      <div class="cd-about"><div class="cd-about-meta"><span>${I(C.mode === "STATIC" ? "flag" : "activity", 13)} ${C.mode === "STATIC" ? "Same target every day" : `Target +${C.dailyTargetIncrease} every day`}</span><span>${I(C.vis === "Public" ? "users" : "lock", 13)} ${C.vis}</span><span>${I("shield", 13)} ${C.approval ? "Approval required" : "Open to join"}</span></div>
        <div class="cd-desc2">${C.desc} <button class="el-link" onclick="CElim.help()">${I("info", 14)} How it works</button></div></div>
      ${st.phase !== "FINISHED" && C.prizes.length ? prizes() : ""}
      <div class="cd7-cta">${cta()}</div>${ctaNote()}
      ${role === "creator" && C.approval && REQS.length && joiningOpen() ? `<div class="cd-jr">${JoinRequests.entry(REQS.length, "CElim.openRequests()")}</div>` : ""}
      <div class="cd-tabs"><div class="cd-tab ${tab === "members" ? "on" : ""}" onclick="CElim.tab('members')">${joinedTotal} Members</div><div class="cd-tab ${tab === "posts" ? "on" : ""}" onclick="CElim.tab('posts')">Posts</div></div>
      <div class="cd-sub">${tab === "posts" ? postsView() : membersView()}</div>`;
    window.Icons.init(root);
  }

  // ── How it works: the only place the full day-by-day target list appears ──
  function help() {
    const today = st.phase === "RUNNING" ? st.day : 0;
    const days = Array.from({ length: C.totalDays }, (_, i) => i + 1).map((d) =>
      `<div class="el-dl${d === today ? " on" : ""}${d < today ? " past" : ""}"><span>Day ${d}${d === today ? " · today" : ""}</span><b>${num(targetOn(C, d))} ${C.unit}</b></div>`).join("");
    window.Buzzend.sheet({ title: "How it works", html: `<div class="el-help-list">
      <div>${I("target", 16)}<span>Every day has a <b>target</b>. All your sessions that day add up.</span></div>
      <div>${I("flag", 16)}<span>Reach it to stay in. <b>Miss it once and you're out.</b></span></div>
      <div>${I("trophy", 16)}<span>Make it through the last day and you're ranked by total ${C.unit === "steps" ? "steps" : "reps"}. Top ${C.winnerCount} win${C.winnerCount > 1 ? "" : "s"}; on a tie, whoever got there first.</span></div>
      <div>${I("clock", 16)}<span>Joining closes when the challenge starts. Results come about an hour after each day ends, and we'll remind you at 8 PM if you're still short.</span></div></div>
      <div class="el-dlh">${C.mode === "STATIC" ? "Same target every day" : `Target goes up by ${C.dailyTargetIncrease} every day`}</div>
      <div class="el-dls">${days}</div>` });
  }

  // ── result pop-up: shown once, on the first open after a day's results ──
  function moment(kind) {
    const stat = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
    const html = {
      made: `<div class="el-mo"><div class="el-mo-ic safe">${I("check", 30)}</div><div class="t">You hit day 2's target!</div>
        <div class="d">Tomorrow: <b>30 squats</b></div>
        <div class="el-mo-st">${stat(2, "days survived")}${stat(45, "total reps")}</div>
        <button class="cd-primary" onclick="Buzzend.closeTop()">Got it</button></div>`,
      out: `<div class="el-mo"><div class="el-mo-ic out">${I("flag", 30)}</div><div class="t">You missed day 3's target (30)</div>
        <div class="d">You're out. Great effort!</div>
        <div class="el-mo-st">${stat(2, "days survived")}${stat(85, "total reps")}</div>
        <button class="cd-primary" onclick="Buzzend.closeTop()">View challenge</button></div>`,
      won: `<div class="el-mo"><div class="el-mo-ic gold">${I("trophy", 30)}</div><div class="t">You won! 1st place</div>
        <div class="d">Prize: <b>${REPS_CH.prizes[0]}</b></div>
        <div class="el-mo-st">${stat(312, "total reps")}</div>
        <button class="cd-primary" onclick="Buzzend.closeTop()">View challenge</button></div>`,
      finished: `<div class="el-mo"><div class="el-mo-ic safe">${I("medal", 30)}</div><div class="t">You made it to the end!</div>
        <div class="d">You finished <b>4th</b>.</div>
        <div class="el-mo-st">${stat(268, "total reps")}</div>
        <button class="cd-primary" onclick="Buzzend.closeTop()">View challenge</button></div>`,
    }[kind];
    window.Buzzend.sheet({ html });
  }
  function toast(k) {
    const m = { join: ["trophy", "You're in!", "Reach today's target to stay in."], chat: ["comment", "Group chat", "Opens the challenge group chat."],
      menu: ["more", "Menu", "Share · Report · Leave (leaving after it starts means you're out)."] }[k];
    window.Buzzend.alert({ icon: m[0], title: m[1], message: m[2] });
  }

  function join() {
    if (C.approval) {
      role = "requested"; render();
      window.Buzzend.alert({ icon: "send", title: "Request sent", message: "The creator of “" + C.title + "” will review your request to join." });
      return;
    }
    toast("join");
  }
  function cancelRequest() { role = "viewer"; render(); }
  function openRequests() { JoinRequests.open(REQS.slice(), { onChange: (list) => { REQS = list; render(); } }); }

  function start(el, state, r) {
    root = el; st = STATES[state] || STATES.under; C = st.steps ? STEPS_CH : REPS_CH; tab = "members";
    role = r || "viewer"; REQS = REQS0.slice();
    // the creator is always a member of their own challenge — never shown "Request to join"
    if (role === "creator" && !st.me && st.phase !== "FINISHED") st = Object.assign({}, st, { me: { status: "ACTIVE", today: 0, total: 0 } });
    render();
  }
  return { start, moment, help, toast, join, cancelRequest, openRequests, tab(t) { tab = t; render(); } };
})();
