/* Capture — reusable camera, grounded in the old Flutter custom_media_library
   (CameraScreen: Photo/Video modes, flash, mic, flip, record timer, "Cannot switch
   while recording").

   THE GALLERY TAB IS GONE. This screen used to own a media grid of its own; picking is now
   the platform's photo picker, opened over the camera (components/photo-picker.js explains
   why — Play rejected the permissions a bespoke grid requires). The gallery BUTTON remains,
   but it launches the system component instead of a screen of ours.

   Configurable by ?purpose:
     post   → photo/video, multi-select → Compose (edit → post)
     avatar → single image  → back to Edit Profile (sets the picture)
     chat   → photo/video, single → back to chat (send)
   Reused by the Plus sheet, Edit Profile and (optionally) chat. Reads Social. */
window.Capture = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  const MR = window.MediaRules, MAX = MR.MAX_IMAGES;
  // simulated camera shots (the prototype's stand-in for real capture)
  const SHOTS = [
    { g: "linear-gradient(135deg,#f0a6c0,#c65f88)", pair: "#f0a6c0,#c65f88" },
    { g: "linear-gradient(135deg,#9ec5e0,#4c7fb0)", pair: "#9ec5e0,#4c7fb0" },
    { g: "linear-gradient(135deg,#a6d6b8,#4f9e73)", pair: "#a6d6b8,#4f9e73" },
    { g: "linear-gradient(135deg,#e6c9a0,#b58a4e)", pair: "#e6c9a0,#b58a4e" },
  ];
  const IMGG = SHOTS.map((s) => s.g);

  let host, st;
  function cfg() {
    const p = new URLSearchParams(location.search), purpose = p.get("purpose") || "post";
    const map = { post: { accept: "all", multiple: true }, avatar: { accept: "image", multiple: false }, chat: { accept: "all", multiple: false } };
    const c = map[purpose] || map.post;
    // `adding` = reached from the composer's "Add more → Camera", i.e. with a draft of photos
    // already in hand. Four things change, all for one reason: the ONLY valid act here is one
    // more photo, and the draft must survive. See renderCamera + close().
    const adding = p.get("adding") === "1";
    return { purpose, adding, accept: adding ? "image" : (p.get("accept") || c.accept),
      multiple: p.get("multiple") ? p.get("multiple") === "true" : c.multiple };
  }
  function start(mount) {
    host = mount; const c = cfg();
    st = Object.assign({ tab: "camera", camMode: "photo", flash: "off", mic: true, facing: "back", recording: false, recSecs: 0, timer: null, shot: 0, sel: [] }, c);
    // Add-more arrives holding a draft, so the remaining allowance (and therefore the picker's
    // cap) has to account for what is already in the post.
    if (st.adding) { try { st.sel = JSON.parse(sessionStorage.getItem("bz-compose-draft") || "[]"); } catch (e) { st.sel = []; } }
    if (st.adding) st.camMode = "photo";
    render();
  }

  /* ── selection rules (images-multi OR single video, max 10) ── */
  function canAdd(a, silent) {
    if (!st.multiple) return true;
    const why = MR.reject(st.sel, a);   // one shared rule set, one set of messages
    if (why) { if (!silent) warn(why); return false; }
    return true;
  }
  // A toast, not a dialog: this explains why something did not land, which the user can see.
  const warn = (m) => Buzzend.toast(m);
  function addAsset(a) {
    if (!st.multiple) { st.sel = [a]; return finish(); }
    if (!canAdd(a)) return;
    st.sel.push(a); render();
  }

  /* ── camera ── */
  function renderCamera() {
    // A video recorded in add-more could only be refused on return (a post is photos OR one
    // video, never both), so the mode toggle is not offered at all — a lone "Photo" pill would
    // be pointless chrome. `accept` is already forced to image in cfg(), which also keeps the
    // top-right on flash rather than the video mic toggle.
    const both = st.accept === "all" && !st.adding;
    const mode = (m, l) => `<button class="cap-mode ${st.camMode === m ? "on" : ""}" onclick="Capture.setMode('${m}')">${l}</button>`;
    const toggle = st.camMode === "photo"
      ? `<button class="cap-tg" onclick="Capture.flash()">${I(st.flash === "on" ? "zap" : "zap", 20)}<i class="cap-tglbl">${st.flash}</i></button>`
      : `<button class="cap-tg ${st.mic ? "" : "off"}" onclick="Capture.mic()">${I(st.mic ? "volume" : "mute", 20)}</button>`;
    const galThumb = st.sel.length ? `style="background-image:${st.sel[st.sel.length - 1].g};background-size:cover"` : "";
    const tray = (st.multiple && st.sel.length) ? trayHtml() : "";
    return `<div class="cap cap-camera facing-${st.facing}">
      <div class="cap-view"><div class="cap-vf"></div><div class="cap-reticle"></div>
        ${st.recording ? `<div class="cap-rec"><span class="dot"></span><span id="cap-timer">${fmt(st.recSecs)}</span></div>` : ""}</div>
      <div class="cap-top">
        <button class="cap-x" onclick="Capture.close()" aria-label="${st.adding ? "Back to your post" : "Close"}">${I(st.adding ? "back" : "x", 22)}</button>
        <div class="cap-title">${st.adding ? "Add photo" : st.purpose === "avatar" ? "Profile photo" : st.purpose === "chat" ? "Camera" : "New post"}</div>
        <div class="cap-tgs">${toggle}</div></div>
      <div class="cap-bottom">
        ${tray}
        ${both ? `<div class="cap-modes">${mode("photo", "Photo")}${mode("video", "Video")}</div>` : ""}
        <div class="cap-controls">
          ${st.adding
            ? /* The sheet that sent the user here just offered Gallery as the other half of the
                 same choice; a second door to it inside the camera loops back to the option they
                 declined. Replaced by a spacer of equal size, not removed — the row is
                 space-between, so dropping a child would drift the shutter off-centre. */
              `<span class="cap-gal-spacer"></span>`
            : `<button class="cap-gal" ${galThumb} onclick="Capture.goGallery()">${st.sel.length ? "" : I("images", 22)}</button>`}
          <button class="cap-shutter ${st.camMode}${st.recording ? " rec" : ""}" onclick="Capture.shutter()"></button>
          <button class="cap-flip" onclick="Capture.flip()">${I("refresh", 22)}</button></div>
      </div></div>`;
  }
  function trayHtml() {
    const thumbs = st.sel.map((a, i) => `<div class="cap-tt" style="background:${a.g}">${a.type === "video" ? `<span class="cap-ttv">${I("play", 9)}</span>` : ""}<button class="cap-ttx" onclick="Capture.unsel(${i})">${I("x", 10)}</button></div>`).join("");
    return `<div class="cap-tray"><div class="cap-tt-row">${thumbs}</div><button class="cap-next" onclick="Capture.finish()">Next · ${st.sel.length}</button></div>`;
  }

  function setMode(m) { if (st.recording) return; st.camMode = m; render(); }
  function flash() { st.flash = st.flash === "off" ? "on" : st.flash === "on" ? "auto" : "off"; render(); }
  function mic() { st.mic = !st.mic; render(); }
  function flip() { if (st.recording) return Buzzend.alert({ icon: "camera", title: "Recording", message: "Cannot switch camera while recording." }); st.facing = st.facing === "back" ? "front" : "back"; render(); }
  function shutter() {
    if (st.camMode === "photo") { const s = SHOTS[st.shot % SHOTS.length]; st.shot++; addAsset({ type: "image", g: s.g, pair: s.pair }); return; }
    if (!st.recording) { st.recording = true; st.recSecs = 0; render(); st.timer = setInterval(() => { st.recSecs++; const t = document.getElementById("cap-timer"); if (t) t.textContent = fmt(st.recSecs); }, 1000); }
    else { clearInterval(st.timer); st.recording = false; const dur = Math.max(1, st.recSecs); const s = SHOTS[st.shot % SHOTS.length]; st.shot++; addAsset({ type: "video", g: s.g, pair: s.pair, dur }); }
  }
  function unsel(i) { st.sel.splice(i, 1); render(); }

  /* ── gallery: the SYSTEM picker, opened over the camera ── */
  function goGallery() {
    const held = st.sel.length;
    window.SystemPhotoPicker.open({
      // The remaining allowance, so the cap is enforced INSIDE the picker rather than as a
      // message afterwards. 1 → the platform's single-item contract.
      maxItems: st.multiple ? Math.max(1, MR.remaining(st.sel)) : 1,
      // A video is only ever valid as the sole item, so once anything is held, don't offer one.
      imagesOnly: st.accept === "image" || held > 0,
      onPick: (picked) => {
        if (!st.multiple) return finish({ type: picked[0].type, g: picked[0].g, ex: picked[0].ex, dur: picked[0].dur });
        // The picker capped the COUNT; the photos-XOR-video rule cannot be expressed to it, so
        // it is applied here — and every dropped item is reported, never silently discarded.
        const { selection, message } = MR.merge(st.sel, picked);
        st.sel = selection;
        if (message) Buzzend.toast(message);
        render();
      },
    });
  }

  // Only one screen now: the camera. The picker is a system sheet ON TOP of it, never a tab.
  function render() { host.innerHTML = renderCamera(); window.Icons.init(host); }
  /* In add-more this is a BACK affordance: it returns to the draft in the composer. Wired to a
     plain close it discarded a draft of up to 10 photos on one tap with no confirmation — and
     the platform back gesture does the same thing, so both must route here. */
  function close() {
    if (st.adding) { location.href = "compose.html?from=adding"; return; }
    if (history.length > 1) history.back(); else location.href = "home-v7.html";
  }

  /* ── done: route by purpose ── */
  function finish(single) {
    const sel = single ? [single] : st.sel;
    if (!sel.length) return;
    if (st.purpose === "avatar") {
      sessionStorage.setItem("bz-avatar-pick", sel[0].pair || "#9ec5e0,#4c7fb0");
      location.href = "profile-edit.html"; return;
    }
    if (st.purpose === "chat") {
      Buzzend.alert({ icon: "success", title: "Sent", message: "Your photo has been sent to the chat.", onConfirm() { location.href = "../chat/chat-detail.html"; } }); return;
    }
    if (st.adding) {
      // Merge the new shot into the draft we were handed, under the same shared rules.
      let draft = []; try { draft = JSON.parse(sessionStorage.getItem("bz-compose-draft") || "[]"); } catch (e) {}
      const { selection } = MR.merge(draft, sel.map((a, n) => Object.assign({ id: "s" + n }, a)));
      sessionStorage.setItem("bz-compose-draft", JSON.stringify(selection.map((a) => ({ type: a.type, g: a.g, ex: a.ex, dur: a.dur || 0 }))));
      location.href = "compose.html?from=adding"; return;
    }
    // post → hand off to the composer for editing
    sessionStorage.setItem("bz-compose-assets", JSON.stringify(sel.map((a) => ({ type: a.type, g: a.g, dur: a.dur || 0 }))));
    location.href = "compose.html?from=capture";
  }

  return { start, setMode, flash, mic, flip, shutter, unsel, goGallery, finish, close };
})();
