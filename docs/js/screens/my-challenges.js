/* Your challenges · See all. Reuses the home ring-card design (chalx) in a full
   vertical list of TWO paginated sections, each with its OWN "Show more" button —
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
  const S = window.Social, fmt = S.fmt;
  const exMeta = (k) => S.ACT.find((a) => a.key === k) || S.ACT[1];
  const PAGE = 3;
  const freshPages = () => ({ active: PAGE, upcoming: PAGE, current: PAGE, completed: PAGE });
  let root, from = "home", q = "", shown = freshPages();
  const matches = (c) => !q || c.n.toLowerCase().includes(q.toLowerCase());

  // same ring markup as Home (HomeData.ring)
  function ring(o) {
    const r = o.r || 21, c = 2 * Math.PI * r, off = c * (1 - o.pct / 100), s = o.size || 50, sw = o.stroke || 5.5;
    return `<div class="ring" style="width:${s}px;height:${s}px"><svg width="${s}" height="${s}">
      <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="var(--surface-alt)" stroke-width="${sw}"/>
      <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${o.prog||'var(--primary)'}" stroke-width="${sw}"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${s/2} ${s/2})"/></svg>
      ${o.center ? `<div class="ring-center">${o.center}</div>` : ""}</div>`;
  }

  function pctOf(c) {
    if (c.status === "upcoming") return 0;
    return Math.min(100, Math.round((c.myReps / c.goal) * 100));
  }
  function metaOf(c) {
    if (c.status === "upcoming") return `<span class="soon">Starts in ${c.startsIn} ${c.startsIn === 1 ? "day" : "days"}</span> · ${c.days}-day plan`;
    if (c.status === "ended") return `<span class="ended">Ended</span> · ${fmt(c.myReps)} of ${fmt(c.goal)} reps`;
    return `Day ${c.day} of ${c.days} · ${fmt(c.myReps)} reps`;
  }

  function card(c) {
    const m = exMeta(c.ex), pct = pctOf(c), color = c.status === "ended" ? "var(--text-tertiary)" : "var(--primary)";
    const center = c.status === "upcoming"
      ? `<div class="cx-pct" style="font-size:11px">${c.startsIn}d</div>`
      : `<div class="cx-pct">${pct}%</div>`;
    const role = c.createdByMe ? "owner" : "member";
    return `<div class="mc-card${c.status === "ended" ? " done" : ""}" onclick="location.href='challenge-detail.html?role=${role}'">
      <div class="chalx-ring">${ring({ pct, prog: color, center })}<span class="chalx-ex" style="color:${m.c}">${I(m.i, 11)}</span></div>
      <div class="mc-info">
        <div class="cx-name">${c.n}${c.createdByMe ? ' <span class="taf-badge">OWNER</span>' : ""}</div>
        <div class="cx-meta">${metaOf(c)}</div>
        <div class="mc-bar"><i style="width:${Math.max(pct, 2)}%;background:${c.status === "ended" ? "var(--text-tertiary)" : m.c}"></i></div>
      </div>
      <button class="mc-chat" onclick="event.stopPropagation();Buzzend.alert({icon:'comment',title:'${c.n} · Group chat',message:'Open the challenge group chat to cheer members on and share your progress.'})">${I("comment", 17)}</button>
    </div>`;
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
