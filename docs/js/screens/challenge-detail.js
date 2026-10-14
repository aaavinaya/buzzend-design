/* Challenge Detail — the Poster layout (hero + meta grid), in two states: running (Prizes)
   and ended (Winners). Members / Posts sub-views, role-based ⋯ menu, report, chat,
   leave/delete, join/record. Reads window.Social. */
window.CDetail = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, fmt = S.fmt, grad = S.grad;
  const EX = { squat: "Squats", pushup: "Push-ups", situp: "Sit-ups", lunge: "Lunges", jumping: "Jumping Jacks", steps: "Walking" };
  const EXI = { squat: "squat", pushup: "pushup", situp: "situp", lunge: "lunge", jumping: "jumping", steps: "walk" };

  const C = { title: "Squats Challenge", ex: "squat", by: "Adesh Pokhrel", byAv: "#9bb7c9,#5e7d99",
    range: "1–30 Jun", freq: "Daily", vis: "Public", approval: true, status: "active", members: 245, day: 12, days: 30,
    myReps: 240, goal: 600, cover: "linear-gradient(135deg,#1f6e5f,#2a9d8f)",
    prizes: ["Rs. 5,000 cash", "Buzzend hoodie", "1-month Pro"],   // firstPrize/secondPrize/thirdPrize (free-text; any set are shown)
    desc: "Do squats every day for 30 days. Camera verification counts every rep automatically — climb the board and win." };
  const PRIZES_ALL = C.prizes.slice();   // a challenge can set 1, 2, or 3 prizes (nulls dropped)
  const exName = () => EX[C.ex], exIcon = () => EXI[C.ex];
  const daysLeft = () => Math.max(0, C.days - C.day);
  const statusLabel = () => ({ active: "Active", upcoming: "Upcoming", expired: "Expired", ended: "Ended" }[C.status] || "Active");

  const POSTS = [
    { pi: 5, cap: "Crushed 52 squats today. Legs are on fire!", likes: 120, views: 15600, t: "5m ago", liked: true, g: "linear-gradient(135deg,#2a3d55,#4a6b8a)" },
    { pi: 1, cap: "New personal best — 48 clean reps.", likes: 86, views: 9200, t: "1h ago", liked: false, g: "linear-gradient(135deg,#3a3a5b,#5e60ce)" },
    { pi: 3, cap: "Day 12 done. Consistency wins.", likes: 64, views: 5400, t: "3h ago", liked: false, g: "linear-gradient(135deg,#1f6e5f,#2a9d8f)" },
  ];

  function board() { return S.challengeBoard(C); }
  let cur = { tab: "members", role: "viewer" }, _ov = null, _reason = null;

  // ── members / posts sub-views ──
  function membersView() {
    const B = board();
    const row = (b) => { const m = b.rank <= 3 ? ["🥇", "🥈", "🥉"][b.rank - 1] : "";
      return `<div class="cd-m"><span class="rk">${b.rank}</span><div class="av" style="background-image:${grad(b.p.av)}">${m ? `<span class="medal">${m}</span>` : ""}</div>
        <span class="nm">${b.p.me ? "You" : b.p.name}${b.p.me ? '<span class="you">YOU</span>' : ""}${b.rank === 1 ? ' <span class="crown">· Leader</span>' : ""}</span>
        <span class="reps"><span class="z">${I("zap", 13)}</span>${fmt(b.v)} <small>reps</small></span></div>`; };
    return `<div class="cd-attempts" style="padding-top:14px">${fmt(C.members)} members · ranked by reps</div>${B.map(row).join("")}<div style="height:14px"></div>`;
  }
  function postsView() {
    if (!POSTS.length) return `<div class="cd-empty">${I("play", 34)}<div class="t">No posts yet</div><div class="d">Be the first to share a clip from this challenge.</div></div>`;
    return POSTS.map((p, pIdx) => { const pe = S.PEOPLE[p.pi];
      return `<div class="cd-post"><div class="cd-post-h"><div class="av" style="background-image:${grad(pe.av)}"></div>
        <div style="flex:1;min-width:0"><div class="nm"><b>${pe.name}</b> · ${exName()}</div><div class="t">${p.t}<span class="cd-badge ${C.status}">${statusLabel()}</span></div></div>
        <span class="mm" onclick="CDetail.postMenu()">⋯</span></div>
        <div class="cd-post-media" style="background:${p.g}"><div class="cap">${p.cap}</div><span class="play">${I("play", 16)}</span></div>
        <div class="cd-post-a">
          <span class="cd-a"><span class="ib${p.liked ? " liked" : ""}" onclick="this.classList.toggle('liked')">${I("heart", 17)}</span><b onclick="CDetail.likers(${pIdx})">${p.likes}</b></span>
          <span class="cd-a" onclick="CDetail.viewers(${pIdx})">${I("eye", 17)} ${fmt(p.views)}</span>
          <span class="cd-a" onclick="CDetail.postMenu()">${I("share", 17)} Share</span></div></div>`; }).join("");
  }
  function subview(t) { return t === "posts" ? postsView() : membersView(); }
  function tabbar() {
    const tab = (id, label) => `<div class="cd-tab ${cur.tab === id ? "on" : ""}" onclick="CDetail.setTab('${id}')">${label}</div>`;
    return `<div class="cd-tabs">${tab("members", fmt(C.members) + " Members") + tab("posts", "Posts")}</div>`;
  }

  // ── CTA (role + status aware) ──
  function cta() {
    if (C.status === "ended" || C.status === "expired") return `<button class="cd-primary" disabled>Challenge ended</button>`;
    if (cur.role === "viewer") return `<button class="cd-primary" onclick="CDetail.join()">${C.vis === "Private" ? I("lock", 17) + " Request to join" : "Join Challenge"}</button>`;
    return `<button class="cd-primary" onclick="CDetail.record()">${I("camera", 18)} Record ${exName()}</button>
      <button class="cd-chatbtn" onclick="CDetail.chat()">${I("comment", 20)}<span class="bdg">3</span></button>`;
  }

  // ── headers ──
  function badge() { return `<span class="cd-badge ${C.status}">${statusLabel()}</span>`; }
  const mchip = (ic, t) => `<span>${I(ic, 13)} ${t}</span>`;
  function about(extraMeta) { return `<div class="cd-about">${extraMeta ? `<div class="cd-about-meta">${extraMeta}</div>` : ""}<div class="cd-desc2">${C.desc}</div></div>`; }
  // ═══════ Poster + meta grid ═══════
  // Prizes (what the top 3 win) — shown WHILE the challenge runs. firstPrize/secondPrize/thirdPrize are
  // free-text on the wire; render whichever are set.
  // prize text is free-text and may be long → tier label + prize stacked, prize wraps.
  function prizesBlock() {
    const tier = ["1st place", "2nd place", "3rd place"], cls = ["gold", "silver", "bronze"];
    return `<div class="cd7-prizes">
      <div class="cd7-sec"><span>${I("trophy", 15)} Prizes</span><span class="r">Top ${C.prizes.length} win</span></div>
      ${C.prizes.map((p, i) => `<div class="cd7-prow"><span class="cd7-rk ${cls[i]}">${i + 1}</span><div class="cd7-ptx"><span class="cd7-tier">${tier[i]}</span><span class="cd7-prize">${p}</span></div></div>`).join("")}</div>`;
  }
  // Winners — shown once the challenge has ENDED. Champion spotlight + runner-up rows; prize text wraps.
  // Real source: GET /members/winners (ranked); here the ranked board stands in for it.
  function winnersBlock() {
    // one winner per prize (1–3); with no prizes, still show the top-3 final podium (no prize chips)
    const n = C.prizes && C.prizes.length ? Math.min(C.prizes.length, 3) : 3;
    const w = board().slice(0, n), cls = ["gold", "silver", "bronze"];
    const champ = w[0], champPrize = C.prizes && C.prizes[0];
    const ru = w.slice(1).map((b, k) => { const i = k + 1;
      return `<div class="cd7-ru"><span class="cd7-rk ${cls[i]}">${i + 1}</span>
        <div class="cd7-wav" style="background-image:${grad(b.p.av)}"></div>
        <div class="cd7-ru-tx"><div class="top"><b>${b.p.me ? "You" : b.p.name}</b><span class="rp">${fmt(b.v)} reps</span></div>
          ${C.prizes && C.prizes[i] ? `<div class="cd7-ru-prize">${I("medal", 12)} ${C.prizes[i]}</div>` : ""}</div></div>`;
    }).join("");
    return `<div class="cd7-winners">
      <div class="cd7-win-top">${I("trophy", 16)} Winners<span>Challenge complete</span></div>
      <div class="cd7-champ">
        <div class="cd7-champ-av" style="background-image:${grad(champ.p.av)}"><span class="cd7-champ-badge">${I("trophy", 15)}</span></div>
        <div class="cd7-champ-nm">${champ.p.me ? "You" : champ.p.name}</div>
        <div class="cd7-champ-meta">Champion · ${fmt(champ.v)} reps</div>
        ${champPrize ? `<div class="cd7-champ-prize">${I("medal", 14)} <span>${champPrize}</span></div>` : ""}</div>
      ${ru}</div>`;
  }
  function v7() {
    /* The EXERCISE cell carries the exercise ILLUSTRATION, the other three carry stroke glyphs, and the
       app sizes them differently on purpose (28 vs 17): a stroke glyph fills its own box, while an
       illustration is equalised by AREA and so draws smaller than its slot. */
    const cell = (ic, k, v, s) => `<div class="cd7-cell"><div class="ic">${I(ic, s || 17)}</div><div style="min-width:0"><div class="k">${k}</div><div class="val">${v}</div></div></div>`;
    const ended = C.status === "ended", hasPrizes = C.prizes && C.prizes.length;
    return `<div class="cd7-hero"><div class="img" style="background:${C.cover}"></div><div class="scrim"></div>
        <div class="cd7-fabs"><button class="cd-fab back" onclick="CDetail.back()">${I("back", 20)}</button><button class="cd-fab more" onclick="CDetail.menu()">⋯</button></div>
        <div class="h1">${C.title}</div>
        <div class="cr"><div class="av" style="background-image:${grad(C.byAv)}"></div>by ${C.by} ${badge()}</div></div>
      ${ended ? winnersBlock() : ""}
      <div class="cd7-grid">${cell(exIcon(), "Exercise", exName(), 28)}${cell("activity", "Schedule", C.freq)}${cell("users", "Members", fmt(C.members))}${cell("clock", ended ? "Ran for" : "Days left", ended ? C.days + "d" : daysLeft())}</div>
      ${about(mchip("calendar", C.range) + mchip(C.vis === "Public" ? "users" : "lock", C.vis) + mchip("shield", C.approval ? "Approval required" : "Open to join"))}
      ${!ended && hasPrizes ? prizesBlock() : ""}
      <div class="cd7-cta">${cta()}</div>${tabbar()}<div class="cd-sub">${subview(cur.tab)}</div>`;
  }

  function render() { root.innerHTML = v7(); window.Icons.init(root); root.scrollTop = 0; }

  // ── nav / actions ──
  let root;
  function setTab(t) { cur.tab = t; render(); }
  function back() { location.href = "challenges.html"; }
  function join() { cur.role = "member"; render(); Buzzend.alert({ icon: "trophy", title: "You're in!", message: "You joined “" + C.title + "”. Record a set to climb the board." }); }
  function record() { location.href = "../workout/moment.html"; }

  // sheets
  function mountSheet(inner, center) { const o = document.createElement("div"); o.className = "cd-ov" + (center ? " center" : ""); o.innerHTML = inner; o.addEventListener("click", (e) => { if (e.target === o) close(); }); document.querySelector(".screen").appendChild(o); window.Icons.init(o); _ov = o; }
  function close() { if (_ov) { _ov.remove(); _ov = null; } }
  function menu() {
    let items;
    if (cur.role === "creator") items = `
      <button class="cd-mi" onclick="CDetail.act('edit')"><span class="mic">${I("edit", 18)}</span> Edit challenge</button>
      <button class="cd-mi" onclick="CDetail.act('cover')"><span class="mic">${I("image", 18)}</span> Change cover image</button>
      <button class="cd-mi" onclick="CDetail.act('invite')"><span class="mic">${I("share", 18)}</span> Invite / share code</button>
      <button class="cd-mi danger" onclick="CDetail.confirmDelete()"><span class="mic">${I("trash", 18)}</span> Delete challenge</button>`;
    else if (cur.role === "member") items = `
      <button class="cd-mi" onclick="CDetail.act('invite')"><span class="mic">${I("share", 18)}</span> Invite / share code</button>
      <button class="cd-mi danger" onclick="CDetail.confirmLeave()"><span class="mic">${I("logout", 18)}</span> Leave challenge</button>
      <button class="cd-mi" onclick="CDetail.report()"><span class="mic">${I("flag", 18)}</span> Report</button>`;
    else items = `
      <button class="cd-mi" onclick="CDetail.act('invite')"><span class="mic">${I("share", 18)}</span> Share</button>
      <button class="cd-mi" onclick="CDetail.report()"><span class="mic">${I("flag", 18)}</span> Report</button>`;
    mountSheet(`<div class="cd-sheet"><div class="cd-grab"></div>${items}<button class="cd-mi cancel" onclick="CDetail.close()">Cancel</button></div>`);
  }
  function postMenu() { mountSheet(`<div class="cd-sheet"><div class="cd-grab"></div><button class="cd-mi" onclick="CDetail.close()"><span class="mic">${I("share", 18)}</span> Share post</button><button class="cd-mi danger" onclick="CDetail.report()"><span class="mic">${I("flag", 18)}</span> Report post</button><button class="cd-mi cancel" onclick="CDetail.close()">Cancel</button></div>`); }
  // Liked by / Viewed by — people sheet
  function peopleList(seed, n) { const pool = S.PEOPLE.slice(1); n = Math.min(n, pool.length); const out = []; for (let k = 0; k < n; k++) out.push(pool[(seed + k) % pool.length]); return out; }
  function openPeople(title, ic, total, seed) {
    const rows = peopleList(seed, Math.min(9, total)).map((p) => `<div class="cd-prow"><div class="av" style="background-image:${grad(p.av)}"></div>
      <div class="nm"><b>${p.name}</b><span>${p.friend ? "Following" : "@" + p.name.split(" ")[0].toLowerCase()}</span></div>
      ${p.friend ? `<button class="cd-pfollow on">Following</button>` : `<button class="cd-pfollow" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'Following':'Follow'">Follow</button>`}</div>`).join("");
    mountSheet(`<div class="cd-sheet"><div class="cd-grab"></div><div class="cd-phead">${I(ic, 18)}<span>${title}</span><b>${fmt(total)}</b></div><div class="cd-people">${rows}</div></div>`);
  }
  function likers(i) { openPeople("Liked by", "heart", POSTS[i].likes, i + 1); }
  function viewers(i) { openPeople("Viewed by", "eye", POSTS[i].views, i + 4); }
  function act(a) { close(); const msg = { edit: ["edit", "Edit challenge", "Opens the create wizard pre-filled with this challenge."], cover: ["image", "Change cover", "Pick a new cover image for this challenge."], invite: ["share", "Invite code: SQ7X2A", "Share this code or link so friends can join instantly."] }[a]; Buzzend.alert({ icon: msg[0], title: msg[1], message: msg[2] }); }

  // report
  const REASONS = ["User is posting abusive content", "User may be under the age of 18", "Something else"];
  function report() { close(); _reason = null; renderReport(); }
  function renderReport() {
    close();
    const rows = REASONS.map((r, i) => `<button class="cd-reason ${_reason === i ? "on" : ""}" onclick="CDetail.pickReason(${i})"><span class="rdo"></span>${r}</button>`).join("");
    mountSheet(`<div class="cd-sheet"><div class="cd-grab"></div><div class="cd-sheet-t">Report challenge</div>${rows}
      <button class="cd-submit" ${_reason === null ? "disabled" : ""} onclick="CDetail.submitReport()">Submit report</button><button class="cd-mi cancel" onclick="CDetail.close()">Cancel</button></div>`);
  }
  function pickReason(i) { _reason = i; renderReport(); }
  function submitReport() { close(); Buzzend.alert({ icon: "flag", title: "Report submitted", message: "Thanks — our team will review this challenge." }); }

  function confirmLeave() { close(); mountSheet(`<div class="cd-dlg"><div class="di">${I("logout", 26)}</div><div class="dt">Leave challenge?</div><div class="dd">You'll lose your spot on the leaderboard. You can re-join anytime.</div><div class="cd-dlg-row"><button class="cd-keep" onclick="CDetail.close()">Stay</button><button class="cd-danger" onclick="CDetail.doLeave()">Leave</button></div></div>`, true); }
  function doLeave() { close(); cur.role = "viewer"; render(); Buzzend.alert({ icon: "logout", title: "Left challenge", message: "You left “" + C.title + "”." }); }
  function confirmDelete() { close(); mountSheet(`<div class="cd-dlg"><div class="di">${I("trash", 26)}</div><div class="dt">Delete this challenge?</div><div class="dd">This permanently removes it for all ${fmt(C.members)} members. This can't be undone.</div><div class="cd-dlg-row"><button class="cd-keep" onclick="CDetail.close()">Cancel</button><button class="cd-danger" onclick="CDetail.doDelete()">Delete</button></div></div>`, true); }
  function doDelete() { close(); Buzzend.alert({ icon: "trash", title: "Challenge deleted", message: "“" + C.title + "” has been removed." }); setTimeout(() => location.href = "challenges.html", 400); }

  // chat
  function chat() {
    const m = (pi, tx, me) => { const pe = me ? S.ME : S.PEOPLE[pi]; return `<div class="cd-chat-msg ${me ? "me" : ""}"><div class="av" style="background-image:${grad(pe.av)}"></div><div class="bub">${me ? "" : `<div class="who">${pe.name.split(" ")[0]}</div>`}<div class="tx">${tx}</div></div></div>`; };
    mountSheet(`<div class="cd-sheet cd-chat"><div class="cd-grab"></div><div class="cd-sheet-t">${C.title} · Group chat</div>
      <div style="flex:1;overflow-y:auto;padding:6px 0">${m(1, "Day 12 and still going strong 💪", false)}${m(5, "Anyone hit 50 today?", false)}${m(null, "Just did 52! Onto the board.", true)}${m(3, "Nice! Catching up tomorrow.", false)}</div>
      <div class="cd-chat-input"><input placeholder="Message the group…"><button onclick="CDetail.close()">${I("send", 18)}</button></div></div>`);
  }

  function start(mountEl, role, tab, status) {
    root = mountEl; cur.role = (role === "owner" ? "creator" : role) || "viewer"; cur.tab = tab === "posts" ? "posts" : "members";
    C.status = status || "active";   // preview: ?status=ended shows the Winners state
    const q = new URLSearchParams(location.search);
    const pc = q.get("prizes");   // preview: ?prizes=0|1|2|3
    C.prizes = PRIZES_ALL.slice(0, pc == null ? PRIZES_ALL.length : +pc);
    if (q.get("approval") != null) C.approval = q.get("approval") !== "0";   // preview: ?approval=0 → open to join
    render();
  }
  return { start, render, setTab, back, join, record, menu, postMenu, likers, viewers, act, report, pickReason, submitReport, renderReport, confirmLeave, doLeave, confirmDelete, doDelete, chat, close };
})();
