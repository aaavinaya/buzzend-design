/* Content composer — the pre-upload flow, grounded in the old Flutter
   MediaLibraryLayout → PreviewScreen → PostSelectorBottomSheet:
     1) PICK   — gallery multi-select (max 10; images-multi OR single video).
     2) EDIT   — PreviewScreen: preview carousel + thumbnail strip (remove / add-more
                 / reorder*) + canvas Editor (Text · Sticker · Draw · Music · BG;
                 video: Trim · Volume/Mute · Speed). Reps auto-burn on workout media.
     3) POST   — "Where do you want to post?" (My Profile · expires after 60 days /
                 tag challenges) → background upload with progress.
   NO caption / public-private — those aren't in the backend (text is a burned canvas
   overlay; visibility = where you post). Items marked (*) are UI-only extras.
   Reads window.Social. Token / palette / dark aware. */
window.Composer = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social, ACT = S.ACT, fmt = S.fmt, grad = S.grad;
  // ONE definition of the rules and the limit, shared with capture and any future surface.
  const MR = window.MediaRules, MAX = MR.MAX_IMAGES;
  const IMGG = ["linear-gradient(135deg,#e6a4c4,#b65a86)", "linear-gradient(135deg,#9ec5e0,#4c7fb0)", "linear-gradient(135deg,#a6d6b8,#4f9e73)",
    "linear-gradient(135deg,#e6c9a0,#b58a4e)", "linear-gradient(135deg,#c3b3e6,#6f5ac0)", "linear-gradient(135deg,#f0b49a,#d1683e)",
    "linear-gradient(135deg,#9bd6cf,#3f9a8c)", "linear-gradient(135deg,#c9c19b,#8a7d4e)"];
  const exG = (k) => { const m = ACT.find((a) => a.key === k) || ACT[1]; return `linear-gradient(150deg,${m.c},color-mix(in srgb,${m.c} 55%,#111))`; };
  const TRACKS = ["Rise Up — Aylo", "Focus Flow — Kbeats", "Momentum — Trilo", "Golden Hour — Nova", "Push It — Rythm"];
  const EMO = ["💪", "🔥", "🏆", "⚡", "😤", "🎯", "👏", "🥵", "✅", "🚀"];

  // NO local media library here any more: the device's photos live behind the system picker
  // (components/photo-picker.js), which owns the only stand-in library in the prototype.
  const assetG = (a) => a.type === "video" ? (a.ex ? exG(a.ex) : a.g) : a.g;
  const mmss = (s) => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");
  const COLORS = ["#ffffff", "#111111", "#ef4444", "#f59e0b", "#fde047", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let host, st;
  function fresh() { return { step: "edit", assets: [], idx: 0, pose: null, editorOpen: false, tool: null, selOv: -1, drawing: false, brush: { color: "#ffffff", size: 6 }, targets: { profile: true, challenges: [] } }; }

  /* ═══════════ 1 · PICK — the SYSTEM picker, not a screen of ours ═══════════
     There is deliberately no PICK step in the composer any more. Picking is the platform's
     photo picker, opened OVER whatever launched it, so it never becomes a place in the flow:
     dismissing it returns you to the camera or the preview you came from with the selection
     untouched. See components/photo-picker.js for why (Play policy) and the contract. */
  function openPicker(after) {
    const left = MR.remaining(st.assets);
    if (st.assets.some((a) => a.type === "video")) return warn(MR.MSG.NO_MIXING);
    if (left <= 0) return warn(MR.MSG.LIMIT_REACHED);
    window.SystemPhotoPicker.open({
      // The REMAINING allowance, so the cap is enforced inside the picker. 1 → single-select.
      maxItems: left,
      // Once anything is held, a video could only be refused on return — so don't offer one.
      imagesOnly: st.assets.length > 0,
      onPick: (picked) => { absorb(picked); if (after) after(); },
    });
  }

  /* Fold a picker result into the draft. The picker enforced the COUNT; the photos-XOR-video
     rule cannot be expressed to it, so it is applied here — and every dropped item is
     reported, never silently discarded. */
  function absorb(picked) {
    const incoming = picked.map((g, n) => asset(g, st.assets.length + n));
    const { selection, message } = MR.merge(st.assets, incoming);
    st.assets = selection;
    if (message) warn(message);
    // Nothing landed and nothing was already held → there is no preview to show. Go back to the
    // camera rather than leave a blank stage (the composer has no gallery step to fall back on).
    if (!st.assets.length) { location.href = "capture.html?purpose=post"; return; }
    if (st.idx >= st.assets.length) st.idx = st.assets.length - 1;
    st.step = "edit";
    renderEdit();
  }
  function asset(g, n) {
    return { id: "a" + (g._li != null ? g._li : "c") + "_" + n, type: g.type, ex: g.ex, g: g.g, dur: g.dur || 0,
      muted: false, speed: 1, bg: null, overlays: [], edited: false };
  }
  // Selection-rule feedback is a TOAST, not a dialog: it explains why something did not land,
  // which the user can already see — a dialog would demand a tap to acknowledge a fact.
  const warn = (m) => Buzzend.toast(m);
  function capture() { location.href = "capture.html?purpose=post"; }
  function cancel() { location.href = "home-v7.html"; }

  /* ═══════════ 2 · EDIT (PreviewScreen) ═══════════ */
  function overlayHtml(o, k) {
    const sel = st.selOv === k ? " sel" : "";
    if (o.kind === "text")
      return `<div class="cp-ov txt${sel}" data-k="${k}" style="left:${o.x * 100}%;top:${o.y * 100}%;color:${o.color || "#fff"};font-size:${o.size || 28}px">${esc(o.txt)}</div>`;
    return `<div class="cp-ov emo${sel}" data-k="${k}" style="left:${o.x * 100}%;top:${o.y * 100}%;font-size:${Math.round(44 * (o.scale || 1))}px">${o.txt}</div>`;
  }
  function previewAsset(a) {
    const ovs = a.overlays.map(overlayHtml).join("");
    const reps = a.pose ? `<div class="cp-reps">${I(a.pose.ic, 14)} I completed ${a.pose.reps} ${a.pose.name}</div>` : "";
    const vid = a.type === "video" ? `<button class="cp-play" onclick="event.stopPropagation()">${I("play", 26)}</button>
      <div class="cp-vinfo">${a.muted ? I("mute", 13) : I("volume", 13)}${a.speed !== 1 ? `<span class="cp-spd">${a.speed}x</span>` : ""}<span class="cp-dur">${mmss(a.dur)}</span></div>` : "";
    const vwm = a.type === "video" ? `<span class="cp-vwm">${I(a.ex || "activity", 130)}</span>` : "";
    return `<div class="cp-canvas${st.drawing ? " drawing" : ""}" style="${a.bg ? "background:" + a.bg : "background-image:" + assetG(a)}">${vwm}${vid}${reps}<canvas class="cp-draw"></canvas>${ovs}</div>`;
  }
  // simulated video frames for the trim strip: same clip tinted per-frame + a moving
  // figure, so the timeline actually looks like footage you can scrub.
  function trimFrames(a, n) {
    return Array.from({ length: n }, (_, i) => {
      const b = (0.7 + 0.42 * Math.abs(Math.sin(i * 0.9 + 1))).toFixed(2), hue = Math.round(Math.sin(i * 0.6) * 16);
      const y = Math.round((0.5 - Math.abs(Math.sin(i * 0.9 + 1))) * 8), sc = (0.7 + 0.3 * Math.abs(Math.sin(i * 0.9 + 1))).toFixed(2);
      return `<div class="cp-frame" style="background:${assetG(a)};filter:brightness(${b}) hue-rotate(${hue}deg)"><span class="cp-tfig" style="transform:translateY(${y}px) scale(${sc})">${I(a.ex || "activity", 14)}</span></div>`;
    }).join("");
  }
  function thumbStrip() {
    // a video is a single-asset post — no cover thumbnail / strip to arrange (videos only)
    if (st.assets.length === 1 && st.assets[0].type === "video") return "";
    const canAdd = !(st.assets.length && st.assets[0].type === "video") && st.assets.length < MAX;
    const thumbs = st.assets.map((a, i) => `<div class="cp-th${i === st.idx ? " on" : ""}" draggable="true" data-i="${i}" style="background-image:${assetG(a)}" onclick="Composer.go(${i})">
      ${a.type === "video" ? `<span class="cp-thv">${I("play", 9)}</span>` : ""}
      ${st.assets.length > 1 ? `<button class="cp-thx" onclick="event.stopPropagation();Composer.remove(${i})">${I("x", 11)}</button>` : ""}
      ${i === 0 ? '<span class="cp-cover">Cover</span>' : ""}</div>`).join("");
    return `<div class="cp-strip" id="cp-strip">${thumbs}${canAdd ? `<button class="cp-thadd" onclick="Composer.addMore()">${I("plus", 20)}</button>` : ""}</div>`;
  }
  function renderEdit() {
    const a = st.assets[st.idx];
    const dots = st.assets.length > 1 ? `<div class="cp-dots">${st.assets.map((_, i) => `<i class="${i === st.idx ? "on" : ""}"></i>`).join("")}</div>` : "";
    const nav = st.assets.length > 1 ? `<button class="cp-nav l" onclick="Composer.go(${(st.idx - 1 + st.assets.length) % st.assets.length})">${I("back", 20)}</button>
      <button class="cp-nav r" onclick="Composer.go(${(st.idx + 1) % st.assets.length})">${I("back", 20)}</button>` : "";
    host.innerHTML = `<div class="cp-edit">
      <div class="cp-top dark">
        <button class="cp-x" onclick="Composer.back()">${I("back", 20)}</button>
        <div class="cp-ttl">${st.assets.length > 1 ? st.idx + 1 + " / " + st.assets.length : "Preview"}</div>
        <button class="cp-next" onclick="Composer.toPost()">Next</button>
      </div>
      <div class="cp-stage">${previewAsset(a)}${nav}${dots}</div>
      ${st.editorOpen ? editorUI(a) : `${thumbStrip()}
        <div class="cp-editbar"><button class="cp-editbtn" onclick="Composer.openEditor()">${I("edit", 16)} Edit ${a.type === "video" ? "video" : "photo"}</button></div>`}
    </div>`;
    window.Icons.init(host);
    wireStage();
  }
  function go(i) { st.idx = i; renderEdit(); }
  function remove(i) {
    const a = st.assets[i];
    const doIt = () => { st.assets.splice(i, 1); if (st.idx >= st.assets.length) st.idx = st.assets.length - 1; renderEdit(); };
    if (a.edited || a.overlays.length) Buzzend.confirm({ icon: "trash", danger: true, title: "Discard changes?", message: "Selected media will be removed.", confirmLabel: "Remove", onConfirm: doIt });
    else doIt();
  }
  /* "+" raises a Camera / Gallery sheet rather than going straight to the picker.
     The system picker has NO camera entry point on any platform, so a "+" wired directly to
     it would remove "shoot one more" from the add-more path entirely — reachable only by
     backing out of the preview. Two labelled options, one tap deeper. The sheet is also the
     only place the remaining budget can be stated, since the picker is not ours to write in. */
  function addMore() {
    const left = MR.remaining(st.assets);
    // Unreachable via the "+" (it is hidden for a video post and at the cap) — but answered
    // rather than ignored, because a control that does nothing is worse than one that explains.
    if (left <= 0) return warn(st.assets.some((a) => a.type === "video") ? MR.MSG.NO_MIXING : MR.MSG.LIMIT_REACHED);
    Buzzend.sheet({
      html: `<div class="cp-addsheet">
        <div class="cp-addttl">Add to post</div>
        <div class="cp-addsub">${MR.remainingLabel(left)}</div>
        <div class="cp-addopts">
          <button class="cp-addopt" onclick="Buzzend.closeTop();Composer.addFromCamera()">
            <span class="cp-addico">${I("camera", 26)}</span><b>Camera</b></button>
          <button class="cp-addopt" onclick="Buzzend.closeTop();Composer.addFromGallery()">
            <span class="cp-addico">${I("images", 26)}</span><b>Gallery</b></button>
        </div></div>`,
    });
    window.Icons.init(document.body);
  }
  // Camera: hand off to the capture screen in ADD-MORE shape (see capture.js `adding`) — only
  // a photo is valid there, and leaving it must return to this draft rather than close the flow.
  function addFromCamera() {
    sessionStorage.setItem("bz-compose-draft", JSON.stringify(st.assets.map((a) => ({ type: a.type, g: a.g, ex: a.ex, dur: a.dur }))));
    location.href = "capture.html?purpose=post&adding=1";
  }
  function addFromGallery() { openPicker(); }

  function back() {
    const edited = st.assets.some((a) => a.edited || a.overlays.length);
    // Leaving the preview abandons the draft, so it confirms — and there is no PICK step to
    // fall back to any more, which is why this exits the composer rather than stepping back.
    const doIt = () => { location.href = "home-v7.html"; };
    if (edited) Buzzend.confirm({ icon: "alert", danger: true, title: "Discard post?", message: "This draft won't be posted.", confirmLabel: "Discard", onConfirm: doIt });
    else doIt();
  }

  /* ── stage wiring: thumbnail reorder · draw canvas · overlays · trim handles ── */
  let dragFrom = null;
  function wireStage() {
    const strip = document.getElementById("cp-strip");
    if (strip) strip.querySelectorAll(".cp-th").forEach((el) => {
      el.addEventListener("dragstart", () => { dragFrom = +el.dataset.i; el.classList.add("dragging"); });
      el.addEventListener("dragend", () => { dragFrom = null; strip.querySelectorAll(".cp-th").forEach((t) => t.classList.remove("dragging", "over")); });
      el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("over"); });
      el.addEventListener("dragleave", () => el.classList.remove("over"));
      el.addEventListener("drop", (e) => { e.preventDefault(); const to = +el.dataset.i; if (dragFrom == null || dragFrom === to) return; const m = st.assets.splice(dragFrom, 1)[0]; st.assets.splice(to, 0, m); st.idx = to; renderEdit(); });
    });
    const canvas = host.querySelector(".cp-canvas"); if (!canvas) return;
    const a = st.assets[st.idx];
    const cv = canvas.querySelector(".cp-draw");
    if (cv) { const r = canvas.getBoundingClientRect(); cv.width = r.width; cv.height = r.height; replayStrokes(cv, a); if (st.drawing) wireDraw(cv, a); }
    canvas.querySelectorAll(".cp-ov").forEach((el) => wireOverlay(el, canvas, a));
    if (st.tool === "trim" && a.type === "video") wireTrim(a);
    updateFmtBar();
  }

  /* ── overlays: drag to move · tap to select · text is editable inline ── */
  function wireOverlay(el, canvas, a) {
    const k = +el.dataset.k, o = a.overlays[k];
    if (o.kind === "text") {
      el.setAttribute("contenteditable", "true");
      el.addEventListener("input", () => { o.txt = el.textContent; a.edited = true; });
    }
    el.addEventListener("pointerdown", (e) => {
      if (st.drawing) return;
      const box = canvas.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY; let moved = false;
      const move = (ev) => {
        if (!moved && (Math.abs(ev.clientX - sx) > 6 || Math.abs(ev.clientY - sy) > 6)) { moved = true; try { el.blur(); } catch (e2) {} const s = window.getSelection && getSelection(); if (s && s.removeAllRanges) s.removeAllRanges(); selectOverlay(k); }
        if (moved) { o.x = clamp((ev.clientX - box.left) / box.width, .03, .97); o.y = clamp((ev.clientY - box.top) / box.height, .05, .95); el.style.left = o.x * 100 + "%"; el.style.top = o.y * 100 + "%"; a.edited = true; }
      };
      const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); if (!moved) { selectOverlay(k); if (o.kind === "text") el.focus(); } };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    });
  }
  function selectOverlay(k) {
    st.selOv = k;
    const canvas = host.querySelector(".cp-canvas"); if (canvas) canvas.querySelectorAll(".cp-ov").forEach((el) => el.classList.toggle("sel", +el.dataset.k === k));
    updateFmtBar();
  }
  function updateFmtBar() {
    const bar = host.querySelector(".cp-fmt"); if (!bar) return;
    const a = st.assets[st.idx], o = (st.selOv >= 0 && a.overlays[st.selOv]) ? a.overlays[st.selOv] : null;
    if (!o) st.selOv = -1;
    bar.classList.toggle("show", !!o && !st.drawing);
    bar.classList.toggle("is-text", !!(o && o.kind === "text"));
    bar.querySelectorAll(".cp-sw").forEach((s) => s.classList.toggle("on", !!(o && o.kind === "text" && s.dataset.c === (o.color || "#ffffff"))));
  }
  function setColor(c) { const o = st.assets[st.idx].overlays[st.selOv]; if (!o) return; o.color = c; st.assets[st.idx].edited = true; const el = host.querySelector('.cp-ov[data-k="' + st.selOv + '"]'); if (el) el.style.color = c; updateFmtBar(); }
  function sizeStep(d) {
    const a = st.assets[st.idx], o = a.overlays[st.selOv]; if (!o) return; a.edited = true;
    const el = host.querySelector('.cp-ov[data-k="' + st.selOv + '"]');
    if (o.kind === "text") { o.size = clamp((o.size || 28) + d * 4, 12, 76); if (el) el.style.fontSize = o.size + "px"; }
    else { o.scale = clamp((o.scale || 1) + d * 0.18, 0.4, 4); if (el) el.style.fontSize = Math.round(44 * o.scale) + "px"; }
  }
  function deleteSel() { const a = st.assets[st.idx]; if (st.selOv < 0) return; a.overlays.splice(st.selOv, 1); st.selOv = -1; renderEdit(); }

  /* ── freehand draw on a canvas layer ── */
  function replayStrokes(cv, a) {
    const ctx = cv.getContext("2d"); ctx.clearRect(0, 0, cv.width, cv.height);
    (a.strokes || []).forEach((s) => { ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
      s.pts.forEach((p, i) => { const x = p[0] * cv.width, y = p[1] * cv.height; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); });
  }
  function wireDraw(cv, a) {
    cv.onpointerdown = (e) => {
      if (!st.drawing) return; e.preventDefault();
      if (!a.strokes) a.strokes = [];
      const r = cv.getBoundingClientRect();
      const stroke = { color: st.brush.color, size: +st.brush.size, pts: [[(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]] };
      a.strokes.push(stroke); a.edited = true; replayStrokes(cv, a);
      const move = (ev) => { stroke.pts.push([(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height]); replayStrokes(cv, a); };
      const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    };
  }
  function brushColor(c) { st.brush.color = c; host.querySelectorAll(".cp-panel .cp-sw").forEach((s) => s.classList.toggle("on", s.dataset.c === c)); }
  function brushSize(v) { st.brush.size = +v; }
  function undoStroke() { const a = st.assets[st.idx]; if (a.strokes && a.strokes.length) { a.strokes.pop(); const cv = host.querySelector(".cp-draw"); if (cv) replayStrokes(cv, a); } }
  function clearDraw() { const a = st.assets[st.idx]; a.strokes = []; const cv = host.querySelector(".cp-draw"); if (cv) replayStrokes(cv, a); }

  /* ── draggable trim handles ── */
  function wireTrim(a) {
    const track = host.querySelector(".cp-trimtrack"), selEl = host.querySelector(".cp-trimsel"); if (!track || !selEl) return;
    if (!a.trim) a.trim = [0, a.dur];
    const labs = host.querySelectorAll(".cp-trimlab span");
    const drag = (which) => (e) => {
      e.preventDefault(); e.stopPropagation(); const r = track.getBoundingClientRect();
      const move = (ev) => {
        const t = clamp((ev.clientX - r.left) / r.width, 0, 1) * a.dur;
        if (which === "l") a.trim[0] = clamp(t, 0, a.trim[1] - 5); else a.trim[1] = clamp(t, a.trim[0] + 5, a.dur);
        selEl.style.left = (a.trim[0] / a.dur * 100) + "%"; selEl.style.right = (100 - a.trim[1] / a.dur * 100) + "%";
        if (labs[0]) labs[0].textContent = mmss(Math.round(a.trim[0])); if (labs[1]) labs[1].textContent = mmss(Math.round(a.trim[1])); a.edited = true;
      };
      const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    };
    const hl = host.querySelector(".cp-h.l"), hr = host.querySelector(".cp-h.r");
    if (hl) hl.addEventListener("pointerdown", drag("l")); if (hr) hr.addEventListener("pointerdown", drag("r"));
  }

  /* ── canvas editor ── */
  function openEditor() { st.editorOpen = true; renderEdit(); }
  function closeEditor() { st.editorOpen = false; st.assets[st.idx].edited = true; st.tool = null; st.drawing = false; st.selOv = -1; renderEdit(); }
  function editorUI(a) {
    const tool = (ic, l, fn, on) => `<button class="cp-tool${on ? " on" : ""}" onclick="${fn}"><span>${I(ic, 20)}</span>${l}</button>`;
    const common = tool("type", "Text", "Composer.addText()") + tool("smile", "Sticker", "Composer.stickers()", st.tool === "sticker") + tool("edit", "Draw", "Composer.draw()", st.drawing) + tool("music", "Music", "Composer.music()", st.tool === "music") + tool("wand", "Background", "Composer.bg()", st.tool === "bg");
    const video = a.type === "video" ? tool("scissors", "Trim", "Composer.trim()", st.tool === "trim") + tool(a.muted ? "mute" : "volume", a.muted ? "Muted" : "Volume", "Composer.mute()", a.muted) + tool("speed", "Speed", "Composer.speed()", st.tool === "speed") : "";
    const fmt = `<div class="cp-fmt">
      <div class="cp-swrow">${COLORS.map((c) => `<button class="cp-sw" data-c="${c}" style="background:${c}" onclick="Composer.setColor('${c}')"></button>`).join("")}</div>
      <div class="cp-fmtbtns"><button class="cp-fbtn" onclick="Composer.sizeStep(-1)">A−</button><button class="cp-fbtn" onclick="Composer.sizeStep(1)">A+</button><button class="cp-fbtn del" onclick="Composer.deleteSel()">${I("trash", 15)}</button></div></div>`;
    return `<div class="cp-editor">
      <div class="cp-etop"><button class="cp-eic" onclick="Composer.reset()">${I("refresh", 16)}</button>
        <div class="cp-etitle">Edit ${a.type === "video" ? "video" : "photo"}</div>
        <button class="cp-edone" onclick="Composer.closeEditor()">${I("check", 16)} Done</button></div>
      ${fmt}
      ${st.tool ? toolPanel(a) : ""}
      <div class="cp-toolrail">${video}${common}</div>
    </div>`;
  }
  function toolPanel(a) {
    if (st.tool === "trim") {
      const s = a.trim ? a.trim[0] : 0, e = a.trim ? a.trim[1] : a.dur, D = a.dur;
      return `<div class="cp-panel">
        <div class="cp-trimhead"><div class="cp-trimstat"><span class="k">Start</span><b>${mmss(Math.round(s))}</b></div>
          <div class="cp-trimstat mid"><span class="k">Keeping</span><b>${mmss(Math.round(e - s))}</b></div>
          <div class="cp-trimstat"><span class="k">End</span><b>${mmss(Math.round(e))}</b></div></div>
        <div class="cp-trimtrack">${trimFrames(a, 14)}
          <div class="cp-trimdim" style="left:0;width:${s / D * 100}%"></div>
          <div class="cp-trimdim" style="right:0;width:${100 - e / D * 100}%"></div>
          <div class="cp-trimsel" style="left:${s / D * 100}%;right:${100 - e / D * 100}%"><span class="cp-h l"><i></i></span><span class="cp-h r"><i></i></span></div></div>
        <div class="cp-trimhint">${I("scissors", 13)} Drag the ends to trim · min 5s</div></div>`;
    }
    if (st.tool === "speed") return `<div class="cp-panel"><div class="cp-panelh">Playback speed</div><div class="cp-chips">${[0.25, 0.5, 1, 1.25, 1.5].map((v) => `<button class="cp-chip ${a.speed === v ? "on" : ""}" onclick="Composer.setSpeed(${v})">${v}x</button>`).join("")}</div></div>`;
    if (st.tool === "music") return `<div class="cp-panel"><div class="cp-panelh">Add music</div><div class="cp-tracks">${TRACKS.map((t) => `<button class="cp-track ${a.music === t ? "on" : ""}" onclick="Composer.setMusic('${t}')">${I("music", 15)} ${t}${a.music === t ? " " + I("check", 14) : ""}</button>`).join("")}</div></div>`;
    if (st.tool === "sticker") return `<div class="cp-panel"><div class="cp-panelh">Add a sticker</div><div class="cp-emos">${EMO.map((e) => `<button class="cp-emo" onclick="Composer.putEmo('${e}')">${e}</button>`).join("")}</div></div>`;
    if (st.tool === "bg") return `<div class="cp-panel"><div class="cp-panelh">Background</div><div class="cp-bgs">${["", "linear-gradient(135deg,#111,#333)", "linear-gradient(135deg,#1f6e5f,#2a9d8f)", "linear-gradient(135deg,#3a2a6a,#7c3aed)", "linear-gradient(135deg,#7a1f2a,#ef4444)"].map((b) => `<button class="cp-bg" style="${b ? "background:" + b : "background-image:" + assetG(a)}" onclick="Composer.setBg('${b}')"></button>`).join("")}</div></div>`;
    if (st.tool === "draw") return `<div class="cp-panel"><div class="cp-panelh">Draw · sketch on the media</div>
      <div class="cp-swrow">${COLORS.map((c) => `<button class="cp-sw ${st.brush.color === c ? "on" : ""}" data-c="${c}" style="background:${c}" onclick="Composer.brushColor('${c}')"></button>`).join("")}</div>
      <div class="cp-drawrow"><span class="cp-panelh" style="margin:0">Brush</span><input type="range" class="cp-range" min="2" max="26" value="${st.brush.size}" oninput="Composer.brushSize(this.value)">
        <button class="cp-chip" onclick="Composer.undoStroke()">Undo</button><button class="cp-chip" onclick="Composer.clearDraw()">Clear</button></div></div>`;
    return "";
  }
  function tp(t) { st.tool = st.tool === t ? null : t; st.drawing = false; st.selOv = -1; renderEdit(); }
  const trim = () => tp("trim"), speed = () => tp("speed"), music = () => tp("music"), stickers = () => tp("sticker"), bg = () => tp("bg");
  function draw() { st.drawing = !st.drawing; st.tool = st.drawing ? "draw" : null; st.selOv = -1; renderEdit(); }
  function mute() { const a = st.assets[st.idx]; a.muted = !a.muted; a.edited = true; renderEdit(); }
  function setSpeed(v) { st.assets[st.idx].speed = v; st.assets[st.idx].edited = true; renderEdit(); }
  function setMusic(t) { st.assets[st.idx].music = t; st.assets[st.idx].edited = true; renderEdit(); }
  function setBg(b) { st.assets[st.idx].bg = b || null; st.assets[st.idx].edited = true; renderEdit(); }
  function addText() {
    const a = st.assets[st.idx]; a.overlays.push({ kind: "text", txt: "Tap to edit", x: 0.5, y: 0.42, color: "#ffffff", size: 30 }); a.edited = true; st.tool = null; st.drawing = false; renderEdit();
    const k = a.overlays.length - 1; selectOverlay(k);
    const el = host.querySelector('.cp-ov[data-k="' + k + '"]'); if (el) { el.focus(); try { const rng = document.createRange(); rng.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(rng); } catch (e) {} }
  }
  function putEmo(e) { const a = st.assets[st.idx]; a.overlays.push({ kind: "emo", txt: e, x: 0.5, y: 0.4, scale: 1 }); a.edited = true; st.tool = null; renderEdit(); selectOverlay(a.overlays.length - 1); }
  function reset() { Buzzend.confirm({ icon: "refresh", danger: true, title: "Revert all changes?", message: "This resets the media to the original — overlays, drawings, trim and audio.", confirmLabel: "Revert", onConfirm() { const a = st.assets[st.idx]; a.overlays = []; a.strokes = []; a.bg = null; a.muted = false; a.speed = 1; a.music = null; a.trim = null; a.edited = false; st.selOv = -1; st.drawing = false; st.tool = null; renderEdit(); } }); }

  /* ═══════════ 3 · POST (where to post) ═══════════ */
  function toPost() { st.step = "post"; renderPost(); }
  function activeChallenges() { return S.CHALLENGES.filter((c) => c.status === "active" || c.status === "open").slice(0, 5); }
  function renderPost() {
    const a0 = st.assets[0], count = st.assets.length;
    const summary = a0.type === "video" ? "1 video" : count + (count > 1 ? " photos" : " photo");
    const profRow = `<button class="cp-dest ${st.targets.profile ? "on" : ""}" onclick="Composer.tgProfile()">
      <div class="cp-di" style="background-image:${grad(S.ME.av)}"></div>
      <div class="cp-dm"><div class="cp-dn">My Profile</div><div class="cp-dd">${I("clock", 11)} Post expires after 60 days</div></div>
      <span class="cp-check">${st.targets.profile ? I("check", 14) : ""}</span></button>`;
    // Reusable ChallengeCard (radio control) — same design as the feed placement + tagged-challenges sheets.
    const chRows = activeChallenges().map((c) => ChallengeCard.row(c, {
      control: "radio", selected: st.targets.challenges.includes(c.id), onClick: `Composer.tgChallenge('${c.id}')`,
    })).join("");
    const chs = chRows ? `<div class="chc-group">${chRows}</div>` : "";
    const sharing = [st.targets.profile ? S.ME.av : null].concat(st.targets.challenges.map(() => null)).filter(Boolean);
    const repsNote = st.assets.some((a) => a.pose) ? `<div class="cp-repnote">${I("activity", 14)} Your workout reps are shown on this post automatically.</div>` : "";
    host.innerHTML = `<div class="cp-post">
      <div class="cp-top"><button class="cp-x" onclick="Composer.back2()">${I("back", 20)}</button><div class="cp-ttl">Share</div><span style="width:44px"></span></div>
      <div class="cp-postbody">
        <div class="cp-summary"><div class="cp-sthumb" style="background-image:${assetG(a0)}">${a0.type === "video" ? `<span class="cp-thv">${I("play", 10)}</span>` : ""}</div>
          <div><div class="cp-sn">Ready to share</div><div class="cp-sd">${summary}${count > 1 ? " · swipe post" : ""}</div></div></div>
        ${repsNote}
        <div class="cp-qh">Where do you want to post?</div>
        ${profRow}
        <div class="cp-sublbl">Tag a challenge</div>
        ${chs || `<div class="cp-none">No active challenges to tag.</div>`}
      </div>
      <div class="cp-postbar"><button class="cp-postbtn" onclick="Composer.publish()">${I("send", 17)} Post</button></div>
    </div>`;
    window.Icons.init(host);
  }
  function back2() { st.step = "edit"; renderEdit(); }
  function tgProfile() { st.targets.profile = !st.targets.profile; ensureTarget(); renderPost(); }
  function tgChallenge(id) { const c = st.targets.challenges, at = c.indexOf(id); if (at >= 0) c.splice(at, 1); else c.push(id); ensureTarget(); renderPost(); }
  function ensureTarget() { if (!st.targets.profile && !st.targets.challenges.length) st.targets.profile = true; } // always ≥1 destination

  // Post is non-blocking: kick off the background upload and return to Home
  // immediately (Facebook-style). The "Posting…" bar lives in localStorage, so it
  // keeps progressing on whatever tab the user switches to, then flips to "Posted".
  function publish() {
    const a0 = st.assets[0];
    if (window.UploadBanner) UploadBanner.start({ cover: assetG(a0), isVideo: a0.type === "video", label: st.assets.some((a) => a.pose) ? "workout" : "post", dur: 6000 });
    location.href = "home-v7.html";
  }

  function start(mountEl, opts) {
    host = mountEl; st = fresh();
    opts = opts || {};
    if (opts.from === "workout") { // AI workout → share the recorded rep video
      const ex = ACT.find((a) => a.key === (opts.ex || "squat")) || ACT[1];
      st.assets = [{ id: "w0", type: "video", ex: ex.key, dur: 38, muted: false, speed: 1, bg: null, overlays: [], edited: false, pose: { reps: +opts.reps || 120, name: ex.n.toLowerCase(), ic: ex.i } }];
      st.step = "edit"; renderEdit();
    } else if (opts.from === "capture") {   // assets handed over from the Capture screen
      let arr = []; try { arr = JSON.parse(sessionStorage.getItem("bz-compose-assets") || "[]"); } catch (e) {}
      sessionStorage.removeItem("bz-compose-assets");
      if (!arr.length) { openPicker(); return; }
      st.assets = arr.map((a, n) => ({ id: "c" + n, type: a.type, g: a.g, dur: a.dur || 0, muted: false, speed: 1, bg: null, overlays: [], edited: false }));
      st.idx = 0; st.step = "edit"; renderEdit();
    } else if (opts.from === "adding") {  // returning from the add-more camera, draft intact
      let arr = []; try { arr = JSON.parse(sessionStorage.getItem("bz-compose-draft") || "[]"); } catch (e) {}
      sessionStorage.removeItem("bz-compose-draft");
      st.assets = arr.map((a, n) => ({ id: "d" + n, type: a.type, g: a.g, ex: a.ex, dur: a.dur || 0, muted: false, speed: 1, bg: null, overlays: [], edited: false }));
      st.idx = 0; st.step = "edit";
      if (st.assets.length) renderEdit(); else openPicker();
    } else {
      // Entering the composer with NOTHING now redirects to the camera, because that is the
      // flow's real entry point: capture → (picker over it) → preview. Opening a picker over an
      // empty composer would leave a blank stage behind it, and a dismissal with nowhere to go.
      location.href = "capture.html?purpose=post";
    }
  }

  return { start, capture, cancel, go, remove, addMore, addFromCamera, addFromGallery, back, openEditor, closeEditor,
    trim, speed, music, stickers, bg, mute, setSpeed, setMusic, setBg, draw, addText, putEmo, reset,
    setColor, sizeStep, deleteSel, brushColor, brushSize, undoStroke, clearDraw,
    toPost, back2, tgProfile, tgChallenge, publish };
})();
