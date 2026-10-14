/* Buzzend · Full Body — how a routine shows up OUTSIDE the workout.
   One visual signature carries the routine everywhere: the ROUTINE RING — one arc per
   exercise, in that exercise's identity colour, each filled to its own completion, with
   the score in the middle. It replaces the single exercise figure that one-exercise
   cards use, so a Full Body session reads as one thing (not "a 5-exercise session").
   Surfaces: feed session card · feed video post · My Activity tile · Workout-log card ·
   Top-activities card · share story. Reuses .vb-card / .cf-card / .pa / .xa / .wl-card /
   .xt-card and tokens; everything new is prefixed .fbc-. Exercise colours, names and
   scoring come from FullBody (full-body-data.js). Exploration canvas only. */
window.FBCards = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const FB = window.FullBody;
  const W = (k, s, fam) => window.Icons.workout(FB.EX[k].i, s, fam || "real");
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const ini = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const AV = { "Jordan Rivera": "#6a8caf,#33566f", "Maya Chen": "#e6a06a,#c9743a", "Kriti Karki": "#caa6c9,#9a5e96",
    "Sam Okafor": "#e0a24a,#b87a26", "Avinaya Acharya": "#57d9a3,#2f9e78", "Taylor Kim": "#b78ad9,#7d54a4" };
  const av = (n, sz) => `<span class="cv-av" style="width:${sz}px;height:${sz}px;background-image:${grad(AV[n] || "#c9a6a6,#a87766")}">${ini(n)}</span>`;

  /* ── sample sessions. ex: [key, done, target] in routine order ── */
  const SESS = {
    complete: { id: "fb1", name: "Jordan Rivera", t: "8m ago", routine: "Total Body", level: "Intermediate", score: 94, dur: "4:12",
      ex: [["squat", 18, 18], ["pushup", 12, 12], ["burpee", 10, 10], ["jumping", 30, 30], ["highknee", 40, 40]], likes: 21, views: 260 },
    partial: { id: "fb2", name: "Maya Chen", t: "35m ago", routine: "Total Body", level: "Beginner", score: 72, dur: "5:05",
      ex: [["squat", 12, 12], ["pushup", 8, 8], ["burpee", 4, 6], ["jumping", 20, 20], ["highknee", 18, 24]], likes: 9, views: 120 },
    short: { id: "fb3", name: "Sam Okafor", t: "1h ago", routine: "Lower Power", level: "Expert", score: 88, dur: "2:10",
      ex: [["squat", 25, 25], ["burpee", 13, 15]], likes: 6, views: 74 },
    video: { id: "fb4", name: "Kriti Karki", t: "2h ago", routine: "Total Body", level: "Expert", score: 91, dur: "5:48",
      ex: [["squat", 25, 25], ["pushup", 18, 18], ["burpee", 15, 15], ["jumping", 45, 45], ["highknee", 52, 60]],
      cap: "Total Body on Expert. Burpees hurt.", g: "linear-gradient(150deg,#5a2a6a,#b0436a)", likes: 64, views: 2300 },
    mine: { id: "fb5", name: "Avinaya Acharya", t: "7:40 AM", routine: "Total Body", level: "Intermediate", score: 94, dur: "4:12",
      ex: [["squat", 18, 18], ["pushup", 12, 12], ["burpee", 10, 10], ["jumping", 30, 30], ["highknee", 40, 40]] },
    ended: { id: "fb6", name: "Avinaya Acharya", t: "Yesterday · 6:15 PM", routine: "Cardio Blast", level: "Intermediate", score: 41, dur: "1:02", ended: true,
      ex: [["jumping", 30, 30], ["highknee", 9, 40]] },
  };
  const reps = (s) => s.ex.reduce((a, x) => a + x[1], 0);
  const target = (s) => s.ex.reduce((a, x) => a + x[2], 0);
  const atTarget = (s) => s.ex.filter((x) => x[1] >= x[2]).length;
  const kcal = (s) => Math.round(s.ex.reduce((a, x) => a + x[1] * FB.EX[x[0]].kcal, 0));
  const status = (s) => s.ended ? "ended" : atTarget(s) === s.ex.length ? "done" : "partial";

  /* ── the routine ring ──────────────────────────────────── */
  function arc(c, r, a0, a1) {
    const p = (a) => [c + r * Math.cos((a - 90) * Math.PI / 180), c + r * Math.sin((a - 90) * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  function ring(s, size, inner, sw) {
    sw = sw || Math.max(3, Math.round(size / 11));
    const c = size / 2, r = c - sw / 2 - 1, n = s.ex.length;
    const gap = n > 1 ? Math.min(14, 40 / n) : 0, seg = 360 / n;
    const paths = s.ex.map(([k, d, t], i) => {
      const a0 = i * seg + gap / 2, a1 = (i + 1) * seg - gap / 2;
      const af = a0 + (a1 - a0) * Math.min(1, d / t);
      const col = FB.EX[k].c;
      return `<path d="${arc(c, r, a0, a1)}" stroke="${col}" stroke-opacity=".2" />`
        + (d > 0 ? `<path d="${arc(c, r, a0, Math.max(af, a0 + 0.01))}" stroke="${col}" />` : "");
    }).join("");
    return `<span class="fbc-ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="none" stroke-width="${sw}" stroke-linecap="round" aria-hidden="true">${paths}</svg>
      ${inner ? `<span class="fbc-ring-in">${inner}</span>` : ""}</span>`;
  }
  const stars = (score, sz) => `<span class="fbc-stars">${[1, 2, 3, 4, 5].map((i) => `<span class="${i <= FB.stars(score) ? "on" : ""}">${I("star", sz || 11)}</span>`).join("")}</span>`;

  // status wording never shames: green only for a clean sweep, neutral otherwise, no red.
  function statusPill(s) {
    const st = status(s);
    if (st === "done") return `<span class="fbc-pill ok">${I("check", 12)} All targets hit</span>`;
    if (st === "partial") return `<span class="fbc-pill">${I("flag", 12)} ${atTarget(s)} of ${s.ex.length} at target</span>`;
    return `<span class="fbc-pill">${I("clock", 12)} Ended early · ${s.dur}</span>`;
  }
  const aiChip = `<span class="fbc-pill ai">${I("camera", 12)} AI-counted</span>`;
  const levelChip = (s) => `<span class="fbc-pill lvl">${s.level}</span>`;

  function exRow(x) {
    const [k, d, t] = x, full = d >= t;
    return `<div class="fbc-row" style="--exc:${FB.EX[k].c}">
      <span class="fbc-ei">${W(k, 20)}</span>
      <span class="en">${FB.EX[k].n}</span>
      <span class="fbc-bar"><i style="width:${Math.round(Math.min(1, d / t) * 100)}%"></i></span>
      <span class="er">${d}<small>/${t}</small></span>
      <span class="fbc-ok">${full ? I("check", 14) : ""}</span></div>`;
  }

  // like/view bar — same .pa markup as the V2 feed (static counts in this canvas).
  // Activity cards (the daily card and the session card) carry Love only: there's no
  // media to view or share, so they get no view count and no Share button. Media posts keep the full bar.
  const loveBar = (s) => `<div class="pa">
    <button class="pa-act love">${I("heart", 20)}<span>${s.likes}</span></button>
    <button class="pa-react" aria-label="See who loved">${I("heart", 14)}</button></div>`;
  const pa = (s) => `<div class="pa">
    <button class="pa-act love">${I("heart", 20)}<span>${s.likes}</span></button>
    <button class="pa-act">${I("eye", 20)}<span>${s.views}</span></button>
    <button class="pa-act pa-icon" aria-label="Share">${I("share", 20)}</button>
    <button class="pa-react" aria-label="See who loved">${I("heart", 14)}</button></div>`;

  /* ── 1 · FEED — session card (routine edition of .vb-card) ── */
  function feedCard(s) {
    const SHOW = 3, rows = s.ex.map(exRow), hidden = rows.length - SHOW;
    const list = hidden > 0
      ? `${rows.slice(0, SHOW).join("")}<div class="fbc-more-rows" hidden>${rows.slice(SHOW).join("")}</div>
         <button class="fbc-more" onclick="FBCards.more(this)">${I("chevron", 14)} <span>${hidden} more exercise${hidden > 1 ? "s" : ""}</span></button>`
      : rows.join("");
    const verb = status(s) === "done" ? "Completed" : "Did";
    return `<div class="vb-card fbc-card">
      <div class="vb-top">${av(s.name, 52)}
        <div class="vb-who"><div class="n">${s.name}<span class="tm"> · ${s.t}</span></div>
          <div class="s">${verb} <b class="fbc-rname">${s.routine}</b></div>
          <div class="fbc-tags">${levelChip(s)}${aiChip}</div></div>
        <div class="fbc-hero">${ring(s, 66, `<b>${s.score}</b><small>score</small>`)}${stars(s.score, 10)}</div></div>
      <div class="fbc-stats">
        <div><b>${reps(s)}</b><span>reps</span></div>
        <div><b>${s.dur}</b><span>time</span></div>
        <div class="${status(s) === "done" ? "fbc-allhit" : ""}"><b>${atTarget(s)}<small>/${s.ex.length}</small>${status(s) === "done" ? I("check", 14) : ""}</b><span>at target</span></div></div>
      <div class="fbc-rows">${list}</div>
      <button class="fbc-try" onclick="location.href='../workout/full-body.html?view=preview&routine=${s.routine === "Total Body" ? "total-body" : "lower-power"}'">
        <span class="fbc-try-ic">${ring({ ex: s.ex.map(([k, , t]) => [k, t, t]) }, 30)}</span>
        <span class="fbc-try-tx"><b>Try ${s.routine}</b><span>${s.ex.length} exercises · ~${Math.max(2, Math.round(target(s) / 25))} min · pick your level</span></span>
        ${I("chevron", 18)}</button>
      ${loveBar(s)}</div>`;
  }


  /* ══ 0 · FEED — ONE CARD PER USER PER DAY ══════════════════════════════
     The day card adapts to what the day holds, so a feed never shows two cards
     for one person on one day:
       singles only  → today's V2 session card (unchanged)
       routine only  → the Full Body session card (feedCard above)
       mixed         → header with the day's TOTAL REPS, routine block(s) first,
                       then the single AI workouts, newest first.
     Reps are never counted twice: a routine's squats live in its block, and the
     Squats row shows only squats done outside a routine. The header total is both. */
  // single AI workouts can be any exercise, including ones not in Full Body
  const EXTRA = { situp: { n: "Sit-ups", i: "situp", c: "#6466E3", kcal: 0.30 }, lunge: { n: "Lunges", i: "lunge", c: "#E74F5E", kcal: 0.40 } };
  const exi = (k) => FB.EX[k] || EXTRA[k];
  const WX = (k, sz) => window.Icons.workout(exi(k).i, sz, "real");
  const R = (base, extra) => Object.assign({}, base, extra);
  const DAYS = {
    mixed: { id: "d1", name: "Jordan Rivera", t: "8m ago", likes: 21, views: 260,
      routines: [R(SESS.complete, { at: "7:40 AM" })],
      singles: [{ k: "pushup", reps: 25, at: "6:05 PM", dur: "1:10", isNew: true }, { k: "squat", reps: 40, at: "12:30 PM", dur: "1:45" }] },
    routineOnly: R(SESS.partial, {}),
    singlesOnly: { id: "d3", name: "Priya Nair", t: "40m ago", likes: 7, views: 96, routines: [],
      singles: [{ k: "situp", reps: 30, at: "9:10 AM", dur: "1:30" }, { k: "jumping", reps: 50, at: "8:20 AM", dur: "1:05" }] },
    heavy: { id: "d4", name: "Sam Okafor", t: "1h ago", likes: 33, views: 410,
      routines: [R(SESS.complete, { at: "6:30 PM", score: 89 }), R(SESS.ended, { routine: "Cardio Blast", at: "7:10 AM", ended: false, score: 58, ex: [["jumping", 30, 30], ["highknee", 26, 40]] })],
      singles: [{ k: "squat", reps: 50, at: "8:15 PM", dur: "2:05" }, { k: "pushup", reps: 30, at: "1:20 PM", dur: "1:15" },
        { k: "situp", reps: 40, at: "11:00 AM", dur: "1:50" }, { k: "lunge", reps: 20, at: "9:30 AM", dur: "1:20" }] },
  };
  const secs = (d) => { const [m, x] = d.split(":").map(Number); return m * 60 + x; };
  const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  const dayReps = (d) => d.routines.reduce((a, r) => a + reps(r), 0) + d.singles.reduce((a, x) => a + x.reps, 0);
  const dayTime = (d) => mmss(d.routines.reduce((a, r) => a + secs(r.dur), 0) + d.singles.reduce((a, x) => a + secs(x.dur), 0));
  const dayKcal = (d) => d.routines.reduce((a, r) => a + kcal(r), 0) + Math.round(d.singles.reduce((a, x) => a + x.reps * exi(x.k).kcal, 0));

  function daySubtitle(d) {
    const nR = d.routines.length, nS = d.singles.length;
    const r = nR === 1 ? `<b class="fbc-rname">${d.routines[0].routine}</b>` : `<b class="fbc-rname">${nR} routines</b>`;
    if (!nR) return nS > 1 ? `Completed a ${nS}-exercise session` : `Completed ${exi(d.singles[0].k).n}`;   // V2 wording
    return nS ? `Did ${r} + ${nS} AI workout${nS > 1 ? "s" : ""}` : `Did ${r}`;
  }

  // a routine inside the day card: compact by default (ring · name · meta · colour strip),
  // "Breakdown" opens the same bar rows the routine-only card shows.
  function routineBlock(r) {
    const segs = r.ex.map(([k, d, t]) => `<span style="--exc:${FB.EX[k].c};flex:${t}"><i style="width:${Math.round(Math.min(1, d / t) * 100)}%"></i></span>`).join("");
    const hit = atTarget(r) === r.ex.length;
    return `<div class="fbc-rb">
      <div class="fbc-rb-h">
        ${ring(r, 50, `<b>${r.score}</b>`, 5)}
        <div class="fbc-rb-tx">
          <div class="fbc-rb-n">${r.routine} <span class="fbc-pill lvl">${r.level}</span></div>
          <div class="fbc-rb-m">${r.at} · ${r.dur} · <span class="${hit ? "ok" : ""}">${atTarget(r)}/${r.ex.length} at target${hit ? " " + I("check", 12) : ""}</span></div>
          ${stars(r.score, 10)}</div>
        <div class="fbc-rb-r"><b>${reps(r)}</b><span>reps</span></div></div>
      <div class="fbc-seg">${segs}</div>
      <div class="fbc-rb-rows" hidden>${r.ex.map(exRow).join("")}</div>
      <button class="fbc-rb-btn" onclick="FBCards.breakdown(this)">${I("chevron", 13)} <span>Breakdown</span></button></div>`;
  }
  const singleRow = (x) => `<div class="fbc-srow${x.isNew ? " new" : ""}" style="--exc:${exi(x.k).c}">
      <span class="fbc-ei">${WX(x.k, 20)}</span>
      <span class="fbc-s-tx"><span class="en">${exi(x.k).n}${x.isNew ? `<span class="fbc-new">New</span>` : ""}</span><span class="at">${x.at} · ${x.dur}</span></span>
      <span class="er">${x.reps}<small>reps</small></span></div>`;

  function hiddenBox(items, noun) {
    if (items.length <= 0) return "";
    return `<div class="fbc-more-rows" hidden>${items.join("")}</div>
      <button class="fbc-more" onclick="FBCards.more(this,'${noun}')">${I("chevron", 14)} <span>${items.length} more ${noun}${items.length > 1 ? "s" : ""}</span></button>`;
  }

  function dayCard(d) {
    if (!d.routines) return feedCard(d);                       // routine-only day = the routine card
    const RMAX = 1, SMAX = 3;
    const rb = d.routines.map(routineBlock), sr = d.singles.map(singleRow);
    const routines = rb.slice(0, RMAX).join("") + hiddenBox(rb.slice(RMAX), "routine");
    const singles = !sr.length ? "" : `<div class="fbc-sec">${I("camera", 12)} AI workouts</div>${sr.slice(0, SMAX).join("")}${hiddenBox(sr.slice(SMAX), "workout")}`;
    return `<div class="vb-card fbc-card fbc-day">
      <div class="vb-top">${av(d.name, 52)}
        <div class="vb-who"><div class="n">${d.name}<span class="tm"> · ${d.t}</span></div>
          <div class="s">${daySubtitle(d)}</div></div>
        <div class="vb-tot"><div class="v">${dayReps(d)}</div><div class="k">TOTAL REPS</div></div></div>
      <div class="fbc-daymeta"><span>${I("clock", 12)} ${dayTime(d)} active</span><span>${I("flame", 12)} ${dayKcal(d)} kcal</span><span>${I("activity", 12)} ${d.routines.length + d.singles.length} workouts</span></div>
      ${routines}${singles}
      ${loveBar(d)}</div>`;
  }
  // a singles-only day is today's V2 card — rendered the V2 way so the canvas proves nothing changes
  function v2Card(d) {
    const rows = d.singles.map((x) => `<div class="vb-row" style="--exc:${exi(x.k).c}"><span class="fbc-ei">${WX(x.k, 20)}</span><span class="en">${exi(x.k).n}</span><span class="er">${x.reps}<small>reps</small></span></div>`).join("");
    return `<div class="vb-card">
      <div class="vb-top">${av(d.name, 52)}
        <div class="vb-who"><div class="n">${d.name}<span class="tm"> · ${d.t}</span></div><div class="s">${daySubtitle(d)}</div></div>
        <div class="vb-tot"><div class="v">${dayReps(d)}</div><div class="k">TOTAL REPS</div></div></div>
      ${rows}${loveBar(d)}</div>`;
  }

  function dayRules() {
    return `<div class="fbc-notes fbc-rules">
      <h3>${I("check", 15)} Which state is used</h3>
      <table class="fbc-tbl">
        <tr><th>The day has</th><th>State</th></tr>
        <tr><td>Only AI workouts</td><td><b>A</b> · total reps hero, one row per exercise</td></tr>
        <tr><td>Exactly one routine, nothing else</td><td><b>B</b> · score ring hero, stats, exercise bars, "Try" link</td></tr>
        <tr><td>A routine + any AI workout</td><td><b>C</b> · total reps hero, routine tile, then workouts</td></tr>
        <tr><td>2+ routines (with or without workouts)</td><td><b>C</b> · one tile per routine</td></tr>
      </table>
      <ul>
        <li><b>States change during the day.</b> Someone who does Total Body at 7 AM shows state B. If they do squats at noon, the same card becomes state C (no new card). Each update moves the card back to the top of the feed. The newest row gets a <b>New</b> tag for an hour. Loves stay with the card. Activity cards have no view count and no Share button; only media posts do.</li>
        <li><b>No double counting.</b> A routine's reps stay inside its block. A single-exercise row only counts reps done outside routines. The header total is both.</li>
        <li><b>Order.</b> Routines come first because they carry the score, and the newest one is on top. AI workouts follow, newest first.</li>
        <li><b>Length is capped.</b> The card shows 1 routine and 3 workouts. Anything more goes behind "+N more", so a busy day never takes over the feed.</li>
        <li><b>The score belongs to the routine, never to the day.</b> A day has no score, so a strong routine isn't watered down by a quick set of squats.</li>
        <li><b>Ended-early routines don't appear.</b> They stay in the user's log. The day's other workouts still show.</li>
      </ul>
      <h3>${I("sliders", 15)} Data</h3>
      <p>The per-day, per-exercise totals stay as they are. The day's activity summary adds <code>routines: [ … ]</code>, the routine record described in the notes below. The server works out the single-exercise rows as the day total minus routine reps, per exercise. When <code>routines</code> is empty, older app versions render exactly what they render today.</p>
    </div>`;
  }

  /* ── 2 · FEED — recorded video post (routine edition of .cf-card) ── */
  function videoCard(s) {
    const total = target(s);
    const segs = s.ex.map(([k, d, t]) => `<span style="--exc:${FB.EX[k].c};flex:${t}"><i style="width:${Math.round(Math.min(1, d / t) * 100)}%"></i></span>`).join("");
    const chips = s.ex.map(([k, d]) => `<span class="fbc-chip" style="--exc:${FB.EX[k].c}">${W(k, 14, "outlined")}${d}</span>`).join("");
    return `<div class="cf-card fbc-vcard">
      <div class="cf-card-h">
        <div class="av" style="background-image:${grad(AV[s.name])}"></div>
        <div class="who"><div class="nm"><b>${s.name}</b></div><div class="t">${s.t} · recorded <b class="fbc-rname">${s.routine}</b></div></div>
        <button class="mm">${I("more", 18)}</button></div>
      <div class="cf-card-media" style="background:${s.g}"><div class="cap">${s.cap}</div>
        <span class="play">${I("play", 16)}</span>
        <span class="fbc-mbadge">${ring(s, 26, "", 3)}<b>${s.score}</b> ${s.routine} · ${s.level}</span></div>
      <div class="fbc-strip">
        <div class="fbc-seg">${segs}</div>
        <div class="fbc-chips">${chips}<span class="fbc-strip-t">${reps(s)}/${total} reps · ${s.dur}</span></div></div>
      ${pa(s)}</div>`;
  }

  /* ── 3 · MY ACTIVITY tile (Home V7 · Variant 1 rail) ── */
  // the person's own routine runs today (My Activity examples + detail sheet)
  const MINE = {
    tb1: R(SESS.mine, { t: "7:40 AM", at: "7:40 AM" }),
    cb1: { routine: "Cardio Blast", level: "Intermediate", score: 86, dur: "2:05", t: "6:15 PM", at: "6:15 PM",
      ex: [["jumping", 30, 30], ["highknee", 36, 40]] },
    tb2: R(SESS.partial, { t: "6:30 PM", at: "6:30 PM" }),
  };
  /* Home · My Activity rail. Every routine RUN gets its own tile (it has its own score),
     newest first, between Steps and the single AI workouts. Two different routines read
     apart by name and ring colours; the same routine twice reads apart by its time line.
     Tapping a routine tile opens its detail sheet (the expanded workout-log card). */
  /* Home · My Activities — matches the app: title + Share only (no "+" in the header),
     a rail of steps-goal tile → routine tiles (newest first) → AI workout tiles → dashed
     "Start workout" tile, then a divider and the Calories · Distance · Active cards.
     Every routine RUN gets its own tile (its own score); the time line tells two runs of the
     same routine apart. Tap a routine tile → detail sheet. Share shows whenever there's any
     activity at all (steps count) and is hidden only on an empty day. Driven by DS (below),
     so a card and the share image it produces always describe the same day. */
  function myActivity(key) {
    const d = DS[key], st = d.steps;
    const C = 2 * Math.PI * 19, off = (C * (1 - Math.min(1, st.n / st.goal))).toFixed(1);
    const stepTile = `<div class="xa-act fbc-steptile">
      <span class="fbc-stepring"><svg class="rg" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="tr"/>
        <circle cx="22" cy="22" r="19" class="pr" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off}"/></svg>${I("footprints-line", 16)}</span>
      <div class="xa-actv">${st.v}</div><div class="xa-actn fbc-goal">of ${st.goal.toLocaleString()} ${I("edit", 12)}</div></div>`;
    const tile = (r) => { const id = Object.keys(MINE).find((k) => MINE[k] === r);
      return `<button class="xa-act fbc-xa" onclick="FBCards.detail('${id}')" aria-label="${r.routine} details">
        <span class="fbc-xa-ic">${ring(r, 34, `<b>${r.score}</b>`, 3.5)}</span>
        <div class="xa-actv">${reps(r)}<span> reps</span></div><div class="xa-actn">${r.routine}</div><div class="fbc-xa-t">${r.at}</div></button>`; };
    const single = (x) => `<div class="xa-act"><span class="xa-actic" style="background:color-mix(in srgb,${exi(x.k).c} 14%,transparent)">${window.Icons.workout(exi(x.k).i, 24, "plain")}</span>
      <div class="xa-actv">${x.reps}<span> reps</span></div><div class="xa-actn">${exi(x.k).n}</div></div>`;
    const start = `<button class="xa-act fbc-start-t"><span class="fbc-start-ic">${I("plus", 20)}</span><b>Start</b><span>workout</span></button>`;
    const kcalNow = dsKind(d) ? dsKcal(d) : 0;
    const metric = (v, ic, l) => `<div class="xa-metric"><div class="xa-mv">${v}</div><div class="xa-ml">${I(ic, 12)} ${l}</div></div>`;
    const share = dsKind(d) ? `<button class="xa-ic fbc-share-btn" onclick="FBCards.shareDay('${key}')" title="Share your day">${I("share", 15)}</button>` : "";
    return `<div class="xa xa1 fbc-myact">
      <div class="xa-h"><div class="xa-t">My Activities</div><div class="xa-acts">${share}</div></div>
      <div class="xa-rail">${stepTile}${d.routines.slice().reverse().map(tile).join("")}${d.singles.map(single).join("")}${start}</div>
      <div class="xa-div"></div>
      <div class="xa-metrics">${metric(kcalNow, "flame", "Calories")}${metric(st.dist, "pin", "Distance")}${metric(st.active, "clock", "Active")}</div></div>`;
  }
  // detail popup: the workout-log card in its expanded form, inside the app's bottom sheet
  function detail(id) {
    window.Buzzend.sheet({ html: `<div class="fbc-sheet">${logCard(MINE[id], true, true)}</div>` });
  }

  /* ── 4 · WORKOUT LOG card — shown expanded in the My Activity detail sheet ── */
  function logCard(s, open, fixed) {
    const st = status(s);
    const rows = s.ex.map(([k, d, t]) => `<div class="fbc-lrow" style="--exc:${FB.EX[k].c}">
      <span class="d"></span><span class="n">${FB.EX[k].n}</span><span class="r">${d}<small>/${t}</small></span>
      ${d >= t ? `<span class="c">${I("check", 13)}</span>` : `<span class="c"></span>`}</div>`).join("");
    const foot = st === "ended"
      ? `<div class="fbc-lfoot">${statusPill(s)}<button class="fbc-again">${I("activity", 14)} Do again</button></div>`
      : `<div class="fbc-lfoot">${statusPill(s)}${stars(s.score, 12)}</div>`;
    return `<div class="wl-card fbc-wl${open ? " open" : ""}${fixed ? " fixed" : ""}"${fixed ? "" : ` onclick="FBCards.toggle(this)"`}>
      <div class="fbc-wl-main">
        <div class="wl-ic fbc-wl-ic">${ring(s, 46, `<b>${s.score}</b>`, 4.5)}</div>
        <div class="wl-mid">
          <div class="wl-n">${s.routine} <span class="wl-ai">AI</span><span class="fbc-wl-lv">${s.level}</span></div>
          <div class="wl-meta"><span class="wl-mi">${I("clock", 12)} ${s.t}</span><span class="wl-sep">·</span><span class="wl-mi">${I("play", 11)} ${s.dur} min</span></div>
        </div>
        <div class="wl-end"><div class="wl-reps">${reps(s)}<span>reps</span></div><div class="wl-kcal">${I("flame", 11)} ${kcal(s)} kcal</div></div>
      </div>
      <div class="fbc-wl-x"><div class="fbc-lrows">${rows}</div>${foot}</div></div>`;
  }

  /* ══ 7 · MY ACTIVITY → SHARE YOUR DAY ═════════════════════════════════════
     Tapping Share in My Activity opens the app's existing share sheet ("Share your day",
     Post · Save · Share, 4:5 / 1080×1350 export). The image speaks the Story-card language
     (dark card, colour rings, one bar per exercise) and picks its layout from the day,
     mirroring the Daily-card states:
       0  no workout yet (steps or not) → no Share button (as the app does today)
       A  AI workouts only     → day ring (one arc per exercise, sized by reps) + bars
       B  one routine only     → the routine's score ring (same as the results story)
       C  routine + workouts / → day ring + a panel per routine (own mini ring + score)
          2+ routines             + the single workouts
     EVERYTHING the person did is on the image — never "+N more". Instead the card has
     three densities: roomy (little data: bigger type, so no dead space), normal, and dense
     (lots: compact routine panels + single workouts as a 2-column grid). The middle block
     is vertically centred between header and footer, so leftover space is shared evenly. */
  const STEPS = { v: "6,240", n: 6240, goal: 8000, dist: "4.4 km", active: "52m", kcal: 240 };
  const ONE = (k, reps) => ({ k, reps });
  const DS = {
    none:    { steps: { v: "0", n: 0, goal: 8000, dist: "0 km", active: "0m", kcal: 0 }, routines: [], singles: [] },
    steps:   { steps: { v: "3,120", n: 3120, goal: 8000, dist: "2.2 km", active: "26m", kcal: 120 }, routines: [], singles: [] },
    single1: { steps: STEPS, routines: [], singles: [ONE("squat", 40)] },
    singles: { steps: STEPS, routines: [], singles: [ONE("squat", 40), ONE("situp", 30), ONE("pushup", 25)] },
    all7:    { steps: STEPS, routines: [], singles: [ONE("jumping", 50), ONE("squat", 40), ONE("situp", 30), ONE("highknee", 30), ONE("pushup", 25), ONE("lunge", 20), ONE("burpee", 10)] },
    routine: { steps: STEPS, routines: [MINE.tb1], singles: [] },
    cardio:  { steps: STEPS, routines: [MINE.cb1], singles: [] },
    mixed:   { steps: STEPS, routines: [MINE.tb1], singles: [ONE("squat", 40), ONE("pushup", 25)] },
    two:     { steps: STEPS, routines: [MINE.cb1, MINE.tb1], singles: [ONE("squat", 40), ONE("situp", 30), ONE("pushup", 25), ONE("lunge", 20)] },
    same:    { steps: STEPS, routines: [MINE.tb2, MINE.tb1], singles: [ONE("squat", 40)] },
  };
  const dsKind = (d) => !d.routines.length && !d.singles.length ? (d.steps.n > 0 ? "S" : null)
    : !d.routines.length ? "A" : d.routines.length === 1 && !d.singles.length ? "B" : "C";
  const dsReps = (d) => d.routines.reduce((a, r) => a + reps(r), 0) + d.singles.reduce((a, x) => a + x.reps, 0);
  const dsKcal = (d) => d.steps.kcal + d.routines.reduce((a, r) => a + kcal(r), 0) + Math.round(d.singles.reduce((a, x) => a + x.reps * exi(x.k).kcal, 0));
  // how much the list has to hold: a routine panel weighs ~2 rows
  function density(d) {
    const kind = dsKind(d);
    const load = kind === "B" ? d.routines[0].ex.length : d.routines.length * 2 + d.singles.length;
    if (kind === "S") return "roomy";
    if (kind === "B") return load <= 3 ? "roomy" : "dense";   // ring + stars + 4-5 bars needs the compact ring
    return load <= 3 ? "roomy" : load <= 4 ? "normal" : "dense";
  }

  // weighted ring: segs = [{ c, w (arc length weight) }]
  function segRing(segs, inner) {
    const size = 100, sw = 8, c = size / 2, r = c - sw / 2 - 1;
    const W = segs.reduce((a, x) => a + x.w, 0), gap = segs.length > 1 ? 5 : 0;
    let a = 0;
    const paths = segs.length === 1 ? `<circle cx="${c}" cy="${c}" r="${r}" stroke="${segs[0].c}" />`
      : segs.map((x) => { const span = 360 * x.w / W, a0 = a + gap / 2, a1 = a + span - gap / 2; a += span;
          return `<path d="${arc(c, r, a0, a1)}" stroke="${x.c}" />`; }).join("");
    return `<span class="fds-ring"><svg viewBox="0 0 ${size} ${size}" fill="none" stroke-width="${sw}" stroke-linecap="round" aria-hidden="true">${paths}</svg>
      <span class="fds-ring-in">${inner}</span></span>`;
  }
  // the day ring: every exercise of the day (routines + singles), one arc each, sized by reps
  const daySegs = (d) => d.routines.flatMap((r) => r.ex.filter((x) => x[1] > 0).map(([k, dn]) => ({ c: FB.EX[k].c, w: dn })))
    .concat(d.singles.map((x) => ({ c: exi(x.k).c, w: x.reps })));

  function dsCard(d, dateLabel) {
    const kind = dsKind(d), den = density(d), date = dateLabel || "Tue, Oct 14";
    const top = `<div class="fds-top"><span class="fds-brand">${window.Icons.brandMark ? window.Icons.brandMark(18, 5) : ""}<b>buzzend</b></span><span>${date}</span></div>`;
    const foot = (items) => `<div class="fds-foot">${items.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>`;
    const ai = `<div class="fds-ai">${I("camera", 10)} Reps counted by AI camera</div>`;
    const bar = (c, name, pct, val) => `<div class="fds-row" style="--exc:${c}"><span class="n">${name}</span><span class="t"><i style="width:${Math.max(4, Math.round(pct))}%"></i></span><span class="r">${val}</span></div>`;
    const wrap = (kick, body, f) => `<div class="fds fds-${den}">${top}<div class="fds-kick">${kick}</div><div class="fds-body">${body}</div>${f}${ai}</div>`;

    if (kind === "B") {                                   // one routine → the routine story
      const r = d.routines[0];
      const body = `<div class="fds-center">${ring(r, 100, `<b>${r.score}</b><small>${FB.band(r.score)}</small>`, 9).replace('class="fbc-ring"', 'class="fbc-ring fds-big"')}${stars(r.score, 13)}</div>
        <div class="fds-list">${r.ex.map(([k, dn, t]) => bar(FB.EX[k].c, FB.EX[k].n, dn / t * 100, `${dn}<s>/${t}</s>`)).join("")}</div>`;
      return wrap(`${r.routine.toUpperCase()} · ${r.level.toUpperCase()}`, body, foot([[reps(r), "reps"], [r.dur, "time"], [dsKcal(d), "kcal"]]));
    }

    if (kind === "S") {                                   // steps only → steps-goal ring
      const st = d.steps, pct = Math.round(st.n / st.goal * 100), left = Math.max(0, st.goal - st.n);
      const C = 2 * Math.PI * 45, off = (C * (1 - Math.min(1, st.n / st.goal))).toFixed(1);
      const body = `<div class="fds-hero"><span class="fds-ring"><svg viewBox="0 0 100 100" fill="none" stroke-width="8" stroke-linecap="round" aria-hidden="true">
          <circle cx="50" cy="50" r="45" stroke="#34D094" stroke-opacity=".22"/><circle cx="50" cy="50" r="45" stroke="#34D094" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off}" transform="rotate(-90 50 50)"/></svg>
          <span class="fds-ring-in">${I("footprints-line", 16)}<small>${pct}%</small></span></span>
        <div class="fds-hv"><b class="${st.v.length > 4 ? "long" : ""}">${st.v}</b><span>steps today</span></div></div>
        <div class="fds-goal"><span class="t"><i style="width:${Math.min(100, pct)}%"></i></span>
          <span class="l">${left ? `${left.toLocaleString()} steps to your ${st.goal.toLocaleString()} goal` : "Daily goal reached"}</span></div>`;
      return `<div class="fds fds-roomy">${top}<div class="fds-kick">MY DAY</div><div class="fds-body">${body}</div>${foot([[st.dist, "distance"], [st.active, "active"], [st.kcal, "kcal"]])}</div>`;
    }
    const n = d.routines.length + d.singles.length;
    const hero = `<div class="fds-hero">${segRing(daySegs(d), `<b>${n}</b><small>workout${n > 1 ? "s" : ""}</small>`)}
      <div class="fds-hv"><b class="${String(dsReps(d)).length > 3 ? "long" : ""}">${dsReps(d)}</b><span>reps today</span></div></div>`;
    const panel = (r) => `<div class="fds-rp">${ring(r, 40, `<b>${r.score}</b>`, 4).replace('class="fbc-ring"', 'class="fbc-ring fds-mini"')}
      <span class="fds-rp-tx"><b>${r.routine}</b><span>${r.level} · ${r.at}</span></span><span class="fds-rp-r">${reps(r)}<s> reps</s></span></div>`;
    const maxS = Math.max(1, ...d.singles.map((x) => x.reps));
    const singles = den === "dense"
      ? `<div class="fds-grid">${d.singles.map((x) => `<div class="fds-tile" style="--exc:${exi(x.k).c}"><i></i><span class="n">${exi(x.k).n}</span><b>${x.reps}</b></div>`).join("")}</div>`
      : d.singles.map((x) => bar(exi(x.k).c, exi(x.k).n, x.reps / maxS * 100, x.reps)).join("");
    const body = `${hero}<div class="fds-list">${d.routines.map(panel).join("")}${singles}</div>`;
    return wrap("MY DAY", body, foot([[d.steps.v, "steps"], [d.steps.active, "active"], [dsKcal(d), "kcal"]]));
  }

  // the existing share-sheet action row (same classes as Buzzend.shareCard)
  const scActs = `<div class="sc-acts">
      <button class="post" onclick="FBCards.act('post')">${I("send", 15)} Post</button>
      <button class="save" onclick="FBCards.act('save')">${I("download", 15)} Save</button>
      <button class="share" onclick="FBCards.act('share')">${I("share", 15)} Share</button></div>`;
  function shareDay(key) {
    if (!DS[key] || !dsKind(DS[key])) return;               // nothing logged → nothing to share
    window.Buzzend.sheet({ closeBtn: true, title: "Share your day", html: `<div class="sc-wrap fds-wrap">${dsCard(DS[key])}${scActs}</div>` });
  }
  function act(kind) {
    const m = { post: ["send", "Posted to your feed", "Your card appears on your profile and in the community feed as a photo post."],
      save: ["download", "Saved to gallery", "The 1080×1350 card was saved to your photos."],
      share: ["share", "Share sheet", "The system share sheet opens with the card as an image (Instagram, WhatsApp, …)."] }[kind];
    window.Buzzend.alert({ icon: m[0], title: m[1], message: m[2] });
  }
  // inline preview of the sheet, for the canvas
  const sheetPrev = (key) => `<div class="fbc-sheet-prev fds-prev"><div class="bz-grip"></div><div class="fds-sheet-t">Share your day</div>
    <div class="sc-wrap fds-wrap">${dsCard(DS[key])}${scActs}</div></div>`;

  function shareColumn() {
    return `<div class="cv-panel fbc-panel">
      ${state("0", "Nothing yet today: no Share button", "0 steps and no workouts. There's nothing to share, so My Activities shows no Share icon.")}${myActivity("none")}
      ${state("S", "Steps only", "Steps but no workout yet. Share is shown (as in the app today) and the steps-goal ring is the hero.")}${myActivity("steps")}${sheetPrev("steps")}
      ${state("A", "One AI workout", "Little data, so the roomy layout: bigger ring, number and bar fill the card instead of leaving a gap.")}${sheetPrev("single1")}
      ${state("A", "AI workouts only", "The day ring has one arc per exercise, sized by its reps. One bar per exercise.")}${sheetPrev("singles")}
      ${state("A", "Every exercise (7 workouts)", "Dense layout: all 7 exercises as a two-column grid. Nothing is hidden.")}${sheetPrev("all7")}
      ${state("B", "One routine only", "One Full Body run. Same image as sharing from the results screen: the routine's score ring.")}${sheetPrev("routine")}
      ${state("B", "Short routine", "A 2-exercise routine uses the roomy layout, so the bars grow into the space.")}${sheetPrev("cardio")}
      ${state("C", "Routine + AI workouts", "Day ring and total reps lead. The routine gets a panel with its own mini ring and score, then the single workouts.")}${sheetPrev("mixed")}
      ${state("C", "Two routines + 4 workouts", "Dense layout: compact routine panels and a two-column grid, so every workout fits inside the 4:5 image.")}${sheetPrev("two")}
    </div>
    <div class="fbc-notes fbc-rules"><h3>${I("check", 15)} Share rules</h3><ul>
      <li><b>Share needs some activity.</b> My Activities shows Share as soon as there are steps or a workout. On a completely empty day it's hidden.</li>
      <li><b>Same sheet and buttons as today.</b> "Share your day" bottom sheet, 4:5 (1080×1350) image, then <b>Post</b> (photo post in the feed), <b>Save</b> (to the gallery) and <b>Share</b> (the system share sheet).</li>
      <li><b>Everything is on the image.</b> There's never a "+N more". With little data the card uses bigger type; with lots it switches to compact panels and a two-column grid.</li>
      <li><b>No dead space.</b> The middle of the card is centred between the header and the footer, so any spare room is split evenly above and below.</li>
      <li><b>Scores stay with routines.</b> The day has no score. A routine shows its score as the hero (state B) or on its own panel (state C).</li>
      <li><b>Ended-early routines get no panel.</b> Their reps still count in the day total and the day ring.</li>
      <li><b>Always dark, no streak.</b> It's an exported image, so it looks the same in light and dark mode. Streaks are calculated by the backend and stay off the card.</li>
    </ul></div>`;
  }

  /* ── 6 · SHARE story (9:16) ── */
  function story() {
    const s = SESS.complete;
    const bars = s.ex.map(([k, d, t]) => `<div class="fbc-sbar" style="--exc:${FB.EX[k].c}">
      <span class="n">${FB.EX[k].n}</span><span class="t"><i style="width:${Math.round(Math.min(1, d / t) * 100)}%"></i></span><span class="r">${d}</span></div>`).join("");
    return `<div class="fbc-story">
      <div class="fbc-s-top"><span class="fbc-s-brand">buzzend</span><span>Oct 14</span></div>
      <div class="fbc-s-rt">${s.routine.toUpperCase()} · ${s.level.toUpperCase()}</div>
      <div class="fbc-s-ring">${ring(s, 150, `<b>${s.score}</b><small>${FB.band(s.score)}</small>`, 11)}</div>
      ${stars(s.score, 15)}
      <div class="fbc-s-bars">${bars}</div>
      <div class="fbc-s-foot"><div><b>${reps(s)}</b><span>reps</span></div><div><b>${s.dur}</b><span>time</span></div><div><b>${kcal(s)}</b><span>kcal</span></div></div>
      <div class="fbc-s-ai">${I("camera", 11)} Reps counted by AI camera</div></div>`;
  }

  /* ── page ── */
  const col = (tag, title, desc, body) => `<div class="cv-col">
    <div class="cv-colh"><div class="cv-tagrow"><span class="cv-tag">${tag}</span><h2>${title}</h2></div><p class="cv-desc fbc-desc">${desc}</p></div>
    ${body}</div>`;
  const label = (t) => `<div class="fbc-lbl">${t}</div>`;
  const state = (k, t, when) => `<div class="fbc-state"><span class="fbc-state-k">${k}</span>
    <div><div class="fbc-state-t">State ${k} · ${t}</div><div class="fbc-state-w">${when}</div></div></div>`;

  function notes() {
    return `<div class="fbc-notes">
      <h3>${I("star", 15)} Why it looks like this</h3>
      <ul>
        <li><b>The score is the main number, with stars next to it.</b> One effort number on top, details underneath (WHOOP Strain). Reps, time and sets at target are capped to three stats, as Strava and Hevy do.</li>
        <li><b>The routine ring replaces the map.</b> Strength cards have no route, so Strava added a muscle map. Our equivalent is one arc per exercise, filled by completion.</li>
        <li><b>3 exercises, then "+N more".</b> The collapsed list is the Hevy feed pattern. Long routines never take over the feed.</li>
        <li><b>Status never shames.</b> Green appears only when every target is hit. Partial reads "4 of 5 at target" in neutral grey. Ended-early sessions stay in your own log by default and are never posted automatically.</li>
        <li><b>"AI-counted", not "verified".</b> Users have learned not to fully trust auto-counted reps (see Garmin reviews). The chip says how the reps were counted without overclaiming.</li>
        <li><b>"Try Total Body".</b> Every routine post links to the routine, which turns the feed into a way to discover routines (Hevy's save-as-routine).</li>
        <li><b>Colour is never the only signal.</b> Every arc and bar sits next to the exercise name, icon and rep count.</li>
      </ul>
      <h3>${I("sliders", 15)} What the apps need</h3>
      <p>Today both apps store <b>one total per user, day and exercise type</b>. An ACTIVITY post is a per-day summary the server builds ("Completed a 5-exercise session"), with no routine, level or score. These cards need a routine record next to it:</p>
      <pre>routine: {
  id: "total-body", name: "Total Body",
  level: "intermediate", score: 94,
  status: "completed" | "partial" | "ended",
  durationSeconds: 252, sessionId: "…",
  exercises: [{ type: "SQUATS", done: 18, target: 18 }, …]
}</pre>
      <p>Add it to <code>PostActivity</code> / <code>ActivitySummaryDto</code>, either as a new <code>postKind</code> or as an optional <code>routine</code> field. When it is present, the feed shows this card instead of the per-day card. Old app versions ignore the field and keep showing the per-day card. Per-type totals still feed streaks, stats and challenges unchanged.</p>
      <p><b>Android</b>: <code>CommunitySessionCard</code> (CommunityCards.kt) gets a routine branch, and the My Activity <code>WorkoutCard</code> gets a ring tile that opens a detail sheet. <b>iOS</b>: same in <code>CommunityFeedCards.swift</code> and <code>MyActivitySection</code>. iOS Full Body currently posts its clip as a GENERAL post (<code>pose: nil</code>) and should attach the routine record. Build the ring once per platform: a Compose <code>Canvas.drawArc</code> per segment, and a SwiftUI <code>Circle().trim</code> per segment.</p>
    </div>`;
  }

  function start(el) {
    el.innerHTML = `<div class="cv-canvas">
      <div class="cv-head"><h1>Full Body · Activity &amp; Post cards</h1>
        <p>How a routine appears in the feed, My Activity and shared stories. One signature: the routine ring.</p></div>
      <div class="cv-scroll"><div class="cv-wrap">
        ${col("FEED", "Daily card", "One feed card per person per day. It's the same card all day; its layout changes with what the person has done so far.",
          `<div class="cv-panel mx-feed boxed fbc-panel">
            ${state("A", "AI workouts only", "Shown when the person did only normal AI workouts today (no routine). Same as today's community card.")}${v2Card(DAYS.singlesOnly)}
            ${state("B", "One routine only: completed", "Shown when the only thing done today is one Full Body routine. The score ring is the hero.")}${feedCard(SESS.complete)}
            ${state("B", "One routine only: partial", "Same state when some targets were missed. Neutral grey, never red.")}${feedCard(SESS.partial)}
            ${state("C", "Routine + AI workouts", "Shown as soon as a day has a routine plus any other workout, or more than one routine. The header switches to the day's total reps; the routine becomes a tile with its own ring.")}${dayCard(DAYS.mixed)}
            ${state("C", "Busy day: capped", "State C with lots of activity: 1 routine and 3 workouts are shown, the rest go behind \"+N more\".")}${dayCard(DAYS.heavy)}
          </div>${dayRules()}`)}
        ${col("FEED", "Video post", "A recorded Full Body clip keeps its routine context instead of posting as a plain GENERAL video.",
          `<div class="cv-panel mx-feed boxed fbc-panel">${label("Recorded routine")}${videoCard(SESS.video)}</div>`)}
        ${col("ACTIVITY", "My Activities", "One tile per routine run, each with its own ring and score. Tap a routine tile to open its details.",
          `<div class="cv-panel fbc-panel">
            ${label("Two different routines + AI workouts")}${myActivity("two")}
            ${label("Same routine twice today")}${myActivity("same")}
            <div class="fbc-hint">${I("info", 14)}<span><b>Tap a Total Body or Cardio Blast tile</b> to open its detail sheet; tap <b>Share</b> for the "Share your day" sheet. Newest run sits first; the time under the name tells two runs of the same routine apart.</span></div>
            ${label("Detail sheet (on tap)")}<div class="fbc-sheet-prev"><div class="bz-grip"></div>${logCard(MINE.tb1, true, true)}</div></div>`)}
        ${col("SHARE", "My Activities · Share your day", "What tapping Share in My Activities produces, for every kind of day. Post · Save · Share as in the app today.", shareColumn())}
        ${col("SHARE", "Results story", "9:16 image shared from a single routine's results screen, with the ring as the hero.",
          `<div class="cv-panel fbc-panel">${story()}</div>${notes()}`)}
      </div></div></div>`;
    window.Icons.init(el);
  }

  function breakdown(btn) {
    const box = btn.previousElementSibling, open = box.hasAttribute("hidden");
    if (open) box.removeAttribute("hidden"); else box.setAttribute("hidden", "");
    btn.classList.toggle("open", open);
    btn.querySelector("span").textContent = open ? "Hide breakdown" : "Breakdown";
  }
  function more(btn, noun) {
    const box = btn.previousElementSibling;
    const open = box.hasAttribute("hidden");
    if (open) box.removeAttribute("hidden"); else box.setAttribute("hidden", "");
    btn.classList.toggle("open", open);
    const n = box.children.length;
    noun = noun || "exercise";
    btn.querySelector("span").textContent = open ? "Show less" : `${n} more ${noun}${n > 1 ? "s" : ""}`;
  }
  function toggle(card) { card.classList.toggle("open"); }

  return { start, more, breakdown, toggle, detail, shareDay, act, ring };
})();
