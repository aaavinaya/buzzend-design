/* Buzzend — Section Design Exploration (LAB). Standalone: labelled variants of
   Top Activities · Streak · My Activity. Does NOT touch the V7 Home screen.
   Reuses Icons (incl. the Today's-workouts workout() artwork), tokens/palette, Electric Orange. */
window.Lab = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const W = (k, s) => window.Icons.workout(k, s || 30, "plain");
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const EXN = { squat: "Squats", pushup: "Push-ups", situp: "Sit-ups", jumping: "Jumping Jacks", lunge: "Lunges", steps: "Steps" };

  function ring(pct, size, stroke, color) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return `<svg width="${size}" height="${size}" class="xr" viewBox="0 0 ${size} ${size}">
      <circle class="xr-t" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
      <circle class="xr-p" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})" style="stroke:${color || "var(--primary)"}"/></svg>`;
  }
  const block = (name, sub, html) => `<div class="lab-block"><div class="lab-bh"><span class="lab-bn">${name}</span>${sub ? `<span class="lab-bs">${sub}</span>` : ""}</div><div class="lab-body">${html}</div></div>`;
  const sec = (title) => `<div class="lab-sech"><h3>${title}</h3><a>See all</a></div>`;

  /* ═══════════════════ 1 · TOP ACTIVITIES ═══════════════════
     Per USER (a user can have several activities). Rep count is the hero; NO kcal/time/km.
     A Global / Friends bubble filter (icons) sits above the ~2.5-card rail. */
  const GLOBAL = [
    { n: "Bishal Karki", av: "#b9a6c9,#6d5e99", acts: [["squat", 200], ["pushup", 150], ["situp", 140]] },
    { n: "Priya Sharma", av: "#c9a6a6,#a87766", acts: [["pushup", 160], ["squat", 130], ["lunge", 80]] },
    { n: "Sara Lama", av: "#a6c9b5,#5e996f", acts: [["jumping", 180], ["situp", 120]] },
    { n: "Dev Gurung", av: "#9bb7c9,#5e7d99", acts: [["situp", 180], ["jumping", 140], ["squat", 90]] },
    { n: "Anita Malan", av: "#caa6c9,#9a5e96", acts: [["lunge", 120], ["squat", 90]] },
  ];
  const FRIENDS = [
    { n: "Ravi Thapa", av: "#c9a6a6,#a87766", acts: [["pushup", 120], ["squat", 100]] },
    { n: "Sita Rai", av: "#a6c9b5,#5e996f", acts: [["squat", 140], ["situp", 90], ["lunge", 60]] },
    { n: "Kiran Shah", av: "#c9c19b,#9a8c5e", acts: [["jumping", 110], ["pushup", 70]] },
    { n: "Maya Gurung", av: "#caa6c9,#9a5e96", acts: [["situp", 130], ["squat", 80]] },
  ];
  const first = (u) => u.n.split(" ")[0];
  const total = (u) => u.acts.reduce((a, x) => a + x[1], 0);
  const rk = (r) => `<span class="xt-rk r${r <= 3 ? r : "x"}">${r}</span>`;
  const av = (u, cls) => `<span class="xt-av ${cls || ""}" style="background-image:${grad(u.av)}"></span>`;
  const tabs = `<div class="xt-tabs"><button class="xt-tab on" onclick="Lab.topScope(this,'global')">${I("globe", 13)} Global</button><button class="xt-tab" onclick="Lab.topScope(this,'friends')">${I("users", 13)} Friends</button></div>`;
  const topBlock = (cardFn) => `${sec("Top activities")}${tabs}
    <div class="xt-wrap scope-global"><div class="xt-rail ta-global">${GLOBAL.map((u, i) => cardFn(u, i + 1)).join("")}</div>
      <div class="xt-rail ta-friends">${FRIENDS.map((u, i) => cardFn(u, i + 1)).join("")}</div></div>`;

  // A — athlete card: name + top activity rows (icon · name · reps) + “+N more”
  const cardA = (u, r) => `<div class="xt-card xt-a"><div class="xt-a-h">${rk(r)}${av(u)}<div class="xt-a-nm">${first(u)}</div></div>
    <div class="xt-a-list">${u.acts.slice(0, 2).map(([ex, n]) => `<div class="xt-a-row"><span class="xt-a-ic">${W(ex, 17)}</span><span class="xt-a-en">${EXN[ex]}</span><span class="xt-a-r">${n}</span></div>`).join("")}</div>
    ${u.acts.length > 2 ? `<div class="xt-a-more">+${u.acts.length - 2} more</div>` : ""}</div>`;
  // B — icon cluster + total reps hero
  const cardB = (u, r) => `<div class="xt-card xt-b"><div class="xt-b-h">${av(u)}<div class="xt-b-nm">${first(u)}</div>${rk(r)}</div>
    <div class="xt-b-figs">${u.acts.slice(0, 3).map(([ex]) => `<span class="xt-b-fig">${W(ex, 26)}</span>`).join("")}</div>
    <div class="xt-b-total">${total(u)}<span> reps</span></div></div>`;
  // C — premium: activity chips + filled total pill
  const cardC = (u, r) => `<div class="xt-card xt-c"><div class="xt-c-h">${av(u, "lg")}<div class="xt-c-nm">${first(u)}</div>${rk(r)}</div>
    <div class="xt-c-chips">${u.acts.map(([ex, n]) => `<span class="xt-c-chip">${W(ex, 14)} ${n}</span>`).join("")}</div>
    <div class="xt-c-pill">${total(u)} total reps</div></div>`;
  // D — top-activity forward: hero activity + “+N more”
  const cardD = (u, r) => { const t = u.acts[0]; return `<div class="xt-card xt-d"><div class="xt-d-h">${av(u)}<span class="xt-d-nm">${first(u)}</span>${rk(r)}</div>
    <div class="xt-d-hero"><span class="xt-d-fig">${W(t[0], 40)}</span><div class="xt-d-htx"><div class="xt-d-en">${EXN[t[0]]}</div><div class="xt-d-r">${t[1]}<span> reps</span></div></div></div>
    ${u.acts.length > 1 ? `<div class="xt-d-more">+${u.acts.length - 1} more ${u.acts.length - 1 > 1 ? "activities" : "activity"}</div>` : ""}</div>`; };
  function topScope(btn, s) { const w = btn.closest(".xt-tabs").parentNode.querySelector(".xt-wrap"); w.className = "xt-wrap scope-" + s; btn.parentNode.querySelectorAll(".xt-tab").forEach((b) => b.classList.toggle("on", b === btn)); }

  /* ═══════════════════ 2 · STREAK ═══════════════════
     "{n} DAY streak" + status. One coherent flame emblem via treatment + shape badge + crack.
     Statuses: active(green) · broken(red) · inactive(grey). */
  const ST = {
    active:   { label: "Active",   badge: "check", tint: "#16a34a" },
    broken:   { label: "Broken",   badge: "x",     tint: "#dc2626" },
    inactive: { label: "Inactive", badge: "",      tint: "#8a9099" },
  };
  function emblem(status, size) {
    const s = ST[status], b = Math.round(size * 0.3);
    const crack = status === "broken" ? `<svg class="xs-crk" viewBox="0 0 24 24"><path d="M14 3 L10 11 L14 12 L8 21"/></svg>` : "";
    const badge = s.badge ? `<span class="xs-badge" style="--bc:${s.tint}">${I(s.badge, b)}</span>` : `<span class="xs-badge dash" style="--bc:${s.tint}"></span>`;
    return `<span class="xs-emb xs-${status}" style="width:${size}px;height:${size}px">${I("flame", Math.round(size * 0.52))}${crack}${badge}</span>`;
  }
  const bubble = (status) => `<span class="xs-bub xs-b-${status}"><span class="xs-dot"></span>${ST[status].label}</span>`;

  function streak(v, c) {
    const s = c.s, status = c.status;
    if (v === 1) {
      return `<div class="xs xs1 xs1-${status}">${emblem(status, 46)}
        <div class="xs1-main"><div class="xs1-num">${s}<span> day streak</span></div>
          <div class="xs1-sub">${status === "broken" ? "Restart today to rebuild it" : status === "inactive" ? "Work out today to begin" : "Best " + c.best}</div></div>
        ${bubble(status)}</div>`;
    }
    if (v === 2) {
      const pct = status === "active" ? Math.min(100, (s % 7 || 7) / 7 * 100) : status === "broken" ? 8 : 0;
      return `<div class="xs xs2"><div class="xr-wrap">${ring(pct, 66, 5, ST[status].tint)}<span class="xs2-emb">${emblem(status, 34)}</span></div>
        <div class="xs2-r"><div class="xs2-num">${s}<span>day streak</span></div>${bubble(status)}</div></div>`;
    }
    if (v === 3) {
      return `<div class="xs xs3 xs3-${status}"><div class="xs3-num">${s}</div>
        <div class="xs3-mid"><div class="xs3-lab">DAY STREAK</div>${bubble(status)}</div>${emblem(status, 40)}</div>`;
    }
    return `<div class="xs xs4 xs4-${status}"><span class="xs4-bg">${I("flame", 84)}</span>${emblem(status, 42)}
      <div class="xs4-mid"><div class="xs4-num">${s}<span> day streak</span></div>
        <div class="xs4-note">${status === "active" ? "On a roll — keep it alive" : status === "broken" ? "Streak broke — start fresh" : "Start your first streak"}</div></div>
      ${bubble(status)}</div>`;
  }
  const CASES = [
    { k: "Active · 7", c: { s: 7, best: 21, status: "active" } },
    { k: "Broken · 0", c: { s: 0, best: 21, status: "broken" } },
    { k: "Inactive / new", c: { s: 0, best: 0, status: "inactive" } },
    { k: "Long · 142", c: { s: 142, best: 142, status: "active" } },
  ];
  const streakVariant = (v) => `<div class="lab-states">${CASES.map((cs) => `<div class="lab-state"><div class="lab-sk">${cs.k}</div>${streak(v, cs.c)}</div>`).join("")}</div>`;

  /* ═══════════════════ 3 · MY ACTIVITY ═══════════════════
     From the sketch: header (title · edit · share) → activity cards (+ add) → divider → metrics.
     Daily goal is STEPS-ONLY (edit pencil sets it) with a completion indicator on the Steps card.
     No workouts goal chip. Share hidden when there is no activity. Left-aligned. */
  const G_STEPS = 6000;
  const stepAct = (v, num) => ({ i: "steps", n: "Steps", v: v, num: num, goal: G_STEPS });
  const A = { push: { i: "pushup", n: "Push-ups", v: "80", u: "reps" }, squat: { i: "squat", n: "Squats", v: "120", u: "reps" }, situp: { i: "situp", n: "Sit-ups", v: "90", u: "reps" } };
  const MA = {
    new:      { has: false, acts: [], kcal: "0", dist: "0.0 km", active: "0 min", steps: stepAct("0", 0) },
    today0:   { has: false, acts: [], kcal: "0", dist: "0.0 km", active: "0 min", steps: stepAct("0", 0) },
    partial:  { has: true, acts: [stepAct("3,240", 3240), A.push, A.squat], kcal: "320", dist: "3.2 km", active: "55 min", steps: stepAct("3,240", 3240) },
    complete: { has: true, acts: [stepAct("6,240", 6240), A.push, A.squat, A.situp], kcal: "640", dist: "6.4 km", active: "1h 25m", steps: stepAct("6,240", 6240) },
  };
  const maHead = (share, withAdd) => `<div class="xa-h"><div class="xa-t">My Activity</div><div class="xa-acts">${withAdd ? `<button class="xa-ic add" title="Add activity">${I("plus", 16)}</button>` : ""}<button class="xa-ic" title="Edit steps goal">${I("edit", 15)}</button>${share ? `<button class="xa-ic" title="Share">${I("share", 15)}</button>` : ""}</div></div>`;
  function actCard(a) {
    if (a.i === "steps") {
      const pct = a.goal ? Math.min(100, Math.round(a.num / a.goal * 100)) : 0, done = a.num >= a.goal;
      return `<div class="xa-act xa-actstep"><div class="xa-stepic${done ? " done" : ""}">${ring(pct, 36, 4, done ? "var(--success)" : "var(--primary)")}<span class="xa-stepc">${done ? I("check", 14) : I("footprints", 15)}</span></div>
        <div class="xa-actv">${a.v}</div><div class="xa-actn">Steps${done ? " · goal" : ""}</div></div>`;
    }
    return `<div class="xa-act"><span class="xa-actic">${W(a.i, 24)}</span><div class="xa-actv">${a.v}${a.u ? `<span> ${a.u}</span>` : ""}</div><div class="xa-actn">${a.n}</div></div>`;
  }
  const addCard = (t) => `<button class="xa-act xa-add"><span class="xa-addic">${I("plus", 20)}</span><span class="xa-addt">${t || "Add"}</span></button>`;
  const railA = (acts, addT) => `<div class="xa-rail">${addCard(addT)}${acts.map(actCard).join("")}</div>`;
  const railNoAdd = (acts) => `<div class="xa-rail">${acts.map(actCard).join("")}</div>`;
  const metric = (ic, v, l) => `<div class="xa-metric"><div class="xa-mv">${v}</div><div class="xa-ml">${I(ic, 12)} ${l}</div></div>`;
  const metrics = (d) => `<div class="xa-metrics">${metric("flame", d.kcal, "calories")}${metric("pin", d.dist, "distance")}${metric("clock", d.active, "active")}</div>`;
  const DIV = `<div class="xa-div"></div>`;

  function activity(v, key) {
    const d = MA[key], sp = d.steps, spct = Math.min(100, Math.round(sp.num / sp.goal * 100)), sdone = sp.num >= sp.goal;

    if (v === 1) {
      // has activity → Add moves up into the header (with edit + share); rail shows activities only.
      // no activity → Add stays in the rail as the primary CTA.
      return d.has
        ? `<div class="xa xa1">${maHead(true, true)}${railNoAdd(d.acts)}${DIV}${metrics(d)}</div>`
        : `<div class="xa xa1">${maHead(false, false)}${railA(d.acts, key === "today0" ? "Start a workout" : "Add activity")}<div class="xa-emptynote">${key === "today0" ? "No workout logged yet today." : "Track steps and workouts as you go."}</div></div>`;
    }
    if (v === 2) {
      return `<div class="xa xa2">${maHead(d.has)}
        <div class="xa2-top"><div class="xa2-goal"><div class="xa2-ring">${ring(spct, 58, 7, sdone ? "var(--success)" : "var(--primary)")}<span class="xa2-rc">${sdone ? I("check", 18) : spct + "%"}</span></div>
            <div class="xa2-gl"><b>Steps goal</b><span>${sp.v} / 6,000${sdone ? " · met" : ""}</span></div></div>
          ${d.has ? `<div class="xa2-mini"><span>${I("flame", 13)} ${d.kcal}</span><span>${I("pin", 13)} ${d.dist}</span><span>${I("clock", 13)} ${d.active}</span></div>` : ""}</div>
        ${DIV}<div class="xa2-actl">Activities</div>${railA(d.acts, d.has ? "Add" : "Start")}</div>`;
    }
    if (v === 3) {
      return `<div class="xa xa3"><div class="xa-h"><div class="xa-t">My Activity</div><button class="xa-ic" title="Edit steps goal">${I("edit", 15)}</button></div>
        ${metrics(d.has ? d : { kcal: "0", dist: d.dist, active: "0 min" })}
        ${DIV}<div class="xa3-actl">Today's activities</div>
        ${railA(d.acts, d.has ? "Add" : "Start a workout")}
        ${d.has ? `<div class="xa3-foot"><span class="xa3-status">${sdone ? '<span class="xa-done inline">' + I("check", 13) + " Steps goal reached</span>" : "Steps " + spct + "% of daily goal"}</span><button class="xa-share">${I("share", 14)} Share</button></div>` : ""}</div>`;
    }
    return `<div class="xa xa4"><div class="xa-h"><div class="xa-t">My Activity</div><div class="xa4-hr"><span class="xa4-sgoal${sdone ? " done" : ""}">${sdone ? I("check", 13) + " Steps goal" : sp.v + " / 6k"}</span><button class="xa-ic sm" title="Edit steps goal">${I("edit", 14)}</button></div></div>
      ${railA(d.acts, d.has ? "Add" : "Start a workout")}
      ${d.has ? `<div class="xa4-strip"><span>${I("flame", 13)} ${d.kcal} cal</span><span>${I("pin", 13)} ${d.dist}</span><span>${I("clock", 13)} ${d.active}</span><button class="xa4-share" title="Share">${I("share", 14)}</button></div>` : `<div class="xa4-strip empty"><span>${key === "today0" ? "No workout yet today" : "Add an activity to begin"}</span></div>`}</div>`;
  }
  const MA_CASES = [["New user", "new"], ["No activity today", "today0"], ["Partial (steps 54%)", "partial"], ["Steps goal met", "complete"]];
  const activityVariant = (v) => `<div class="lab-states col">${MA_CASES.map(([k, key]) => `<div class="lab-state wide"><div class="lab-sk">${k}</div>${activity(v, key)}</div>`).join("")}</div>`;

  /* ═══════════════════ mount ═══════════════════ */
  function mount() {
    const top = [["Variant A", "Athlete card · activity rows", topBlock(cardA)], ["Variant B", "Icon cluster · total reps", topBlock(cardB)],
      ["Variant C", "Premium · chips + total pill", topBlock(cardC)], ["Variant D", "Top-activity forward", topBlock(cardD)]];
    setHTML("lab-top", top.map(([n, s, h]) => block("Top Activities — " + n, s, h)).join(""));

    const stv = [["Variant 1", "Emblem strip"], ["Variant 2", "State ring"], ["Variant 3", "Number hero"], ["Variant 4", "Tinted banner"]];
    setHTML("lab-streak", stv.map(([n, s], i) => block("Streak — " + n, s, streakVariant(i + 1))).join(""));

    const mav = [["Variant 1", "Sketch: activities → metrics"], ["Variant 2", "Steps-goal ring + activities"], ["Variant 3", "Metrics hero + Share footer"], ["Variant 4", "Compact · steps goal"]];
    setHTML("lab-activity", mav.map(([n, s], i) => block("My Activity — " + n, s, activityVariant(i + 1))).join(""));
    window.Icons.init(document.body);
  }
  function setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

  return { mount, topScope };
})();
