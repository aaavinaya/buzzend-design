/* Camera-permission screen — 5 readability-focused redesigns.
   Same identity as the current screen (camera tile + orange/ghost pill buttons);
   the middle content is restructured so the reassurance actually gets read. */
window.PermissionVariants = (function () {
  const I = (n, s) => window.Icons.svg(n, s);

  const statusbar = `<div class="statusbar"><span>9:41</span><span>5G&nbsp;&nbsp;􀙇&nbsp;&nbsp;100%</span></div>`;
  const foot = `<div class="pm-foot">
      <button class="fl-btn-primary">${I("camera", 18)} Enable Camera</button>
      <button class="fl-btn-ghost">Not now</button></div>`;
  const tile = (extra) => `<div class="fl-ic ${extra || ""}">${I("camera", (extra || "").includes("sm") ? 32 : 40)}</div>`;
  const screen = (body, bodyCls) => `<div class="screen-box"><div class="screen">${statusbar}<div class="pm"><div class="pm-body ${bodyCls || ""}">${body}</div>${foot}</div></div></div>`;

  // ── V1 · Benefit rows ──
  const row = (ic, t, d) => `<div class="pm-row"><span class="pm-row-ic">${I(ic, 22)}</span><span class="pm-row-tx"><b>${t}</b><span>${d}</span></span></div>`;
  function v1() {
    return screen(`${tile("sm")}
      <div class="fl-c-t">Let Buzzend count your reps</div>
      <div class="pm-rows">
        ${row("phone", "Counts on your phone", "Reps are counted live, right on your device.")}
        ${row("lock", "Your video stays private", "The footage never leaves your phone.")}
        ${row("share", "You choose what to share", "Nothing is posted unless you tap Post.")}
      </div>`);
  }

  // ── V2 · Privacy callout ──
  function v2() {
    return screen(`${tile()}
      <div class="fl-c-t">Your video stays on your phone</div>
      <div class="fl-c-d">Buzzend uses the camera to count your reps as you move.</div>
      <div class="pm-note"><span class="pm-note-ic">${I("lock", 22)}</span>
        <div><b>Private by default.</b><p>Your workout video is never uploaded — it's only shared if you choose to post it.</p></div></div>
      <div class="pm-chips">
        <span class="pm-chip">${I("phone", 13)} On-device</span>
        <span class="pm-chip">${I("shield", 13)} Never uploaded</span></div>`);
  }

  // ── V3 · Numbered steps ──
  const step = (n, t, d) => `<div class="pm-step"><span class="pm-step-n">${n}</span><div class="pm-step-tx"><b>${t}</b><span>${d}</span></div></div>`;
  function v3() {
    return screen(`${tile("sm")}
      <div class="fl-c-t">How Buzzend counts reps</div>
      <div class="pm-steps">
        ${step(1, "Point your phone at yourself", "Prop it up so you're in frame.")}
        ${step(2, "Buzzend counts each rep live", "It reads your movement on-device — no internet needed.")}
        ${step(3, "Your video stays with you", "It's never uploaded unless you choose to post it.")}
      </div>`);
  }

  // ── V4 · Do / Don't ──
  const ddItem = (ic, t) => `<div class="pm-dd-item"><span class="ic">${I(ic, 14)}</span><span>${t}</span></div>`;
  function v4() {
    return screen(`${tile("sm")}
      <div class="fl-c-t">How Buzzend uses your camera</div>
      <div class="pm-dd">
        <div class="pm-dd-grp ok"><div class="h"><span class="hic">${I("check", 13)}</span>What Buzzend does</div>
          ${ddItem("check", "Uses your camera to detect your pose and count your reps")}
          ${ddItem("check", "Detects your pose in real time during your workout")}</div>
        <div class="pm-dd-grp no"><div class="h"><span class="hic">${I("x", 13)}</span>What Buzzend never does</div>
          ${ddItem("x", "Counts reps unless you start a workout")}
          ${ddItem("x", "Uploads your video unless you choose to post it")}</div>
      </div>`, "top");
  }

  // ── V5 · Q&A ──
  const qa = (q, a) => `<div class="pm-qa-item"><div class="pm-qa-q">${I("info", 16)}${q}</div><div class="pm-qa-a">${a}</div></div>`;
  function v5() {
    return screen(`${tile("sm")}
      <div class="pm-eyebrow">Before you turn it on</div>
      <div class="fl-c-t">Your questions, answered</div>
      <div class="pm-qa">
        ${qa("Is my video uploaded?", "No. It's processed on your phone. It's only uploaded if you tap Post.")}
        ${qa("Can other people see it?", "Only if you choose to post it — otherwise it stays private to you.")}
      </div>`);
  }

  const COLS = [
    { tag: "V · 1", title: "Benefit rows", desc: "Breaks the message into 3 scannable, icon-led facts.", render: v1 },
    { tag: "V · 2", title: "Privacy callout", desc: "Pulls the key reassurance into a highlighted card the eye lands on.", render: v2 },
    { tag: "V · 3", title: "How it works", desc: "Numbered 1-2-3 steps — read in order, privacy is the final step.", render: v3 },
    { tag: "V · 4", title: "Does / Never does", desc: "Two short lists that directly answer 'what are you accessing?'", render: v4 },
    { tag: "V · 5", title: "Q&A", desc: "Answers the exact worry in the user's head, in their words.", render: v5 },
  ];
  function start(mountEl) {
    mountEl.innerHTML = `<div class="pv-canvas">
      <div class="pv-head"><h1>Camera permission — 5 designs</h1><p>Same identity as today · each one restructured so the privacy reassurance actually gets read · Electric Orange</p></div>
      <div class="pv-scroll"><div class="pv-wrap">
        ${COLS.map((c) => `<div class="pv-col">
          <div class="pv-lab"><div class="pv-tagrow"><span class="pv-tag">${c.tag}</span><b>${c.title}</b></div><p>${c.desc}</p></div>
          ${c.render()}</div>`).join("")}
      </div></div></div>`;
    window.Icons.init(mountEl);
  }
  // standalone final page — just the chosen V4 screen
  const isGranted = () => { try { return localStorage.getItem("buzzend-cam-granted") === "1"; } catch (e) { return false; } };
  const setGranted = () => { try { localStorage.setItem("buzzend-cam-granted", "1"); } catch (e) {} };
  const goBack = () => { if (history.length > 1) history.back(); else location.href = "moment.html"; };
  function startFinal(mountEl) {
    mountEl.innerHTML = `<div class="pv-single">${v4()}</div>`;
    window.Icons.init(mountEl);
    const footEl = mountEl.querySelector(".pm-foot");
    if (isGranted()) {
      // permission already given → no Enable / Not now; just confirm + Done
      mountEl.querySelector(".fl-c-t").insertAdjacentHTML("afterend",
        `<div class="pm-granted">${I("check", 15)} Camera access is on</div>`);
      footEl.innerHTML = `<button class="fl-btn-ghost" id="pm-done">Done</button>`;
      footEl.querySelector("#pm-done").addEventListener("click", goBack);
    } else {
      footEl.querySelector(".fl-btn-primary").addEventListener("click", () => { setGranted(); location.href = "moment.html"; });
      footEl.querySelector(".fl-btn-ghost").addEventListener("click", goBack);
    }
    window.Icons.init(footEl);
  }
  return { start, startFinal };
})();
