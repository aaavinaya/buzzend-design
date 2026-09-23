/* Mixed community feed — the new auto-activity cards interleaved with the EXISTING
   media posts, so the two can be judged side by side in one real scroll. Toggle the
   activity-card style (Rows / Podium / Session / Dense) with the dev switch. */
window.CommunityMixed = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const ini = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const AV = {
    "Maya Chen": "#e6a06a,#c9743a", "Jordan Rivera": "#6a8caf,#33566f",
    "Priya Nair": "#57d9a3,#2f9e78", "Sam Okafor": "#e0a24a,#b87a26",
    "Taylor Kim": "#b78ad9,#7d54a4", "Riley Foster": "#6ab0d9,#3a7fa4",
    "Kriti Karki": "#caa6c9,#9a5e96", "Gaurab Rana": "#b78a5a,#7a5326",
  };
  const EX = {
    pushup:  { ic: "pushup",  lb: "Push-ups",      cls: "pushup" },
    squat:   { ic: "squat",   lb: "Squats",        cls: "squat" },
    situp:   { ic: "situp",   lb: "Sit-ups",       cls: "situp" },
    lunge:   { ic: "lunge",   lb: "Lunges",        cls: "lunge" },
    jumping: { ic: "jumping", lb: "Jumping Jacks", cls: "jumping" },
  };
  const av = (n, sz, dot) => `<span class="cv-av" style="width:${sz}px;height:${sz}px;background-image:${grad(AV[n])}">${ini(n)}${dot || ""}</span>`;
  const badge = (c, ic, t) => `<span class="cv-badge ${c}">${I(ic, 13)}${t}</span>`;

  // one chronological feed: auto-activity events + existing-style media posts
  const FEED = [
    { type: "act", name: "Maya Chen", t: "2m ago", streak: 5, time: "12m",
      ex: [["pushup", 20], ["squat", 15], ["situp", 10]], badges: [["gold", "medal", "Gold"], ["pr", "zap", "PR"]] },
    { type: "act", name: "Jordan Rivera", t: "12m ago", streak: 12, time: "18m",
      ex: [["pushup", 30], ["squat", 25], ["situp", 15], ["lunge", 15], ["jumping", 10]], badges: [["club", "trophy", "100 Club"]] },
    { type: "media", name: "Kriti Karki", t: "1h ago", sub: "recorded a workout",
      g: "linear-gradient(150deg,#8a5a1a,#e0922a)", cap: "40 clean squats.", video: true, reps: 40, exlabel: "squats", likes: 88, views: "3.4k" },
    { type: "act", name: "Priya Nair", t: "2h ago", streak: 3, time: "22m",
      ex: [["situp", 15]], badges: [["bronze", "medal", "Bronze"]] },
    { type: "act", name: "Sam Okafor", t: "3h ago", streak: 2, time: "9m",
      ex: [["lunge", 12], ["jumping", 20]], badges: [] },
    { type: "media", name: "Gaurab Rana", t: "4h ago", sub: "posted a photo",
      g: "linear-gradient(160deg,#3a6b4a,#1e3a2a)", cap: "Morning grind, done.", video: false, likes: 24, views: "1.2k" },
    { type: "act", name: "Taylor Kim", t: "5h ago", streak: 6, time: "15m",
      ex: [["squat", 40]], badges: [["gold", "medal", "Gold"]] },
    { type: "act", name: "Riley Foster", t: "6h ago", streak: 1, time: "6m",
      ex: [["pushup", 12]], badges: [] },
  ];
  const total = (e) => e.ex.reduce((s, x) => s + x[1], 0);
  const primary = (e) => e.ex[0];

  // ── existing-style media post (reuses .cf-card exactly) ──
  function media(e, i) {
    const b = e.reps ? `<span class="cf-cbadge"><span class="z">${I("zap", 12)}</span>${e.reps} ${e.exlabel}</span>` : "";
    const play = e.video ? `<span class="play">${I("play", 16)}</span>` : "";
    return `<div class="cf-card">
      <div class="cf-card-h">
        <div class="av" style="background-image:${grad(AV[e.name])}"></div>
        <div class="who"><div class="nm"><b>${e.name}</b></div><div class="t">${e.t} · ${e.sub}</div></div>
        <button class="mm">${I("more", 18)}</button></div>
      <div class="cf-card-media" style="background:${e.g}"><div class="cap">${e.cap}</div>${play}${b}</div>
      <div class="cf-card-a">
        <span class="cf-a"><span class="like" onclick="CommunityMixed.like(this,${i})">${I("heart", 17)}</span><b data-lc="${i}">${e.likes}</b></span>
        <span class="cf-a">${I("eye", 17)} ${e.views}</span>
        <span class="cf-a">${I("share", 17)} Share</span></div></div>`;
  }

  // ── activity renderers, one per style ──
  function rowsAct(e) {                                   // compact edge-to-edge (recommended inline)
    const me = EX[primary(e)[0]];
    const label = e.ex.length > 1
      ? `did <span class="m">${total(e)} reps</span> · ${e.ex.length} moves`
      : `did <span class="m">${primary(e)[1]} ${me.lb.toLowerCase()}</span>`;
    return `<div class="af-act">
      <span class="af-avwrap"><span class="af-av" style="background-image:${grad(AV[e.name])}">${ini(e.name)}</span>
        <span class="af-type${e.badges.length ? " milestone" : ""}">${I(me.ic, 11)}</span></span>
      <span class="af-mid"><span class="af-txt"><b>${e.name.split(" ")[0]}</b> ${label}</span><span class="af-time">${e.t}</span></span>
      <button class="af-cheer" onclick="CommunityMixed.cheer(this)">${I("flame", 14)}<b>${e.streak}</b></button></div>`;
  }
  function podiumAct(e) {                                 // boxed single-highlight card
    const p = primary(e), me = EX[p[0]];
    return `<div class="va-card">
      <div class="va-top">${av(e.name, 52)}
        <div class="va-nm cv-ex ${me.cls}"><div class="n">${e.name}</div>
          <div class="d">did <span class="cv-ei">${I(me.ic, 14)}</span> <b>${me.lb}</b></div></div>
        <div class="va-rank"><span class="lb">${e.t.toUpperCase()}</span></div></div>
      <div class="va-stats">
        <div class="va-stat"><div class="v">${p[1]}</div><div class="k">REPS</div></div>
        <div class="va-stat"><div class="v">${e.time}</div><div class="k">TIME</div></div>
        <div class="va-stat"><div class="v">${e.streak}</div><div class="k">STREAK</div></div></div>
      ${e.badges.length ? `<div class="va-badges">${e.badges.map((b) => badge(b[0], b[1], b[2])).join("")}</div>` : ""}</div>`;
  }
  function sessionAct(e) {                                // boxed full-session card
    const rows = e.ex.map((x) => { const me = EX[x[0]];
      return `<div class="vb-row cv-ex ${me.cls}"><span class="vb-ei">${I(me.ic, 20)}</span><span class="en">${me.lb}</span><span class="er">${x[1]}<small>reps</small></span></div>`;
    }).join("");
    const sub = e.ex.length > 1 ? `Completed a ${e.ex.length}-exercise session` : `Completed ${EX[e.ex[0][0]].lb}`;
    return `<div class="vb-card">
      <div class="vb-top">${av(e.name, 52)}
        <div class="vb-who"><div class="n">${e.name}</div><div class="s">${sub}</div></div>
        <div class="vb-tot"><div class="v">${total(e)}</div><div class="k">TOTAL REPS</div></div></div>
      ${rows}
      <div class="vb-foot">${e.badges.map((b) => badge(b[0], b[1], b[2])).join("")}<span class="t">${e.t}</span></div></div>`;
  }
  function denseRow(e) {                                  // compact multi-metric row (grouped in a card)
    const mini = e.ex.length > 2;
    const chips = e.ex.map((x) => { const me = EX[x[0]];
      return `<span class="vc-chip cv-ex ${me.cls}${mini ? " mini" : ""}">${I(me.ic, 12)}${mini ? x[1] : me.lb + " " + x[1]}</span>`;
    }).join("");
    return `<div class="vc-row">${av(e.name, 44, `<span class="dot">${I(EX[e.ex[0][0]].ic, 9)}</span>`)}
      <div class="vc-mid"><div class="vc-nmrow"><span class="n">${e.name}</span><span class="rk">${e.t}</span></div>
        <div class="vc-chips">${chips}</div></div>
      <div class="vc-rep"><div class="v">${total(e)}</div><div class="k">REPS</div></div></div>`;
  }

  const cur = { style: "rows" };
  function bodyHtml() {
    const s = cur.style;
    if (s === "dense") {                                 // group consecutive activities into one card
      let out = "", buf = [];
      const flush = () => { if (buf.length) { out += `<div class="vc-card">${buf.map(denseRow).join("")}</div>`; buf = []; } };
      FEED.forEach((e, i) => { if (e.type === "act") buf.push(e); else { flush(); out += media(e, i); } });
      flush();
      return `<div class="mx-feed boxed">${out}</div>`;
    }
    const boxed = s === "podium" || s === "session";
    const render = s === "podium" ? podiumAct : s === "session" ? sessionAct : rowsAct;
    let out = "";
    FEED.forEach((e, i) => { out += e.type === "media" ? media(e, i) : render(e); });
    return `<div class="mx-feed${boxed ? " boxed" : ""}">${out}</div>`;
  }

  function header() {
    const tab = (t, on) => `<div class="cf-tab ${on ? "on" : ""}">${t}</div>`;
    return `<div class="cf-top">
      <div class="cf-toprow"><div class="cf-title">Community</div>
        <button class="cf-ic">${I("search", 18)}</button>
        <button class="cf-ic">${I("plus", 20)}</button></div>
      <div class="cf-sub">Auto-activity and posts, together in one feed.</div>
      <div class="cf-tabs">${tab("All", true)}${tab("Friends")}${tab("Milestones")}</div></div>
      <div class="mx-note">${I("info", 15)}<span><b>Mixed feed.</b> Auto-generated activity cards and existing photo/video posts share the same scroll — use the switch above to compare activity-card styles.</span></div>`;
  }

  function like(el, i) {
    const c = document.querySelector(`[data-lc="${i}"]`); const on = el.classList.toggle("liked");
    if (c) c.textContent = (parseInt(c.textContent, 10) || 0) + (on ? 1 : -1);
  }
  function cheer(btn) { const on = btn.classList.toggle("on"); const b = btn.querySelector("b"); b.textContent = (+b.textContent) + (on ? 1 : -1); }
  function setStyle(s) {
    cur.style = s;
    const b = document.getElementById("mx-body"); b.innerHTML = bodyHtml(); window.Icons.init(b);
    document.querySelectorAll(".state-switch button").forEach((x) => x.classList.toggle("active", x.dataset.st === s));
  }
  function start(mountEl, s) {
    cur.style = s || "rows";
    mountEl.innerHTML = header() + `<div id="mx-body">${bodyHtml()}</div>`;
    window.Icons.init(mountEl);
  }
  return { start, setStyle, like, cheer };
})();
