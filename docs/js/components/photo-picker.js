/* SYSTEM photo picker — a STAND-IN for the platform's own picker, not a screen of ours.
   -------------------------------------------------------------------------------------
   This prototype used to draw its own media grid in two places (capture's gallery tab and
   the composer's PICK step). Google Play REJECTED that shape: an app targeting Android 13+
   may only request the broad media-read permissions a bespoke grid needs when a system
   picker is technically insufficient for core functionality, and "pick a few items to post"
   is precisely the case the policy says must use the picker. iOS has no such mandate but
   ships the same component (PHPickerViewController), so one picker suits every client.

   It is deliberately drawn in PLATFORM chrome — neutral surface, system-ish header, none of
   our brand — because the single most important thing this file communicates is DO NOT STYLE
   THIS. Anything a client can restyle here is something it would have to build itself, which
   is what put the app in violation. Treat the visuals as indicative only; the real component
   looks like whatever the OS version ships.

   What IS ours, and what every client must implement, is the CONTRACT around it:
     open({ maxItems, imagesOnly, onPick })
       maxItems   — the REMAINING allowance, not a constant. The picker enforces the count
                    itself, so the user is stopped inside it rather than told off afterwards.
                    1 means single-select (the platform's multi-picker needs >= 2).
       imagesOnly — true once anything is selected, since a video is only ever valid as the
                    sole item. Stops a pick that could only be refused on return.
       onPick     — receives the chosen items. The photos-XOR-video rule CANNOT be expressed
                    to the picker, so it is applied on the way back out by the caller. */
window.SystemPhotoPicker = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const mmss = (s) => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");

  // Stand-in for the device library (newest first). Shared by both entry points so the
  // prototype behaves like one device rather than two different phones.
  const IMGG = [
    "linear-gradient(135deg,#e6a4c4,#b65a86)", "linear-gradient(135deg,#9ec5e0,#4c7fb0)",
    "linear-gradient(135deg,#a6d6b8,#4f9e73)", "linear-gradient(135deg,#e6c9a0,#b58a4e)",
    "linear-gradient(135deg,#c3b3e6,#6f5ac0)", "linear-gradient(135deg,#f0b49a,#d1683e)",
    "linear-gradient(135deg,#9bd6cf,#3f9a8c)", "linear-gradient(135deg,#c9c19b,#8a7d4e)",
  ];
  const LIBRARY = [
    { type: "video", ex: "squat", dur: 42 }, { type: "image", g: IMGG[0] }, { type: "image", g: IMGG[1] },
    { type: "video", ex: "pushup", dur: 28 }, { type: "image", g: IMGG[2] }, { type: "image", g: IMGG[3] },
    { type: "video", ex: "jumping", dur: 15 }, { type: "image", g: IMGG[4] }, { type: "image", g: IMGG[5] },
    { type: "video", ex: "lunge", dur: 51 }, { type: "image", g: IMGG[6] }, { type: "image", g: IMGG[7] },
    { type: "image", g: IMGG[1] }, { type: "image", g: IMGG[3] }, { type: "video", ex: "situp", dur: 33 },
  ];
  const tileBg = (a) => {
    if (a.type !== "video") return a.g;
    const m = (window.Social && window.Social.ACT.find((x) => x.key === a.ex)) || null;
    return m ? `linear-gradient(150deg,${m.c},color-mix(in srgb,${m.c} 55%,#111))` : "linear-gradient(150deg,#2a9d8f,#1f6e5f)";
  };

  let el = null, sel = [], opts = null;

  function visible() {
    return LIBRARY.map((a, i) => ({ a, i })).filter(({ a }) => !(opts.imagesOnly && a.type === "video"));
  }

  function render() {
    const single = opts.maxItems <= 1;
    const full = !single && sel.length >= opts.maxItems;
    const tiles = visible().map(({ a, i }) => {
      const at = sel.indexOf(i);
      // Past the cap the platform picker greys out what you cannot take. That is the whole
      // point of handing it the REMAINING allowance rather than a constant 10.
      const off = at < 0 && full;
      const vid = a.type === "video";
      /* A VIDEO must be unmistakable at a glance, not inferable from a small corner label.
         Real pickers get this for free — a video's poster frame plus a duration read as motion.
         The prototype's stand-in tiles are flat gradients, so photo and video looked identical
         apart from a 10px badge. Three cues instead, and they are cheap on any platform:
         a centred play disc, a bottom scrim so the label always has contrast, and the duration.
         The type is also in the aria-label, since none of the three is text. */
      return `<button class="spp-tile${vid ? " vid" : ""}${at >= 0 ? " on" : ""}${off ? " off" : ""}" style="background-image:${tileBg(a)}"
        onclick="SystemPhotoPicker.tap(${i})"
        aria-label="${vid ? `Video, ${mmss(a.dur)}` : "Photo"}${at >= 0 ? ", selected" : ""}">
        ${vid ? `<span class="spp-vscrim"></span><span class="spp-playdisc">${I("play", 16)}</span>
                 <span class="spp-vb">${mmss(a.dur)}</span>` : ""}
        <span class="spp-check${at >= 0 ? " on" : ""}">${at >= 0 && !single ? at + 1 : ""}</span></button>`;
    }).join("");

    el.innerHTML = `<div class="spp-sheet" role="dialog" aria-label="Select photos">
      <div class="spp-grab"></div>
      <div class="spp-head">
        <span class="spp-tab on">Photos</span><span class="spp-tab">Collections</span>
        <button class="spp-close" onclick="SystemPhotoPicker.dismiss()" aria-label="Close">${I("x", 18)}</button>
      </div>
      <div class="spp-note">${I("lock", 12)} Buzzend will only have access to the ${opts.imagesOnly ? "photos" : "photos and videos"} that you select</div>
      <div class="spp-grid">${tiles}</div>
      <div class="spp-bar">
        <span class="spp-count">${single ? "Tap a photo to add it" : sel.length ? `${sel.length} selected` : "Nothing selected"}</span>
        ${single ? "" : `<button class="spp-done ${sel.length ? "" : "dis"}" onclick="SystemPhotoPicker.done()">Done</button>`}
      </div>
      <div class="spp-os">system picker — platform UI, not ours to style</div>
    </div>`;
    window.Icons.init(el);
  }

  function open(o) {
    opts = Object.assign({ maxItems: 10, imagesOnly: false, onPick: () => {} }, o);
    sel = [];
    el = document.createElement("div");
    el.className = "spp-scrim";
    el.addEventListener("click", (e) => { if (e.target === el) dismiss(); });
    // The device frame, not the page body — same host the dialogs use. Appended to body the
    // sheet renders outside the phone and spans the viewport.
    (document.querySelector(".screen-box") || document.body).appendChild(el);
    render();
  }

  function tap(i) {
    // Single-select REPLACES rather than accumulates, and returns immediately — the platform's
    // single-item contract, which is what a remaining allowance of 1 must use.
    if (opts.maxItems <= 1) { sel = [i]; return done(); }
    const at = sel.indexOf(i);
    if (at >= 0) sel.splice(at, 1);
    else if (sel.length < opts.maxItems) sel.push(i);
    render();
  }

  function close() { if (el) { el.remove(); el = null; } }
  // Dismissing without choosing is NOT a failure and must stay silent.
  function dismiss() { close(); }
  function done() {
    if (!sel.length) return;
    const picked = sel.map((i) => Object.assign({ _li: i }, LIBRARY[i]));
    const cb = opts.onPick;
    close();
    cb(picked);
  }

  return { open, tap, done, dismiss, LIBRARY };
})();
