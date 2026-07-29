/* Buzzend AI Workout — complete flow, all screens + edge cases.
   select → [permission] → get-ready(position+countdown) → camera(record+count)
        → summary → [review → uploading → posted].
   Edge: permission denied · no body in frame · low light · tracking lost · pause ·
         quit-confirm · 0-rep finish · manual correct · upload fail+retry.
   Camera/reps simulated (skeleton + auto count). Deep-link any screen via ?step=. */
window.AIFlow = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const EX = { squat:{n:"Squats",i:"squat"}, pushup:{n:"Push-ups",i:"pushup"}, situp:{n:"Sit-ups",i:"situp"}, jumping:{n:"Jumping Jacks",i:"jumping"}, lunge:{n:"Lunges",i:"lunge"} };
  const ORDER = ["squat","pushup","situp","jumping","lunge"];

  /* ── GUIDE: per-exercise setup, derived from what the engine actually gates on ──
     Each entry mirrors a real gate in the pose engine, so the guide and the counter can never
     disagree. `no` = the anti-cheat rules — listing them up front is what turns a mysterious
     zero into an understood rule. `ready` = the advisory shown at get-ready when the framing
     can't support counting (it never blocks Start).                                        */
  const GUIDE = {
    squat: { view:"SIDE-ON", dist:"2–3 steps back · phone at knee height",
      ready:"Turn side-on — I can't judge depth from the front",
      rows:[["eye","Film from your side","Front-on works, but I read squat depth best from the side."],
            ["target","Head to ankles in frame","I measure depth from your knees and feet — I need to see them."],
            ["phone","Prop the phone at knee height","Lean it back a little so you stay in frame at the bottom."],
            ["activity","Stand up tall to start","Your standing height is the reference for every rep."]],
      no:["Seated leg raises — your hips have to actually drop","Lunges — keep your feet level with each other","Jump squats aren't supported yet"] },
    pushup: { view:"SIDE-ON", dist:"phone on the floor, 2 steps away, angled up",
      ready:"I need to see your hands on the floor",
      rows:[["eye","Film from your side","From your head end your elbows overlap and I can't read the angle."],
            ["target","Hands must be visible","Your wrists on the floor are how I know you're in a plank."],
            ["phone","Phone low and angled up","Flat on the floor works; propped at knee height is better."],
            ["activity","Full plank, legs straight","I judge depth by your elbow angle, not your chest."]],
      no:["Knee push-ups — this is deliberate, not a bug","Hands on your head or hips","Push-ups on a couch or step"] },
    situp: { view:"SIDE-ON", dist:"phone beside you at floor level",
      ready:"Lie flat on your back to start",
      rows:[["eye","Film from your side, or your feet","From above your head there is no curl for me to see at all."],
            ["target","Torso and knees in frame","Your feet can leave the frame — your knees can't."],
            ["phone","Raise the phone off the floor a little","Dead flat on the floor flattens your torso to nothing."],
            ["activity","Lie flat, knees bent","I count as you reach the top of the curl, not on the way down."]],
      no:["Standing crunches","V-ups and leg raises — keep your knees bent","Filming from above your head"] },
    jumping: { view:"FRONT-ON", dist:"3 steps back · room above your head",
      ready:"Face the camera — I can't see your feet spread",
      rows:[["eye","Face the camera","Side-on hides your feet spreading, and I need both arms and legs."],
            ["target","Feet and raised hands in frame","Both matter — the weaker of the two limits every rep."],
            ["phone","Prop the phone up, don't hold it","Hand-held rocking is tolerated, but propped is cleaner."],
            ["activity","Start with your feet together","I learn your feet-together position, then measure the spread."]],
      no:["Arm swings over a static wide stance","Legs without arms","Arms without legs"] },
    lunge: { view:"SIDE-ON", dist:"2–3 steps back · stay on one spot",
      ready:"Step one foot forward so I can see the stagger",
      rows:[["eye","Side-on or facing me","Both work — side-on reads your depth best."],
            ["target","Both feet in frame","The gap between your feet is how I tell a lunge from a squat."],
            ["phone","Prop the phone at knee height","Stay on one spot — walking lunges leave the frame."],
            ["activity","Each leg counts as its own rep","10 on each side counts as 20, not 10."]],
      no:["Standing knee raises and kicks — your body has to lower","Squats — one foot has to be forward","Curtsy lunges aren't supported yet"] },
  };
  const STAND = { head:[110,52],neck:[110,82], sL:[86,98],sR:[134,98], eL:[76,140],eR:[144,140], wL:[80,182],wR:[140,182], hL:[96,186],hR:[124,186], kL:[95,250],kR:[125,250], aL:[94,322],aR:[126,322] };
  const SQUAT = { head:[110,108],neck:[110,136], sL:[86,150],sR:[134,150], eL:[82,156],eR:[138,156], wL:[96,154],wR:[124,154], hL:[99,242],hR:[121,242], kL:[80,258],kR:[140,258], aL:[86,322],aR:[134,322] };
  const EDGES = [["neck","sL"],["neck","sR"],["sL","sR"],["sL","eL"],["eL","wL"],["sR","eR"],["eR","wR"],["sL","hL"],["sR","hR"],["hL","hR"],["hL","kL"],["kL","aL"],["hR","kR"],["kR","aR"],["neck","head"]];

  /* Advisory form fault + rejected-rep reason per exercise. Both come from signals the engine
     already computes and currently discards: the analyzer's own per-frame note, and the weakest
     of the validator's five per-rep scores. `joints` = what to highlight on the skeleton. */
  const FAULT = {
    squat:   { note:"Knees uneven",            joints:["kL","kR"], reject:"go deeper" },
    pushup:  { note:"Hips sagging",            joints:["hL","hR"], reject:"lower your chest further" },
    situp:   { note:"Come up further",         joints:[],          reject:"come up further" },
    jumping: { note:"Arms all the way up",     joints:["wL","wR"], reject:"jump your feet wider" },
    lunge:   { note:"Chest up",                joints:["sL","sR"], reject:"drop your back knee lower" },
  };

  let root, S;
  const say = (t) => { try { if (!window.speechSynthesis) return; const u = new SpeechSynthesisUtterance("" + t); u.rate = 1.15; u.volume = .7; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} };
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(15); } catch (e) {} };
  const mmss = (s) => Math.floor(s / 60) + ":" + ("" + (s % 60)).padStart(2, "0");
  // derived stats (no backend change): calories ≈ reps × 0.55 (same factor as top-activities);
  // form score reuses the report's own component math so celebration and report never disagree.
  const kcalOf = (reps) => Math.max(1, Math.round(reps * 0.55));
  const formScore = (reps) => Math.max(40, 100 - 2 * 7 - ((reps > 3 ? 1 : 0) + (reps > 10 ? 1 : 0)) * 4);
  const home = () => location.href = "index.html";
  function clear() { (S.timers || []).forEach((t) => clearInterval(t)); if (S.raf) cancelAnimationFrame(S.raf); S.timers = []; S.raf = null; try { speechSynthesis.cancel(); } catch (e) {} }
  function go(step) { clear(); S.step = step; render(); }

  function skeletonSVG(extraTop) {
    const ln = (a, b, cls, w) => `<line class="${cls}" data-e="${a},${b}" stroke-width="${w}" stroke-linecap="round" x1="${STAND[a][0]}" y1="${STAND[a][1]}" x2="${STAND[b][0]}" y2="${STAND[b][1]}"/>`;
    return `<svg viewBox="0 0 220 360" fill="none">${EDGES.map((x) => ln(x[0], x[1], "cm-body-bone", 18)).join("")}<circle class="cm-body-bone" data-j="head" cx="110" cy="52" r="20"/>${EDGES.map((x) => ln(x[0], x[1], "cm-bone", 3)).join("")}${Object.keys(STAND).map((k) => `<circle class="cm-joint" data-j="${k}" cx="${STAND[k][0]}" cy="${STAND[k][1]}" r="4"/>`).join("")}</svg>`;
  }
  function poser(fig) {
    const lines = fig.querySelectorAll("[data-e]"), circles = fig.querySelectorAll("[data-j]");
    return (t) => { const c = {}; Object.keys(STAND).forEach((j) => c[j] = [STAND[j][0] + (SQUAT[j][0] - STAND[j][0]) * t, STAND[j][1] + (SQUAT[j][1] - STAND[j][1]) * t]);
      circles.forEach((n) => { const j = n.dataset.j; if (c[j]) { n.setAttribute("cx", c[j][0].toFixed(1)); n.setAttribute("cy", c[j][1].toFixed(1)); } });
      lines.forEach((l) => { const p = l.dataset.e.split(","), a = c[p[0]], b = c[p[1]]; if (a && b) { l.setAttribute("x1", a[0].toFixed(1)); l.setAttribute("y1", a[1].toFixed(1)); l.setAttribute("x2", b[0].toFixed(1)); l.setAttribute("y2", b[1].toFixed(1)); } }); };
  }

  /* Camera-placement diagram for the guide card: a little overhead scene — phone, sight lines,
     body. SIDE-ON squashes the body horizontally so it reads as a profile; FRONT-ON shows it
     square with the phone below. No artwork needed: it reuses the same skeleton the whole flow
     draws, so the guide can never drift from the app's own visual language. */
  function sceneSVG(view) {
    const side = view === "SIDE-ON";
    const bones = EDGES.map((e) => `<line x1="${STAND[e[0]][0]}" y1="${STAND[e[0]][1]}" x2="${STAND[e[1]][0]}" y2="${STAND[e[1]][1]}" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>`).join("");
    const body = `<g transform="${side ? "translate(196,26) scale(.34,.44)" : "translate(112,26) scale(.5,.44)"}" color="var(--primary)">
        ${bones}<circle cx="110" cy="52" r="17" fill="currentColor"/></g>`;
    // phone: to the LEFT for side-on (looking across at a profile), BELOW-CENTRE for front-on
    const phone = side
      ? `<g transform="translate(26,74)"><rect width="26" height="46" rx="6" fill="#0e181d" stroke="rgba(255,255,255,.34)"/><circle cx="13" cy="10" r="3" fill="var(--primary)"/></g>`
      : `<g transform="translate(112,150)"><rect x="-13" y="0" width="26" height="46" rx="6" fill="#0e181d" stroke="rgba(255,255,255,.34)"/><circle cx="0" cy="10" r="3" fill="var(--primary)"/></g>`;
    const sight = side
      ? `<path d="M55 84 L196 34 M55 112 L196 176" stroke="rgba(255,255,255,.2)" stroke-width="1.4" stroke-dasharray="4 4"/>`
      : `<path d="M104 150 L58 40 M120 150 L166 40" stroke="rgba(255,255,255,.2)" stroke-width="1.4" stroke-dasharray="4 4"/>`;
    return `<svg viewBox="0 0 250 200" fill="none">
      <line x1="0" y1="182" x2="250" y2="182" stroke="rgba(255,255,255,.12)" stroke-width="2"/>
      ${sight}${phone}${body}</svg>`;
  }

  // ───────── screens ─────────
  function render() {
    ({ select: rSelect, permission: rPermission, denied: rDenied, guide: rGuide, getready: rGetReady, camera: rCamera,
       congrats: () => rCongrats(S.cvar || "A"), summary: rSummary, report: rReport, review: rReview,
       uploading: rUploading, uploadfail: rUploadFail, posted: rPosted }[S.step] || rSelect)();
    window.Icons.init(root);
  }

  /* Guide card — PREVENT, the half of the system the live engine structurally can't do.
     Four of five exercises have a camera position that yields zero counts with no error at all;
     a mid-set cue can only catch that after the set is already spoiled. Shown once per exercise
     (then via the ⓘ on get-ready). */
  function rGuide() {
    const e = EX[S.exKey], g = GUIDE[S.exKey];
    root.innerHTML = `<div class="fl gd-scr">
      <div class="fl-head"><button class="cm-x glass" id="back">${I("chevron", 20)}</button>
        <div class="fl-title" style="font-size:21px">Set up for ${e.n.toLowerCase()}</div></div>
      <div class="gd-diagram">${sceneSVG(g.view)}
        <span class="gd-vlabel">${g.view}</span><span class="gd-dist">${g.dist}</span></div>
      <div class="gd-rows">${g.rows.map((r) => `<div class="gd-row"><span class="ic">${I(r[0], 17)}</span><div><b>${r[1]}</b><span>${r[2]}</span></div></div>`).join("")}</div>
      <div class="gd-no"><div class="t">${I("alert", 14)} Won't count</div>
        <ul>${g.no.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      <button class="gd-chk${S.guideSkip ? " on" : ""}" id="chk"><i>${S.guideSkip ? "✓" : ""}</i>Don't show this again for ${e.n.toLowerCase()}</button>
      <div class="gd-foot"><button class="fl-btn-primary" id="got">${I("check", 18)} Got it</button></div></div>`;
    root.querySelector("#back").addEventListener("click", () => go(S.guideSeen ? "getready" : "select"));
    root.querySelector("#chk").addEventListener("click", function () {
      S.guideSkip = !S.guideSkip; this.classList.toggle("on", S.guideSkip);
      this.querySelector("i").textContent = S.guideSkip ? "✓" : ""; buzz();
    });
    root.querySelector("#got").addEventListener("click", () => { S.guideSeen = true; go("getready"); });
  }

  function rSelect() {
    S.reps = 0; S.secs = 0;
    root.innerHTML = `<div class="fl">
      <div class="fl-head"><button class="cm-x glass" onclick="location.href='index.html'">${I("x", 20)}</button><div class="fl-title">Choose a workout</div></div>
      <div class="fl-sub">Pick an exercise — the camera will count your reps automatically.</div>
      <div class="fl-list">${ORDER.map((k) => `<button class="fl-ex glass" data-ex="${k}"><span class="fl-ex-ic">${I(EX[k].i, 26)}</span><span class="fl-ex-n">${EX[k].n}</span><span class="fl-ex-go">${I("chevron", 20)}</span></button>`).join("")}</div></div>`;
    // First time on an exercise the guide comes first — it prevents the silent-zero setups that no
    // in-set cue can undo. Once seen (or dismissed) it's skipped and reachable from get-ready's ⓘ.
    const afterPick = () => (S.guideSeen || S.guideSkip ? "getready" : "guide");
    root.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { S.exKey = b.dataset.ex; go(S.granted ? afterPick() : "permission"); }));
  }

  function rPermission() {
    root.innerHTML = `<div class="fl fl-center">
      <div class="fl-ic">${I("camera", 40)}</div>
      <div class="fl-c-t">Let Buzzend see you</div>
      <div class="fl-c-d">The camera counts your reps <b>on-device</b>. Nothing is recorded or shared unless you choose to post.</div>
      <div class="fl-f-foot"><button class="fl-btn-primary" id="enable">${I("camera", 18)} Enable camera</button>
        <button class="fl-btn-ghost" id="deny">Not now</button></div></div>`;
    root.querySelector("#enable").addEventListener("click", () => { S.granted = true; go(S.guideSeen || S.guideSkip ? "getready" : "guide"); });
    root.querySelector("#deny").addEventListener("click", () => go("denied"));
  }
  function rDenied() {
    root.innerHTML = `<div class="fl fl-center">
      <div class="fl-ic bad">${I("camera", 40)}</div>
      <div class="fl-c-t">Camera is off</div>
      <div class="fl-c-d">Buzzend needs the camera to count reps. Turn it on in your phone's Settings, then try again.</div>
      <div class="fl-f-foot"><button class="fl-btn-primary" id="retry">Try again</button>
        <button class="fl-btn-ghost" onclick="location.href='index.html'">Back</button></div></div>`;
    root.querySelector("#retry").addEventListener("click", () => go("permission"));
  }

  // get-ready: frame your shot (front/back flip) → positioning → tap start → countdown
  function rGetReady() {
    const e = EX[S.exKey];
    root.innerHTML = `<div class="cm partial" id="cm">
      <span class="cm-spot"></span>
      <div class="cm-frame"><i></i><i></i><i></i><i></i></div>
      <div class="cm-top"><button class="cm-x glass" id="back">${I("x", 20)}</button>
        <span class="cm-status glass"><span class="dot"></span>SET UP YOUR SHOT</span>
        <button class="cm-info glass" id="info" title="Setup guide">${I("info", 19)}</button>
        <button class="cm-info glass" id="flip" title="Flip camera">${I("flip-camera", 18)}</button></div>
      <div class="cm-fig ${S.facing === "front" ? "mirror" : ""}" id="fig">${skeletonSVG()}</div>
      <div class="cm-cuewrap">
        <div class="cm-facing inflow" id="facelbl">${S.facing === "front" ? "Front camera" : "Back camera"} · tap to flip</div>
        <div class="cm-cue glass" id="cue">Stand back so your whole body fits</div>
        <button class="cm-why" id="why" style="display:none">Why?</button></div>
      <div class="cm-controls"><button class="cm-finish" id="start">${I("check", 18)} Start ${e.n.toLowerCase()}</button></div>
      <div class="cm-cd-wrap" id="cd" style="display:none"><div class="cm-cd" id="cdn">3</div><div class="cm-cd-l">Get ready</div></div></div>`;
    const cm = root.querySelector("#cm"), fig = root.querySelector("#fig"), cue = root.querySelector("#cue");
    const setPose = poser(fig); let t0 = performance.now();
    S.raf = requestAnimationFrame(function loop(now) { if (!fig.isConnected) return; setPose((1 - Math.cos(((now - t0) % 1700) / 1700 * 2 * Math.PI)) / 2); S.raf = requestAnimationFrame(loop); });
    root.querySelector("#back").addEventListener("click", () => go("select"));
    // front/back camera switch (before starting)
    const facelbl = root.querySelector("#facelbl");
    root.querySelector("#flip").addEventListener("click", () => {
      S.facing = S.facing === "front" ? "back" : "front";
      facelbl.textContent = (S.facing === "front" ? "Front camera" : "Back camera") + " · tap to flip";
      fig.classList.toggle("mirror", S.facing === "front");
      fig.classList.remove("flip-anim"); void fig.offsetWidth; fig.classList.add("flip-anim"); buzz();
    });
    root.querySelector("#info").addEventListener("click", () => { S.guideSeen = true; go("guide"); });
    // Readiness advisory. The old flow went straight to "Perfect — hold still" as soon as a body was
    // visible — a promise the engine doesn't keep, because each exercise ALSO needs the right camera
    // angle before it can count. Now the not-ready state names the actual reason and offers the
    // guide. It never blocks Start: a mistuned gate must not be able to trap anyone.
    const why = root.querySelector("#why"), start = root.querySelector("#start");
    why.addEventListener("click", () => { S.guideSeen = true; go("guide"); });
    S.timers.push(setTimeout(() => {
      cue.textContent = GUIDE[S.exKey].ready; cue.classList.add("form"); why.style.display = "";
      start.innerHTML = `${I("check", 18)} Start anyway`; window.Icons.init(root); say(GUIDE[S.exKey].ready);
    }, 1500));
    S.timers.push(setTimeout(() => {
      cm.classList.remove("partial"); cm.classList.add("locked");
      cue.textContent = "Perfect — hold still"; cue.classList.remove("form"); why.style.display = "none";
      start.innerHTML = `${I("check", 18)} Start ${e.n.toLowerCase()}`; window.Icons.init(root);
    }, 4200));
    // tap start → 3·2·1 countdown → camera
    root.querySelector("#start").addEventListener("click", () => {
      const cd = root.querySelector("#cd"), cdn = root.querySelector("#cdn"); cd.style.display = "grid"; let n = 3; cdn.textContent = n; say(n);
      const iv = setInterval(() => { n--; if (n <= 0) { cdn.textContent = "GO"; cdn.classList.add("go"); say("go"); clearInterval(iv); S.timers.push(setTimeout(() => go("camera"), 550)); } else { cdn.textContent = n; say(n); } }, 800);
      S.timers.push(iv);
    });
  }

  // camera: record + count, with live states + quit-confirm
  function rCamera(forceState) {
    const e = EX[S.exKey]; S.reps = 0; S.secs = 0;
    root.innerHTML = `<div class="cm locked" id="cm">
      <span class="cm-spot"></span>
      <div class="cm-frame"><i></i><i></i><i></i><i></i></div>
      <div class="cm-top"><button class="cm-x glass" id="quit">${I("x", 20)}</button>
        <span class="cm-status glass"><span class="dot"></span><span id="stat">${e.n.toUpperCase()}</span></span>
        <span class="cm-rectime glass"><span class="rd"></span><span id="rec">0:00</span></span></div>
      <div class="cm-hud"><div class="cm-eyebrow">${I(e.i, 14)} ${e.n}</div><div class="cm-count" id="count" title="Tap to correct">0</div>
        <div class="cm-hint" id="hint">tap the number to fix a miss</div>
        <div class="cm-nc">${I("alert", 12)} not counting</div></div>
      <div class="cm-fig ${S.facing === "front" ? "mirror" : ""}" id="fig">${skeletonSVG()}</div>
      <div class="cm-cuewrap">
        <div class="cm-cue glass" id="cue" style="display:none">${e.n} · counting</div>
        <div class="cm-cue glass form" id="fcue" style="display:none"></div></div>
      <div class="cm-controls"><button class="cm-pause glass" id="pause">${I("clock", 18)} Pause</button>
        <button class="cm-finish" id="finish">${I("check", 18)} Finish</button></div>
      <div class="cm-flash" id="flash"></div>
      <div class="cm-toast" id="toast"></div></div>`;
    const cm = root.querySelector("#cm"), fig = root.querySelector("#fig"), countEl = root.querySelector("#count"),
      stat = root.querySelector("#stat"), cue = root.querySelector("#cue"), hint = root.querySelector("#hint"),
      toast = root.querySelector("#toast"), rec = root.querySelector("#rec");
    const fcue = root.querySelector("#fcue"), flash = root.querySelector("#flash");
    const setPose = poser(fig); let locked = true, glitched = false, paused = false, lastCyc = 0, t0 = performance.now();
    // BLOCKING cue (framing / wrong position): shown in the cue line, count dims, "not counting" chip
    // lights. Advisory FORM notes are suppressed while blocking — one message at a time, by tier.
    function status(state, txt, label) {
      cm.className = "cm " + state; stat.textContent = txt;
      const blocking = state !== "locked";
      if (label != null) cue.textContent = label;
      cue.style.display = blocking ? "" : "none";          // "X · counting" is redundant with the HUD
      if (blocking) { fcue.style.display = "none"; markJoints([]); }
    }
    // Highlight the offending joints — the skeleton names the fault, not just the text.
    function markJoints(js) {
      fig.querySelectorAll("[data-j]").forEach((n) => n.classList.toggle("warn", js.includes(n.dataset.j)));
      fig.querySelectorAll("[data-e]").forEach((l) => {
        const p = l.dataset.e.split(",");
        l.classList.toggle("warn", l.classList.contains("cm-bone") && js.includes(p[0]) && js.includes(p[1]));
      });
    }
    // ADVISORY form note — counting continues. Auto-expires, and each note has its own cooldown so
    // the same nag can't fire on every rep.
    // `sticky` = a ?step= review state: hold the cue on screen instead of letting it expire, so the
    // tier can actually be looked at. Live behaviour always expires.
    function formNote(text, joints, sticky) {
      if (!locked) return;
      fcue.textContent = text; fcue.style.display = ""; fcue.classList.remove("good"); markJoints(joints || []); say(text);
      if (sticky) return;
      S.timers.push(setTimeout(() => { if (fcue.isConnected) { fcue.style.display = "none"; markJoints([]); } }, 2600));
    }
    function praise(text, sticky) {
      fcue.textContent = text; fcue.style.display = ""; fcue.classList.add("good"); markJoints([]);
      if (sticky) return;
      S.timers.push(setTimeout(() => { if (fcue.isConnected) fcue.style.display = "none"; }, 2200));
    }
    // Per-rep verdict — the answer to "why didn't that one count?", which today is pure silence.
    function showFlash(kind, text, sticky) {
      flash.className = "cm-flash " + kind + " show";
      flash.innerHTML = (kind === "no" ? I("x", 16) : I("check", 16)) + " " + text;
      window.Icons.init(flash);
      if (sticky) return;
      S.timers.push(setTimeout(() => { if (flash.isConnected) flash.classList.remove("show"); }, 1400));
    }
    function paint() { countEl.textContent = S.reps; countEl.classList.remove("pop"); void countEl.offsetWidth; countEl.classList.add("pop"); say(S.reps); buzz(); if (S.reps === 3) hint.classList.add("show"); if (S.reps === 6) hint.classList.remove("show"); }
    function glitch() { locked = false; status("partial", "MOVE BACK", "Step back — fit your whole body in frame"); say("step back"); S.timers.push(setTimeout(() => { if (fig.isConnected) { locked = true; status("locked", e.n.toUpperCase(), e.n + " · counting"); } }, 2100)); }
    // Scripted beats so every tier is reviewable in one pass: warning rep → blocking cue → rejected
    // rep → positive streak.
    const F = FAULT[S.exKey];
    function beat() {
      if (S.reps === 4) { showFlash("warn", "counted · " + F.note); formNote(F.note, F.joints); }
      else if (S.reps === 6 && !glitched) { glitched = true; glitch(); }
      else if (S.reps === 9) { showFlash("no", "didn't count · " + F.reject); say("that one didn't count, " + F.reject); }
      else if (S.reps === 13) praise("5 clean in a row");
    }
    S.raf = requestAnimationFrame(function loop(now) { if (!fig.isConnected) return;
      if (!paused) { const el = now - t0, ph = (el % 1700) / 1700; setPose((1 - Math.cos(ph * 2 * Math.PI)) / 2);
        const cyc = Math.floor(el / 1700); if (cyc !== lastCyc) { lastCyc = cyc; if (locked) { S.reps++; paint(); beat(); } } }
      S.raf = requestAnimationFrame(loop); });
    S.timers.push(setInterval(() => { if (!paused) { S.secs++; rec.textContent = mmss(S.secs); } }, 1000));
    // forced edge states for review
    if (forceState === "lost") { locked = false; status("lost", "MORE LIGHT", "Too dark — find better light"); }
    if (forceState === "noframe") { locked = false; status("partial", "STEP INTO FRAME", "I can't see you — step into view"); }
    if (forceState === "setup") { locked = false; status("partial", "GET IN POSITION", GUIDE[S.exKey].ready); }
    if (forceState === "form") { S.timers.push(setTimeout(() => formNote(F.note, F.joints, true), 60)); }
    if (forceState === "reject") { S.timers.push(setTimeout(() => showFlash("no", "didn't count · " + F.reject, true), 60)); }
    if (forceState === "praise") { S.timers.push(setTimeout(() => praise("5 clean in a row", true), 60)); }
    countEl.addEventListener("click", () => { if (S.reps <= 0) return; S.reps--; countEl.textContent = S.reps; toast.textContent = "−1 · corrected"; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1100); });
    root.querySelector("#pause").addEventListener("click", function () { paused = !paused; this.classList.toggle("on", paused); this.innerHTML = paused ? `${I("play", 18)} Resume` : `${I("clock", 18)} Pause`; });
    // Finish now lands on the form report (which explains the set, then hands off to the composer in
    // one tap) instead of jumping straight to the composer.
    root.querySelector("#finish").addEventListener("click", () => go(S.reps > 0 ? "congrats" : "report"));
    root.querySelector("#quit").addEventListener("click", () => { paused = true; quitOverlay(cm, () => { paused = false; }); });
  }
  function quitOverlay(cm, onKeep) {
    const o = document.createElement("div"); o.className = "fl-quit";
    o.innerHTML = `<div class="fl-quit-card"><div class="t">End this set?</div><div class="d">Your ${S.reps} reps won't be saved.</div>
      <div class="row"><button class="fl-btn-primary" id="q-keep">Keep going</button><button class="fl-btn-ghost" id="q-end" style="color:#ff6a62;border-color:rgba(255,106,98,.4)">Discard &amp; exit</button></div></div>`;
    cm.appendChild(o);
    o.querySelector("#q-keep").addEventListener("click", () => { o.remove(); onKeep && onKeep(); });
    o.querySelector("#q-end").addEventListener("click", () => go("select"));
  }

  function rSummary() { go("report"); }

  /* Congratulations — the celebratory moment right after a finished set (reps > 0).
     4 design variations, switchable via ?step=congrats:A|B|C|D. Actions: Share (→ composer),
     See details (→ the form report), Done (→ home). All values are already known to the flow:
     reps, duration, derived calories + form score. */
  function rCongrats(variant) {
    const e = EX[S.exKey], reps = S.reps, t = mmss(S.secs), kcal = kcalOf(reps), score = formScore(reps), streak = 47;
    const V = variant || "A";
    const conf = `<div class="cg-confetti">${Array.from({ length: 16 }, (_, i) =>
      `<span class="c${i % 5}" style="left:${(i * 6.3 + 3) % 96}%;animation-delay:${((i * 7) % 30) / 10}s"></span>`).join("")}</div>`;
    const pill = (ic, val, lbl) => `<div class="cg-pill"><span class="i">${I(ic, 17)}</span><b>${val}</b><span class="l">${lbl}</span></div>`;
    const stat = (ic, val, lbl) => `<div class="cg-st"><span class="i">${I(ic, 18)}</span><div><b>${val}</b><span>${lbl}</span></div></div>`;

    let inner;
    if (V === "B") {                                   // clean analytics card
      inner = `<div class="cg-card">
        <div class="cg-tick soft">${I("trophy", 30)}</div>
        <div class="cg-elabel">${I(e.i, 14)} ${e.n}</div>
        <h1 class="cg-title">Set complete!</h1>
        <p class="cg-sub">Every rep counted by the camera — clean and controlled.</p>
        <div class="cg-grid">${stat("zap", reps, "reps")}${stat("clock", t, "time")}${stat("flame", kcal, "kcal")}${stat("target", score, "form score")}</div>
      </div>`;
    } else if (V === "C") {                             // immersive gradient
      inner = `<div class="cg-immhead">
        <div class="cg-tick glass">${I("check", 34)}</div>
        <div class="cg-elabel light">${I(e.i, 14)} ${e.n}</div>
        <h1 class="cg-title">Nice one!</h1>
        <p class="cg-sub light">You crushed your ${e.n.toLowerCase()} set.</p>
        <div class="cg-hero light"><b>${reps}</b><span>reps</span></div>
        <div class="cg-chips">${pill("clock", t, "time")}${pill("flame", kcal, "kcal")}${pill("target", score, "form")}</div>
      </div>`;
    } else if (V === "D") {                             // streak + weekly progress
      const days = ["M", "T", "W", "T", "F", "S", "S"], vals = [45, 70, 30, 85, 0, 0, 0], today = 4;
      const bars = days.map((d, i) => `<div class="cg-bar${i === today ? " on" : ""}"><i style="height:${i === today ? 92 : vals[i]}%"></i><span>${d}</span></div>`).join("");
      inner = `<div class="cg-card">
        <div class="cg-streak"><span class="cg-flame">${I("flame", 26)}</span><div class="cg-sk-tx"><b>${streak}-day streak</b><span>You kept it alive today.</span></div><span class="plus">+1</span></div>
        <div class="cg-elabel row">${I(e.i, 14)} ${e.n} · ${reps} reps · ${t}</div>
        <div class="cg-week"><div class="wk-t">This week</div><div class="cg-bars">${bars}</div></div>
        <div class="cg-mini">${stat("zap", reps, "reps today")}${stat("target", score, "form score")}</div>
      </div>`;
    } else {                                            // A · burst medal
      inner = `<div class="cg-burstwrap">
        <div class="cg-burst"><svg viewBox="0 0 200 200" class="cg-rays">${Array.from({ length: 12 }, (_, i) => `<rect x="98" y="4" width="4" height="26" rx="2" transform="rotate(${i * 30} 100 100)"/>`).join("")}</svg>
          <div class="cg-medal">${I("trophy", 40)}</div></div>
        <div class="cg-elabel">${I(e.i, 14)} ${e.n}</div>
        <h1 class="cg-title">Great work!</h1>
        <p class="cg-sub">You finished your ${e.n.toLowerCase()} set.</p>
        <div class="cg-hero"><b>${reps}</b><span>reps</span></div>
        <div class="cg-stats3">${pill("clock", t, "time")}${pill("flame", kcal, "kcal")}${pill("target", score, "form")}</div>
      </div>`;
    }
    root.innerHTML = `<div class="cg v${V}">
      <button class="cg-x" id="x">${I("x", 20)}</button>${conf}
      <div class="cg-body">${inner}</div>
      <div class="cg-actions">
        <button class="cg-btn primary" id="share">${I("share", 18)} Share your set</button>
        <button class="cg-btn ghost" id="done">Done</button></div></div>`;
    root.querySelector("#share").addEventListener("click", () => { location.href = "../home/compose.html?from=workout&ex=" + S.exKey + "&reps=" + reps; });
    root.querySelector("#done").addEventListener("click", () => location.href = "../home/home-v7.html");
    root.querySelector("#x").addEventListener("click", () => location.href = "../home/home-v7.html");
  }

  /* Form report — EXPLAIN. Every number here is already computed per rep by the validator today
     (five component scores + outcome + variant) and thrown away. The zero-rep branch is the one
     the native app is missing entirely: it currently just closes, teaching the user nothing.

     Deliberately NOT the old "You crushed it!" screen that was cut at QA: this one carries
     information, and Continue is a single tap to the composer so it never delays posting. */
  function rReport() {
    const e = EX[S.exKey], F = FAULT[S.exKey];
    if (S.reps <= 0) {
      root.innerHTML = `<div class="fl fl-center">
        <div class="fl-ic warn">${I("alert", 38)}</div><div class="fl-c-t">No reps counted</div>
        <div class="fl-c-d"><b>${GUIDE[S.exKey].ready}</b> — that's what blocked most of this set, so nothing could be counted.</div>
        <div class="fl-f-foot"><button class="fl-btn-primary" id="guide">${I("info", 18)} Show me the setup</button>
          <button class="fl-btn-ghost" id="retry">Try again</button></div></div>`;
      root.querySelector("#guide").addEventListener("click", () => { S.guideSeen = true; go("guide"); });
      root.querySelector("#retry").addEventListener("click", () => go("getready")); return;
    }
    // Simulated per-rep outcomes. Counted (clean + warned) must total exactly the displayed rep
    // count; the "didn't count" marks are attempts ON TOP of it — that's the whole point of the
    // strip, showing effort the counter rejected.
    const marks = []; for (let i = 0; i < S.reps; i++) marks.push(i === 3 || i === 10 ? "warn" : "ok");
    marks.splice(8, 0, "no"); marks.splice(14, 0, "no");
    const missed = marks.filter((m) => m === "no").length, warned = marks.filter((m) => m === "warn").length;
    const score = Math.max(40, 100 - missed * 7 - warned * 4);
    root.innerHTML = `<div class="fl rp-scr">
      <div class="fl-head"><button class="cm-x glass" id="back">${I("chevron", 20)}</button>
        <div class="fl-title" style="font-size:21px">Your set</div></div>
      <div class="rp-top">
        <div class="rp-reps"><b>${S.reps}</b><span>${e.n} · ${mmss(S.secs)}</span></div>
        <div class="rp-ring" style="--v:${score}"><i>${score}</i><em>form</em></div></div>
      <div class="rp-strip"><div class="t">Rep by rep</div>
        <div class="rp-bars">${marks.map((m, i) => `<i class="${m === "ok" ? "" : m}" style="height:${m === "no" ? 40 : m === "warn" ? 68 : 78 + (i % 3) * 7}%"></i>`).join("")}</div>
        <div class="rp-legend"><span><b></b>Counted</span><span><b class="warn"></b>Counted, form off</span><span><b class="no"></b>Didn't count</span></div></div>
      <div class="rp-card"><span class="ic">${I("info", 17)}</span><div><b>${missed} didn't count</b>
        <span>All ${missed} came up short on depth — ${F.reject}. Everything else looked clean.</span></div></div>
      <div class="rp-card tip"><span class="ic">${I("target", 17)}</span><div><b>Work on: ${F.note.toLowerCase()}</b>
        <span>Your weakest axis this set. ${warned} reps counted with that warning — fixing it is the fastest way to lift your form score.</span></div></div>
      <div class="rp-foot"><button class="fl-btn-primary" id="next">${I("check", 18)} Continue</button>
        <button class="fl-btn-ghost" id="again">Do another set</button></div></div>`;
    root.querySelector("#back").addEventListener("click", () => go("select"));
    root.querySelector("#again").addEventListener("click", () => go("getready"));
    root.querySelector("#next").addEventListener("click", () => { location.href = "../home/compose.html?from=workout&ex=" + S.exKey + "&reps=" + S.reps; });
  }

  function rReview() {
    const e = EX[S.exKey];
    root.innerHTML = `<div class="fl fl-scr">
      <div class="fl-head"><button class="cm-x glass" id="back">${I("chevron", 20)}</button><div class="fl-title" style="font-size:20px">Share your set</div></div>
      <div class="fl-clip"><span class="fl-clip-badge">${I(e.i, 14)} ${S.reps}</span><div class="cm-fig">${skeletonSVG()}</div></div>
      <div class="fl-cap" contenteditable="true" id="cap">Just counted ${S.reps} ${e.n.toLowerCase()} with Buzzend 💪</div>
      <div class="fl-f-foot"><button class="fl-btn-primary" id="post">${I("share", 18)} Post to feed</button>
        <button class="fl-btn-ghost" id="discard" style="color:#ff6a62;border-color:rgba(255,106,98,.4)">Discard</button></div></div>`;
    const fig = root.querySelector(".cm-fig"); const setPose = poser(fig); setPose(0.55);
    root.querySelector("#back").addEventListener("click", () => go("summary"));
    root.querySelector("#discard").addEventListener("click", () => go("select"));
    root.querySelector("#post").addEventListener("click", () => go("uploading"));
  }

  function rUploading(fail) {
    const e = EX[S.exKey];
    root.innerHTML = `<div class="fl fl-scr fl-center">
      <div class="fl-clip" style="opacity:.55"><span class="fl-clip-badge">${I(e.i, 14)} ${S.reps}</span><div class="cm-fig">${skeletonSVG()}</div></div>
      <div class="fl-prog"><i id="bar"></i></div><div class="fl-prog-l" id="pl">Uploading your set… 0%</div></div>`;
    const fig = root.querySelector(".cm-fig"); poser(fig)(0.55);
    const bar = root.querySelector("#bar"), pl = root.querySelector("#pl"); let p = 0;
    const iv = setInterval(() => { p += 12 + Math.round(8 * (p < 60 ? 1 : 0.4)); if (p > 100) p = 100; bar.style.width = p + "%"; pl.textContent = "Uploading your set… " + p + "%";
      if (p >= 100) { clearInterval(iv); setTimeout(() => go(fail ? "uploadfail" : "posted"), 400); } }, 320);
    S.timers.push(iv);
  }
  function rUploadFail() {
    root.innerHTML = `<div class="fl fl-center">
      <div class="fl-ic bad">${I("alert", 38)}</div><div class="fl-c-t">Couldn't post</div>
      <div class="fl-c-d">Your set is saved on your device. Check your connection and try again.</div>
      <div class="fl-f-foot"><button class="fl-btn-primary" id="retry">Retry</button><button class="fl-btn-ghost" onclick="location.href='index.html'">Save for later</button></div></div>`;
    root.querySelector("#retry").addEventListener("click", () => go("uploading"));
  }
  function rPosted() {
    root.innerHTML = `<div class="fl fl-center">
      <div class="fl-ic">${I("success", 40)}</div><div class="fl-c-t">Posted to your feed</div>
      <div class="fl-c-d">Nice work — your set is live for friends to cheer on.</div>
      <div class="fl-f-foot"><button class="fl-btn-primary" onclick="location.href='../home/community.html'">${I("users", 18)} View in feed</button>
        <button class="fl-btn-ghost" onclick="location.href='index.html'">Done</button></div></div>`;
  }

  function start(mountEl, deep) {
    root = mountEl; S = { step: "select", exKey: "squat", reps: 0, secs: 0, granted: false, facing: "front", guideSeen: false, guideSkip: false, timers: [], raf: null };
    if (deep) {
      // ?step= deep links, incl. every feedback tier: camera:setup · camera:form · camera:reject ·
      // camera:praise · camera:lost · camera:noframe · guide · report · report0 (zero-rep diagnosis).
      const m = deep.split(":"); S.exKey = m[2] || "squat"; S.reps = 12; S.secs = 38; S.granted = true; S.guideSeen = true;
      if (m[0] === "report0") { S.reps = 0; return go("report"); }
      if (m[0] === "camera" && m[1]) return clear(), (S.step = "camera"), rCamera(m[1]), window.Icons.init(root);
      if (m[0] === "uploadfail2") return clear(), rUploading(true), void window.Icons.init(root);
      if (m[0] === "congrats") { S.cvar = m[1] || "A"; return go("congrats"); }
      return go(m[0]);
    }
    go("select");
  }
  return { start };
})();
