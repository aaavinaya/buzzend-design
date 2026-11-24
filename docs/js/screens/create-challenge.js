/* Create Challenge — the app's wizard (matched to the shipping screens 2026-10-27), now 4 steps:
   Step 1 What's the challenge?  ONE grid: 8 exercises + a "Full Body" card.
            · tap one exercise            → Single workout (as today)
            · tap 2+ exercises            → Multi-workout; pick order shows as 1, 2, 3 (the order members see).
                                            Walking can't be combined (steps aren't allowed in Multi).
            · tap Full Body               → routine cards (Trio · Dynamic / Quad · Standard / Penta · Ultimate)
                                            → level cards (Easy / Medium / Hard), all on this step.
            Quick start below (single-workout presets).
   Step 2 Name it                  challenge name + description.
   Step 3 When & who can join?     who can join → Require approval (ON by default) → Elimination toggle →
            dates → (Elimination: daily target) → winners → prizes.
            · Single:        as today (Elimination = same every day / goes up daily; winner None/Top/Random).
            · Multi:         Elimination = a daily target per workout (fixed only); Standard = points note.
            · Full Body:     Elimination = the level IS the target (read-only); Standard = "only <level> counts".
            · Multi + Full Body: Winners is a 1 / 2 / 3 picker with one optional prize per place.
   Step 4 Review                   preview + summary + the rules in plain words.
   Every Elimination challenge closes joining when it starts. There is no Duration (frequency) picker: the
   request always sends frequency: "DAILY". Full validation, templates, discard-confirm. */
window.CC = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const EXA = (n, s) => window.Icons.workout(n, s, "plain");
  const EXO = (n, s) => window.Icons.workout(n, s, "outlined");

  /* The app's exercise grid (names as the catalog returns them). Burpee and High Knee carry a NEW badge. */
  const EX = [
    { key: "steps", n: "Walking", pl: "steps", i: "walk" }, { key: "pushup", n: "Push Up", pl: "push-ups", i: "pushup" },
    { key: "squat", n: "Squat", pl: "squats", i: "squat" }, { key: "jumping", n: "Jumping Jack", pl: "jumping jacks", i: "jumping" },
    { key: "situp", n: "Sit Up", pl: "sit-ups", i: "situp" }, { key: "lunge", n: "Lunge", pl: "lunges", i: "lunge" },
    { key: "burpee", n: "Burpee", pl: "burpees", i: "burpee", isNew: true }, { key: "highknee", n: "High Knee", pl: "high knees", i: "high-knee", isNew: true },
  ];
  const exMeta = (k) => EX.find((e) => e.key === k) || EX[0];
  /* Full Body routines + levels (the app's full_body_routines.json: 1 round each). */
  const ROUTINES = [
    { id: "basics", n: "Trio · Dynamic", short: "Trio", steps: ["jumping", "highknee", "squat"],
      lv: { easy: { jumping: 20, highknee: 20, squat: 15 }, medium: { jumping: 30, highknee: 35, squat: 20 }, hard: { jumping: 50, highknee: 55, squat: 40 } } },
    { id: "power", n: "Quad · Standard", short: "Quad", steps: ["jumping", "highknee", "squat", "pushup"],
      lv: { easy: { jumping: 20, highknee: 25, squat: 15, pushup: 10 }, medium: { jumping: 40, highknee: 40, squat: 30, pushup: 15 }, hard: { jumping: 50, highknee: 55, squat: 40, pushup: 25 } } },
    { id: "total-body", n: "Penta · Ultimate", short: "Penta", steps: ["jumping", "highknee", "squat", "pushup", "burpee"],
      lv: { easy: { jumping: 20, highknee: 25, squat: 15, pushup: 10, burpee: 10 }, medium: { jumping: 40, highknee: 40, squat: 30, pushup: 20, burpee: 15 }, hard: { jumping: 60, highknee: 60, squat: 50, pushup: 30, burpee: 25 } } },
  ];
  const LEVELS = [{ id: "easy", n: "Easy" }, { id: "medium", n: "Medium" }, { id: "hard", n: "Hard" }];
  const routine = () => ROUTINES.find((r) => r.id === S.routine);
  const levelN = () => (LEVELS.find((l) => l.id === S.level) || {}).n;
  const harder = () => S.level === "easy" ? "Medium or Hard" : S.level === "medium" ? "Hard" : "";

  /* Quick start — the app's ChallengeTemplate list (single-workout presets). */
  const QUICK = [
    { id: "burpee_7day", ic: "rocket", label: "7-Day Burpees", ex: "burpee", name: "7-Day Burpee Kickstart", desc: "A week of daily burpees to build full-body strength.", dur: 7 },
    { id: "hknee_14day", ic: "zap", label: "14-Day High Knees", ex: "highknee", name: "14-Day High Knees Sprint", desc: "Two weeks of daily high knees to get your heart going.", dur: 14 },
    { id: "squat_30day", ic: "trophy", label: "30-Day Squats", ex: "squat", name: "30-Day Squat Challenge", desc: "Do squats every day for 30 days.", dur: 30 },
    { id: "pushup_30day", ic: "trophy", label: "30-Day Push-ups", ex: "pushup", name: "30-Day Push-up Challenge", desc: "Build upper body strength with daily push-ups.", dur: 30 },
    { id: "walk_10k", ic: "trophy", label: "30-Day Walk", ex: "steps", name: "10,000 Steps Daily Challenge", desc: "Walk 10,000 steps every day for 30 days.", dur: 30 },
    { id: "situp_30day", ic: "trophy", label: "30-Day Sit-ups", ex: "situp", name: "30-Day Sit-up Challenge", desc: "Build core strength with daily sit-ups.", dur: 30 },
    { id: "lunge_30day", ic: "trophy", label: "30-Day Lunges", ex: "lunge", name: "30-Day Lunge Challenge", desc: "Daily lunges for stronger legs over 30 days.", dur: 30 },
    { id: "jjack_14day", ic: "zap", label: "14-Day Jumping Jacks", ex: "jumping", name: "14-Day Jumping Jack Blast", desc: "Two weeks of daily jumping jacks to get the heart going.", dur: 14 },
    { id: "custom", ic: "wand", label: "Custom", ex: null, name: "", desc: "", dur: 30 },
  ];
  const WIN = [
    { v: "NO_WINNER", ic: "block", t: "None", s: "Casual · No pressure", r: "No Winner" },
    { v: "NORMAL_WINNER", ic: "trophy", t: "Top Score", s: "Competitive · Rewards", r: "Top Score" },
    { v: "RANDOM_WINNER", ic: "zap", t: "Random", s: "Fair · Exciting", r: "Random" },
  ];
  const winLabel = (v) => (WIN.find((w) => w.v === v) || WIN[0]).r;
  const BAD = ["damn", "hell", "shit", "fuck", "crap", "idiot", "stupid"];
  const NAME_MAX = 250, DESC_MAX = 3000, STEPS = 4;

  // date helpers
  const pad = (n) => ("" + n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = iso(new Date());
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (s) => { const p = s.split("-"); return `${+p[2]} ${MON[+p[1] - 1]} ${p[0]}`; };   // "27 Oct 2026", like the app
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const esc = (s) => ("" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const n0 = (n) => n.toLocaleString("en-US");

  let S = { edit: false, editMembers: 0, noLimit: false, step: 0, template: null, picks: [], fullBody: false, routine: null, level: null, name: "", desc: "", isPublic: true,
    requireApproval: true,   // ON by default for every new challenge
    start: today, end: iso(addDays(new Date(), 7)), winner: "NO_WINNER", prizes: [], winners: 1, placePrizes: ["", "", ""],
    elim: false, elimDays: 7, koMode: "DYNAMIC", koTarget: null, koInc: null, mTargets: {}, err: {} };
  // what kind of challenge the picks make
  const kind = () => S.fullBody ? "FULL_BODY" : S.picks.length >= 2 ? "MULTI" : "SINGLE";
  const single = () => S.picks[0];
  const durDays = () => S.elim ? S.elimDays : Math.max(1, daysBetween(S.start, S.end));
  const elimEnd = () => iso(addDays(new Date(S.start), S.elimDays - 1));

  /* Single-workout Elimination: same every day (STATIC) or goes up every day (DYNAMIC). */
  const koSteps = () => single() === "steps";
  const koUnit = () => single() ? exMeta(single()).pl : "reps";
  const koStep = () => koSteps() ? 500 : 5;
  const koT = () => S.koTarget != null ? S.koTarget : koSteps() ? 6000 : 20;
  const koI = () => S.koMode === "STATIC" ? 0 : S.koInc != null ? S.koInc : koSteps() ? 500 : 5;
  const koTargetOn = (d) => koT() + koI() * (d - 1);
  /* Multi-workout Elimination: a fixed daily target per workout (default 20; burpees 10), minimum 1. */
  const mT = (k) => S.mTargets[k] != null ? S.mTargets[k] : k === "burpee" ? 10 : 20;
  const mLine = () => S.picks.map((k) => `${n0(mT(k))} ${exMeta(k).pl}`).join(" + ");

  const hasData = () => !!(S.name.trim() || S.desc.trim() || S.picks.length || S.fullBody || S.template || S.prizes.some((p) => p.trim()));

  // ── render ──
  function render() {
    document.getElementById("app").innerHTML = header() + body() + footer();
    window.Icons.init(document.getElementById("app"));
  }
  document.addEventListener("wheel", (ev) => {   // vertical wheel -> horizontal scroll over the quick-start carousel
    const row = ev.target.closest && ev.target.closest(".cc-quick");
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 0) return;
    const d = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
    if ((d < 0 && row.scrollLeft <= 0) || (d > 0 && row.scrollLeft >= max)) return;
    row.scrollLeft += d;
    ev.preventDefault();
  }, { passive: false });
  function header() {
    return `<div class="cc-head"><div class="cc-htop"><button class="cc-back" onclick="CC.tryExit()">${I("back", 22)}</button>
      <div class="t">${S.edit ? "Edit Challenge" : "Create Challenge"}</div><div class="cc-step">Step ${S.step + 1} of ${STEPS}</div></div>
      <div class="cc-prog"><i style="width:${((S.step + 1) / STEPS) * 100}%"></i></div></div>`;
  }
  function body() { return [step1, step2, step3, step4][S.step](); }

  // ── Step 1 · What's the challenge? ──
  function step1() {
    const chip = (q) => `<button class="cc-chip ${S.template === q.id ? "on" : ""}" onclick="CC.applyTemplate('${q.id}')">${I(q.ic, 15)} ${q.label}</button>`;
    const multi = S.picks.length >= 2;
    const exc = (e) => { const ix = S.picks.indexOf(e.key), on = ix >= 0;
      return `<button class="cc-ex-c ${on ? "on" : ""}" onclick="CC.pickEx('${e.key}')">${e.isNew ? `<span class="cc-new">NEW</span>` : ""}${on && multi ? `<span class="cc-order">${ix + 1}</span>` : ""}<span class="ic">${EXA(e.i, 58)}</span><span class="n">${e.n}</span></button>`; };
    const fbCard = `<button class="cc-ex-c cc-fb ${S.fullBody ? "on" : ""}" onclick="CC.pickFullBody()">
      <span class="cc-fb-ic">${I("activity", 26)}</span><span class="n">Full Body</span><span class="cc-fb-s">A full routine</span></button>`;
    let mode = "";
    if (S.fullBody) mode = `<div class="cc-mode">${I("activity", 14)}<span><b>Full Body</b> · pick a routine and a level</span></div>`;
    else if (multi) mode = `<div class="cc-mode">${I("grid", 14)}<span><b>Multi-workout</b> · ${S.picks.length} workouts, in this order: ${S.picks.map((k, i) => `${i + 1} ${exMeta(k).n}`).join(" · ")}</span></div>`;
    else if (S.picks.length === 1) mode = `<div class="cc-mode">${I("dumbbell", 14)}<span><b>Single workout</b>${single() === "steps" ? "" : " · tap more exercises to make it a Multi-workout"}</span></div>`;
    const walkNote = single() === "steps" ? `<div class="cc-hint">Walking can't be combined with other workouts.</div>` : "";
    return `<div class="cc-body">
      <div class="cc-h1">What's the challenge?</div><div class="cc-sub">Pick one exercise, a few of them, or a full routine</div>
      <div class="cc-lbl">Workout</div><div class="cc-ex">${EX.map(exc).join("")}${fbCard}</div>
      ${S.err.exercise ? `<div class="cc-err" style="margin-top:9px">${S.err.exercise}</div>` : ""}
      ${mode}${walkNote}
      ${S.fullBody ? fullBodyPicker() : `<div class="cc-lbl">Quick start</div><div class="cc-quick">${QUICK.map(chip).join("")}</div>`}</div>`;
  }
  /* Full Body: routine cards, then level cards (each says what the level means). */
  function fullBodyPicker() {
    const rc = (r) => `<button class="cc-rt ${S.routine === r.id ? "on" : ""}" onclick="CC.pickRoutine('${r.id}')">
      <span class="cc-rt-tx"><b>${r.n}</b><span>${r.steps.length} exercises</span></span>
      <span class="cc-rt-ics">${r.steps.map((k) => `<i>${EXO(exMeta(k).i, 22)}</i>`).join("")}</span>
      <span class="cc-radio${S.routine === r.id ? " on" : ""}"></span></button>`;
    const r = routine();
    const lc = (l) => `<button class="cc-lv ${S.level === l.id ? "on" : ""}" onclick="CC.pickLevel('${l.id}')">
      <b>${l.n}</b><span>1 round · ${r.steps.map((k) => `${r.lv[l.id][k]} ${exMeta(k).pl}`).join(" · ")}</span></button>`;
    return `<div class="cc-lbl">Routine</div><div class="cc-rts">${ROUTINES.map(rc).join("")}</div>
      ${S.err.routine ? `<div class="cc-err" style="margin-top:9px">${S.err.routine}</div>` : ""}
      ${r ? `<div class="cc-lbl">Level</div><div class="cc-lvs">${LEVELS.map(lc).join("")}</div>
        ${S.err.level ? `<div class="cc-err" style="margin-top:9px">${S.err.level}</div>` : ""}` : ""}`;
  }

  // ── Step 2 · Name it ──
  function step2() {
    const ph = kind() === "FULL_BODY" ? `E.g. 30-Day ${routine() ? routine().short : "Penta"} Challenge` : kind() === "MULTI" ? "E.g. 14-Day Leg & Push Mix" : "E.g. 30-Day Squat Challenge";
    return `<div class="cc-body">
      <div class="cc-h1">Name your challenge</div><div class="cc-sub">Give it a name people will want to join</div>
      <div class="cc-lbl">Challenge name</div>
      <input class="cc-input ${S.err.name ? "err" : ""}" maxlength="${NAME_MAX}" value="${esc(S.name)}" placeholder="${ph}" oninput="CC.setName(this.value)">
      <div class="cc-meta"><span class="cc-err">${S.err.name || ""}</span><span class="cc-count">${S.name.length}/${NAME_MAX}</span></div>
      <div class="cc-lbl">Description</div>
      <textarea class="cc-textarea ${S.err.desc ? "err" : ""}" maxlength="${DESC_MAX}" placeholder="What's the goal? Any rules?" oninput="CC.setDesc(this.value)">${esc(S.desc)}</textarea>
      <div class="cc-meta"><span class="cc-err">${S.err.desc || ""}</span><span class="cc-count">${S.desc.length}/${DESC_MAX}</span></div></div>`;
  }

  // ── Step 3 · When & who can join? ──
  const toggleCard = (ic, title, sub, on, fn) => `<div class="cc-toggle${on ? " on" : ""}" onclick="CC.${fn}()">
      <span class="tic">${I(ic, 22)}</span><span class="ttx"><b>${title}</b><span>${sub}</span></span>
      <span class="cc-switch${on ? " on" : ""}" role="switch" aria-checked="${on}"><i></i></span></div>`;
  function step3() {
    const k = kind();
    const win = (w) => `<button class="cc-win ${S.winner === w.v ? "on" : ""}" onclick="CC.setWinner('${w.v}')">
      <span class="wic" style="color:${S.winner === w.v ? "var(--primary)" : "var(--text-secondary)"}">${I(w.ic, 22)}</span><div class="wt">${w.t}</div><div class="ws">${w.s}</div></button>`;
    const elimSub = k === "MULTI" ? "Every workout gets a daily target. Miss any one and you're out."
      : k === "FULL_BODY" ? "Finish the routine every day. Miss a day and you're out."
      : "Everyone gets a daily target. Miss it once and you're out.";
    return `<div class="cc-body">
      <div class="cc-h1">When &amp; who can join?</div><div class="cc-sub">Set the schedule and visibility</div>
      <div class="cc-lbl">Who can join?</div>
      <div class="cc-two">
        <div class="cc-pick ${S.isPublic ? "on" : ""}" onclick="CC.setPublic(true)"><span class="pic">${I("users", 26)}</span><div class="pt">Public</div><div class="pd">Anyone can join</div></div>
        <div class="cc-pick ${!S.isPublic ? "on" : ""}" onclick="CC.setPublic(false)"><span class="pic">${I("lock", 24)}</span><div class="pt">Private</div><div class="pd">${S.noLimit ? "Invite only" : "Invite only · up to 10 members"}</div></div></div>
      ${!S.isPublic ? (S.noLimit ? `<div class="cc-hint">${I("users", 13)} No member limit</div>`
        : `<div class="cc-hint">Up to 10 members, including you. Need more? <button class="cc-link" onclick="CC.support()">Contact Buzzend support</button></div>`) : ""}
      <div class="cc-lbl">Joining</div>
      ${toggleCard("shield", "Require approval to join", "You'll review and approve each request before someone joins.", S.requireApproval, "toggleApproval")}
      <div class="cc-lbl">Challenge type</div>
      ${toggleCard("target", "Elimination challenge", elimSub, S.elim, "toggleElim")}
      ${S.elim ? elimSchedule() : `<div class="cc-lbl">Start &amp; end date</div>
        <div class="cc-dates">
          <label class="cc-date"><span class="k">Start</span><input type="date" value="${S.start}" min="${today}" onchange="CC.setStart(this.value)"></label>
          <label class="cc-date"><span class="k">End</span><input type="date" value="${S.end}" min="${iso(addDays(new Date(S.start), 1))}" onchange="CC.setEnd(this.value)"></label></div>
        <div class="cc-hint">Choose the start and end dates for your challenge.</div>${standardNote()}`}
      ${k === "SINGLE" ? `<div class="cc-lbl">Winner selection</div><div class="cc-three">${WIN.map(win).join("")}</div>
        ${S.winner !== "NO_WINNER" ? prizes() : ""}` : winnersPicker()}</div>`;
  }
  // Standard (non-elimination) rule note for the new kinds
  function standardNote() {
    if (kind() === "MULTI") return `<div class="cc-rule">${I("info", 16)}<span>Each workout has its own leaderboard. Your places are added up into points, and the <b>lowest points lead</b>.</span></div>`;
    if (kind() === "FULL_BODY") return `<div class="cc-rule">${I("info", 16)}<span>Only sessions on <b>${levelN()}</b> count. You don't need to finish the routine, <b>every rep counts</b>.</span></div>`;
    return "";
  }
  /* Elimination: start date + number of days (end date shown), then the daily target for this kind. */
  function elimSchedule() {
    const k = kind();
    let target;
    if (k === "MULTI") {
      target = `<div class="cc-lbl">Daily targets</div>
        <div class="cc-fixed">${I("lock", 13)} Fixed daily target only for this challenge</div>
        ${S.picks.map((x, i) => `<div class="cc-mt"><span class="cc-mt-n">${i + 1}</span><span class="cc-mt-ic">${EXO(exMeta(x).i, 22)}</span><span class="cc-mt-l">${exMeta(x).n}</span>
          <span class="cc-stepper"><button onclick="CC.mTargetStep('${x}',-1)" aria-label="Lower" ${mT(x) <= 1 ? "disabled" : ""}>−</button><b>${n0(mT(x))}</b><button onclick="CC.mTargetStep('${x}',1)" aria-label="Higher">+</button></span></div>`).join("")}
        <div class="cc-rule">${I("target", 16)}<span>Every day: <b>${mLine()}</b>. Miss any one and you're out.</span></div>`;
    } else if (k === "FULL_BODY") {
      target = `<div class="cc-lbl">Daily target</div>
        <div class="cc-fbt"><span class="cc-fbt-ic">${I("activity", 20)}</span><span><b>Finish ${routine().n} on ${levelN()}${harder() ? ` (or ${harder()})` : ""} once a day.</b>
          <em>This comes from the level you picked. Fixed daily target only for this challenge.</em></span></div>`;
    } else {
      target = `<div class="cc-lbl">Daily target</div>
      <div class="cc-two">
        <div class="cc-pick ${S.koMode === "STATIC" ? "on" : ""}" onclick="CC.setKoMode('STATIC')"><span class="pic">${I("flag", 22)}</span><div class="pt">Same every day</div><div class="pd">e.g. ${n0(koT())} a day</div></div>
        <div class="cc-pick ${S.koMode === "DYNAMIC" ? "on" : ""}" onclick="CC.setKoMode('DYNAMIC')"><span class="pic">${I("activity", 22)}</span><div class="pt">Goes up daily</div><div class="pd">e.g. ${n0(koT())} → ${n0(koT() + koStep())} → …</div></div></div>
      <div class="cc-ko-row"><span>${S.koMode === "STATIC" ? "Target" : "Day 1 target"}</span>
        <span class="cc-stepper"><button onclick="CC.koTargetStep(-1)" aria-label="Lower">−</button><b>${n0(koT())}</b><button onclick="CC.koTargetStep(1)" aria-label="Higher">+</button></span><em>${koUnit()}</em></div>
      ${S.koMode === "DYNAMIC" ? `<div class="cc-ko-row"><span>Goes up by</span>
        <span class="cc-stepper"><button onclick="CC.koIncStep(-1)" aria-label="Less">−</button><b>${n0(koI())}</b><button onclick="CC.koIncStep(1)" aria-label="More">+</button></span><em>every day</em></div>
      <div class="cc-ko-prev">
        <div class="h">${I("target", 16)} Day by day</div>
        <div class="cc-ko-days">${Array.from({ length: S.elimDays }, (_, d) => `<span><i>Day ${d + 1}</i><b>${n0(koTargetOn(d + 1))}</b></span>`).join("")}</div>
        <div class="f">Reach the day's target to stay in. Miss it once and you're out.</div></div>`
        : `<div class="cc-hint">Everyone needs ${n0(koT())} ${koUnit()} every day. Miss it once and you're out.</div>`}`;
    }
    return `<div class="cc-lbl">Start &amp; days</div>
      <div class="cc-dates">
        <label class="cc-date"><span class="k">Start</span><input type="date" value="${S.start}" min="${today}" onchange="CC.setStart(this.value)"></label>
        <div class="cc-date"><span class="k">Days</span>
          <span class="cc-stepper"><button onclick="CC.elimDaysStep(-1)" aria-label="Fewer days" ${S.elimDays <= 2 ? "disabled" : ""}>−</button><b>${S.elimDays}</b><button onclick="CC.elimDaysStep(1)" aria-label="More days" ${S.elimDays >= 30 ? "disabled" : ""}>+</button></span></div></div>
      <div class="cc-hint">Starts at midnight on ${fmtDate(S.start)} · ends ${fmtDate(elimEnd())} · 2–30 days. Joining closes when the challenge starts.</div>
      ${target}`;
  }
  function prizes() {   // single workout: None / Top Score / Random + up to 3 prizes (as today)
    const rows = S.prizes.map((p, i) => `<div class="cc-prize-row"><span class="medal" style="color:${["#f5a623", "#b8c0c8", "#c8894a"][i]}">${I("medal", 22)}</span>
      <input value="${esc(p)}" maxlength="40" placeholder="${["1st", "2nd", "3rd"][i]} place prize" oninput="CC.setPrize(${i},this.value)">
      <button class="rm" onclick="CC.removePrize(${i})" aria-label="Remove prize">${I("x", 16)}</button></div>`).join("");
    return `<div class="cc-lbl">Prizes (optional)</div>${rows}
      ${S.prizes.length < 3 ? `<button class="cc-addprize" onclick="CC.addPrize()">${I("plus", 16)} Add prize</button>` : ""}
      <div class="cc-prize-hint">${S.prizes.length}/3 · rewards for the top finishers</div>`;
  }
  // Multi-workout + Full Body: Winners 1 / 2 / 3 + one optional prize per place
  function winnersPicker() {
    const by = kind() === "MULTI" ? (S.elim ? "combined reps" : "fewest points") : "total reps";
    return `<div class="cc-lbl">Winners</div>
      <div class="cc-seg">${[1, 2, 3].map((n) => `<button class="${S.winners === n ? "on" : ""}" onclick="CC.setWinners(${n})">${n}</button>`).join("")}</div>
      <div class="cc-hint">The top ${S.winners} by ${by} win${S.winners > 1 ? "" : "s"}. On a tie, whoever got there first.</div>
      <div class="cc-lbl">Prizes (optional)</div>
      ${Array.from({ length: S.winners }, (_, i) => `<div class="cc-prize-row"><span class="medal" style="color:${["#f5a623", "#b8c0c8", "#c8894a"][i]}">${I("medal", 22)}</span>
        <input value="${esc(S.placePrizes[i])}" maxlength="40" placeholder="${["1st", "2nd", "3rd"][i]} place prize" oninput="CC.setPlacePrize(${i},this.value)"></div>`).join("")}`;
  }

  // ── Step 4 · Review ──
  /* the rules in plain words (design brief "The rules your screens must explain") */
  function rules() {
    const k = kind(), W = S.winners, top = `The top ${W} win${W > 1 ? "" : "s"}.`;
    if (k === "MULTI" && !S.elim) return ["Each workout has its own leaderboard.", "Your places on all of them are added up into points, and the lowest points lead.", top];
    if (k === "MULTI") return [`Every day: ${mLine()}.`, "Miss any one in a day and you're out.", `Everyone still in at the end is ranked by combined reps. ${top}`];
    if (k === "FULL_BODY" && !S.elim) return [`Only sessions on ${levelN()} count.`, "Every rep counts, even if you don't finish the routine.", `Ranked by total reps. ${top}`];
    if (k === "FULL_BODY") return [`Each day, finish ${routine().n} once on ${levelN()}${harder() ? " or harder" : ""}.`, "Miss a day and you're out.", `Everyone still in at the end is ranked by total reps. ${top}`];
    return null;
  }
  function step4() {
    const k = kind(), days = durDays(), name = S.name.trim() || "Your challenge";
    const row = (ic, kk, v) => `<div class="cc-sum-row"><span class="sic">${I(ic, 16)}</span><span class="sk">${kk}</span><span class="sv">${v}</span></div>`;
    let art, tag, workout;
    if (k === "FULL_BODY") { art = `<span class="cc-fb-ic big">${I("activity", 30)}</span>`; tag = `Full Body · ${routine().n} · ${levelN()}`; workout = `${routine().n} · ${levelN()}`; }
    else if (k === "MULTI") { art = `<span class="cc-stack">${S.picks.slice(0, 3).map((x) => `<i>${EXA(exMeta(x).i, 34)}</i>`).join("")}</span>`; tag = `Multi · ${S.picks.length} workouts`; workout = S.picks.map((x) => exMeta(x).n).join(", "); }
    else { const e = exMeta(single()); art = EXA(e.i, 56); tag = e.n; workout = e.n; }
    const tgt = k === "SINGLE" ? (S.koMode === "STATIC" ? `${n0(koT())} ${koUnit()} a day` : `${n0(koT())} → ${n0(koTargetOn(days))} (+${n0(koI())}/day)`)
      : k === "MULTI" ? mLine() : `Finish on ${levelN()}${harder() ? " or harder" : ""}`;
    const prizeN = (k === "SINGLE" ? S.prizes : S.placePrizes.slice(0, S.winners)).filter((p) => p && p.trim()).length;
    const R = rules();
    const noteIc = single() === "steps" ? "walk" : "camera";
    const noteTx = single() === "steps" ? "Steps are tracked automatically from your phone — no camera needed." : "Camera verification required. AI auto-counts every rep.";
    return `<div class="cc-body">
      <div class="cc-h1">Review your challenge</div><div class="cc-sub">Looks good? Launch it!</div>
      <div class="cc-lbl">Preview</div>
      <div class="cc-preview"><div class="art">${art}</div><div style="min-width:0">
        <div class="pt">${esc(name)}</div><div class="tag">${tag}</div>
        <div class="meta">${S.elim ? "Elimination" : "Daily"} · ${S.isPublic ? "Public" : "Private"} · ${days} days</div></div></div>
      ${R ? `<div class="cc-lbl">How it works</div><div class="cc-how">${R.map((t) => `<div>${I("check", 14)}<span>${t}</span></div>`).join("")}</div>` : ""}
      <div class="cc-lbl">Summary</div>
      <div class="cc-sum">
        ${row(k === "FULL_BODY" ? "activity" : k === "MULTI" ? "grid" : "dumbbell", k === "MULTI" ? "Workouts" : k === "FULL_BODY" ? "Routine" : "Exercise", workout)}
        ${row("target", "Type", S.elim ? "Elimination" : "Standard")}
        ${row("users", "Visibility", S.isPublic ? "Public" : "Private")}
        ${row("shield", "Joining", S.requireApproval ? "Approval required" : "Open to all")}
        ${S.elim ? row("calendar", "Start", "Midnight, " + fmtDate(S.start)) : ""}
        ${row("flag", "Duration", days + " days")}
        ${S.elim ? row("activity", k === "MULTI" ? "Daily targets" : "Daily target", tgt) : ""}
        ${row("trophy", k === "SINGLE" ? "Winner" : "Winners", k === "SINGLE" ? winLabel(S.winner) : `Top ${S.winners}`)}
        ${prizeN ? row("star", "Prizes", prizeN === 1 ? "1 prize" : prizeN + " prizes") : ""}</div>
      ${S.elim ? `<div class="cc-note"><span class="nic">${I("target", 18)}</span><span class="nt">${k === "MULTI" ? "Miss any workout's target and you're out." : k === "FULL_BODY" ? "Miss a day and you're out." : "Miss a day's target and you're out."} Joining closes when the challenge starts.</span></div>` : ""}
      <div class="cc-note"><span class="nic">${I(noteIc, 18)}</span><span class="nt">${noteTx}</span></div></div>`;
  }

  function footer() {
    const primary = ["Next: Name it", "Next: When &amp; who", "Next: Review", I("rocket", 18) + " Launch Challenge"][S.step];
    return `<div class="cc-foot"><button class="cc-cancel" onclick="CC.cancel()">${S.step === 0 ? "Cancel" : "Back"}</button>
      <button class="cc-nextbtn" onclick="CC.next()">${primary}${S.step < STEPS - 1 ? " " + I("chevron", 18) : ""}</button></div>`;
  }

  // ── field setters ──
  function setName(v) { S.name = v; if (S.err.name) { S.err.name = null; } document.querySelector(".cc-count").textContent = v.length + "/" + NAME_MAX; }
  function setDesc(v) { S.desc = v; if (S.err.desc) S.err.desc = null; document.querySelectorAll(".cc-count")[1].textContent = v.length + "/" + DESC_MAX; }
  /* Tap = add / remove. 2+ picks = Multi-workout (order = pick order). Walking stands alone: picking it clears
     the others, and picking anything else replaces it. Picking an exercise clears Full Body. */
  function pickEx(k) {
    S.err = {}; S.template = null; S.koTarget = null; S.koInc = null; S.fullBody = false;
    const ix = S.picks.indexOf(k);
    if (ix >= 0) S.picks.splice(ix, 1);
    else if (k === "steps") S.picks = ["steps"];
    else S.picks = S.picks.filter((x) => x !== "steps").concat(k);
    render();
  }
  function pickFullBody() {
    S.err = {}; S.template = null;
    S.fullBody = !S.fullBody; S.picks = [];
    if (!S.fullBody) { S.routine = null; S.level = null; }
    render();
  }
  function pickRoutine(id) { S.routine = id; S.err.routine = null; if (!S.level) S.level = "medium"; render(); }
  function pickLevel(id) { S.level = id; S.err.level = null; render(); }
  function applyTemplate(id) {
    const q = QUICK.find((x) => x.id === id); if (!q) return;
    S.template = id; S.err = {}; S.koTarget = null; S.koInc = null; S.fullBody = false;
    if (id === "custom") { S.picks = []; S.name = ""; S.desc = ""; S.winner = "NO_WINNER"; S.isPublic = true; S.prizes = []; S.end = iso(addDays(new Date(S.start), 30)); }
    else { S.picks = [q.ex]; S.name = q.name; S.desc = q.desc; S.winner = "NO_WINNER"; S.isPublic = true; S.end = iso(addDays(new Date(S.start), q.dur)); }
    S.elimDays = clamp(q.dur, 2, 30);
    render();
  }
  function setPublic(v) {
    // editing a public challenge (before the start) that already has more than 10 members → refuse
    if (!v && S.edit && !S.noLimit && S.editMembers > window.PrivateLimit.LIMIT) {
      window.PrivateLimit.tooManyDialog(S.editMembers, S.name.trim(), () => { S.isPublic = true; render(); });
      return;
    }
    S.isPublic = v; render();
  }
  // from the create flow the challenge doesn't exist yet, so the message carries no name (an edit does)
  function support() { window.PrivateLimit.contactSupport(S.edit ? S.name.trim() : null); }
  function toggleApproval() { S.requireApproval = !S.requireApproval; render(); }
  function toggleElim() { S.elim = !S.elim; render(); }
  function elimDaysStep(d) { S.elimDays = clamp(S.elimDays + d, 2, 30); render(); }
  function setKoMode(m) { S.koMode = m; render(); }
  function koTargetStep(d) { S.koTarget = clamp(koT() + d * koStep(), koStep(), koSteps() ? 50000 : 1000); render(); }
  function koIncStep(d) { S.koInc = clamp(koI() + d * (koSteps() ? 250 : 1), koSteps() ? 250 : 1, koSteps() ? 5000 : 50); render(); }
  function mTargetStep(k, d) { S.mTargets[k] = clamp(mT(k) + d, 1, 1000); render(); }
  function setStart(v) {
    const len = durDays(); S.start = v && v >= today ? v : today;
    if (S.end <= S.start) S.end = iso(addDays(new Date(S.start), Math.max(1, len)));
    render();
  }
  function setEnd(v) { if (v && v > S.start) S.end = v; render(); }
  function setWinner(v) { S.winner = v; if (v === "NO_WINNER") S.prizes = []; else if (!S.prizes.length) S.prizes = [""]; render(); }
  function setWinners(n) { S.winners = n; render(); }
  function addPrize() { if (S.prizes.length < 3) { S.prizes.push(""); render(); } }
  function removePrize(i) { S.prizes.splice(i, 1); render(); }
  function setPrize(i, v) { S.prizes[i] = v; }
  function setPlacePrize(i, v) { S.placePrizes[i] = v; }

  // ── validation + nav ──
  function validate1() {
    S.err = {};
    if (S.fullBody) {
      if (!S.routine) S.err.routine = "Pick a routine to continue.";
      else if (!S.level) S.err.level = "Pick a level to continue.";
    } else if (!S.picks.length) S.err.exercise = "Pick a workout to continue.";
    return !S.err.exercise && !S.err.routine && !S.err.level;
  }
  function validate2() {
    S.err = {};
    if (!S.name.trim()) S.err.name = "Field required";
    const d = S.desc.trim();
    if (!d) S.err.desc = "Field required";
    else if (d.length < 10) S.err.desc = "Minimum 10 characters required";
    if ((S.name + " " + S.desc).toLowerCase().split(/\W+/).some((w) => BAD.includes(w))) S.err.desc = "Please avoid using improper words.";
    return !S.err.name && !S.err.desc;
  }
  function validate3() { S.prizes = S.prizes.filter((p) => p.trim()); return true; }
  function next() {
    if (S.step === 0 && !validate1()) return render();
    if (S.step === 1 && !validate2()) return render();
    if (S.step === 2 && !validate3()) return render();
    if (S.step < STEPS - 1) { S.step++; render(); document.getElementById("app").querySelector(".cc-body").scrollTop = 0; }
    else launch();
  }
  function cancel() { if (S.step > 0) { S.step--; render(); } else tryExit(); }
  function tryExit() { hasData() ? discard() : exit(); }
  function exit() { location.href = "discover.html"; }

  let _ov = null;
  function discard() {
    const o = document.createElement("div"); o.className = "cc-ov";
    o.innerHTML = `<div class="cc-dlg"><div class="di">${I("alert", 26)}</div><div class="dt">Discard challenge?</div>
      <div class="dd">Your draft will be lost. This can't be undone.</div>
      <div class="cc-dlg-row"><button class="cc-keep" onclick="CC.closeDiscard()">Keep editing</button><button class="cc-discard" onclick="CC.exit()">Discard</button></div></div>`;
    o.addEventListener("click", (e) => { if (e.target === o) closeDiscard(); });
    document.querySelector(".screen").appendChild(o); window.Icons.init(o); _ov = o;
  }
  function closeDiscard() { if (_ov) { _ov.remove(); _ov = null; } }

  /* The create request (POST /v1/challenge). Single-workout fields follow ELIMINATION_CHALLENGE_APP_GUIDE.md.
     The Multi-workout / Full Body fields (workoutMode, workoutCodes, workoutTargets, routineId, level) are the
     design's PROPOSAL — the backend contract for them isn't written yet. */
  function request() {
    const k = kind();
    const base = { title: S.name.trim(), description: S.desc.trim(), startDate: S.start, days: durDays(),
      accessLevel: S.isPublic ? "PUBLIC" : "PRIVATE", frequency: "DAILY", joinApproval: S.requireApproval, workoutMode: k };
    if (k === "SINGLE") Object.assign(base, { workoutCode: single(), winnerType: S.winner, prizes: S.prizes.filter((p) => p.trim()) });
    else Object.assign(base, { winnerCount: S.winners, prizes: S.placePrizes.slice(0, S.winners) });
    if (k === "MULTI") Object.assign(base, { workoutCodes: S.picks.slice() });
    if (k === "FULL_BODY") Object.assign(base, { routineId: S.routine, level: S.level.toUpperCase() });
    if (!S.elim) return base;
    Object.assign(base, { challengeType: "ELIMINATION", eliminationMode: k === "SINGLE" ? S.koMode : "STATIC" });
    if (k === "SINGLE") Object.assign(base, { dailyTarget: koT(), dailyTargetIncrease: koI() });
    if (k === "MULTI") Object.assign(base, { workoutTargets: S.picks.map((x) => ({ workoutCode: x, dailyTarget: mT(x) })) });
    return base;
  }
  function launch() {
    console.log("POST /v1/challenge", request());
    Buzzend.alert({ icon: "trophy", title: "Challenge created!", message: "“" + (S.name.trim() || "Your challenge") + "” is live. Invite friends and record your first set." });
    setTimeout(() => { location.href = "challenges.html"; }, 400);
  }

  /* Deep links: ?step=0..3 · ?kind=single|multi|fullbody · ?type=elimination · ?err=1 */
  function start(step) {
    step = +step || 0;
    const q = new URLSearchParams(location.search), kd = q.get("kind");
    if (kd === "multi") { S.picks = ["squat", "pushup", "burpee"]; S.mTargets = { squat: 20, pushup: 15 }; }
    else if (kd === "fullbody") { S.fullBody = true; S.routine = "total-body"; S.level = "medium"; }
    else if (step > 0) { S.picks = ["burpee"]; S.template = "burpee_7day"; }
    if (step > 1) {   // prefill name/description so later steps preview real data
      S.name = kd === "multi" ? "14-Day Leg & Push Mix" : kd === "fullbody" ? "Penta Week" : "7-Day Burpee Kickstart";
      S.desc = kd === "multi" ? "Squats, push-ups and burpees every day." : kd === "fullbody" ? "Finish the Penta routine every day for a week." : "A week of daily burpees to build full-body strength.";
    }
    if (q.get("type") === "elimination") S.elim = true;
    if (q.get("private") === "1") S.isPublic = false;            // ?private=1 → Private selected
    if (q.get("unlimited") === "1") S.noLimit = true;            // ?unlimited=1 → support raised the limit for this account
    if (q.get("edit") === "1") {                                  // ?edit=1&members=14 → editing a public challenge before its start
      S.edit = true; S.editMembers = +(q.get("members") || 14); S.isPublic = true;
      if (!S.picks.length && !S.fullBody) S.picks = ["squat"];
      S.name = S.name || "30-Day Squat Challenge"; S.desc = S.desc || "Do squats every day for 30 days.";
    }
    if (kd && kd !== "single") S.winners = 3;
    S.step = Math.max(0, Math.min(STEPS - 1, step));
    if (q.get("err")) { S.picks = []; S.fullBody = false; validate1(); }
    render();
  }
  return { start, render, support, setName, setDesc, pickEx, pickFullBody, pickRoutine, pickLevel, applyTemplate, setPublic, toggleApproval, toggleElim,
    elimDaysStep, setKoMode, koTargetStep, koIncStep, mTargetStep, setStart, setEnd, setWinner, setWinners, addPrize, removePrize, setPrize,
    setPlacePrize, next, cancel, tryExit, exit, discard, closeDiscard };
})();
