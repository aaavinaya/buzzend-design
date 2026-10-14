/* Challenge Detail — ELIMINATION hub (backend: docs/ELIMINATION_CHALLENGE_APP_GUIDE.md).
   Same Poster layout as a classic challenge; one compact HUB card under the hero answers the
   three questions that matter — what day is it and how long is left, how many are still in,
   and am I safe — then a leaderboard with a visible cutoff line. Everything is decided on the
   server; this screen only displays the summary (GET …/elimination) and the board
   (GET …/elimination/leaderboard). States: upcoming · safe · risk · out · locking · won, plus
   the result moments (through · out · won) as sheets. Reuses cd7-* / cd-* styles; new = el-*. */
window.CElim = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, fmt = S.fmt, grad = S.grad;
  const AVS = S.PEOPLE.slice(1).map((p) => p.av);
  const FIRST = ["Asha", "Ravi", "Sita", "Kiran", "Anita", "Maya", "Lauren", "Drake", "Joseph", "Priya", "Sam", "Nisha", "Arjun", "Bina", "Dev",
    "Elina", "Hari", "Isha", "Jay", "Kavya", "Leo", "Mina", "Nabin", "Om", "Pooja", "Rohan", "Sara", "Tara", "Umesh", "Vivek"];
  const LAST = ["Shah", "Thapa", "Rai", "Gurung", "Malan", "Karki", "Sharma", "Lama", "Basnet", "Joshi"];
  const person = (i) => ({ name: FIRST[i % FIRST.length] + " " + LAST[(i * 3) % LAST.length], av: AVS[i % AVS.length] });

  // ── challenge + summary (shape of GET /v1/challenge/{id}/elimination) ──
  const C = { title: "October Push-up Knockout", ex: "pushup", exName: "Push-ups", by: "Adesh Pokhrel", byAv: "#9bb7c9,#5e7d99",
    cover: "linear-gradient(135deg,#3a2a6a,#c0436a)", vis: "Public", approval: true, range: "6–12 Oct", tz: "Asia/Kathmandu", totalDays: 7, winnerCount: 1,
    prizes: ["Buzzend gym hoodie"],
    desc: "Push-ups every day. Each night the lowest totals are knocked out. Last one standing wins." };
  const FUNNEL = [100, 52, 27, 14, 8, 4, 2, 1];   // participants at the start of each day (final = winners)
  const CUTOFF = 14;                                // todayCutoffRemaining on day 3

  // live board: 27 still in, ranked by cumulative reps; places 5 & 6 tie (shared place)
  function liveBoard(myPlace) {
    const rows = [];
    for (let i = 0; i < 27; i++) {
      const p = person(i), cum = 640 - i * 17 - (i % 3) * 4;
      rows.push({ name: p.name, av: p.av, cum, day: 20 + (i * 7) % 45 });
    }
    rows[5].cum = rows[4].cum;
    if (myPlace) rows[myPlace - 1] = Object.assign({}, rows[myPlace - 1], { name: "You", av: S.ME.av, me: true });
    let place = 0;
    rows.forEach((r, i) => { place = i && r.cum === rows[i - 1].cum ? place : i + 1; r.place = place; });
    return rows;
  }
  const knocked = (meOut) => {
    const out = [];
    for (let i = 0; i < 73; i++) { const p = person(i + 27); out.push({ name: p.name, av: p.av, cum: 300 - i * 3, outDay: i < 25 ? 2 : 1 }); }
    if (meOut) out[3] = Object.assign({}, out[3], { name: "You", av: S.ME.av, me: true, cum: meOut.cum, outDay: meOut.day, left: meOut.status === "WITHDRAWN" });
    return out;
  };

  // the six screen states
  const STATES = {
    upcoming: { phase: "NOT_STARTED", day: 0, me: null, joined: 12 },
    safe:     { phase: "RUNNING", day: 3, me: { status: "ACTIVE", place: 9 } },
    risk:     { phase: "RUNNING", day: 3, me: { status: "ACTIVE", place: 15 } },
    out:      { phase: "RUNNING", day: 3, me: { status: "ELIMINATED", day: 2, cum: 210 } },
    locking:  { phase: "RUNNING", day: 4, locking: 3, me: { status: "ACTIVE", place: 9 } },
    won:      { phase: "FINISHED", day: 7, me: { status: "WINNER", place: 1 } },
    left:     { phase: "RUNNING", day: 3, me: { status: "WITHDRAWN", day: 3, cum: 380 } },
    final:    { phase: "FINISHED", day: 7, me: { status: "FINISHED", place: 2 } },
    nowinner: { phase: "FINISHED", day: 7, noWinner: true, me: null },
  };
  let st, key, board, tab = "board", dayView = "live", root;

  // ── pieces ──
  function countdownRing(left) {   // fraction of today still to go (to midnight, challenge time zone)
    const r = 26, c = 2 * Math.PI * r;
    return `<div class="el-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="tr"/>
      <circle cx="32" cy="32" r="${r}" class="pr" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - left)).toFixed(1)}"/></svg>
      <div class="in"><b>5h 12m</b><span>left</span></div></div>`;
  }
  // funnel: one column per day, height = people who started that day; future days unknown
  function funnel() {
    const D = C.totalDays, max = FUNNEL[0];
    // while a day is locking in, the next day's field isn't known yet
    const known = st.phase === "FINISHED" ? D : st.phase === "NOT_STARTED" ? 0 : st.locking || st.day;
    const cols = [];
    for (let d = 1; d <= D; d++) {
      const isToday = st.phase === "RUNNING" && d === st.day, n = d <= known ? FUNNEL[d - 1] : null;
      const h = n ? Math.max(8, Math.round((n / max) * 44)) : 22;
      cols.push(`<div class="el-fc${isToday ? " today" : ""}${n ? "" : " future"}">
        <span class="n">${n == null ? (isToday ? "…" : "?") : n}</span><span class="b" style="height:${h}px"></span><span class="d">${isToday ? "Today" : "D" + d}</span></div>`);
    }
    cols.push(`<div class="el-fc win"><span class="n">${st.noWinner ? "0" : C.winnerCount}</span><span class="b">${I("trophy", 14)}</span><span class="d">Win</span></div>`);
    return `<div class="el-funnel">${cols.join("")}</div>`;
  }
  // my status — icon + words (never colour alone)
  function chip() {
    const m = st.me; if (!m) return "";
    if (st.locking) return `<div class="el-chip wait">${I("clock", 15)}<span><b>Locking in day ${st.locking}</b> · you were #${m.place}. Results within the hour.</span></div>`;
    if (m.status === "WINNER") return `<div class="el-chip gold">${I("trophy", 15)}<span><b>Winner</b> · last one standing of ${FUNNEL[0]}</span></div>`;
    if (m.status === "WITHDRAWN") return `<div class="el-chip out">${I("logout", 15)}<span><b>You left on day ${m.day}</b> · ${m.cum} reps</span></div>`;
    if (m.status === "FINISHED") return `<div class="el-chip final">${I("medal", 15)}<span><b>Finished #${m.place}</b> · you made the final</span></div>`;
    if (m.status === "ELIMINATED") return `<div class="el-chip out">${I("x", 15)}<span><b>Knocked out on day ${m.day}</b> · ${m.cum} reps</span></div>`;
    const me = board.find((r) => r.me), cut = board[CUTOFF - 1];
    if (me.place <= CUTOFF) return `<div class="el-chip safe">${I("shield", 15)}<span><b>Safe</b> · #${me.place} of ${board.length}, cutoff #${CUTOFF}</span></div>`;
    return `<div class="el-chip risk">${I("alert", 15)}<span><b>At risk</b> · #${me.place} · ${cut.cum - me.cum + 1} reps to reach #${CUTOFF}</span></div>`;
  }
  function hub() {
    if (st.phase === "NOT_STARTED") return `<div class="el-hub">
        <div class="el-hub-top"><div class="el-start">${I("calendar", 20)}</div>
          <div class="el-hub-tx"><b>Starts in 2d 4h</b><span>${st.joined} joined · joining closes at the end of day 1</span></div></div></div>`;
    if (st.phase === "FINISHED") return `<div class="el-hub">
        <div class="el-hub-top"><div class="el-start gold">${I("trophy", 20)}</div>
          <div class="el-hub-tx"><b>Finished</b><span>${FUNNEL[0]} started · ${C.totalDays} days · ${st.noWinner ? "no winner" : "1 left standing"}</span></div></div>
        ${funnel()}${st.me && st.me.status === "FINISHED" ? chip() : ""}</div>`;
    const lead = st.locking
      ? `<div class="el-start">${I("clock", 20)}</div><div class="el-hub-tx"><b>Day ${st.day} of ${C.totalDays}</b><span>Day ${st.locking} results coming soon</span></div>`
      : `${countdownRing(0.22)}<div class="el-hub-tx"><b>Day ${st.day} of ${C.totalDays}</b><span>${FUNNEL[st.day - 1]} still in · ${CUTOFF} survive today</span></div>`;
    return `<div class="el-hub"><div class="el-hub-top">${lead}
        <button class="el-help" onclick="CElim.help()" aria-label="How it works">${I("info", 18)}</button></div>
      ${funnel()}${chip()}</div>`;
  }

  function winners() {   // reuses the classic Winners block styles
    if (st.noWinner) return `<div class="cd7-winners el-nowin">
      <div class="cd7-win-top">${I("trophy", 16)} No winner this time</div>
      <div class="el-nowin-b">Nobody logged a workout on the last day, so nobody was left standing.</div></div>`;
    const w = board[0];
    return `<div class="cd7-winners">
      <div class="cd7-win-top">${I("trophy", 16)} Winner<span>Last one standing</span></div>
      <div class="cd7-champ"><div class="cd7-champ-av" style="background-image:${grad(w.av)}"><span class="cd7-champ-badge">${I("trophy", 15)}</span></div>
        <div class="cd7-champ-nm">${w.me ? "You" : w.name}</div><div class="cd7-champ-meta">Champion · ${fmt(w.cum)} reps</div>
        <div class="cd7-champ-prize">${I("medal", 14)} <span>${C.prizes[0]}</span></div></div></div>`;
  }

  function cta() {
    const m = st.me;
    if (st.phase === "FINISHED") return `<button class="el-ghost wide" onclick="CElim.toast('chat')">${I("comment", 16)} Open group chat</button>`;
    if (st.phase === "NOT_STARTED") return `<button class="cd-primary" onclick="CElim.toast('join')">Join · closes end of day 1</button>`;
    if (m && (m.status === "ELIMINATED" || m.status === "WITHDRAWN")) return `<button class="el-ghost wide" onclick="CElim.toast('chat')">${I("comment", 16)} Open group chat</button>`;
    return `<button class="cd-primary" onclick="location.href='../workout/moment.html'">${I("camera", 18)} Start workout</button>
      <button class="cd-chatbtn" onclick="CElim.toast('chat')">${I("comment", 20)}<span class="bdg">3</span></button>`;
  }

  // ── leaderboard ──
  const row = (r, frozen) => `<div class="el-row${r.me ? " me" : ""}">
      <span class="pl">${r.place || ""}</span><span class="av" style="background-image:${grad(r.av)}"></span>
      <span class="nm">${r.me ? "You" : r.name}</span>
      ${frozen ? `<span class="tag ${r.outcome === "Out" ? "out" : "in"}">${r.outcome}</span>` : st.phase === "FINISHED" ? "" : `<span class="td">+${r.day}</span>`}
      <span class="sc">${fmt(r.cum)}</span></div>`;
  const cutLine = (n) => `<div class="el-cut"><span>${I("chevron", 12)} Advance</span><b>Cutoff #${n}</b><span>Knocked out ${I("chevron", 12)}</span></div>`;
  function knockedSection(list, label) {
    return `<button class="el-ko" onclick="CElim.toggleKo(this)">${I("chevron", 14)} ${label} (${list.length})</button>
      <div class="el-ko-list" hidden>${list.slice(0, 12).map((r) => `<div class="el-row out${r.me ? " me" : ""}"><span class="pl"></span>
        <span class="av" style="background-image:${grad(r.av)}"></span><span class="nm">${r.me ? "You" : r.name}</span><span class="tag out">${r.left ? "Left" : ""} Day ${r.outDay}</span><span class="sc">${fmt(r.cum)}</span></div>`).join("")}
        ${list.length > 12 ? `<div class="el-more">and ${list.length - 12} more</div>` : ""}</div>`;
  }
  function boardView() {
    if (st.phase === "NOT_STARTED") {
      const roster = Array.from({ length: st.joined }, (_, i) => person(i));
      return `<div class="el-rost-top">${st.joined} joined · board opens on day 1</div>`
        + roster.map((p) => `<div class="el-row"><span class="pl"></span><span class="av" style="background-image:${grad(p.av)}"></span><span class="nm">${p.name}</span><span class="tag in">Joined</span></div>`).join("");
    }
    if (st.locking) return `<div class="el-lock">${I("clock", 16)} Locking in day ${st.locking} results…</div>${Array.from({ length: 7 }, () => `<div class="el-skel"></div>`).join("")}`;
    const finalized = st.phase === "FINISHED" ? [] : Array.from({ length: st.day - 1 }, (_, i) => st.day - 1 - i);
    const chips = st.phase === "RUNNING"
      ? `<div class="el-days"><button class="${dayView === "live" ? "on" : ""}" onclick="CElim.day('live')">Live</button>${finalized.map((d) => `<button class="${dayView === d ? "on" : ""}" onclick="CElim.day(${d})">Day ${d}</button>`).join("")}</div>` : "";
    const ko = knocked(st.me && (st.me.status === "ELIMINATED" || st.me.status === "WITHDRAWN") ? st.me : null);
    if (dayView !== "live") {   // frozen day: who advanced, who went out that day
      const n = FUNNEL[dayView - 1], adv = FUNNEL[dayView];
      const rows = [];
      for (let i = 0; i < n; i++) { const p = i < 27 ? board[i] : person(i + 27); rows.push({ name: p.me ? "You" : p.name, av: p.av, me: p.me, place: i + 1, cum: 300 - i * 6, outcome: i < adv ? "Through" : "Out" }); }
      return chips + rows.slice(0, adv).map((r) => row(r, true)).join("") + cutLine(adv) + rows.slice(adv, adv + 6).map((r) => row(r, true)).join("") + `<div class="el-more">${n - adv} knocked out on day ${dayView}</div>`;
    }
    if (st.noWinner) return knockedSection(board.map((r, i) => Object.assign({}, r, { outDay: 7 - (i % 7) })).concat(ko), "Knocked out");
    const live = st.phase === "FINISHED" ? board.slice(0, st.me && st.me.status === "FINISHED" ? 2 : 1) : board;
    const cut = st.phase === "FINISHED" ? "" : cutLine(CUTOFF);
    const above = live.filter((r) => st.phase === "FINISHED" || r.place <= CUTOFF), below = live.filter((r) => st.phase !== "FINISHED" && r.place > CUTOFF);
    const me = live.find((r) => r.me);
    const pin = me && me.place > 8 ? `<div class="el-pin">${row(me)}</div>` : "";
    return chips + above.map((r) => row(r)).join("") + (below.length ? cut + below.map((r) => row(r)).join("") : "")
      + knockedSection(st.phase === "FINISHED" ? board.slice(live.length).map((r, i) => Object.assign({}, r, { outDay: 7 - (i % 6) })).concat(ko) : ko, "Knocked out") + pin;
  }
  function postsView() { return `<div class="cd-empty">${I("play", 32)}<div class="t">No posts yet</div><div class="d">Clips from this knockout will show up here.</div></div>`; }

  function render() {
    const hasPrizes = st.phase !== "FINISHED";
    root.innerHTML = `<div class="cd7-hero el-hero"><div class="img" style="background:${C.cover}"></div><div class="scrim"></div>
        <div class="cd7-fabs"><button class="cd-fab back" onclick="location.href='challenges.html'">${I("back", 20)}</button><button class="cd-fab more" onclick="CElim.toast('menu')">⋯</button></div>
        <span class="el-type">${I("target", 13)} Elimination</span>
        <div class="h1">${C.title}</div>
        <div class="cr"><div class="av" style="background-image:${grad(C.byAv)}"></div>by ${C.by}</div></div>
      ${hub()}
      ${st.phase === "FINISHED" ? winners() : ""}
      <div class="el-meta"><span>${I("calendar", 13)} ${C.range}</span><span>${I(C.vis === "Public" ? "users" : "lock", 13)} ${C.vis}</span><span>${I("shield", 13)} ${C.approval ? "Approval required" : "Open to join"}</span></div>
      <div class="cd-about"><div class="cd-desc2">${C.desc} <button class="el-link" onclick="CElim.help()">How it works</button></div></div>
      ${hasPrizes ? `<div class="cd7-prizes"><div class="cd7-sec"><span>${I("trophy", 15)} Prize</span><span class="r">Last one standing</span></div>
        <div class="cd7-prow"><span class="cd7-rk gold">1</span><div class="cd7-ptx"><span class="cd7-tier">Winner</span><span class="cd7-prize">${C.prizes[0]}</span></div></div></div>` : ""}
      <div class="cd7-cta">${cta()}</div>
      <div class="cd-tabs"><div class="cd-tab ${tab === "board" ? "on" : ""}" onclick="CElim.tab('board')">Leaderboard</div><div class="cd-tab ${tab === "posts" ? "on" : ""}" onclick="CElim.tab('posts')">Posts</div></div>
      <div class="cd-sub el-board">${tab === "posts" ? postsView() : boardView()}</div>`;
    window.Icons.init(root);
  }

  // ── result moments (shown on the next open after a day is finalized, or from the push) ──
  function moment(kind) {
    const html = {
      through: `<div class="el-mo"><div class="el-mo-ic safe">${I("shield", 30)}</div><div class="t">You're through to day 4!</div>
        <div class="d">14 left. Today's cutoff is <b>#8</b>, so stay in the top 8 tonight.</div>
        <button class="cd-primary" onclick="Buzzend.closeTop();location.href='../workout/moment.html'">${I("camera", 18)} Start workout</button></div>`,
      out: `<div class="el-mo"><div class="el-mo-ic out">${I("flag", 30)}</div><div class="t">Knocked out on day 2</div>
        <div class="d">You gave it a real go. Thanks for competing.</div>
        <div class="el-mo-st"><div><b>1</b><span>day survived</span></div><div><b>210</b><span>total reps</span></div><div><b>120</b><span>best day</span></div></div>
        <div class="el-mo-row"><button class="el-ghost" onclick="Buzzend.closeTop()">Keep watching</button><button class="cd-primary" onclick="Buzzend.closeTop();CElim.toast('share')">${I("share", 16)} Share</button></div></div>`,
      won: `<div class="el-mo"><div class="el-mo-ic gold">${I("trophy", 30)}</div><div class="t">You won!</div>
        <div class="d">Last one standing of ${FUNNEL[0]}. Prize: <b>${C.prizes[0]}</b></div>
        <div class="el-mo-row"><button class="cd-primary" style="flex:1" onclick="Buzzend.closeTop();CElim.toast('share')">${I("share", 16)} Share</button></div></div>`,
    }[kind];
    window.Buzzend.sheet({ html });
  }
  function help() {
    window.Buzzend.sheet({ title: "How elimination works", html: `<div class="el-help-list">
      <div>${I("calendar", 16)}<span>Every day is one round. Days end at midnight <b>${C.tz}</b>, shown in your local time.</span></div>
      <div>${I("activity", 16)}<span>You're ranked by your <b>total</b> reps since day 1.</span></div>
      <div>${I("x", 16)}<span>After each day, the lowest totals are knocked out. Everyone tied at the cutoff goes through.</span></div>
      <div>${I("clock", 16)}<span>Results land within an hour of midnight. Sync before midnight: late workouts don't count for that day.</span></div>
      <div>${I("trophy", 16)}<span>The last ${C.winnerCount > 1 ? C.winnerCount : "one"} standing win${C.winnerCount > 1 ? "" : "s"}.</span></div></div>` });
  }
  function toast(k) {
    const m = { join: ["trophy", "You're in!", "Rank by total reps. Joining closes when day 1 ends."], chat: ["comment", "Group chat", "Opens the challenge group chat."],
      find: ["search", "Find a challenge", "Opens Discover with open challenges."], create: ["plus", "New knockout", "Opens Create challenge with Elimination selected."],
      share: ["share", "Share", "Opens the share card for your result."], menu: ["more", "Menu", "Share · Report · Leave (leaving after day 1 is final)."] }[k];
    window.Buzzend.alert({ icon: m[0], title: m[1], message: m[2] });
  }

  function start(el, state) {
    root = el; key = STATES[state] ? state : "safe"; st = STATES[key]; tab = "board"; dayView = "live";
    board = liveBoard(st.me && st.me.place ? st.me.place : 0);
    render();
  }
  return {
    start, moment, help, toast,
    tab(t) { tab = t; render(); },
    day(d) { dayView = d; render(); },
    toggleKo(btn) { const l = btn.nextElementSibling; l.hidden = !l.hidden; btn.classList.toggle("open", !l.hidden); },
  };
})();
