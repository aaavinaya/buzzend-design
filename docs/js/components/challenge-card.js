/* ── ChallengeCard — one reusable challenge row, used across the app ──────────────────────────────
   ONE design, three surfaces:
     · Composer "Tag a challenge"        → ChallengeCard.row(c, { control: "radio",  selected })
     · Feed "Change where it's shown"    → ChallengeCard.row(c, { control: "check",  selected })
     · Feed tagged-challenges sheet      → ChallengeCard.row(c, { control: "chevron" })
   Deliberately minimal: exercise glyph (uniform, no colored tile) + challenge name + "by <creator>".
   Members / public-private / status are intentionally NOT shown — creator name is enough. The native
   port should mirror this as a single Compose `ChallengeCard` composable with the same variants.

   c    — a Social.CHALLENGES entry (or ChallengeCard.byName("…") for a name-only feed tag).
   opts — { control: "radio"|"check"|"chevron"|"none",  selected: bool,  onClick: "<inline handler>" } */
window.ChallengeCard = (function () {
  const S = window.Social, I = (n, s) => window.Icons.svg(n, s);
  const actOf = (ex) => S.ACT.find((a) => a.key === ex) || S.ACT[1];

  function control(kind, on) {
    if (kind === "check")   return `<span class="chc-cb${on ? " on" : ""}">${on ? I("check", 14) : ""}</span>`;
    if (kind === "radio")   return `<span class="chc-rb${on ? " on" : ""}">${on ? I("check", 13) : ""}</span>`;
    if (kind === "chevron") return `<span class="chc-chev">${I("chevron", 18)}</span>`;
    return "";
  }

  function row(c, opts) {
    opts = opts || {};
    const a = actOf(c.ex);
    return `<button class="chc${opts.selected ? " sel" : ""}"${opts.onClick ? ` onclick="${opts.onClick}"` : ""}>
      <span class="chc-ic">${I(a.i, 24)}</span>
      <span class="chc-main">
        <span class="chc-name">${c.n}</span>
        <span class="chc-sub">by ${c.by}</span>
      </span>
      ${control(opts.control || "none", opts.selected)}
    </button>`;
  }

  const list = (items, opts) => items.map((c) => row(c, opts)).join("");
  // Grouped card: a run of rows inside one rounded card with inset dividers (the V2 “clean list” look).
  const group = (items, opts) => `<div class="chc-group">${list(items, opts)}</div>`;

  // Feed posts tag challenges by display-name; resolve to the full model, with a safe fallback
  // for demo names that aren't in Social.CHALLENGES (e.g. "Cardio Kings").
  function byName(n) {
    return S.CHALLENGES.find((c) => c.n === n) || { n, ex: "squat", by: "a member" };
  }

  return { row, list, group, byName };
})();
