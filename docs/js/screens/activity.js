/* Activity tab — 3 variants. V1 Leaderboard (Top/Friends + metric), V2 Your activity,
   V3 Live. Reps & steps recorded whether or not a clip is posted (per the product),
   so anyone can rank globally or among friends. Reads window.Social. */
window.Activity = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, fmt = S.fmt, grad = S.grad;
  const exMeta = (k) => S.ACT.find((a) => a.key === k) || S.ACT[1];

  // ── V1 · Leaderboard ──
  let cur = { v: "1", scope: "top", metric: "reps" };
  function row(b, metric) {
    const unit = metric === "steps" ? "steps" : "reps";
    const medal = b.rank === 1 ? "🥇" : b.rank === 2 ? "🥈" : b.rank === 3 ? "🥉" : "";
    return `<div class="lb-row ${b.p.me ? "me" : ""}"><span class="rk">${b.rank}</span>
      <div class="lb-av" style="background-image:${grad(b.p.av)}">${medal ? `<span class="m">${medal}</span>` : ""}</div>
      <span class="nm">${b.p.me ? "You" : b.p.name}</span><span class="v">${fmt(b.v)} <small>${unit}</small></span></div>`;
  }
  function podium(top3, metric) {
    const unit = metric === "steps" ? "steps" : "reps", order = [top3[1], top3[0], top3[2]].filter(Boolean), hts = [60, 84, 48];
    return `<div class="lb-podium">${order.map((b, idx) => {
      const place = b.rank, first = place === 1;
      return `<div class="lb-pod ${first ? "first" : ""}"><div class="crown">${first ? "👑" : ""}</div>
        <div class="pa" style="background-image:${grad(b.p.av)}"></div><div class="pn">${b.p.me ? "You" : b.p.name.split(" ")[0]}</div><div class="pv">${fmt(b.v)} ${unit}</div>
        <div class="bar" style="height:${hts[idx]}px;background:${first ? "linear-gradient(180deg,#ffd66b,#ffb020)" : place === 2 ? "var(--surface-alt)" : "color-mix(in srgb,var(--primary) 35%,transparent)"}"></div></div>`;
    }).join("")}</div>`;
  }
  function v1() {
    const sc = (s, ic, l) => `<button class="${cur.scope === s ? "on" : ""}" onclick="Activity.setScope('${s}')">${I(ic, 15)} ${l}</button>`;
    const metricList = [{ key: "reps", n: "All reps", i: "zap" }, ...S.ACT];
    const chip = (m) => `<button class="ac-chip ${cur.metric === m.key ? "on" : ""}" onclick="Activity.setMetric('${m.key}')">${I(m.i, 14)} ${m.n}</button>`;
    const board = S.rankBy(cur.metric, cur.scope);
    const me = board.find((b) => b.p.me), top3 = board.slice(0, 3), rest = board.slice(3);
    return `<div class="ac-scope">${sc("top", "trophy", "Top") + sc("friends", "users", "Friends")}</div>
      <div class="ac-metrics">${metricList.map(chip).join("")}</div>
      <div class="ac-board">
        ${podium(top3, cur.metric)}
        ${me ? `<div class="lb-you"><span class="rk">#${me.rank}</span><div class="tx"><b>YOUR RANK</b><span>${me.rank > 3 ? "Top " + Math.round((me.rank / board.length) * 100) + "% · keep pushing" : "You're on the podium! 🎉"}</span></div><div class="v">${fmt(me.v)}</div></div>` : ""}
        <div style="font:800 12px var(--font);color:var(--text-tertiary);margin:16px 0 2px">${cur.scope === "friends" ? "FRIENDS" : "EVERYONE"}</div>
        ${rest.map((b) => row(b, cur.metric)).join("")}
        <div class="ac-note">Reps &amp; steps are recorded automatically — posting a clip is optional.</div></div>`;
  }

  // ── V2 · Your activity ──
  function v2() {
    const me = S.ME;
    const wk = [0.5, 0.8, 0.45, 1, 0.62, 0.3, 0.74], days = ["M", "T", "W", "T", "F", "S", "S"], mx = Math.max(...wk);
    const stat = (ic, c, v, l) => `<div class="ac-stat"><div class="si" style="color:${c};background:color-mix(in srgb,${c} 13%,transparent)">${I(ic, 18)}</div><b>${v}</b><span>${l}</span></div>`;
    const sess = (ex, t, reps) => { const m = exMeta(ex); return `<div class="ac-sess"><div class="ic" style="background-image:linear-gradient(135deg,${m.c},color-mix(in srgb,${m.c} 60%,#000))">${I(m.i, 22)}</div>
      <div><div class="nm">${m.n}</div><div class="mt">${t}</div></div><div class="rt"><b>${reps}</b><span>reps</span></div></div>`; };
    return `<div class="ac-statrow">${stat("zap", "var(--primary)", fmt(S.totalReps(me)), "reps this week") + stat("footprints", "#22c993", fmt(me.steps), "steps") + stat("flame", "#ff7a1a", me.streak, "day streak")}</div>
      <div class="ac-card"><div class="hd"><b>This week</b><span class="pct">+18% vs last</span></div>
        <div class="ac-wk">${wk.map((h, i) => `<div class="col ${h === mx ? "hi" : ""}"><div class="bar" style="height:${Math.max(10, (h / mx) * 92)}px"></div><div class="lb">${days[i]}</div></div>`).join("")}</div></div>
      <div class="ac-sec">TODAY</div>${sess("squat", "9:12 AM · 0:35", 120)}${sess("pushup", "12:30 PM · 0:28", 80)}${sess("situp", "6:05 PM · 0:40", 120)}
      <div class="ac-sec">YESTERDAY</div>${sess("jumping", "7:40 AM · 0:50", 140)}${sess("lunge", "5:10 PM · 0:33", 64)}`;
  }

  // ── V3 · Live ──
  function v3() {
    const acts = [
      { p: 1, ex: "squat", reps: 48, t: "just now" }, { p: 5, ex: "pushup", reps: 32, t: "2m ago" },
      { p: 2, ex: "jumping", reps: 60, t: "5m ago" }, { p: 3, ex: "situp", reps: 25, t: "11m ago" },
      { p: 6, ex: "lunge", reps: 40, t: "18m ago" }, { p: 4, ex: "squat", reps: 52, t: "26m ago" },
      { p: 7, ex: "pushup", reps: 28, t: "34m ago" },
    ];
    const live = acts.map((a, i) => { const pe = S.PEOPLE[a.p], m = exMeta(a.ex);
      return `<div class="ac-live"><div class="lav" style="background-image:${grad(pe.av)}"><span class="x" style="background:${m.c}">${I(m.i, 12)}</span></div>
        <div class="tx"><b>${pe.me ? "You" : pe.name}</b><p>counted <b style="color:var(--text-primary)">${a.reps}</b> ${m.n.toLowerCase()}</p><div class="tm">${a.t}</div></div>
        <button class="ac-cheer ${i === 0 ? "on" : ""}" onclick="this.classList.toggle('on')">${I("heart", 13)} Cheer</button></div>`; }).join("");
    return `<div class="ac-livehead"><span class="live"><span class="d"></span>LIVE</span> · activity from everyone</div>${live}<div class="ac-note">Every counted set shows here — whether or not a clip was posted.</div>`;
  }

  function render(v) { cur.v = v; return v === "2" ? v2() : v === "3" ? v3() : v1(); }
  function rerender() { const h = document.getElementById("content"); h.innerHTML = render(cur.v); window.Icons.init(h); }
  function setScope(s) { cur.scope = s; rerender(); }
  function setMetric(m) { cur.metric = m; rerender(); }
  return { render, setScope, setMetric };
})();
