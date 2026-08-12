/* ── ChallengeListCard — one reusable challenge row for VERTICAL challenge lists ───────────────────
   The prototype's twin of the app's `MyChallengeCard` / `ChallengeTabCard` — the SAME card in two
   places on device, so one component here:
     · "Your challenges" see-all  → ChallengeListCard.card(c, { chat: true, onChat: "…" })
     · profile → Challenges tab   → ChallengeListCard.card(c, { meta, bar })

   Content is minimal and honest, exactly as on device: the exercise illustration in its accent tile,
   the challenge name, ONE meta line, and (see-all only) the group-chat button. No completion % and no
   rep count in the default meta — the challenge contract carries no per-user count and no goal, so the
   app leads with "N members · Daily" instead of inventing progress.

   c    — a Social.CHALLENGES entry.
   opts — { meta:   string   override the meta line (default "N members · Freq")
            owner:  bool     OWNER pill (default c.createdByMe)
            chip:   string   an extra pill after the name, e.g. "UPCOMING"
            bar:    number   0–100 schedule bar under the meta; omit for no bar
            barColor: string bar fill (default the workout accent)
            chat:   bool     trailing group-chat button
            onClick / onChat: "<inline handler>" } */
window.ChallengeListCard = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const actOf = (ex) => { const A = window.Social.ACT; return A.find((a) => a.key === ex) || A[1]; };

  /* The app's default meta: `formatMembers(memberCount) · Frequency` → "3 members · Daily". */
  function metaOf(c) {
    const n = c.members || 0;
    const members = n === 1 ? "1 member" : `${window.Social.fmt(n)} members`;
    return c.freq ? `${members} · ${c.freq}` : members;
  }

  function card(c, opts) {
    opts = opts || {};
    const a = actOf(c.ex);
    const meta = opts.meta != null ? opts.meta : metaOf(c);
    const owner = opts.owner != null ? opts.owner : !!c.createdByMe;
    const bar = opts.bar;
    // A 0% bar stays empty (an upcoming challenge has genuinely elapsed nothing); anything above 0 gets
    // a 2% floor so a just-started challenge still shows a sliver instead of reading as "not started".
    const fill = bar == null ? null : bar <= 0 ? 0 : Math.max(bar, 2);
    return `<div class="clc"${opts.onClick ? ` onclick="${opts.onClick}"` : ""}>
      <span class="clc-ic" style="color:${a.c};background:color-mix(in srgb,${a.c} 14%,transparent)">${I(a.i, 46)}</span>
      <span class="clc-main">
        <span class="clc-top">
          <span class="clc-name">${c.n}</span>
          ${owner ? `<span class="clc-tag">OWNER</span>` : ""}
          ${opts.chip ? `<span class="clc-tag">${opts.chip}</span>` : ""}
        </span>
        ${meta ? `<span class="clc-meta">${meta}</span>` : ""}
        ${fill == null ? "" : `<span class="clc-bar"><i style="width:${fill}%;background:${opts.barColor || a.c}"></i></span>`}
      </span>
      ${opts.chat ? `<button class="clc-chat" onclick="${opts.onChat || ""}">${I("comment", 18)}</button>` : ""}
    </div>`;
  }

  const list = (items, opts) => items.map((c) => card(c, typeof opts === "function" ? opts(c) : opts)).join("");

  return { card, list, metaOf };
})();
