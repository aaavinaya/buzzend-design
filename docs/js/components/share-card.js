/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   Share card — the 4:5 exportable image, in ONE sticker-board language for all three periods.

   Design source: screens/home/share-card.html (variation I · Sticker board) and
   screens/home/stats-share.html (W4 · Ranked ladder, M4 · Exercise scoreboard).

   This module is a pure RENDERER over a view model. It does no arithmetic of its own on purpose:
   every call site passes numbers it has already computed with its own formulas, so the card can
   never disagree with the chart or tile the user tapped Share from. That also makes the shape a
   1:1 template for the Kotlin `ShareCardModel` when this lands in the app.

     Buzzend.shareCard({
       dateLabel,                              // "Friday, Jul 24, 2026" / "20 Jul – 26 Jul"
       hero:  { icon, label, value, unit, meta: [{icon, text}] },
       seal:  { big, small, tight },           // ALWAYS a consistency figure — goal % / days active
       stickers: [{icon, color, label, value, unit}],        // day card: one per exercise
       ladder:   { title, rows: [{icon, color, label, value, pct}] },   // W4 / M4
       onPost, onSave, onShare,                // optional; default to a stub alert
     })

   Deliberately absent: STREAK. Streak is 100% backend-computed (/v1/streaks/status — freezes,
   missed-day restore, invite-restore) and Profile already renders the real `currentStreak` above the
   Stats section, so a locally recomputed run of active days would contradict it on the same screen.
   Consistency is expressed as "days active" and "strongest on ⟨weekday⟩" instead.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
  const I = (n, s) => (window.Icons ? Icons.svg(n, s) : "");

  const brand = () =>
    `<div class="sc-brand">${window.Icons ? Icons.brandMark(26, 7) : ""}` +
    `<span class="sc-bn">Buzzend</span><span class="sc-sll">Stay active. Stay ahead.</span></div>`;

  function heroEl(hero, seal) {
    const meta = (hero.meta || []).length
      ? `<div class="sc-ms">${hero.meta.map((m) => `${m.icon ? I(m.icon, 12) : ""}<span>${m.text}</span>`).join('<span style="opacity:.5">·</span>')}</div>`
      : "";
    const sealEl = seal
      ? `<div class="sc-seal${seal.tight ? " tight" : ""}"><b>${seal.big}</b><span>${seal.small}</span></div>`
      : "";
    return `<div class="sc-main sc-stick">
      <div class="sc-mh">${I(hero.icon, 23)}<span>${hero.label}</span></div>
      <div class="sc-mb${String(hero.value).length > 7 ? " sm" : ""}">${hero.value}${hero.unit ? `<s>${hero.unit}</s>` : ""}</div>
      ${meta}${sealEl}</div>`;
  }

  const stickersEl = (items) =>
    `<div class="sc-row">${items.slice(0, 6).map((t) => `<div class="sc-st sc-stick">
      <span style="color:${t.color}">${I(t.icon, 17)}</span>
      <div><div class="sc-sl">${t.label}</div><div class="sc-sv">${t.value}${t.unit ? `<s> ${t.unit}</s>` : ""}</div></div>
    </div>`).join("")}</div>`;

  const ladderEl = (lad) =>
    `<div class="sc-pad sc-stick"><div class="sc-sl">${lad.title}</div>
      <div class="sc-lad">${lad.rows.map((r) => `<div class="sc-lr">
        <span style="color:${r.color}">${I(r.icon, 16)}</span>
        <span class="sc-ln">${r.label}</span>
        <span class="sc-lt"><i style="width:${Math.max(6, Math.min(100, r.pct))}%;background:${r.color}"></i></span>
        <span class="sc-lv">${r.value}</span></div>`).join("")}</div></div>`;

  /** The card markup on its own — reusable if a screen ever wants to inline it rather than modal it. */
  function markup(m) {
    const body = m.ladder ? ladderEl(m.ladder) : m.stickers && m.stickers.length ? stickersEl(m.stickers) : "";
    return `<div class="sc-frame${m.ladder ? " ladder" : ""}">
      <div class="sc-date">${m.dateLabel}</div>
      <div class="sc-stage${m.ladder ? " spread" : ""}">${heroEl(m.hero, m.seal)}${body}</div>
      ${brand()}</div>`;
  }

  window.Buzzend = window.Buzzend || {};
  window.Buzzend.shareCardMarkup = markup;

  /** Opens the card in the standard bottom sheet with the Post / Save / Share row. */
  window.Buzzend.shareCard = function (m) {
    const stub = (verb, msg) => () => Buzzend.alert({ icon: verb, title: msg.t, message: msg.m });
    const acts = `<div class="sc-acts">
      <button class="post" data-sc="post">${I("send", 15)} Post</button>
      <button class="save" data-sc="save">${I("download", 15)} Save</button>
      <button class="share" data-sc="share">${I("share", 15)} Share</button></div>`;

    const built = Buzzend.sheet({ closeBtn: true, title: m.sheetTitle || "Share your stats", html: `<div class="sc-wrap">${markup(m)}${acts}</div>` });
    const scope = (built && built.dialog) || document;

    const handlers = {
      post: m.onPost || stub("send", { t: "Posted to your feed", m: "Your card is uploading — it will appear on your profile and in the community feed shortly." }),
      save: m.onSave || stub("download", { t: "Saved to gallery", m: "The 1080×1350 card was saved to your photos." }),
      share: m.onShare || stub("share", { t: "Share sheet", m: "The system share sheet opens with the card as an image." }),
    };
    // scoped to this sheet's own dialog, so a closing overlay (220ms fade) can't steal the clicks
    scope.querySelectorAll("[data-sc]").forEach((b) => {
      b.onclick = () => handlers[b.getAttribute("data-sc")]();
    });
    return built;
  };
})();
