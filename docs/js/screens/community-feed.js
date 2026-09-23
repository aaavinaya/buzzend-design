/* Community — V1 auto-generated activity feed. A new page that reuses the existing
   Community design system (cf-* header + media cards, tokens, Social avatars, workout
   icons). Lightweight auto-activity cards (completing a workout posts them — no compose)
   live natively beside the existing media posts. Does not touch the current community.js. */
window.CommunityFeed = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, fmt = S ? S.fmt : (v) => "" + v;
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const esc = (s) => (s + "").replace(/'/g, "");

  // people in the feed (name · avatar gradient · friend?) — real names, not placeholders
  const P = {
    me:    { n: "Ema William",     av: "#6a8caf,#33566f", friend: true },
    kriti: { n: "Kriti Karki",     av: "#caa6c9,#9a5e96", friend: true },
    gaurab:{ n: "Gaurab Rana",     av: "#b78a5a,#7a5326", friend: true },
    avinaya:{n: "Avinaya Acharya", av: "#57d9a3,#2f9e78", friend: true },
    riya:  { n: "Riya Bharati",    av: "#d98fb0,#a4477a", friend: false },
    anita: { n: "Anita Malan",     av: "#b8c6d1,#8aa0b3", friend: true },
    sita:  { n: "Sita Rai",        av: "#a6c9b5,#5e996f", friend: true },
    ravi:  { n: "Ravi Thapa",      av: "#c9a6a6,#a87766", friend: false },
    maya:  { n: "Maya Gurung",     av: "#c9b59b,#9a7d5e", friend: false },
    kiran: { n: "Kiran Shah",      av: "#c9c19b,#9a8c5e", friend: true },
    drake: { n: "Drake Parker",    av: "#9b9bc9,#5e5e9a", friend: false },
  };

  // media gradients (reuse the community media look)
  const G = { squat: "linear-gradient(150deg,#8a5a1a,#e0922a)", trail: "linear-gradient(160deg,#3a6b4a,#1e3a2a)" };

  /* the feed — a realistic mix, newest first, bucketed by time. `mile` = milestone
     (streak / personal best / challenge) so it can read a touch stronger + filter.
     `media` items are full posts; everything else is an auto-activity card. */
  const EVENTS = [
    { p: "me",     kind: "steps",  n: "6,200", t: "25m ago", bucket: "Today", cheers: 2 },
    { p: "kriti",  kind: "reps",   ex: "squat",  n: 40, name: "squats", verb: "did", t: "2h ago", bucket: "Today", cheers: 6 },
    { p: "anita",  kind: "streak", n: 7,  mile: true, t: "3h ago", bucket: "Today", cheers: 11 },
    { p: "gaurab", kind: "steps",  n: "8,000", t: "3h ago", bucket: "Today", cheers: 4 },
    { p: "gaurab", kind: "media",  g: G.trail, cap: "Morning grind, done.", video: false, likes: 24, views: "1.2k", liked: false, sub: "posted a photo", t: "4h ago", bucket: "Today" },
    { p: "avinaya",kind: "reps",   ex: "pushup", n: 25, name: "push-ups", verb: "completed", t: "5h ago", bucket: "Today", cheers: 3 },
    { p: "sita",   kind: "pb",     ex: "situp", n: 24, name: "sit-ups", mile: true, t: "6h ago", bucket: "Today", cheers: 9 },
    { p: "riya",   kind: "workout",dur: "15 min", t: "1d ago", bucket: "Yesterday", cheers: 5 },
    { p: "ravi",   kind: "reps",   ex: "lunge",  n: 60, name: "lunges", verb: "did", t: "1d ago", bucket: "Yesterday", cheers: 2 },
    { p: "kriti",  kind: "media",  g: G.squat, cap: "40 clean squats.", video: true, reps: 40, ex: "squat", likes: 88, views: "3.4k", liked: false, sub: "recorded a workout", t: "1d ago", bucket: "Yesterday" },
    { p: "maya",   kind: "reps",   ex: "jumping",n: 50, name: "jumping jacks", verb: "did", t: "1d ago", bucket: "Yesterday", cheers: 7 },
    { p: "kiran",  kind: "challenge", ch: "30-Day Squats", mile: true, t: "2d ago", bucket: "Earlier this week", cheers: 14 },
    { p: "drake",  kind: "reps",   ex: "pushup", n: 30, name: "push-ups", verb: "did", t: "3d ago", bucket: "Earlier this week", cheers: 1 },
  ];

  const cur = { filter: "all", state: "feed" };
  const passes = (e) => cur.filter === "all" ? true : cur.filter === "friends" ? P[e.p].friend : !!e.mile;

  // ── activity card (lightweight) ──
  const typeIcon = (e) => e.kind === "steps" ? I("footprints", 11) : e.kind === "workout" ? I("dumbbell", 11)
    : e.kind === "streak" ? I("flame", 11) : e.kind === "pb" ? I("star", 11) : e.kind === "challenge" ? I("trophy", 11) : I(e.ex, 11);
  function actLabel(e) {
    if (e.kind === "steps")     return `hit <span class="m">${e.n} steps</span>`;
    if (e.kind === "workout")   return `completed a <span class="m">${e.dur} workout</span>`;
    if (e.kind === "streak")    return `reached a <span class="m mile">${e.n}-day streak</span>`;
    if (e.kind === "pb")        return `set a new best — <span class="m mile">${e.n} ${e.name}</span>`;
    if (e.kind === "challenge") return `completed <span class="m mile">${e.ch}</span>`;
    return `${e.verb} <span class="m">${e.n} ${e.name}</span>`;   // reps
  }
  function actCard(e, i) {
    const p = P[e.p];
    return `<div class="af-act" onclick="CommunityFeed.openUser('${esc(p.n)}')">
      <span class="af-avwrap"><span class="af-av" style="background-image:${grad(p.av)}">${initials(p.n)}</span>
        <span class="af-type${e.mile ? " milestone" : ""}">${typeIcon(e)}</span></span>
      <span class="af-mid"><span class="af-txt"><b>${p.n.split(" ")[0]}</b> ${actLabel(e)}</span><span class="af-time">${e.t}</span></span>
      <button class="af-cheer${e.cheered ? " on" : ""}" onclick="event.stopPropagation();CommunityFeed.cheer(this,${i})">${I("flame", 14)}<b>${e.cheers}</b></button>
    </div>`;
  }

  // ── media post (reuses the existing .cf-card look) ──
  function mediaCard(e, i) {
    const p = P[e.p];
    const badge = e.reps ? `<span class="cf-cbadge"><span class="z">${I("zap", 12)}</span>${e.reps} ${e.ex === "squat" ? "squats" : "reps"}</span>` : "";
    const play = e.video ? `<span class="play">${I("play", 16)}</span>` : "";
    return `<div class="cf-card">
      <div class="cf-card-h">
        <div class="av" style="background-image:${grad(p.av)}" onclick="CommunityFeed.openUser('${esc(p.n)}')"></div>
        <div class="who" onclick="CommunityFeed.openUser('${esc(p.n)}')"><div class="nm"><b>${p.n}</b></div><div class="t">${e.t} · ${e.sub}</div></div>
        <button class="mm" onclick="CommunityFeed.postMenu(${i})">${I("more", 18)}</button></div>
      <div class="cf-card-media" style="background:${e.g}" onclick="Buzzend.alert({icon:'play',title:'Post',message:'Opens the full post.'})">
        <div class="cap">${e.cap}</div>${play}${badge}</div>
      <div class="cf-card-a">
        <span class="cf-a"><span class="like${e.liked ? " liked" : ""}" data-l="${i}" onclick="CommunityFeed.like(this,${i})">${I("heart", 17)}</span><b data-lc="${i}">${fmt(e.likes)}</b></span>
        <span class="cf-a">${I("eye", 17)} ${e.views}</span>
        <span class="cf-a" onclick="Buzzend.alert({icon:'share',title:'Share',message:'Send this to friends.'})">${I("share", 17)} Share</span></div></div>`;
  }

  // ── feed body ──
  function feedHtml() {
    let out = "", last = null, any = false;
    EVENTS.forEach((e, i) => {
      if (!passes(e)) return;
      any = true;
      if (e.bucket !== last) { out += `<div class="af-group">${e.bucket}</div>`; last = e.bucket; }
      out += e.kind === "media" ? mediaCard(e, i) : actCard(e, i);
    });
    if (!any) return `<div class="af-none">${I("users", 26)}<div class="t">No ${cur.filter === "friends" ? "friends'" : "milestone"} activity yet</div>
      <div class="d">It'll show up here as it happens.</div></div>`;
    return `<div class="af-list">${out}</div>`;
  }
  function emptyHtml() {
    return `<div class="af-empty"><div class="ill">${I("flame", 42)}<span class="p1"></span><span class="p2"></span><span class="p3"></span></div>
      <h3>Your community is warming up</h3>
      <p>As you and your friends work out, activity shows up here automatically — no posting required.</p>
      <div class="af-eacts">
        <button class="af-btn p" onclick="location.href='../workout/moment.html'">${I("camera", 18)} Start a workout</button>
        <button class="af-btn s" onclick="location.href='friends.html'">${I("users", 17)} Find friends</button></div></div>`;
  }
  function bodyHtml() { return cur.state === "empty" ? emptyHtml() : feedHtml(); }

  // ── header ──
  function header() {
    const tab = (id, label) => `<div class="cf-tab ${cur.filter === id ? "on" : ""}" data-f="${id}" onclick="CommunityFeed.setFilter('${id}')">${label}</div>`;
    return `<div class="cf-top">
      <div class="cf-toprow"><div class="cf-title">Community</div>
        <button class="cf-ic" onclick="Buzzend.alert({icon:'search',title:'Search',message:'Find people and activity.'})">${I("search", 18)}</button>
        <button class="cf-ic" onclick="window.CreateMenu?CreateMenu.open():location.href='compose.html'">${I("plus", 20)}</button></div>
      <div class="cf-sub">Updates automatically as people work out.</div>
      <div class="cf-tabs">${tab("all", "All")}${tab("friends", "Friends")}${tab("milestone", "Milestones")}</div></div>`;
  }

  // ── interactions ──
  function setFilter(id) {
    cur.filter = id;
    document.querySelectorAll(".cf-tabs .cf-tab").forEach((t) => t.classList.toggle("on", t.dataset.f === id));
    paintBody();
  }
  function cheer(btn, i) {
    const e = EVENTS[i]; e.cheered = !e.cheered; e.cheers += e.cheered ? 1 : -1;
    btn.classList.toggle("on", e.cheered); btn.querySelector("b").textContent = e.cheers;
  }
  function like(el, i) {
    const e = EVENTS[i]; e.liked = !e.liked; e.likes += e.liked ? 1 : -1;
    el.classList.toggle("liked", e.liked);
    const c = document.querySelector(`[data-lc="${i}"]`); if (c) c.textContent = fmt(e.likes);
  }
  function postMenu(i) {
    Buzzend.sheet({ html: `<div class="cf-pmenu">
      <button class="cf-pm" onclick="Community?Community._close():document.querySelector('.bz-overlay.open')?.classList.remove('open')">${I("send", 18)} Share to…</button>
      <button class="cf-pm" onclick="document.querySelector('.bz-overlay.open')?.classList.remove('open')">${I("eye", 18)} Not interested</button>
      <button class="cf-pm danger" onclick="document.querySelector('.bz-overlay.open')?.classList.remove('open')">${I("flag", 18)} Report post</button></div>` });
  }
  function openUser(name) { location.href = "user-profile.html?name=" + encodeURIComponent(name); }

  const root = () => document.getElementById("content");
  function paintBody() { const b = document.getElementById("af-body"); if (b) { b.innerHTML = bodyHtml(); window.Icons.init(b); } }
  function start(mountEl, state) {
    cur.state = state || "feed";
    const f = new URLSearchParams(location.search).get("filter");
    cur.filter = ["all", "friends", "milestone"].includes(f) ? f : "all";
    mountEl.innerHTML = header() + `<div id="af-body">${bodyHtml()}</div>`;
    window.Icons.init(mountEl);
  }
  return { start, setFilter, cheer, like, postMenu, openUser };
})();
