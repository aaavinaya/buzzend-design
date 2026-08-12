/* Your challenges · See all. Rows are the shared ChallengeListCard component
   (js/components/challenge-list-card.js) — the same card the profile Challenges
   tab uses, and the app's `MyChallengeCard` verbatim. It used to re-declare the
   home RING card (chalx) here; the app moved this list to the accent-tile card on
   2026-08-05 and the ring now lives only on the Home rail, where the app keeps it.
   The list is TWO paginated sections, each with its OWN "Show more" button —
   the fix for the two-stacked-infinite-lists problem: paging is button-driven per
   section, so the two never fight over one scroll trigger (a scroll-triggered infinite
   load can only ever feed the bottom list). SOURCE-AWARE (this screen is reused):
     - from Challenges/Home → "Active" + "Upcoming"
     - from Profile (?from=profile) → "Current challenges" (active+upcoming = the backend
       NON_EXPIRED page) + "Completed" (the COMPLETED page)
   Name search too. Reads window.Social. PAGE = the prototype's page size (real app
   pages via the API). */
window.MyCh = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const S = window.Social;
  const PAGE = 3;
  const freshPages = () => ({ active: PAGE, upcoming: PAGE, current: PAGE, completed: PAGE });
  let root, from = "home", q = "", shown = freshPages();
  const matches = (c) => !q || c.n.toLowerCase().includes(q.toLowerCase());

  /* One row = the shared ChallengeListCard. Its DEFAULT meta ("N members · Freq") is what the app
     shows here, so nothing is passed but the two per-row decisions this screen owns:
       · the group-chat button, hidden once a challenge has ended (its chat is closed)
       · which detail role the card opens (creator vs member) */
  function card(c) {
    const role = c.createdByMe ? "owner" : "member";
    return window.ChallengeListCard.card(c, {
      chat: c.status !== "ended",
      onClick: `location.href='challenge-detail.html?role=${role}'`,
      onChat: `event.stopPropagation();Buzzend.alert({icon:'comment',title:'${c.n} · Group chat',message:'Open the challenge group chat to cheer members on and share your progress.'})`,
    });
  }

  /* One paginated section: shows the first `shown[key]` items + a "Show more" button that
     pages THAT section only (no scroll-trigger ambiguity). No "N more" count — real
     pagination doesn't know the total; the button just fetches the next page. It's kept
     visible for one extra tap after everything loaded (the "is there more?" confirming
     tap), and only disappears once a tap reveals nothing new — exactly how page-by-page
     fetching learns it hit the end (a short/empty page). */
  function section(key, label, items) {
    if (!items.length) return "";
    const page = items.slice(0, shown[key]);
    const more = shown[key] < items.length + PAGE
      ? `<button class="mc-more" onclick="MyCh.more('${key}')">${I("chevron", 15)} Show more</button>`
      : "";
    return `<div class="mc-sec">${label}</div>${page.map(card).join("")}${more}`;
  }

  function render() {
    const mine = S.CHALLENGES.filter((c) => c.joined);
    const filt = mine.filter(matches);
    const active = filt.filter((c) => c.status === "active");
    const upcoming = filt.filter((c) => c.status === "upcoming");
    const ended = filt.filter((c) => c.status === "ended");
    // Reused screen → different section split by source. From Profile the two are
    // Current (active+upcoming, active first = the NON_EXPIRED page) + Completed;
    // from Challenges/Home they're Active + Upcoming (finished challenges aren't shown).
    const groups = from === "profile"
      ? [{ key: "current", label: "Current challenges", items: active.concat(upcoming) },
         { key: "completed", label: "Completed", items: ended }]
      : [{ key: "active", label: "Active", items: active },
         { key: "upcoming", label: "Upcoming", items: upcoming }];

    const countEl = document.getElementById("mc-count");
    if (countEl) countEl.textContent = mine.length;
    const qx = document.getElementById("mc-qx");
    if (qx) qx.style.display = q ? "grid" : "none";

    if (!mine.length) {
      root.innerHTML = `<div class="mc-empty"><div class="ic">${I("trophy", 34)}</div>
        <div class="t">No challenges yet</div>
        <div class="d">Join a challenge to compete with friends and stay motivated.</div>
        <button class="btn btn-primary" onclick="location.href='discover.html'">Browse challenges</button></div>`;
      return;
    }

    const total = groups.reduce((n, g) => n + g.items.length, 0);
    if (q && !total) {
      root.innerHTML = `<div class="mc-body"><div class="mc-empty" style="padding:52px 30px">
        <div class="ic">${I("search", 30)}</div><div class="t">No results</div>
        <div class="d">No challenges match “${q}”.</div></div></div>`;
      window.Icons.init(root);
      return;
    }

    root.innerHTML = `<div class="mc-body">
      ${groups.map((g) => section(g.key, g.label, g.items)).join("")}
      ${q ? "" : `<div class="mc-browse" onclick="location.href='discover.html'">
        <div class="ic">${I("search", 22)}</div>
        <div><b>Discover more challenges</b><span>Find new goals and friends to compete with</span></div>
        <span class="go">${I("chevron", 20)}</span>
      </div>`}</div>`;
    window.Icons.init(root);
  }

  /* Page one section forward (its own "Show more"). Keeps the other section's offset. */
  function more(key) { shown[key] += PAGE; render(); }

  function search(v) { q = (v || "").trim(); shown = freshPages(); render(); }
  function clearQ() { q = ""; shown = freshPages(); const el = document.getElementById("mc-q"); if (el) { el.value = ""; el.focus(); } render(); }

  function start(mountEl) {
    root = mountEl;
    from = new URLSearchParams(location.search).get("from") === "profile" ? "profile" : "home";
    shown = freshPages();
    render();
  }
  return { start, render, search, clearQ, more };
})();
