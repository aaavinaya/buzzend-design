/* Community — Session-design pages.
   V1: Session cards as the default "Activities" tab + a "Posts" tab that keeps the
       existing full-bleed post design untouched.
   V2 (final): ONE clean feed — sessions, media posts and a Beat-It competition post,
       newest first, no tabs. Every card carries the same like / view / share bar:
       tap the heart to like, tap the counts to see who liked / viewed (bottom sheet),
       tap Share to send — the pattern people know from Facebook / LinkedIn.
   Reuses .vb-card (session), .cf-card + .cf-lb (post / competition), .cf-people
   (liked/viewed sheet) and tokens. Only the .pa action bar is new. */
window.CommunitySessions = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social;
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const ini = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // avatar colours for the feed's authors (session/post people live here; competition
  // board people come from Social.PEOPLE) — one lookup handles both.
  const AV = {
    "Maya Chen": "#e6a06a,#c9743a", "Jordan Rivera": "#6a8caf,#33566f",
    "Priya Nair": "#57d9a3,#2f9e78", "Sam Okafor": "#e0a24a,#b87a26",
    "Avinaya Acharya": "#57d9a3,#2f9e78", "Riya Bharati": "#d98fb0,#a4477a",
    "Taylor Kim": "#b78ad9,#7d54a4", "Riley Foster": "#6ab0d9,#3a7fa4",
    "Kriti Karki": "#caa6c9,#9a5e96", "Gaurab Rana": "#b78a5a,#7a5326",
    "Anita Malan": "#8aa6c9,#3a5a8a", "Ravi Thapa": "#c98a9a,#7a3a5a",
  };
  const gradOf = (name) => grad(AV[name] || ((S.PEOPLE || []).find((p) => p.name === name) || {}).av || "#c9a6a6,#a87766");
  const EX = {
    pushup:  { ic: "pushup",  lb: "Push-ups",      cls: "pushup" },
    squat:   { ic: "squat",   lb: "Squats",        cls: "squat" },
    situp:   { ic: "situp",   lb: "Sit-ups",       cls: "situp" },
    lunge:   { ic: "lunge",   lb: "Lunges",        cls: "lunge" },
    jumping: { ic: "jumping", lb: "Jumping Jacks", cls: "jumping" },
  };
  const av = (n, sz, dot) => `<span class="cv-av" style="width:${sz}px;height:${sz}px;background-image:${gradOf(n)}">${ini(n)}${dot || ""}</span>`;
  const badge = (c, ic, t) => `<span class="cv-badge ${c}">${I(ic, 13)}${t}</span>`;

  // ── data (newest first — `min` = minutes-ago, drives V2 chronology) ──
  const SESS = [
    { id: "s0", name: "Maya Chen", t: "2m ago", min: 2, streak: 5, time: "12m", friend: true, likes: 18, views: 210,
      ex: [["pushup", 20], ["squat", 15], ["situp", 10]], badges: [["gold", "medal", "Gold"], ["pr", "zap", "New PR"]] },
    { id: "s1", name: "Jordan Rivera", t: "12m ago", min: 12, streak: 12, time: "18m", friend: true, likes: 42, views: 540,
      ex: [["pushup", 30], ["squat", 25], ["situp", 15], ["lunge", 15], ["jumping", 10]], badges: [["club", "trophy", "100 Club"]] },
    { id: "s2", name: "Priya Nair", t: "40m ago", min: 40, streak: 3, time: "9m", friend: false, likes: 7, views: 96,
      ex: [["situp", 15]], badges: [["bronze", "medal", "Bronze Core"]] },
    { id: "s3", name: "Sam Okafor", t: "1h ago", min: 75, streak: 2, time: "11m", friend: false, likes: 11, views: 180,
      ex: [["lunge", 12], ["jumping", 20]], badges: [] },
    { id: "s4", name: "Avinaya Acharya", t: "2h ago", min: 130, streak: 8, time: "20m", friend: true, likes: 25, views: 320,
      ex: [["pushup", 25], ["squat", 20]], badges: [["streak", "flame", "8-Day Streak"]] },
    { id: "s5", name: "Riya Bharati", t: "3h ago", min: 190, streak: 1, time: "7m", friend: false, likes: 5, views: 88,
      ex: [["jumping", 40]], badges: [["pr", "zap", "New PR"]] },
    { id: "s6", name: "Taylor Kim", t: "5h ago", min: 300, streak: 6, time: "15m", friend: true, likes: 30, views: 260,
      ex: [["squat", 40]], badges: [["gold", "medal", "Gold Squat"]] },
    { id: "s7", name: "Riley Foster", t: "6h ago", min: 360, streak: 1, time: "6m", friend: false, likes: 4, views: 70,
      ex: [["pushup", 12]], badges: [] },
  ];
  const POSTS = [
    { id: "p0", name: "Kriti Karki", t: "1h ago", min: 60, sub: "recorded a workout", friend: true,
      g: "linear-gradient(150deg,#8a5a1a,#e0922a)", cap: "40 clean squats.", video: true, reps: 40, exlabel: "squats", likes: 88, views: 3400 },
    { id: "p1", name: "Gaurab Rana", t: "4h ago", min: 240, sub: "posted a photo", friend: true,
      g: "linear-gradient(160deg,#3a6b4a,#1e3a2a)", cap: "Morning grind, done.", video: false, likes: 24, views: 1200 },
    { id: "p2", name: "Anita Malan", t: "6h ago", min: 380, sub: "posted a photo", friend: false,
      g: "linear-gradient(150deg,#3a5a8a,#1e2e4a)", cap: "Sunrise 5k, done.", video: false, likes: 31, views: 980 },
    { id: "p3", name: "Ravi Thapa", t: "1d ago", min: 1440, sub: "recorded a workout", friend: false,
      g: "linear-gradient(150deg,#7a3a5a,#4a1e2e)", cap: "New squat PR.", video: true, reps: 50, exlabel: "squats", likes: 52, views: 2100 },
  ];
  // Beat-It competition post — an open 30-second challenge with a live top-3 board.
  const COMP = [
    { id: "c0", name: "Sita Rai", t: "30m ago", min: 30, friend: true, ex: "situp", reps: 22, left: "2d left",
      cap: "22 sit-ups in 30s — think you can beat it?", g: "linear-gradient(150deg,#2f6f5a,#173a2e)",
      likes: 34, views: 1100, owner: "Sita Rai",
      board: [["Sita Rai", 22], ["Adesh Pokhrel", 19], ["Ravi Thapa", 17], [S.ME.name, 15]] },
  ];
  const total = (e) => e.ex.reduce((s, x) => s + x[1], 0);

  // ── like / view state (keyed by card id) ──
  const STATE = {};
  [...SESS, ...POSTS, ...COMP].forEach((e) => { STATE[e.id] = { likes: e.likes, liked: false, views: e.views }; });
  const seedOf = (id) => id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  // ── the shared action row (Facebook engagement bar): the heart toggles a Love,
  //    the eye opens "who viewed", the arrow shares, and the filled reaction circle on
  //    the right opens "who loved". Counts sit tight to their icon. ──
  function paInner(id) {
    const s = STATE[id];
    const loveLbl = s.likes > 0 ? S.fmt(s.likes) : (s.liked ? "Loved" : "Love");
    const react = s.likes > 0
      ? `<button class="pa-react" onclick="CommunitySessions.likers('${id}',event)" aria-label="See who loved">${I("heart", 14)}</button>` : "";
    return `<button class="pa-act love${s.liked ? " loved" : ""}" onclick="CommunitySessions.like('${id}',event)">${I("heart", 20)}<span>${loveLbl}</span></button>
      <button class="pa-act" onclick="CommunitySessions.viewers('${id}',event)">${I("eye", 20)}<span>${S.fmt(s.views)}</span></button>
      <button class="pa-act pa-icon" onclick="CommunitySessions.share(event)" aria-label="Share">${I("share", 20)}</button>
      ${react}`;
  }
  const pa = (id) => `<div class="pa" data-pa="${id}">${paInner(id)}</div>`;

  // ── renderers ──
  function sessionCard(e) {
    const rows = e.ex.map((x) => { const me = EX[x[0]];
      return `<div class="vb-row cv-ex ${me.cls}"><span class="vb-ei">${I(me.ic, 20)}</span><span class="en">${me.lb}</span><span class="er">${x[1]}<small>reps</small></span></div>`;
    }).join("");
    const sub = e.ex.length > 1 ? `Completed a ${e.ex.length}-exercise session` : `Completed ${EX[e.ex[0][0]].lb}`;
    // Time sits on the name line (like a social card) — no reward badges, so there's no
    // footer row for it to sit alone in, and the subtitle keeps the full width.
    return `<div class="vb-card">
      <div class="vb-top">${av(e.name, 52)}
        <div class="vb-who"><div class="n">${e.name}<span class="tm"> · ${e.t}</span></div><div class="s">${sub}</div></div>
        <div class="vb-tot"><div class="v">${total(e)}</div><div class="k">TOTAL REPS</div></div></div>
      ${rows}
      ${pa(e.id)}</div>`;
  }
  function postCard(e) {
    const b = e.reps ? `<span class="cf-cbadge"><span class="z">${I("zap", 12)}</span>${e.reps} ${e.exlabel}</span>` : "";
    const play = e.video ? `<span class="play">${I("play", 16)}</span>` : "";
    return `<div class="cf-card">
      <div class="cf-card-h">
        <div class="av" style="background-image:${gradOf(e.name)}"></div>
        <div class="who"><div class="nm"><b>${e.name}</b></div><div class="t">${e.t} · ${e.sub}</div></div>
        <button class="mm" onclick="CommunitySessions.postMenu(event)">${I("more", 18)}</button></div>
      <div class="cf-card-media" style="background:${e.g}"><div class="cap">${e.cap}</div>${play}${b}</div>
      ${pa(e.id)}</div>`;
  }
  // Beat-It competition card — media prompt + inline top-3 leaderboard strip + action bar.
  function compCard(e) {
    const board = e.board.map(([name, score]) => ({ name, score, owner: name === e.owner }))
      .sort((a, b) => b.score - a.score).map((r, k) => ({ ...r, rank: k + 1 }));
    const challengers = board.filter((r) => !r.owner);
    const me = board.find((r) => r.name === S.ME.name);
    const row = (r) => `<div class="cf-lbr${r.rank === 1 ? " top" : ""}">
      <span class="cf-lbrk r${r.rank}">${r.rank}</span>
      <span class="av" style="background-image:${gradOf(r.name)}"></span>
      <span class="nm">${r.name === S.ME.name ? "You" : r.name.split(" ")[0]}</span>
      <span class="sc">${r.score}<small>reps</small></span></div>`;
    const head = `<div class="cf-lbh">${I("trophy", 15)}<span class="tt">${EX[e.ex].lb} Challenge</span>
      <span class="tag">${challengers.length} competing</span>
      <span class="right">${me ? `<span class="you">You #${me.rank}</span>` : ""}${I("chevron", 18)}</span></div>`;
    const strip = `<div class="cf-lb" onclick="CommunitySessions.openBoard(event)">${head}
      <div class="cf-lbboard">${board.slice(0, 3).map(row).join("")}</div>
      <button class="cf-lbcta" onclick="CommunitySessions.beatIt(event)">${I("target", 15)} Beat it</button></div>`;
    return `<div class="cf-card">
      <div class="cf-card-h">
        <div class="av" style="background-image:${gradOf(e.name)}"></div>
        <div class="who"><div class="nm"><b>${e.name}</b></div><div class="t">${e.t} · <span class="cf-chlink" onclick="CommunitySessions.openBoard(event)">Competitions</span></div></div>
        <button class="mm" onclick="CommunitySessions.postMenu(event)">${I("more", 18)}</button></div>
      <div class="cf-card-media" style="background:${e.g}"><div class="cap">${e.cap}</div>
        <span class="cf-cbadge"><span class="z">${I("zap", 12)}</span>${e.reps} ${EX[e.ex].lb.toLowerCase()}</span>
        <span class="cf-cstatus live"><span class="d"></span>Live · ${e.left}</span></div>
      ${strip}
      ${pa(e.id)}</div>`;
  }
  const cardFor = (it) => it.kind === "s" ? sessionCard(it.e) : it.kind === "c" ? compCard(it.e) : postCard(it.e);
  const noneState = (label) => `<div class="af-none">${I("users", 26)}<div class="t">No ${label} yet</div><div class="d">It'll show up here as it happens.</div></div>`;

  // ── V1 bodies (unchanged intent: Activities tab + Posts tab) ──
  function activitiesBody() {
    return `<div class="mx-feed boxed">
      <div class="va-sub"><span class="l">TODAY'S SESSIONS</span><span class="r">${SESS.length} people active</span></div>
      ${SESS.map(sessionCard).join("")}</div>`;
  }
  function postsBody() {   // V1 Posts tab keeps the existing full-bleed media design
    return `<div class="mx-feed">${POSTS.map(postCard).join("")}</div>`;
  }

  // ── V2 body — one chronological feed, everything together, no tabs ──
  function feedBody() {
    const items = SESS.map((e) => ({ kind: "s", e }))
      .concat(POSTS.map((e) => ({ kind: "p", e })), COMP.map((e) => ({ kind: "c", e })))
      .sort((a, b) => a.e.min - b.e.min);
    if (!items.length) return `<div class="mx-feed boxed">${noneState("activity")}</div>`;
    return `<div class="mx-feed boxed">${items.map(cardFor).join("")}</div>`;
  }

  // ── headers ──
  function header(tabs, activeId, sub) {
    const t = tabs.map((x) => `<div class="cf-tab ${x.id === activeId ? "on" : ""}" data-t="${x.id}" onclick="CommunitySessions.tab('${x.id}')">${x.label}</div>`).join("");
    return `<div class="cf-top">
      <div class="cf-toprow"><div class="cf-title">Community</div>
        <button class="cf-ic">${I("search", 18)}</button><button class="cf-ic">${I("plus", 20)}</button></div>
      <div class="cf-sub">${sub}</div>
      <div class="cf-tabs">${t}</div></div>`;
  }
  function headerV2() {   // lives inside the Home page as its own section — no search / add controls
    return `<div class="cf-top cf-top-plain">
      <div class="cf-toprow"><div class="cf-title">Community</div></div></div>`;
  }

  const cur = { page: "v1", tab: "activities" };
  const V1TABS = [{ id: "activities", label: "Activities" }, { id: "posts", label: "Posts" }];

  function tab(id) {
    cur.tab = id;
    document.querySelectorAll(".cf-tabs .cf-tab").forEach((x) => x.classList.toggle("on", x.dataset.t === id));
    const b = document.getElementById("cs-body");
    b.innerHTML = cur.tab === "posts" ? postsBody() : activitiesBody();
    window.Icons.init(b);
  }

  // ── interactions ──
  function like(id, ev) {
    if (ev) ev.stopPropagation();
    const s = STATE[id]; s.liked = !s.liked; s.likes += s.liked ? 1 : -1;
    const el = document.querySelector(`[data-pa="${id}"]`);
    if (el) { el.innerHTML = paInner(id); window.Icons.init(el); }
  }
  // Liked-by / Viewed-by bottom sheet (native PeopleSheet) — real names, follow control.
  function peopleList(seed, n) { const pool = S.PEOPLE.slice(1); n = Math.min(n, pool.length); const out = []; for (let k = 0; k < n; k++) out.push(pool[(seed + k) % pool.length]); return out; }
  function openPeople(title, ic, total, seed) {
    const rows = peopleList(seed, Math.min(9, total)).map((p) => `<div class="cf-prow">
      <div class="av" style="background-image:${grad(p.av)}"></div>
      <div class="nm"><b>${p.name}</b><span>${p.friend ? "Following" : "@" + p.name.split(" ")[0].toLowerCase()}</span></div>
      ${p.friend ? `<button class="cf-pfollow on">Following</button>` : `<button class="cf-pfollow" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'Following':'Follow'">Follow</button>`}</div>`).join("");
    window.Buzzend.sheet({ html: `<div class="cf-phead">${I(ic, 18)} <span>${title}</span><b>${S.fmt(total)}</b></div><div class="cf-people">${rows}</div>` });
  }
  function likers(id, ev) { if (ev) ev.stopPropagation(); openPeople("Loved by", "heart", STATE[id].likes, seedOf(id) + 1); }
  function viewers(id, ev) { if (ev) ev.stopPropagation(); openPeople("Viewed by", "eye", STATE[id].views, seedOf(id) + 4); }
  function share(ev) { if (ev) ev.stopPropagation(); window.Buzzend.alert({ icon: "share", title: "Share post", message: "Send this to friends or share to your story." }); }
  function postMenu(ev) {
    if (ev) ev.stopPropagation();
    window.Buzzend.sheet({ html: `<div class="cf-pmenu">
      <button class="cf-pm" onclick="Buzzend.closeTop();CommunitySessions.share()">${I("send", 18)} Share to…</button>
      <button class="cf-pm" onclick="Buzzend.closeTop();Buzzend.alert({icon:'copy',title:'Link copied',message:'Post link copied to your clipboard.'})">${I("copy", 18)} Copy link</button>
      <button class="cf-pm danger" onclick="Buzzend.closeTop();Buzzend.alert({icon:'flag',title:'Reported',message:'Thanks — our team will review this post.'})">${I("flag", 18)} Report post</button></div>` });
  }
  function openBoard(ev) { if (ev) ev.stopPropagation(); location.href = "post-leaderboard.html?v=leaderboard"; }
  function beatIt(ev) { if (ev) ev.stopPropagation(); location.href = "post-leaderboard.html?v=beatit"; }

  // ── entry points ──
  function startV1(mountEl) {
    cur.page = "v1"; cur.tab = "activities";
    mountEl.innerHTML = header(V1TABS, "activities", "Your sessions, auto-logged. Posts live on their own tab.")
      + `<div id="cs-body">${activitiesBody()}</div>`;
    window.Icons.init(mountEl);
  }
  function startV2(mountEl) {
    cur.page = "v2";
    mountEl.innerHTML = headerV2() + `<div id="cs-body">${feedBody()}</div>`;
    window.Icons.init(mountEl);
  }
  return { startV1, startV2, tab, like, likers, viewers, share, postMenu, openBoard, beatIt };
})();
