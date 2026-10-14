/* Buzzend · Full Body Workout — UI state machine.
   landing (pick routine) → preview (pick difficulty, see the plan) → session
   (prep → exercise → rest → …) → results. Reuses the token system, Icons artwork,
   the dialog component and the rep-counting idea (simulated here, exactly like the
   prototype's individual AI-workout flow). Routine/difficulty numbers + scoring all
   come from FullBody (full-body-data.js) — this file is presentation + runtime only. */
window.FBWorkout = (function () {
  const FB = window.FullBody;
  const I = (n, s) => window.Icons.svg(n, s);
  const W = (k, s) => window.Icons.workout(k, s, "real");
  const exName = (k) => FB.EX[k].n;
  const exColor = (k) => FB.EX[k].c;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.round(s % 60))).padStart(2, "0")}`;
  // ms of real time per simulated second (keeps a demo watchable). ?fast speeds it up for previews.
  const SPEED = (new URLSearchParams(location.search).get("fast") ? 25 : 240);

  let root, S, tick = null;

  function start(el, opts) {
    root = el;
    opts = opts || {};
    S = { view: "landing", routineId: opts.routine || FB.ROUTINES[0].id, level: opts.level || "intermediate" };
    go("landing");
  }

  function go(view) { S.view = view; render(); }

  function render() {
    stopTick();
    if (S.view === "landing") root.innerHTML = landing();
    else if (S.view === "preview") root.innerHTML = preview();
    else if (S.view === "session") return runtime();          // runtime paints itself
    else if (S.view === "results") root.innerHTML = results();
    window.Icons.init(root);
  }

  /* ── LANDING ───────────────────────────────────────────── */
  function landing() {
    const card = (rt) => {
      const figs = rt.steps.map((k) => `<span class="fb-fig">${W(FB.EX[k].i, 34)}</span>`).join("");
      const tmin = FB.estMinutes(rt, "beginner"), tmax = FB.estMinutes(rt, "expert");
      return `<button class="fb-card" onclick="FBWorkout.pick('${rt.id}')">
        <div class="fb-card-top" style="background:${rt.grad}">
          <div class="fb-card-figs">${figs}</div>
          <span class="fb-card-focus">${rt.focus}</span></div>
        <div class="fb-card-body">
          <div class="fb-card-name">${rt.name}</div>
          <div class="fb-card-desc">${rt.desc}</div>
          <div class="fb-card-meta">
            <span>${I("dumbbell", 13)} ${rt.steps.length} exercise${rt.steps.length === 1 ? "" : "s"}</span>
            <span>${I("clock", 13)} ${tmin}–${tmax} min</span>
            <span>${I("camera", 13)} ${rt.frame}</span></div>
        </div>
        <span class="fb-card-go">${I("chevron", 20)}</span></button>`;
    };
    return `<div class="fb">
      <div class="fb-head">
        <button class="fb-back" onclick="location.href='../home/home-v7.html'">${I("back", 22)}</button>
        <div><div class="fb-title">Full Body Workout</div><div class="fb-sub">Pick a routine. Total Body runs every move; the others keep one camera setup the whole way.</div></div>
      </div>
      <div class="fb-cards">${FB.ROUTINES.map(card).join("")}</div>
    </div>`;
  }
  function pick(id) { S.routineId = id; go("preview"); }

  /* ── PREVIEW (routine + difficulty) ────────────────────── */
  function preview() {
    const rt = FB.routine(S.routineId), lv = rt.levels[S.level];
    const seg = FB.LEVELS.map((l) => `<button class="fb-seg-b ${S.level === l.id ? "on" : ""}" onclick="FBWorkout.setLevel('${l.id}')">${l.n}</button>`).join("");
    const rows = rt.steps.map((k) => `<div class="fb-ex-row" style="--exc:${exColor(k)}">
      <span class="fb-ex-fig">${W(FB.EX[k].i, 34)}</span>
      <div class="fb-ex-tx"><div class="fb-ex-n">${FB.EX[k].n}</div><div class="fb-ex-sub">~${lv.sec[k]}s · ${FB.EX[k].frame}</div></div>
      <span class="fb-ex-reps">${lv.reps[k]}<small>reps</small></span></div>`).join("");
    const totalEx = FB.totalExercises(rt, S.level);
    return `<div class="fb">
      <div class="fb-head">
        <button class="fb-back" onclick="FBWorkout.go('landing')">${I("back", 22)}</button>
        <div><div class="fb-title">${rt.name}</div><div class="fb-sub">${rt.focus} · ${rt.frame}</div></div>
      </div>
      <div class="fb-prev-desc">${rt.desc}</div>
      <div class="fb-lbl">Difficulty</div>
      <div class="fb-seg">${seg}</div>
      <div class="fb-seg-d">${FB.LEVELS.find((l) => l.id === S.level).d}</div>
      <div class="fb-lbl">Your plan${lv.rounds > 1 ? ` · ${lv.rounds} rounds` : ""}</div>
      <div class="fb-list">${rows}</div>
      <div class="fb-totals">
        <div class="fb-total"><div class="fb-total-v">${totalEx}</div><div class="fb-total-l">exercises</div></div>
        <div class="fb-total"><div class="fb-total-v">${FB.totalReps(rt, S.level)}</div><div class="fb-total-l">total reps</div></div>
        <div class="fb-total"><div class="fb-total-v">~${FB.estMinutes(rt, S.level)}</div><div class="fb-total-l">minutes</div></div>
      </div>
      <button class="fb-start" onclick="FBWorkout.begin()">${I("zap", 18)} Start Workout</button>
      <div class="fb-priv">${I(rt.setup === "mixed" ? "camera" : "lock", 15)} ${rt.setup === "mixed"
        ? "Camera switches between side-on and front-on — we'll cue you during rest."
        : `One camera position for the whole session — ${rt.frame.toLowerCase()}.`}</div>
    </div>`;
  }
  function setLevel(id) { S.level = id; render(); }

  /* ── SESSION RUNTIME ───────────────────────────────────── */
  function begin() {
    const rt = FB.routine(S.routineId);
    S.seq = FB.buildSequence(rt, S.level);
    S.pos = 0; S.phase = "prep"; S.reps = 0; S.elapsed = 0; S.prep = 3;
    S.paused = false; S.overflow = false; S.ended = false;
    S.results = []; S.clock = 0;
    S.view = "session";
    runtime();
  }

  function cur() { return S.seq[S.pos]; }

  function runtime() {
    paintSession();
    startTick();
  }

  function startTick() {
    stopTick();
    tick = setInterval(() => {
      if (S.paused || S.overflow) return;
      S.clock += 1;
      if (S.phase === "prep") {
        S.prep -= 1;
        if (S.prep <= 0) { S.phase = "exercise"; S.reps = 0; S.elapsed = 0; }
      } else if (S.phase === "exercise") {
        const c = cur();
        S.elapsed += 1;
        const rate = Math.max(1, c.reps / (c.sec * 0.85));   // reach target ~85% through the window
        S.reps = Math.min(c.reps, Math.round(rate * S.elapsed));
        if (S.reps >= c.reps) { recordSet(c.reps); advance(); return; }
        if (S.elapsed >= c.sec) { S.overflow = true; }         // time up but target not met — never auto-complete
      } else if (S.phase === "rest") {
        S.elapsed -= 1;
        if (S.elapsed <= 0) { nextExercise(); return; }
      }
      paintSession(true);
    }, SPEED);
  }
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function recordSet(done) {
    const c = cur();
    S.results.push({ ex: c.ex, target: c.reps, done, sec: S.elapsed, targetSec: c.sec });
  }
  function advance() {
    // move past the current exercise to the following item (rest or next exercise or end)
    S.overflow = false;
    if (S.pos + 1 >= S.seq.length) { finish(false); return; }
    S.pos += 1;
    if (cur().type === "rest") { S.phase = "rest"; S.elapsed = cur().sec; }
    else { S.phase = "exercise"; S.reps = 0; S.elapsed = 0; }
    paintSession();
  }
  function nextExercise() {
    if (S.pos + 1 >= S.seq.length) { finish(false); return; }
    S.pos += 1; S.phase = "exercise"; S.reps = 0; S.elapsed = 0;
    paintSession();
  }

  // user controls
  function pause() { S.paused = !S.paused; paintSession(); }
  function skip() {   // skip current exercise with whatever reps are done so far
    if (S.phase !== "exercise") return;
    recordSet(S.reps); advance();
  }
  function keepGoing() { S.overflow = false; S.reps = Math.min(cur().reps, S.reps); paintSession(); startTick(); }
  function endNow() { recordSet(S.reps); finish(true); }
  function skipRest() { if (S.phase === "rest") nextExercise(); }
  function exit() {
    const done = S.results.length;
    if (!done) { location.href = "../home/home-v7.html"; return; }
    S.paused = true; paintSession();
    Buzzend.confirm({ icon: "alert", danger: true, title: "End this workout?", message: `You've done ${done} of ${cur().total} sets. Your progress so far won't be saved.`,
      confirmLabel: "End workout", cancelLabel: "Keep going",
      onConfirm: () => { recordSet(S.reps); finish(true); },
      onCancel: () => { S.paused = false; paintSession(); startTick(); } });
  }
  function finish(ended) { stopTick(); S.ended = ended; go("results"); }

  /* Circular countdown. frac = time left (1 → 0). When `animate` is set the arc starts
     one second earlier and eases to its new position over one tick, so it sweeps smoothly. */
  function ring(frac, prevFrac, color, inner, cls) {
    const size = 248, sw = 16, r = (size - sw) / 2, C = 2 * Math.PI * r;
    const off = (f) => (C * (1 - Math.max(0, Math.min(1, f)))).toFixed(2);
    return `<div class="fb-ring ${cls || ""}" style="--ring:${color}">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
        <circle class="fb-ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" />
        <circle class="fb-ring-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}"
          stroke-dasharray="${C.toFixed(2)}" style="stroke-dashoffset:${off(prevFrac)}" data-to="${off(frac)}" />
      </svg>
      <div class="fb-ring-in">${inner}</div></div>`;
  }

  /* Full-height, glanceable stage. The exercise's colour carries through the progress
     strip, the name tag and the countdown ring; rest uses its own calm colour. */
  function paintSession(animate) {
    const c = cur();
    const exItems = S.seq.filter((x) => x.type === "exercise");
    const totalEx = exItems.length;
    const curNo = Math.min(S.results.length + 1, totalEx);
    const prog = exItems.map((x, i) => {
      const st = i < S.results.length ? "done" : (i === S.results.length && S.phase !== "rest" ? "cur" : "");
      return `<span class="${st}" style="--exc:${exColor(x.ex)}"></span>`;
    }).join("");

    let content = "";
    if (S.phase === "prep") {
      content = `<div class="fb-cam-fig">${W(FB.EX[c.ex].i, 200)}</div>
        <div class="fb-cam-c" style="--exc:${exColor(c.ex)}">
        <div class="fb-cam-lbl">Get ready</div>
        <div class="fb-cam-huge fb-tint">${S.prep}</div>
        <div class="fb-cam-ex">${exName(c.ex)} · ${c.reps} reps</div>
        <div class="fb-cam-frame">${I("camera", 15)} ${FB.EX[c.ex].frame}</div></div>`;
    } else if (S.phase === "exercise") {
      const remain = Math.max(0, c.sec - S.elapsed);
      const prev = animate ? Math.min(c.sec, remain + 1) : remain;
      const inner = `<div class="fb-ring-wm">${W(FB.EX[c.ex].i, 150)}</div>
        <div class="fb-ring-time ${remain <= 5 ? "low" : ""}">${mmss(remain)}</div>
        <div class="fb-cam-unit">time left</div>`;
      content = `<div class="fb-ex-stage" style="--exc:${exColor(c.ex)}">
          <div class="fb-ex-tag"><i></i>${exName(c.ex)}</div>
          ${ring(remain / c.sec, prev / c.sec, exColor(c.ex), inner, remain <= 5 ? "low" : "")}
          <div class="fb-rep-block">
            <div class="fb-reps-huge">${S.reps}<small>/${c.reps}</small></div>
            <div class="fb-cam-unit">reps</div></div>
        </div>
        <div class="fb-ex-bottom">
          ${S.overflow
            ? `<div class="fb-over-bar"><div class="fb-over-t">Time's up — ${c.reps - S.reps} reps to go</div>
                <div class="fb-over-row"><button class="fb-btn-g" onclick="FBWorkout.skip()">Skip</button><button class="fb-btn-p" onclick="FBWorkout.keepGoing()">Keep going</button><button class="fb-btn-g" onclick="FBWorkout.endNow()">End</button></div></div>`
            : `<button class="fb-cc" onclick="FBWorkout.pause()" aria-label="${S.paused ? "Resume" : "Pause"}">${I(S.paused ? "play" : "pause", 24)}</button>
               <button class="fb-cc" onclick="FBWorkout.skip()" aria-label="Skip">${I("forward", 24)}</button>`}
          ${S.paused && !S.overflow ? `<div class="fb-paused-tag">Paused · tap ▶ to resume</div>` : ""}
        </div>`;
    } else if (S.phase === "rest") {
      const nx = S.seq[S.pos + 1];
      const prevEx = S.seq[S.pos - 1];
      const reframe = prevEx && FB.EX[prevEx.ex].frame !== FB.EX[c.nextEx].frame;
      const prev = animate ? Math.min(c.sec, S.elapsed + 1) : S.elapsed;
      const inner = `<div class="fb-cam-lbl">Rest</div>
        <div class="fb-ring-time fb-ring-rest">${S.elapsed}</div>
        <div class="fb-cam-unit">seconds</div>`;
      content = `<div class="fb-rest-stage">
        ${ring(S.elapsed / c.sec, prev / c.sec, FB.REST_COLOR, inner)}
        <div class="fb-next" style="--exc:${exColor(c.nextEx)}">
          <span class="fb-next-fig">${W(FB.EX[c.nextEx].i, 40)}</span>
          <div class="fb-next-tx"><div class="fb-next-l">Next up</div><div class="fb-next-n">${exName(c.nextEx)}</div></div>
          <span class="fb-next-reps">${nx.reps}<small>reps</small></span></div>
        ${reframe ? `<div class="fb-cam-frame fb-reframe">${I("camera", 15)} Move your phone: ${FB.EX[c.nextEx].frame}</div>` : ""}
        <button class="fb-btn-p fb-skiprest" onclick="FBWorkout.skipRest()">Skip rest ${I("forward", 15)}</button></div>`;
    }

    root.innerHTML = `<div class="fb fb-session">
      <div class="fb-ses-top">
        <button class="fb-ses-x" onclick="FBWorkout.exit()">${I("x", 18)}</button>
        <div class="fb-ses-count">${S.phase === "rest" ? "Rest" : "Exercise " + curNo + " of " + totalEx}</div>
        <button class="fb-ses-x" onclick="FBWorkout.pause()">${I(S.paused ? "play" : "pause", 16)}</button></div>
      <div class="fb-prog">${prog}</div>
      <div class="fb-cam">${content}</div>
    </div>`;
    window.Icons.init(root);

    const arc = root.querySelector(".fb-ring-arc");
    if (arc) {
      arc.style.transition = animate ? `stroke-dashoffset ${SPEED}ms linear` : "none";
      arc.getBoundingClientRect();               // commit the start offset before moving
      arc.style.strokeDashoffset = arc.dataset.to;
    }
  }

  /* ── RESULTS ───────────────────────────────────────────── */
  function results() {
    const rt = FB.routine(S.routineId);
    const planned = FB.totalExercises(rt, S.level);
    const sc = FB.score(S.results);
    const st = FB.status(S.results, planned, S.ended);
    const nStars = FB.stars(sc.total), bandTxt = FB.band(sc.total);
    const kcal = Math.round(S.results.reduce((a, r) => a + r.done * FB.EX[r.ex].kcal, 0));
    const estSec = FB.estSeconds(rt, S.level);
    const star = (on) => `<span class="fb-star ${on ? "on" : ""}">${I("star", 20)}</span>`;
    const rows = S.results.map((r) => {
      const full = r.done >= r.target;
      return `<div class="fb-rres" style="--exc:${exColor(r.ex)}">
        <span class="fb-rres-fig">${W(FB.EX[r.ex].i, 28)}</span>
        <div class="fb-rres-tx"><div class="fb-rres-n">${exName(r.ex)}</div><div class="fb-rres-sub">${mmss(r.sec)}${full ? "" : ` · ${r.target - r.done} short`}</div></div>
        <span class="fb-rres-c ${full ? "ok" : "miss"}">${r.done}/${r.target} ${full ? I("check", 14) : ""}</span></div>`;
    }).join("");
    const stClass = st.key;
    return `<div class="fb fb-results">
      <div class="fb-res-hero fb-res-${stClass}">
        <div class="fb-res-badge">${I(st.key === "completed" ? "check" : st.key === "partial" ? "flag" : "alert", 15)} ${st.label}</div>
        <div class="fb-res-score">${sc.total}</div><div class="fb-res-score-l">score</div>
        <div class="fb-stars">${[1, 2, 3, 4, 5].map((i) => star(i <= nStars)).join("")}</div>
        <div class="fb-res-band">${bandTxt}</div>
      </div>
      <div class="fb-res-sum">
        <div class="fb-sum"><div class="fb-sum-v">${sc.repsDone}<small>/${sc.repsTarget}</small></div><div class="fb-sum-l">reps</div></div>
        <div class="fb-sum"><div class="fb-sum-v">${sc.exFull}<small>/${S.results.length}</small></div><div class="fb-sum-l">done</div></div>
        <div class="fb-sum"><div class="fb-sum-v">${kcal}</div><div class="fb-sum-l">kcal</div></div>
        <div class="fb-sum"><div class="fb-sum-v">${mmss(S.clock)}<small>/${mmss(estSec)}</small></div><div class="fb-sum-l">time</div></div>
      </div>
      <div class="fb-score-explain">${Math.round(sc.repScore * 100)}% reps · ${Math.round(sc.exScore * 100)}% sets · ${Math.round(sc.paceScore * 100)}% pace</div>
      <div class="fb-lbl">Each exercise</div>
      <div class="fb-list fb-res-rows">${rows || `<div class="fb-ex-sub" style="padding:8px">No sets recorded.</div>`}</div>
      <div class="fb-cheer">${FB.cheer(st.key)}</div>
      <div class="fb-res-actions">
        <button class="fb-btn-g" onclick="FBWorkout.go('landing')">${I("home", 16)} Routines</button>
        <button class="fb-start" onclick="FBWorkout.begin()">${I("activity", 16)} Retry</button>
      </div>
      <button class="fb-res-home" onclick="location.href='../home/home-v7.html'">Back to Home</button>
    </div>`;
  }

  return { start, go, pick, setLevel, begin, pause, skip, keepGoing, endNow, skipRest, exit };
})();
