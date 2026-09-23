/* Community feed — three redesign variations built from the reference.
   V5·A Podium · V5·B Multi-Exercise Session · V5·C Dense Feed.
   Emoji in the reference are mapped to Buzzend SVG icons; all color is token-driven. */
window.CommunityVariants = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // avatar gradients per person (reused Social-style stops)
  const AV = {
    "Maya Chen": "#e6a06a,#c9743a", "Jordan Rivera": "#6a8caf,#33566f",
    "Priya Nair": "#57d9a3,#2f9e78", "Sam Okafor": "#e0a24a,#b87a26",
    "Taylor Kim": "#b78ad9,#7d54a4", "Riley Foster": "#6ab0d9,#3a7fa4",
  };
  // exercise meta: figure glyph + label + category class (drives the tint)
  const EX = {
    pushup:  { ic: "pushup",  lb: "Push-ups",      cls: "pushup" },
    squat:   { ic: "squat",   lb: "Squats",        cls: "squat" },
    situp:   { ic: "situp",   lb: "Sit-ups",       cls: "situp" },
    lunge:   { ic: "lunge",   lb: "Lunges",        cls: "lunge" },
    jumping: { ic: "jumping", lb: "Jumping Jacks", cls: "jumping" },
  };
  const av = (name, size, dot) => `<span class="cv-av" style="width:${size}px;height:${size}px;background-image:${grad(AV[name])}">${initials(name)}${dot || ""}</span>`;
  const liveDot = `<span class="dot live"></span>`;
  const sportDot = (ex) => `<span class="dot">${I(EX[ex].ic, 9)}</span>`;
  const badge = (cls, icon, txt) => `<span class="cv-badge ${cls}">${I(icon, 13)}${txt}</span>`;

  // ---------- V5·A Podium ----------
  const PODIUM = [
    { name: "Maya Chen",     verb: "Completed", ex: "pushup", reps: 18, time: "12m", streak: 5,  rank: 1, medal: "g", place: "#1 · LEADERBOARD",
      badges: [["gold", "medal", "Gold Push"], ["streak", "flame", "5-Day"], ["pr", "zap", "PR"]] },
    { name: "Jordan Rivera", verb: "Crushed",   ex: "squat",  reps: 24, time: "18m", streak: 12, rank: 2, medal: "s", place: "#2 · LEADERBOARD",
      badges: [["silver", "medal", "Silver Squat"], ["club", "trophy", "100 Club"]] },
    { name: "Priya Nair",    verb: "Logged",    ex: "situp",  reps: 15, time: "22m", streak: 3,  rank: 3, medal: "b", place: "#5 · LEADERBOARD",
      badges: [["bronze", "medal", "Bronze Core"], ["streak", "flame", "3-Day"]] },
  ];
  function podiumCard(p) {
    const e = EX[p.ex];
    return `<div class="va-card">
      <div class="va-top">
        ${av(p.name, 52, liveDot)}
        <div class="va-nm cv-ex ${e.cls}"><div class="n">${p.name}</div>
          <div class="d">${p.verb} <span class="cv-ei">${I(e.ic, 14)}</span> <b>${e.lb}</b></div></div>
        <div class="va-rank"><span class="lb">${p.place}</span><span class="va-medal ${p.medal}">${p.rank}</span></div></div>
      <div class="va-stats">
        <div class="va-stat"><div class="v">${p.reps}</div><div class="k">REPS</div></div>
        <div class="va-stat"><div class="v">${p.time}</div><div class="k">TIME</div></div>
        <div class="va-stat"><div class="v">${p.streak}</div><div class="k">STREAK</div></div></div>
      <div class="va-badges">${p.badges.map((b) => badge(b[0], b[1], b[2])).join("")}</div></div>`;
  }
  function podium() {
    return `<div class="cv-panel">
      <div class="cv-feedh"><span class="b">Buzzend <span>feed</span></span><span class="r">Today</span></div>
      <div class="va-sub"><span class="l">LEADERBOARD</span><span class="r">4 activities</span></div>
      ${PODIUM.map(podiumCard).join("")}</div>`;
  }

  // ---------- V5·B Multi-Exercise Session ----------
  const SESSIONS = [
    { name: "Maya Chen", sub: "Completed a full-body session", total: 45, t: "2m ago",
      rows: [["pushup", 20, ["gold", "medal", "Gold"]], ["squat", 15], ["situp", 10]],
      badges: [["streak", "flame", "5-Day Streak"], ["pr", "zap", "New PR"]] },
    { name: "Jordan Rivera", sub: "Crushed a 5-exercise circuit", total: 95, t: "18m ago",
      rows: [["pushup", 30, ["club", "trophy", "100 Club"]], ["squat", 25], ["situp", 15], ["lunge", 15], ["jumping", 10]],
      badges: [["gold", "medal", "Full Circuit"], ["streak", "flame", "12-Day Streak"]] },
  ];
  function sessionRow(r) {
    const e = EX[r[0]], b = r[2];
    return `<div class="vb-row cv-ex ${e.cls}"><span class="vb-ei">${I(e.ic, 20)}</span>
      <span class="en">${e.lb}</span>
      ${b ? badge(b[0], b[1], b[2]) : ""}
      <span class="er">${r[1]}<small>reps</small></span></div>`;
  }
  function sessionCard(s) {
    return `<div class="vb-card">
      <div class="vb-top">${av(s.name, 52)}
        <div class="vb-who"><div class="n">${s.name}</div><div class="s">${s.sub}</div></div>
        <div class="vb-tot"><div class="v">${s.total}</div><div class="k">TOTAL REPS</div></div></div>
      ${s.rows.map(sessionRow).join("")}
      <div class="vb-foot">${s.badges.map((b) => badge(b[0], b[1], b[2])).join("")}<span class="t">${s.t}</span></div></div>`;
  }
  function sessions() {
    return `<div class="cv-panel">
      <div class="cv-feedh"><span class="b">Buzzend <span>feed</span></span><span class="r">Today</span></div>
      <div class="va-sub"><span class="l">TODAY'S SESSIONS</span><span class="r">2 users</span></div>
      ${SESSIONS.map(sessionCard).join("")}</div>`;
  }

  // ---------- V5·C Dense Feed ----------
  const DENSE = [
    { name: "Maya Chen",     rank: "#1",  total: 35, chips: [["pushup", 20], ["squat", 15]] },
    { name: "Jordan Rivera", rank: "#2",  total: 95, mini: true, chips: [["pushup", 30], ["squat", 25], ["situp", 15], ["lunge", 15], ["jumping", 10]] },
    { name: "Priya Nair",    rank: "#3",  total: 15, chips: [["situp", 15]] },
    { name: "Sam Okafor",    rank: "#6",  total: 32, chips: [["lunge", 12], ["jumping", 20]] },
    { name: "Taylor Kim",    rank: "#8",  total: 40, chips: [["squat", 40]] },
    { name: "Riley Foster",  rank: "#12", total: 12, chips: [["pushup", 12]] },
  ];
  AV["Sam Okafor"] = AV["Sam Okafor"] || "#e0a24a,#b87a26";
  function denseChip(c, mini) {
    const e = EX[c[0]];
    return `<span class="vc-chip cv-ex ${e.cls}${mini ? " mini" : ""}">${I(e.ic, 12)}${mini ? c[1] : e.lb + " " + c[1]}</span>`;
  }
  function denseRow(d) {
    return `<div class="vc-row">${av(d.name, 44, sportDot(d.chips[0][0]))}
      <div class="vc-mid"><div class="vc-nmrow"><span class="n">${d.name}</span><span class="rk">${d.rank}</span></div>
        <div class="vc-chips">${d.chips.map((c) => denseChip(c, d.mini)).join("")}</div></div>
      <div class="vc-rep"><div class="v">${d.total}</div><div class="k">REPS</div></div></div>`;
  }
  function dense() {
    return `<div class="cv-panel">
      <div class="cv-feedh"><span class="b">Buzzend <span>feed</span></span><span class="r">Today</span></div>
      <div class="vc-card">
        <div class="vc-head"><span class="live"></span><span class="b">Active now</span><span class="r">6 users · 8 activities</span></div>
        ${DENSE.map(denseRow).join("")}</div></div>`;
  }

  // ---------- assemble ----------
  const COLS = [
    { tag: "V5 · A", title: "Podium", desc: "One exercise per card. Icon, medal, reward badges.", render: podium },
    { tag: "V5 · B", title: "Multi-Exercise Session", desc: "One card = full workout. Rows for each exercise.", render: sessions },
    { tag: "V5 · C", title: "Dense Feed", desc: "Compact rows. Great when many users are active.", render: dense },
  ];
  function start(mountEl) {
    mountEl.innerHTML = `<div class="cv-canvas">
      <div class="cv-head"><h1>Community feed — 3 variations</h1><p>Reworked from the reference into the Buzzend design system · Electric Orange</p></div>
      <div class="cv-scroll"><div class="cv-wrap">
        ${COLS.map((c) => `<div class="cv-col">
          <div class="cv-colh"><div class="cv-tagrow"><span class="cv-tag">${c.tag}</span><h2>${c.title}</h2></div>
            <div class="cv-desc">${c.desc}</div></div>
          ${c.render()}</div>`).join("")}
      </div></div></div>`;
    window.Icons.init(mountEl);
  }
  return { start };
})();
