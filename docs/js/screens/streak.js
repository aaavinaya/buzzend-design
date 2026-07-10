/* Streak detail — faithful port of Flutter streak_detail_screen (states: active /
   broken / inactive; hero, current/longest, this-week, keep-alive/start/restore,
   workout pills, invite, reset) + Rings & Calendar redesigns. Reads window.Social. */
window.Streak = (function () {
  const I = (n, s) => window.Icons.svg(n, s);

  const WORKOUTS = [
    { i: "pushup", n: "Push-ups", sub: "10 reps" }, { i: "squat", n: "Squats", sub: "10 reps" },
    { i: "walk", n: "Steps", sub: "3000 steps" }, { i: "situp", n: "Sit-ups", sub: "10 reps" },
    { i: "jumping", n: "Jumping Jacks", sub: "20 reps" }, { i: "lunge", n: "Lunges", sub: "10 reps" },
  ];
  const LB = ["M", "T", "W", "T", "F", "S", "S"];
  const DATA = {
    active: { current: 47, longest: 60, week: ["C", "C", "C", "C", "C", "C", "P"] },
    broken: { current: 0, longest: 60, missedDays: 2, restored: 0, week: ["C", "C", "C", "C", "M", "M", "F"], invite: { accepted: 0, required: 1 } },
    inactive: { current: 0, longest: 0, week: ["F", "F", "F", "F", "F", "F", "F"] },
  };
  const WEEK_RANGE = "Jun 24 – 30";
  let cur = { mode: "active" }, _ov = null, root;

  // ── shared pieces ──
  function topbar(title) { return `<div class="sk-bar"><button onclick="Streak.back()">${I("back", 20)}</button><span class="t">${title || "Streak"}</span><button onclick="Streak.confirmReset()" style="visibility:${cur.mode === "inactive" ? "hidden" : "visible"}">${I("refresh", 18)}</button></div>`; }
  function badge(state) { const t = state === "active" ? "ACTIVE" : state === "broken" ? "BROKEN" : "INACTIVE"; return `<span class="badge"><span class="d"></span>${t}</span>`; }
  function heroFaithful(state) {
    const d = DATA[state], icon = state === "broken" ? I("heart-crack", 52) : I("flame", 52);
    const sub = state === "active" ? "You're on fire — keep it going!" : state === "broken" ? `You missed ${d.missedDays} days — restore it to keep your ${d.longest}-day record.` : "Log a workout to start your streak.";
    return `<div class="sk-hero ${state}">${badge(state)}
      <div class="sk-hero-main"><div><span class="sk-num">${d.current}</span><span class="sk-lbl">${d.current === 1 ? "day" : "days"} streak</span></div><span class="sk-hero-ic">${icon}</span></div>
      <div class="sk-sub">${sub}</div></div>`;
  }
  function stats(state) {
    const d = DATA[state];
    return `<div class="sk-stats">
      <div class="sk-stat"><span class="ic" style="color:var(--primary)">${I("flame", 20)}</span><div class="v">${d.current}</div><div class="l">current streak</div></div>
      <div class="sk-stat"><span class="ic" style="color:#f5a623">${I("trophy", 20)}</span><div class="v">${d.longest}</div><div class="l">longest streak</div></div></div>`;
  }
  function dayCell(st, lb) {
    const map = { C: "completed", M: "missed", P: "pending", F: "future" };
    const inner = st === "C" ? I("flame", 15) : st === "M" ? I("x", 14) : "";
    return `<div class="sk-day ${map[st]}"><div class="dot">${inner}</div><div class="lb">${lb}</div></div>`;
  }
  function weekCard(state) {
    return `<div class="sk-sec"><div class="sk-card"><div class="sk-wkhd"><span class="h">This week</span><span class="r">${WEEK_RANGE}</span></div>
      <div class="sk-week">${DATA[state].week.map((st, i) => dayCell(st, LB[i])).join("")}</div></div></div>`;
  }
  const pill = (w) => `<div class="sk-pill" onclick="Streak.record('${w.i}')"><div class="pic">${I(w.i, 22)}</div><div style="flex:1"><div class="nm">${w.n}</div><div class="sub">${w.sub}</div></div><span class="go">${I("chevron", 18)}</span></div>`;
  const pillsCard = () => `<div class="sk-pills">${WORKOUTS.map((w, i) => pill(w) + (i < WORKOUTS.length - 1 ? '<div class="sk-or">OR</div>' : "")).join("")}</div>`;

  function inviteCard() {
    const iv = DATA.broken.invite, done = iv.accepted >= iv.required, pct = Math.round((iv.accepted / iv.required) * 100);
    return `<div class="sk-invite"><div class="top"><div class="ic">${I("users", 22)}</div><div style="flex:1"><div class="nm">Invite friends</div><div class="sub">Get ${iv.required} friend${iv.required === 1 ? "" : "s"} to accept within 24 hrs.</div></div></div>
      <div class="stat"><span>${iv.accepted}/${iv.required} accepted</span><span class="${done ? "done" : ""}">${done ? "Threshold reached!" : iv.required - iv.accepted + " more to go"}</span></div>
      <div class="sk-track" style="margin-top:8px"><i style="width:${pct}%"></i></div>
      <button class="share" onclick="Streak.invite()">${I("share", 16)} Share invite link</button></div>`;
  }
  function section(state) {
    if (state === "inactive") return `<div class="sk-sec"><div class="h">Start your streak today</div><div class="sh">Pick any one workout below</div>${pillsCard()}</div>`;
    if (state === "active") return `<div class="sk-sec"><div class="h">Keep your streak alive</div><div class="sh">Pick any one workout below</div>${pillsCard()}</div>`;
    // broken → restore
    const d = DATA.broken, remaining = d.missedDays - d.restored;
    const subtitle = remaining > 1 ? `Complete ${remaining} workouts to fully restore (${d.missedDays} days missed).` : remaining === 1 ? "One more workout and your streak is back!" : "All days restored! Your streak is recovering.";
    const bar = d.missedDays > 1 ? `<div class="sk-rbar"><div class="row"><b>Restore progress</b><span>${d.restored} / ${d.missedDays} days</span></div><div class="sk-track"><i style="width:${(d.restored / d.missedDays) * 100}%"></i></div></div>` : "";
    return `<div class="sk-sec"><div class="h">Restore streak</div><div class="sh">${subtitle}</div>${bar}${pillsCard()}${inviteCard()}</div>`;
  }
  const resetLink = (state) => state === "inactive" ? "" : `<div class="sk-resetwrap"><button class="sk-reset" onclick="Streak.confirmReset()">${I("refresh", 15)} Reset streak</button></div>`;

  // ── V1 Faithful ──
  function faithful(state) {
    return heroFaithful(state) + stats(state) + (state !== "inactive" ? weekCard(state) : "") + section(state) + resetLink(state);
  }

  // ── V2 Rings ──
  function ring(pct) {
    const r = 84, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return `<svg width="190" height="190"><circle cx="95" cy="95" r="${r}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="12"/>
      <circle cx="95" cy="95" r="${r}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 95 95)"/></svg>`;
  }
  function rings() {
    const d = DATA.active, done = d.week.filter((x) => x === "C").length, pct = Math.round((done / 7) * 100);
    return `<div class="sk-ringhero"><div class="sk-ring">${ring(pct)}<div class="c"><span class="fl">${I("flame", 30)}</span><span class="n">${d.current}</span><span class="u">day streak</span></div></div>
        <span style="display:inline-flex;align-items:center;gap:7px;font:800 11px var(--font);letter-spacing:.6px;padding:6px 12px;border-radius:99px;background:rgba(255,255,255,.16);margin-top:16px"><span style="width:7px;height:7px;border-radius:50%;background:#5fe3a1"></span>ACTIVE</span>
        <div class="sk-ringstats"><div class="s"><b>${done}/7</b><span>this week</span></div><div class="s"><b>${d.longest}</b><span>longest</span></div><div class="s"><b>${pct}%</b><span>weekly goal</span></div></div></div>
      ${weekCard("active")}${section("active")}${resetLink("active")}`;
  }

  // ── V3 Calendar / heatmap ──
  function calendar() {
    const d = DATA.active;
    const cells = Array.from({ length: 35 }, (_, i) => {
      if (i === 1) return "miss";
      if (i < 4) return "l1";
      const m = (i * 7) % 9;
      return m === 0 ? "l1" : m % 3 === 0 ? "l2" : "l3";
    });
    const cal = `<div class="sk-cal"><div class="sk-cal-hd"><span class="m">Last 5 weeks</span><span style="font:700 12px var(--font);color:var(--text-tertiary)">${d.current}-day streak</span></div>
      <div class="sk-cal-grid">${cells.map((c) => `<div class="cell ${c}"></div>`).join("")}</div>
      <div class="sk-cal-legend">Less <i style="background:var(--surface-alt)"></i><i style="background:color-mix(in srgb,var(--primary) 30%,transparent)"></i><i style="background:color-mix(in srgb,var(--primary) 60%,transparent)"></i><i style="background:var(--primary)"></i> More</div></div>`;
    const mile = (dn, v, l, done, prog) => `<div class="sk-mile ${done ? "done" : ""}"><div class="mi">${I(done ? "check" : "flame", 20)}</div><div class="mv">${v}</div><div class="ml">${l}${!done && prog ? " · " + prog : ""}</div></div>`;
    const miles = `<div class="sk-sec"><div class="h">Milestones</div><div class="sk-miles">${mile(7, "7 days", "Week warrior", true) + mile(30, "30 days", "Monthly master", true) + mile(100, "100 days", "Century", false, d.current + "/100") + mile(365, "365 days", "Year of fire", false, d.current + "/365")}</div></div>`;
    return heroFaithful("active") + stats("active") + `<div class="sk-sec">${cal}</div>` + miles + section("active") + resetLink("active");
  }

  function render() {
    root.innerHTML = topbar() + (cur.mode === "rings" ? rings() : cur.mode === "calendar" ? calendar() : faithful(cur.mode));
    window.Icons.init(root); root.scrollTop = 0;
  }

  // ── actions ──
  function back() { location.href = "home-v7.html"; }
  function record(w) { if (w === "walk") return Buzzend.alert({ icon: "walk", title: "Steps sync automatically", message: "Your step count updates from your phone — no need to record." }); location.href = "../workout/moment.html"; }
  function invite() { Buzzend.alert({ icon: "share", title: "Invite link ready", message: "Share your link — when a friend joins within 24 hrs, your streak is restored." }); }
  function mount(html) { const o = document.createElement("div"); o.className = "sk-ov"; o.innerHTML = html; o.addEventListener("click", (e) => { if (e.target === o) close(); }); document.querySelector(".screen").appendChild(o); window.Icons.init(o); _ov = o; }
  function close() { if (_ov) { _ov.remove(); _ov = null; } }
  function confirmReset() {
    mount(`<div class="sk-dlg"><button class="x" onclick="Streak.close()">${I("x", 16)}</button><div class="di">${I("refresh", 26)}</div>
      <div class="dt">Reset streak?</div><div class="dd">Your current streak will be cleared. Your longest streak record is kept.</div>
      <div class="sk-dlg-row"><button class="sk-cancel" onclick="Streak.close()">Cancel</button><button class="sk-confirm" onclick="Streak.doReset()">Reset</button></div></div>`);
  }
  function doReset() { close(); Buzzend.alert({ icon: "refresh", title: "Streak reset", message: "Your streak is back to 0. Your longest-streak record is safe." }); }

  function start(mountEl, mode) { root = mountEl; cur.mode = mode || "active"; render(); }
  return { start, render, back, record, invite, confirmReset, doReset, close };
})();
