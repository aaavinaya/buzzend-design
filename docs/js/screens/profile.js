/* Profile — 3 variants. V1 Stats (figma-faithful), V2 Social, V3 Dashboard.
   Reads window.Social. Theme + palette aware (uses tokens / --primary / hero-grad). */
window.Profile = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, me = S.ME, EX = S.EX, fmt = S.fmt, grad = S.grad;
  const avEl = (av, cls) => `<div class="${cls || "pf-av"}" style="background-image:${grad(av)}"></div>`;

  // deterministic per-day activity values for the chart (stable screenshots)
  function periodData(period) {
    const n = period === "day" ? 1 : period === "week" ? 7 : 15;
    const days = [];
    for (let i = 0; i < n; i++) {
      const w = 0.55 + 0.45 * Math.sin(i * 1.3 + 1);   // 0.1..1 wave
      const d = { steps: Math.round((900 + 1400 * w)) };
      EX.forEach((e, j) => { d[e.key] = (i + j) % 3 === 0 ? Math.round((10 + 70 * w) * (e.key === "lunge" ? 0.4 : 1)) : (j < 2 ? Math.round(8 + 40 * w) : 0); });
      days.push(d);
    }
    return { n, days, label: period === "day" ? "Wed, 15 Jun" : period === "week" ? "This week" : "June 2026" };
  }

  // scale: steps are big, reps small — normalize steps into a rep-comparable band.
  // segment heights are concrete px (over a 150px area) so they render reliably.
  const CHART_H = 150;
  function chart(period) {
    const { n, days, label } = periodData(period);
    const norm = (d) => ({ steps: d.steps / 18, squat: d.squat, pushup: d.pushup, situp: d.situp, jumping: d.jumping, lunge: d.lunge });
    const dayTotal = (d) => S.ACT.reduce((a, k) => a + norm(d)[k.key], 0);
    const totals = days.map(dayTotal);
    const max = Math.max(...totals, 1);
    const gap = n > 10 ? "4px" : "9px";
    const labels = period === "week" ? ["M", "T", "W", "T", "F", "S", "S"] : Array.from({ length: n }, (_, i) => "" + (i + 1));
    const barHtml = (d) => {
      const t = dayTotal(d), barH = (t / max) * CHART_H;
      const segs = S.ACT.map((a) => { const part = norm(d)[a.key]; if (!part) return ""; const ph = (part / t) * barH;
        return `<div class="pf-seg-fill" style="height:${ph.toFixed(1)}px;background:${a.c}"></div>`; }).join("");
      return `<div class="pf-bar">${segs}</div>`;
    };
    const head = `<div class="pf-chart-hd"><button class="pf-navb">${I("chevron", 16)}</button><span class="mo">${label}</span><button class="pf-navb" style="transform:scaleX(-1)">${I("chevron", 16)}</button></div>`;

    if (period === "day") {
      const d = days[0];
      return `<div class="pf-chart">${head}
        <div class="pf-day1"><span class="pill"><i style="background:${S.ACT[0].c}"></i>${fmt(d.steps)} steps</span>
          <span class="pill"><i style="background:${S.ACT[2].c}"></i>${d.pushup} push-ups</span>
          <span class="pill"><i style="background:${S.ACT[1].c}"></i>${d.squat} squats</span></div>
        <div class="pf-bars few" style="--bg:0;justify-content:center;height:${CHART_H + 6}px"><div class="pf-bar" style="max-width:120px">${barHtml(d).replace('<div class="pf-bar">', "").replace(/<\/div>$/, "")}</div></div>
        ${legend()}</div>`;
    }
    return `<div class="pf-chart">${head}
      <div class="pf-bars ${n <= 7 ? "few" : ""}" style="--bg:${gap};height:${CHART_H + 6}px">${days.map(barHtml).join("")}</div>
      <div class="pf-xl" style="--bg:${gap}">${labels.map((l) => `<span>${l}</span>`).join("")}</div>
      ${legend()}</div>`;
  }
  const legend = () => `<div class="pf-legend">${S.ACT.map((a) => `<span class="pf-lg"><i style="background:${a.c}"></i>${a.n}</span>`).join("")}</div>`;

  function statsRowTeal() {
    const st = (b, l) => `<div class="pf-stat"><b>${b}</b><span>${l}</span></div>`;
    return `<div class="pf-stats">${st(me.following, "Following") + st(me.followers, "Followers") + st(me.joinedChallenges, "Challenges") + st(me.streak + "🔥", "Streak")}</div>`;
  }

  // ── V1 · Stats (figma-faithful) ──
  function v1(period) {
    period = period || "month";
    const tab = (id, on) => `<div class="pf-tab ${on ? "on" : ""}" onclick="Profile.go1('${id}')">${id}</div>`;
    const seg = (p) => `<button class="${p === period ? "on" : ""}" onclick="Profile.go1('Stats','${p}')">${p[0].toUpperCase() + p.slice(1)}</button>`;
    return `<div class="pf-head">
        <div class="pf-id">${avEl(me.av)}<div><div class="nm">${me.name}</div><div class="hd">${me.online ? "Online" : me.handle}</div></div>
          <button class="pf-edit">${I("user", 14)} Edit</button></div>
        ${statsRowTeal()}</div>
      <div class="pf-tabs">${tab("Stats", true) + tab("Posts") + tab("Challenges")}</div>
      <div class="pf-seg">${seg("day") + seg("week") + seg("month")}</div>
      ${chart(period)}`;
  }

  // ── V2 · Social ──
  function v2() {
    const counts = (b, l) => `<div class="pf-count"><b>${b}</b><span>${l}</span></div>`;
    const cells = [
      { ex: "squat", g: "#1f6e5f,#2a9d8f", r: 150 }, { ex: "pushup", g: "#8a5a1a,#e0922a", r: 96 },
      { ex: "jumping", g: "#7a2a6a,#c0398e", r: 120 }, { ex: "situp", g: "#1e3a5a,#3b6eff", r: 88 },
      { ex: "lunge", g: "#7a1f2a,#ef4444", r: 64 }, { ex: "squat", g: "#3a3a5b,#5e60ce", r: 132 },
    ].map((c) => `<div class="pf-cell" style="background-image:linear-gradient(135deg,${c.g})"><span class="pl">${I("play", 26)}</span><span class="rep">${I(c.ex, 13)} ${c.r}</span></div>`).join("");
    return `<div class="pf-cover">${avEl(me.av)}</div>
      <div class="pf-social"><div class="nm">${me.name}</div><div class="hd">${me.handle} · Online</div>
        <div class="bio">Counting every rep with Buzzend 💪 · ${me.streak}-day streak · Squats &amp; push-ups daily.</div>
        <div class="pf-countrow">${counts(12, "Posts") + counts(me.following, "Following") + counts(me.followers, "Followers")}</div>
        <div class="pf-actions"><button class="btn btn-primary btn-sm" style="flex:1">${I("user", 16)} Edit profile</button>
          <button class="btn btn-social btn-sm" style="flex:none">${I("share", 16)}</button></div>
        <div class="pf-tabs" style="margin-top:14px;padding-left:0;padding-right:0"><div class="pf-tab on">Posts</div><div class="pf-tab">Activity</div><div class="pf-tab">Challenges</div></div>
        <div class="pf-grid">${cells}</div></div>`;
  }

  // ── V3 · Dashboard / bento ──
  function v3() {
    const wk = periodData("week").days.map((d) => S.EX.reduce((a, e) => a + d[e.key], 0));
    const mx = Math.max(...wk, 1);
    const badge = (ic, n, c, lock) => `<div class="pf-badge ${lock ? "lock" : ""}"><div class="bi" style="color:${c};background:color-mix(in srgb,${c} 14%,transparent)">${I(ic, 24)}</div><div class="bn">${n}</div></div>`;
    const act = (ic, n, m, v) => `<div class="pf-act"><div class="ai">${I(ic, 20)}</div><div><div class="an">${n}</div><div class="am">${m}</div></div><div class="av2">${v}</div></div>`;
    return `<div class="pf-hero">${avEl(me.av)}<div><div class="nm">${me.name}</div><div class="hd">${me.handle} · Online</div></div>
        <button class="pf-ic" style="margin-left:auto">${I("share", 18)}</button></div>
      <div class="pf-bento">
        <div class="pf-b pf-streak span2"><div class="bl">${I("flame", 13)} CURRENT STREAK</div>
          <div class="bv">${I("flame", 30)} ${me.streak} days</div><div class="bd">Best: ${me.best} days · keep the chain alive</div></div>
        <div class="pf-b"><div class="bl">TOTAL REPS</div><div class="bv">${fmt(S.totalReps(me))}</div><div class="bd">this week</div></div>
        <div class="pf-b"><div class="bl">STEPS</div><div class="bv">${fmt(me.steps)}</div><div class="bd">this week</div></div>
        <div class="pf-b span2"><div class="bl">THIS WEEK</div><div class="pf-mini">${wk.map((v, i) => `<i class="${v === mx ? "hi" : ""}" style="height:${Math.max(12, (v / mx) * 100)}%"></i>`).join("")}</div></div>
        <div class="pf-b span2"><div class="bl" style="margin-bottom:4px">ACHIEVEMENTS</div>
          <div class="pf-badges">${badge("flame", "30-day streak", "#ff7a1a") + badge("trophy", "Challenge win", "#ffb020") + badge("zap", "500 reps/day", "var(--primary)") + badge("target", "Goal master", "#9b6cff", true)}</div></div>
        <div class="pf-b span2"><div class="bl" style="margin-bottom:6px">RECENT ACTIVITY</div>
          ${act("squat", "Squats", "Today · 9:12 AM", "120")}${act("pushup", "Push-ups", "Today · 12:30 PM", "80")}${act("footprints", "Walk", "Yesterday", fmt(3800))}</div>
      </div>`;
  }

  let cur = { v: "1", period: "month" };
  function render(v) { cur.v = v; return v === "2" ? v2() : v === "3" ? v3() : v1(cur.period); }
  function go1(tab, period) { // Stats sub-nav (tab + period) — re-render V1 in place
    if (period) cur.period = period;
    const host = document.getElementById("content");
    if (tab && tab !== "Stats") { return; } // Posts/Challenges tabs are illustrative here
    host.innerHTML = v1(cur.period); window.Icons.init(host);
  }
  return { render, go1, periodData };
})();
