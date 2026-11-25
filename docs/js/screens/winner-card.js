/* Winner card — the automatic CHALLENGE_WIN feed post and everything around it.
   Spec: ios/Buzzend/docs/CHALLENGE_WINNER_DESIGN_PROMPT.md + CHALLENGE_WINNER_RECOGNITION.md §3.2–3.7.

   · card(s)       the feed card: the media card's header + action bar, with a tier panel as the body
   · won(s)        the "You won!" sheet (same container as the Elimination result sheets)
   · shareImg(s)   the 4:5 (1080×1350) "Share your win" image, sized in cqw so the preview = the export
   · trophies(…)   the profile Trophy case strip
   Uses only the winSummary fields from the spec — no rank change, no other winners, no percentile. */
window.WinnerCard = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const W = (k, s, fam) => window.Icons.workout(k, s, fam || "plain");
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const grad = (av) => `linear-gradient(135deg,${av})`;
  const ini = (n) => n.split(/[\s-]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const TIER = { 1: "gold", 2: "silver", 3: "bronze" };
  const ORD = { 1: "1st", 2: "2nd", 3: "3rd" };
  const EXN = { squat: "Squats", pushup: "Push-ups", situp: "Sit-ups", steps: "Steps", jumping: "Jumping Jacks", burpee: "Burpees", highknee: "High Knees" };
  const AUD = { public: ["globe", "Public"], followers: ["users", "Followers"], friends: ["user-check", "Friends"] };

  /* ── the 8 samples from the brief ── */
  const SAMPLES = [
    { id: "w1", tag: "Gold, classic", name: "Asha Rai", av: "#e6a06a,#c9743a", t: "2h", aud: "public", title: "30-Day Squat Sprint",
      cover: "linear-gradient(150deg,#3a6b4a,#173a2e)", ex: "squat", mode: "SINGLE", type: "STANDARD", place: 1,
      total: 1234, members: 167, days: 30, range: "Nov 1–30", prize: "$50 gift card", likes: 24, liked: true, posted: true },
    { id: "w2", tag: "Silver", name: "Ben Carter", av: "#6a8caf,#33566f", t: "5h", aud: "followers", title: "Push-up Ladder",
      ex: "pushup", mode: "SINGLE", type: "STANDARD", place: 2, total: 980, members: 58, days: 14, range: "Nov 10–23", likes: 9, posted: true },
    { id: "w3", tag: "Bronze, steps", name: "Priya Shah", av: "#57d9a3,#2f9e78", t: "1d", aud: "friends", title: "Weekend Step Rush",
      ex: "steps", mode: "SINGLE", type: "STANDARD", place: 3, total: 48210, members: 312, days: 3, range: "Nov 21–23", prize: "Buzzend T-shirt", likes: 41, posted: true },
    { id: "w4", tag: "Random draw", name: "Liam O'Neill", av: "#b78ad9,#7d54a4", t: "3h", aud: "public", title: "Jumping Jack January",
      ex: "jumping", mode: "SINGLE", type: "STANDARD", place: 1, draw: true, total: 640, members: 89, days: 31, range: "Jan 1–31", prize: "Gym voucher", likes: 15, posted: true },
    { id: "w5", tag: "Multi-workout", name: "Sofia Martínez", av: "#d98fb0,#a4477a", t: "6h", aud: "public", title: "Total Body Trio",
      mode: "MULTI", workouts: ["squat", "pushup", "situp"], type: "STANDARD", place: 1, total: 2145, members: 40, days: 21, range: "Nov 3–23", likes: 33, posted: true },
    { id: "w6", tag: "Elimination", name: "Kenji Tanaka", av: "#6ab0d9,#3a7fa4", t: "8h", aud: "public", title: "Burpee Survivor",
      cover: "linear-gradient(150deg,#7a3a5a,#3a1e2e)", ex: "burpee", mode: "SINGLE", type: "ELIMINATION", place: 1,
      total: 1050, members: 120, days: 14, range: "Nov 10–23", prize: "$100", likes: 87, posted: true },
    { id: "w7", tag: "Private challenge", name: "Maya Gurung", av: "#caa6c9,#9a5e96", t: "1h", aud: "private", title: "Office Squad Squats",
      ex: "squat", mode: "SINGLE", type: "STANDARD", place: 1, total: 860, members: 9, days: 7, range: "Nov 17–23", prize: "Team lunch", likes: 5, posted: true },
    { id: "w8", tag: "Tie + edge case", name: "Alexandria Konstantinopoulou-Smith", av: null, t: "12m", aud: "public",
      title: "The Ultimate 60-Day High Knees Cardio Marathon Challenge", ex: "highknee", mode: "SINGLE", type: "STANDARD", place: 1, tie: true,
      total: 1234567, members: 2400, days: 60, range: "Sep 25–Nov 23", likes: 0, posted: true },
  ];
  const BY = {}; SAMPLES.forEach((s) => { BY[s.id] = s; });
  const LIKE = {}; SAMPLES.forEach((s) => { LIKE[s.id] = { likes: s.likes, liked: !!s.liked }; });
  let viewer = "other";                                // "other" | "winner" — drives the ⋯ menu and the share sheet title

  const tierOf = (s) => s.draw ? "gold" : TIER[s.place];
  const ribbon = (s) => s.draw ? "DRAWN WINNER" : `${ORD[s.place].toUpperCase()} PLACE`;
  const elim = (s) => s.type === "ELIMINATION";
  const unit = (s) => s.ex === "steps" ? "steps" : s.mode === "MULTI" ? "combined reps" : s.mode === "FULL_BODY" ? "total reps" : "reps";
  const daysTxt = (n) => `${n} day${n === 1 ? "" : "s"}`;
  const sizeCls = (v) => v.length > 9 ? "xl" : v.length > 7 ? "l" : "";

  /* ═════════ the feed card ═════════ */
  function confetti() {   // fixed positions, measured from the panel's corners (see the spec table)
    const sp = (cls, st) => `<i class="sp ${cls}" style="${st}">${I("sparkles", 14)}</i>`;
    return `<div class="wc-cf" aria-hidden="true">
      ${sp("", "left:12px;top:12px")}<i class="d" style="left:34px;top:27px"></i><i class="b k" style="left:15px;top:41px;transform:rotate(-30deg)"></i>
      <i class="d s" style="left:52px;top:12px"></i>
      ${sp("sm", "right:16px;top:14px")}<i class="d s" style="right:38px;top:10px"></i><i class="b" style="right:13px;top:36px;transform:rotate(35deg)"></i>
      <i class="d k" style="right:44px;top:33px"></i>
      <i class="d s" style="left:10px;top:118px"></i><i class="b" style="left:20px;top:150px;transform:rotate(60deg)"></i>
      ${sp("sm", "right:12px;top:116px")}<i class="d k" style="right:24px;top:150px"></i></div>`;
  }
  /* The post is made automatically, so the header is the CHALLENGE (cover · title · "2h ◍ · Challenge
     results"), never the winner — a winner seeing their own name as the author would think they had
     posted it. The winner is the subject of the panel instead. */
  function header(s) {
    const meta = s.aud === "private" ? `${I("lock", 11)}<span class="fix">&nbsp;Challenge members</span>`
      : `${I(AUD[s.aud][0], 11)}<span class="ell">&nbsp;·&nbsp;Challenge results</span>`;
    return `<div class="wc-h">${cover(s)}
      <div class="wc-who"><div class="n">${s.title}</div><div class="t">${s.t}&nbsp;${meta}</div></div>
      <button class="wc-mm" onclick="event.stopPropagation();WinnerCard.menu('${s.id}')" aria-label="More">${I("more", 18)}</button></div>`;
  }
  function chips(s) {
    const c = [];
    if (s.mode === "MULTI") s.workouts.forEach((k) => c.push(`<span class="wc-chip">${W(k, 16)}${EXN[k]}</span>`));
    if (s.mode === "FULL_BODY") c.push(`<span class="wc-chip">${I("target", 12)} Full Body</span>`);
    if (elim(s)) c.push(`<span class="wc-chip">${I("target", 12)} Elimination</span>`);
    return c.length ? `<div class="wc-chips">${c.join("")}</div>` : "";
  }
  function panel(s) {
    const v = fmt(s.total), me = viewer === "winner";
    const hav = s.av ? `<div class="wc-hav" style="background-image:${grad(s.av)}"></div>` : `<div class="wc-hav ini">${ini(s.name)}</div>`;
    const crown = s.place === 1 && !s.draw ? `<span class="wc-crown" aria-hidden="true">${I("crown", 26)}</span>` : "";
    return `<div class="wc-panel wc-${tierOf(s)}">${confetti()}
      <div class="wc-ribrow"><span class="wc-rib">${ribbon(s)}</span>${s.tie ? `<span class="wc-chip">Tied</span>` : ""}</div>
      <div class="wc-hero" onclick="event.stopPropagation();WinnerCard.profile('${s.id}')">${crown}${hav}<span class="wc-trophy">${I("trophy", 14)}</span></div>
      <div class="wc-nm" onclick="event.stopPropagation();WinnerCard.profile('${s.id}')">${me ? "You" : s.name}</div>
      <div class="wc-tt">${s.draw ? (me ? "were drawn in" : "drawn in") : "won"} “<b>${s.title}</b>”</div>
      ${chips(s)}
      <div class="wc-stats">
        <div class="wc-st"><div class="v ${sizeCls(v)}">${v}</div><div class="k">${unit(s)}</div></div>
        <div class="wc-st"><div class="v ${sizeCls("of " + fmt(s.members))}"><small>of</small>${fmt(s.members)}</div><div class="k">${elim(s) ? "started" : "members"}</div></div>
        <div class="wc-st"><div class="v">${s.days}</div><div class="k">${elim(s) ? "days survived" : s.days === 1 ? "day" : "days"}</div></div></div>
      ${s.prize ? `<div class="wc-prize">${I("medal", 15)}<span>Prize: <b>${s.prize}</b></span></div>` : ""}
    </div>`;
  }
  function cover(s) {   // challenge cover, else the workout art, else a trophy (Multi / Full Body)
    if (s.cover) return `<span class="wc-cov" style="background:${s.cover}"></span>`;
    if (s.mode === "SINGLE") return `<span class="wc-cov">${W(s.ex, 30, "real")}</span>`;
    return `<span class="wc-cov" style="color:var(--primary)">${I("trophy", 18)}</span>`;
  }
  function bar(s) {
    const st = LIKE[s.id];
    return `<div class="pa" onclick="event.stopPropagation()">
      <button class="pa-act love${st.liked ? " loved" : ""}" onclick="WinnerCard.like('${s.id}')" aria-label="Love">${I("heart", 20)}<span class="cnt${st.likes ? "" : " off"}">${st.likes || 0}</span></button>
      <button class="pa-act pa-icon" onclick="WinnerCard.share('${s.id}')" aria-label="Share">${I("share", 20)}</button>
      <button class="pa-react${st.likes ? "" : " off"}" onclick="WinnerCard.likers('${s.id}')" aria-label="See who loved">${I("heart", 14)}</button></div>`;
  }
  function card(s) {
    return `<div class="wc-card" data-wc="${s.id}" onclick="WinnerCard.open('${s.id}')">
      ${header(s)}${panel(s)}
      ${bar(s)}</div>`;
  }
  function repaint(id) {
    document.querySelectorAll(`[data-wc="${id}"]`).forEach((el) => { el.outerHTML = card(BY[id]); });
  }

  /* ── interactions ── */
  function like(id) { const st = LIKE[id]; st.liked = !st.liked; st.likes += st.liked ? 1 : -1; repaint(id); }
  function likers(id) { window.Buzzend.toast(`Opens “Loved by” (${LIKE[id].likes})`, 1800); }
  function open(id) { window.Buzzend.toast(`Opens “${BY[id].title}” · challenge detail`, 2000); }
  function profile(id) { window.Buzzend.toast(`Opens ${BY[id].name}'s profile`, 1800); }
  function menu(id) {
    const s = BY[id], row = (ic, t, fn, cls) => `<button class="cf-pm ${cls || ""}" onclick="Buzzend.closeTop();${fn}">${I(ic, 18)} ${t}</button>`;
    let rows;
    if (viewer !== "winner") rows = row("flag", "Report post", "Buzzend.alert({icon:'flag',title:'Reported',message:'Thanks. Our team will review this post.'})");
    else if (s.aud === "private") rows = row("trash", "Delete post", `WinnerCard.del('${id}')`, "danger");   // members decide who sees it
    else rows = row(AUD[s.aud][0], `Change audience <span style="margin-left:auto;font-weight:700;color:var(--text-tertiary)">${AUD[s.aud][1]}</span>`, `WinnerCard.audience('${id}')`)
      + row("trash", "Delete post", `WinnerCard.del('${id}')`, "danger");
    window.Buzzend.sheet({ html: `<div class="cf-pmenu">${rows}</div>` });
  }
  function audience(id) {
    const s = BY[id];
    const rows = Object.keys(AUD).map((k) => `<button class="cf-pm" onclick="Buzzend.closeTop();WinnerCard.setAud('${id}','${k}')">${I(AUD[k][0], 18)} ${AUD[k][1]}
      ${s.aud === k ? `<span style="margin-left:auto;color:var(--primary)">${I("check", 18)}</span>` : ""}</button>`).join("");
    window.Buzzend.sheet({ title: "Who can see this post", html: `<div class="cf-pmenu">${rows}</div>` });
  }
  function setAud(id, k) { BY[id].aud = k; repaint(id); }
  function del(id) {
    window.Buzzend.confirm({ icon: "trash", danger: true, title: "Delete this post?", confirmLabel: "Delete",
      message: "It won't be posted again. Your trophy stays on your profile.",
      onConfirm: () => window.Buzzend.toast("Post deleted", 1600) });
  }

  /* ═════════ "Share your win" — the image + the existing share popup ═════════ */
  function wsConfetti() {
    const sp = (st) => `<i class="sp" style="${st}">${I("sparkles", 14)}</i>`;
    return `<div class="ws-cf" aria-hidden="true">${sp("left:6cqw;top:6cqw")}<i class="d" style="left:15cqw;top:15cqw"></i>
      <i class="b k" style="left:7cqw;top:22cqw;transform:rotate(-30deg)"></i><i class="d k" style="left:22cqw;top:7cqw"></i>
      ${sp("right:7cqw;top:9cqw;width:3.6cqw;height:3.6cqw")}<i class="d" style="right:16cqw;top:5cqw"></i>
      <i class="b" style="right:6cqw;top:21cqw;transform:rotate(35deg)"></i><i class="d k" style="right:20cqw;top:19cqw"></i>
      <i class="b" style="left:27cqw;top:30cqw;transform:rotate(70deg)"></i><i class="d" style="right:28cqw;top:31cqw;width:1.6cqw;height:1.6cqw"></i></div>`;
  }
  function shareImg(s) {
    const v = fmt(s.total);
    const av = s.av ? `<div class="ws-av" style="background-image:${grad(s.av)}"></div>` : `<div class="ws-av ini">${ini(s.name)}</div>`;
    return `<div class="ws wc-${tierOf(s)}">
      <div class="ws-head">${wsConfetti()}<div class="ws-trophy">${I("trophy", 24)}</div><span class="ws-rib">${ribbon(s)}</span></div>
      ${av}
      <div class="ws-body"><div class="ws-nm">${s.name}</div><div class="ws-won">${s.draw ? "was drawn as a winner of" : "won"}</div><div class="ws-tt">${s.title}</div>
        <div class="ws-st"><div><b class="${v.length > 7 ? "l" : ""}">${v}</b><span>${unit(s)}</span></div>
          <div><b>of ${fmt(s.members)}</b><span>${elim(s) ? "started" : "members"}</span></div>
          <div><b class="l">${s.range}</b><span>${elim(s) ? `${s.days} days survived` : daysTxt(s.days)}</span></div></div></div>
      <div class="ws-foot">${window.Icons.brandMark(24, 7)}<span class="bn">Buzzend</span><span class="sl">Stay active. Stay ahead.</span></div></div>`;
  }
  // Save + Share always; Post only when NO automatic post was made (auto-post off)
  const acts = (s) => `<div class="sc-acts">
      ${s.posted ? "" : `<button class="post" onclick="WinnerCard.act('post')">${I("send", 15)} Post</button>`}
      <button class="save" onclick="WinnerCard.act('save')">${I("download", 15)} Save</button>
      <button class="share" onclick="WinnerCard.act('share')">${I("share", 15)} Share</button></div>`;
  const shareTitle = () => viewer === "winner" ? "Share your win" : "Share this win";
  function share(id, posted) {
    const s = Object.assign({}, BY[id], posted === false ? { posted: false } : {});
    window.Buzzend.sheet({ closeBtn: true, title: shareTitle(), html: `<div class="sc-wrap">${shareImg(s)}${acts(s)}</div>` });
  }
  function act(kind) {
    const m = { post: ["send", "Posted to your feed", "The image is posted as a normal photo post to your profile and the community, with your default audience."],
      save: ["download", "Saved to Photos", "The 1080×1350 image was saved."],
      share: ["share", "Share sheet", "The system share sheet opens with the image (WhatsApp, Instagram, …)."] }[kind];
    window.Buzzend.alert({ icon: m[0], title: m[1], message: m[2] });
  }
  const sharePrev = (s, title) => `<div class="wc-shprev"><div class="bz-grip"></div><div class="ttl">${title || "Share your win"}</div>
    <div class="sc-wrap">${shareImg(s)}${acts(s)}</div></div>`;

  /* ═════════ "You won!" sheet ═════════ */
  function wyConfetti(s) {
    const t = { gold: ["#F6C651", "#DD992A"], silver: ["#C9D0D8", "#8F99A5"], bronze: ["#E6A769", "#C17E40"] }[tierOf(s)];
    const P = [[6, 18, 0, -25, 10], [14, 52, 1, 40, 8], [22, 8, 2, 15, 6], [30, 70, 0, 70, 7], [70, 66, 1, -40, 8], [78, 12, 2, 20, 6],
      [86, 46, 0, 55, 10], [94, 22, 1, -15, 7], [40, 2, 1, 80, 6], [60, 4, 0, -60, 7], [12, 86, 2, 30, 5], [90, 84, 0, -35, 6]];
    const col = [t[0], t[1], "var(--primary)"];
    return `<div class="wy-cf" aria-hidden="true">${P.map(([x, y, c, r, w]) =>
      `<i style="left:${x}%;top:${y}px;width:${w}px;height:${Math.round(w * 0.42)}px;background:${col[c]};transform:rotate(${r}deg);opacity:.85"></i>`).join("")}</div>`;
  }
  function won(s, opts) {
    const o = Object.assign({ posted: true }, opts);
    const st = (b, l) => `<div><b>${b}</b><span>${l}</span></div>`;
    const title = s.draw ? "You won the draw!" : `You won! ${ORD[s.place]} place`;
    const stats = elim(s)
      ? st(s.days, "days survived") + st(fmt(s.total), unit(s)) + st(`of ${fmt(s.members)}`, "started")
      : st(fmt(s.total), unit(s)) + st(`of ${fmt(s.members)}`, "members");
    return `<div class="wy wc-${tierOf(s)}">${wyConfetti(s)}
      <div class="wy-disc">${I("trophy", 32)}</div>
      <div class="t">${title}</div>
      <div class="c">${s.title}</div>
      ${elim(s) ? `<span class="cv-badge gold chip">${I("target", 13)} Elimination</span>` : ""}
      ${s.prize ? `<div class="wy-prize">${I("medal", 14)}<span>Prize: ${s.prize}</span></div>` : ""}
      <div class="wy-st">${stats}</div>
      ${o.posted ? `<div class="wy-feed">${I("sparkles", 16)}<span>Your win is on the community feed</span></div>` : ""}
      <div class="wy-acts"><button class="cd-primary" onclick="Buzzend.closeTop();WinnerCard.share('${s.id}',${o.posted})">${I("share", 18)} Share your win</button>
        <button class="cd-primary ghost" onclick="Buzzend.closeTop()">Done</button></div></div>`;
  }
  const wonPrev = (s, opts) => `<div class="wc-sheetprev" onclick="WinnerCard.openWon('${s.id}',${!(opts && opts.posted === false)})" style="cursor:pointer">
    <div class="bz-grip"></div><button class="x" aria-label="Close">${I("x", 14)}</button>${won(s, opts).replace(/onclick="[^"]*"/g, "")}</div>`;
  function openWon(id, posted) { window.Buzzend.sheet({ html: won(BY[id], { posted }) }); }

  /* ═════════ profile Trophy case ═════════ */
  const TROPHIES = [
    { place: 1, title: "30-Day Squat Sprint", d: "Nov 2026" },
    { place: 2, title: "Push-up Ladder", d: "Oct 2026" },
    { place: 1, title: "Jumping Jack January", d: "Jan 2026", draw: true },
    { place: 3, title: "Weekend Step Rush", d: "Dec 2025" },
    { place: 1, title: "Burpee Survivor", d: "Nov 2025" },
    { place: 2, title: "Plank Week", d: "Oct 2025" },
  ];
  /* A filled trophy in the tier's metal — drawn from 6 shapes (cup, two handles, stem, base, plate) + a
     highlight and a star, one linear gradient each. Ship it as one vector asset tinted per tier, or draw it. */
  const METAL = { gold: ["#FFE594", "#F3BC3A", "#C98912", "#7A4E06"], silver: ["#FBFCFD", "#CDD4DC", "#929CA8", "#4E5661"],
    bronze: ["#F0B98F", "#B97340", "#7A421D", "#4A2208"] };
  function starPts(cx, cy, R, r) {
    const p = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, d = i % 2 ? r : R; p.push((cx + d * Math.cos(a)).toFixed(2) + "," + (cy + d * Math.sin(a)).toFixed(2)); }
    return p.join(" ");
  }
  function trophyArt(tier, sz) {
    const [a, b, c, d] = METAL[tier], g = "wct-" + tier, u = `url(#${g})`;
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
      <path d="M13.5 12H9.5a4.6 4.6 0 0 0 0 9.2h4.5M34.5 12h4a4.6 4.6 0 0 1 0 9.2H34" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M12.5 7h23v11.5a11.5 11.5 0 0 1-23 0z" fill="${u}"/>
      <path d="M17 11v7.2a7 7 0 0 0 3.2 5.9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.2" stroke-linecap="round"/>
      <polygon points="${starPts(24, 17.2, 4.6, 2)}" fill="${d}" fill-opacity=".38"/>
      <path d="M21.2 29.6h5.6l1.1 5.2h-7.8z" fill="${u}"/>
      <rect x="14.5" y="34.6" width="19" height="6.6" rx="2" fill="${u}"/>
      <rect x="19.5" y="36.8" width="9" height="2.2" rx="1.1" fill="${d}" fill-opacity=".35"/></svg>`;
  }
  function trophies(list, more) {
    const tile = (t) => { const tier = t.draw ? "gold" : TIER[t.place];
      return `<button class="tc-t wc-${tier}" onclick="Buzzend.toast('Opens “${t.title}”',1600)">
        <span class="tc-cup">${trophyArt(tier, 46)}</span>
        <span class="tc-tt">${t.title}</span>
        <span class="tc-pl">${t.draw ? "Drawn winner" : ORD[t.place] + " place"}</span>
        <span class="tc-d">${t.d}</span></button>`; };
    return `<div class="tc"><div class="tc-h">${I("trophy", 17)} Trophy case <span class="tc-n">${more ? more : list.length}</span></div>
      <div class="tc-row">${list.map(tile).join("")}${more ? `<div class="tc-more"><span class="tc-spin"></span></div>` : ""}</div></div>`;
  }
  function profileMock(who, list, more) {
    const p = who === "me" ? { n: "Asha Rai", s: "Your profile", av: "#e6a06a,#c9743a" } : { n: "Ben Carter", s: "@bencarter · Following", av: "#6a8caf,#33566f" };
    return `<div class="wc-prof">
      <div class="wc-pfmini"><div class="wc-av" style="background-image:${grad(p.av)}"></div><div><div class="n">${p.n}</div><div class="s">${p.s}</div></div></div>
      <div class="wc-pfstats"><div><b>184</b><span>Following</span></div><div><b>1.2K</b><span>Followers</span></div><div><b>27</b><span>Challenges</span></div><div><b>12</b><span>Day streak</span></div></div>
      ${list.length ? trophies(list, more) : ""}
      <div class="wc-tabs"><span class="on">Stats</span><span>Posts</span><span>Challenges</span></div></div>`;
  }

  /* ═════════ feed context: photo post → Winner card → Activity card ═════════ */
  function photoPost() {
    return `<div class="cf-card">
      <div class="cf-card-h"><div class="av" style="background-image:${grad("#b78a5a,#7a5326")}"></div>
        <div class="who"><div class="nm"><b>Gaurab Rana</b></div><div class="t">1h ${I("globe", 11)} · posted a photo</div></div>
        <button class="mm">${I("more", 18)}</button></div>
      <div class="cf-card-media" style="background:linear-gradient(160deg,#3a6b4a,#1e3a2a)"><div class="cap">Morning grind, done.</div></div>
      <div class="pa"><button class="pa-act love">${I("heart", 20)}<span>18</span></button><button class="pa-act pa-icon">${I("share", 20)}</button>
        <button class="pa-react">${I("heart", 14)}</button></div></div>`;
  }
  function activityCard() {
    const row = (k, n) => `<div class="vb-row cv-ex ${k}"><span class="vb-ei">${W(k, 22, "real")}</span><span class="en">${EXN[k]}</span><span class="er">${n}<small>reps</small></span></div>`;
    return `<div class="vb-card">
      <div class="vb-top"><span class="cv-av" style="width:52px;height:52px;font-size:15px;background-image:${grad("#6a8caf,#33566f")}">JR</span>
        <div class="vb-who"><div class="n">Jordan Rivera<span class="tm"> · 3h</span></div><div class="s">Completed a 3-exercise session</div></div>
        <div class="vb-tot"><div class="v">70</div><div class="k">TOTAL REPS</div></div></div>
      ${row("pushup", 30)}${row("squat", 25)}${row("situp", 15)}
      <div class="pa"><button class="pa-act love">${I("heart", 20)}<span>12</span></button><button class="pa-react">${I("heart", 14)}</button></div></div>`;
  }

  /* ═════════ spec sheet ═════════ */
  function spec() {
    const sw = (c) => `<span class="wc-sw" style="background:${c}"></span>`;
    return `<div class="wc-spec">
      <h3>${I("info", 16)} Card shell (the media card's layout)</h3>
      <table><tr><th>Part</th><th>Value</th></tr>
        <tr><td>Card</td><td>surface · 1px border · radius 20 · card shadow · 14 top/bottom padding · 14 gap between cards. Width = screen − 32.</td></tr>
        <tr><td>Header = the challenge</td><td>The post is automatic, so it never shows the winner as its author. 18 left padding · <b>challenge cover 38 × 38, radius 10</b> (a rounded square, so it never reads as a person; no cover → the workout art 30 on surface-alt, Multi / Full Body → trophy 18 in primary) · gap 10 · <b>challenge title</b> 13.5 / 800, 1 line · line 2: 11.5 / 700 tertiary, <code>2h ◍ · Challenge results</code> (glyph 11). ⋯ 17 icon in a 44 target. Tapping the header (or anywhere on the card) opens the challenge.</td></tr>
        <tr><td>Line 2 variants</td><td>Private: <code>2h 🔒 Challenge members</code> (lock glyph 11, no emoji). Truncates at the end.</td></tr>
        <tr><td>Action bar</td><td>The shared bar (iOS <code>CommunityActionBar</code>, inset 8, share shown): divider · ♡ + count · ↗ · spacer · “who loved” red circle 30 (hidden at 0 likes, slot kept). <b>No view count.</b></td></tr>
        <tr><td>No “View challenge” row</td><td>The header is the challenge now, so the bar sits 10 below the panel, as on the media card.</td></tr></table>

      <h3>${I("trophy", 16)} Celebration panel</h3>
      <table><tr><th>Part</th><th>Value</th></tr>
        <tr><td>Panel</td><td>11 below the header · 14 side margins · radius 16 · padding 16 / 14 / 14 · linear gradient 160° from t1 to t2 · centred. One radial white bloom (55% → 0) 220 × 150 centred 30 from the top, behind the avatar.</td></tr>
        <tr><td>Confetti</td><td>Static, corners only. Sparkle (4-point star, white) 14 at (12, 12) and 10 at (right 16, 14) and (right 12, 116). Dots 6 (white 75%) / 4 (white 60%) / 6 ink 16%. Bars 11 × 4 radius 2, white 70% or ink 14%, rotated −30° to 60°. Exact list in <code>winner-card.js › confetti()</code>.</td></tr>
        <tr><td>Ribbon</td><td>Height 24 · padding 0 17 · ribbon fill (gold / silver: the ink; bronze: cream #FFE2C6) · notched ends 7 deep (6-point path) · 11 / 900, tracking 1.4, ribbon-text colour. <code>1ST PLACE</code> · <code>2ND PLACE</code> · <code>3RD PLACE</code> · <code>DRAWN WINNER</code>.</td></tr>
        <tr><td>Chips</td><td>Height 22 · pill · white 55% (bronze: black 20%) · ink 10.5 / 900 · icon 12 (workout art 16). <code>Tied</code> sits right of the ribbon (gap 6). Workout chips (Multi, 2–4), <code>Full Body</code> and <code>Elimination</code> sit in a row 9 below the title.</td></tr>
        <tr><td>Avatar</td><td>72 · 22 below the ribbon · white 3 + tier ring 2.5 · shadow 0 8 18 black 18%. No photo: initials 24 / 900 ink on white 75% (bronze: #4A2208 on #FFE2C6). Tapping the photo or the name opens the winner's profile.</td></tr>
        <tr><td>Crown (1st only, not draws)</td><td>Lucide <code>crown</code> 26, centred, top −21 over the ring · fill #FFF4D2 · stroke ink 1.8.</td></tr>
        <tr><td>Trophy disc</td><td>28 · ribbon fill · trophy 14 in ribbon-text colour · 2.5 white border · offset right −6, bottom −5.</td></tr>
        <tr><td>Name / title</td><td>Name 18 / 900, 13 below the avatar, 1 line. <b>On the winner's own card the name reads <code>You</code></b> (draw: <code>You</code> / <code>were drawn in “…”</code>). Title line 13.5 / 700 with the title in 900, 2 lines max then “…”. <code>won “…”</code> / <code>drawn in “…”</code>.</td></tr>
        <tr><td>Stats strip</td><td>13 below · glass (white 42%; bronze: black 20%) · radius 12 · padding 9 · 3 equal cells, ink 16% dividers. Value 18 / 900 tabular (15 when it is over 7 characters, 13.5 over 9) · “of” 12 / 800 · label 10.5 / 800.</td></tr>
        <tr><td>Prize</td><td>Only when set. 8 below · glass · radius 12 · padding 9 / 12 · medal 15 · <code>Prize: <b>…</b></code> 13 / 700 + 900 · wraps.</td></tr></table>

      <h3>${I("star", 16)} Tiers (text passes WCAG AA on the darker stop)</h3>
      <table><tr><th>Tier</th><th>t1 → t2</th><th>Ink (text)</th><th>Ribbon</th><th>Ring</th></tr>
        <tr><td>Gold (1st, draw)</td><td>${sw("#F6C651")}#F6C651 → ${sw("#DD992A")}#DD992A</td><td>${sw("#4A3300")}#4A3300 · 4.9:1</td><td>#FFE7A6 on #4A3300</td><td>#B7791A</td></tr>
        <tr><td>Silver (2nd)</td><td>${sw("#E3E8EE")}#E3E8EE → ${sw("#AEB7C1")}#AEB7C1</td><td>${sw("#2B323B")}#2B323B · 6.4:1</td><td>#EEF1F5 on #2B323B</td><td>#77808C</td></tr>
        <tr><td>Bronze (3rd)</td><td>${sw("#9E6038")}#9E6038 → ${sw("#5E3216")}#5E3216</td><td>${sw("#FFF1E2")}#FFF1E2 · 4.5:1</td><td>#4A2208 on #FFE2C6</td><td>#E6A769</td></tr></table>
      <p>The brief's gold ink <code>#5A3D00</code> is only 4.1:1 on <code>#DD992A</code>, so the panel uses <code>#4A3300</code>. The ring is the deeper badge tone (#B7791A etc.) because #E8B23E disappears on a gold panel. The panel keeps the same colours in dark mode.</p>
      <p><b>Bronze is a dark copper with light text.</b> The first bronze (#E6A769 → #C17E40) sat right next to gold's darker stop and read as gold in the feed. A darker bronze can't carry dark text (it drops under 4.5:1), so bronze flips to cream text, a cream ribbon and a darker strip. Its light behind the avatar is warmer and shorter (110) so it stays off the name.</p>

      <h3>${I("sparkles", 16)} “You won!” sheet</h3>
      <ul><li>The Elimination result-sheet container (bottom sheet, grip, ✕). Confetti: 12 bars (tier t1 / t2 + primary) in the top 120.</li>
        <li>Trophy disc 72 in the tier gradient, ink trophy 32, 4 surface + 2 tier rings. Title 22 / 900 (<code>You won! 1st place</code> · <code>You won the draw!</code>). Challenge 14.5 / 800 secondary.</li>
        <li>Prize row (gold tint, as the Winners card). Stat box: score · of N (Elimination: days survived · score · of N started).</li>
        <li><code>Your win is on the community feed</code> with sparkles, on a primary 9% row — only when the post exists. Then <b>Share your win</b> (primary) and <b>Done</b> (ghost), both full width, 52 high.</li></ul>

      <h3>${I("share", 16)} Share your win (image)</h3>
      <ul><li><b>4:5, 1080 × 1350</b>, the same size as “Share your day”. In a WhatsApp chat it shows whole; on an Instagram story it sits centred.</li>
        <li>Always the same colours (it is an image): cream #FFFDF7 body, tier header (top 40%) with a curved edge, confetti, trophy disc, ribbon.</li>
        <li>Avatar 25% of the width over the header edge · name · “won” · the title (2 lines) · stats strip: score · of N members · date range (days under it) · Buzzend footer (mark + wordmark + “Stay active. Stay ahead.”).</li>
        <li>Actions: <b>Save · Share</b>. <b>Post</b> appears first only when no automatic post was made.</li></ul>

      <h3>${I("trophy", 16)} Trophy case</h3>
      <ul><li>Between the stats and the tabs. Hidden at 0 wins, on blocked profiles and on the brand page.</li>
        <li>Title row: trophy 17 (gold #DD992A) · <code>Trophy case</code> 15 / 900 · count in a small grey pill (11.5 / 800, surface-alt).</li>
        <li><b>The trophy carries the place</b>: a gold, silver or bronze cup, not a 1 / 2 / 3 number. Filled vector trophy 46 (cup, handles, stem, base, plate, a white highlight and a faint star), one gradient per metal — gold #FFE594 → #F3BC3A → #C98912, silver #FBFCFD → #CDD4DC → #929CA8, bronze #F0B98F → #B97340 → #7A421D. It sits on a 60 circle tinted with the same metal (gold #FCEBC2 · silver #E4E8EE · bronze #F4DCC8, lighter in the middle). A draw uses the gold cup.</li>
        <li>Tile 104 wide · surface · 1px border · radius 16 · padding 12 / 9 / 11 · centred · title 12.5 / 800, 2 lines (height kept) · place in words 11 / 900 in the metal's dark tone (<code>1st place</code> #8A5A0C · <code>2nd place</code> #5B6470 · <code>3rd place</code> #8A4B22 · <code>Drawn winner</code>; dark mode uses the light tones) · month 11 / 700 tertiary.</li>
        <li>Newest first, scrolls sideways, 10 apart, 16 edge padding; loads more at the end (a spinner tile while it loads).</li></ul>

      <h3>${I("flag", 16)} Decisions made here (tell me to change any)</h3>
      <ul><li><b>The post comes from the challenge</b>, not from the winner, so nobody sees themselves as the author of something they didn't post. The winner reads <b>You</b> on their own card.</li>
        <li><b>The trophy disc is a badge on the avatar</b>, as on the in-app Winners card champion, not a separate row above the ribbon. That saves about 50 pt of height.</li>
        <li><b>The action bar is the shared feed bar</b>: Share sits next to the heart and the “who loved” circle is on the right, as on every other card.</li>
        <li><b>The ⋯ menu for people who aren't the winner</b> has <b>Report post</b> only. The menu has no link to copy, because Share shares the image, not a post link.</li>
        <li><b>Share from someone else's card</b> opens the same image with the title <b>Share this win</b>. The winner sees <b>Share your win</b>.</li>
        <li><b>The share image is 4:5</b>, not 9:16, to match the existing share popup.</li>
        <li><b>A random draw gets no crown</b>, because it isn't a 1st place.</li></ul>
    </div>`;
  }

  /* ═════════ page — one section at a time (tabs in a sticky bar), each scrolls down ═════════ */
  const lbl = (n, t, sub) => `<div class="wc-lbl">${n ? `<b>#${n}</b>` : ""}${t}${sub ? `<span>· ${sub}</span>` : ""}</div>`;
  const item = (body, label, cls) => `<div class="wc-item ${cls || ""}">${label || ""}${body}</div>`;
  const TABS = [
    ["feed", "In the feed"], ["samples", "Winner card · 8 samples"], ["won", "“You won!” sheet"],
    ["share", "Share your win"], ["trophy", "Trophy case"], ["spec", "Build spec"],
  ];
  const sec = (id, title, desc, body) => `<section class="wc-sec" data-s="${id}">
    <div class="wc-sech"><h2>${title}</h2><p>${desc}</p></div>${body}</section>`;

  function page() {
    const dp = document.documentElement.getAttribute("data-palette") || "teal";
    const dark = (html) => `<div class="wc-dark" data-theme="dark" data-palette="${dp}">${html}</div>`;
    // each sample: light and dark side by side
    const pairs = SAMPLES.map((s, i) => `<div class="wc-pair">${lbl(i + 1, s.tag, s.name.split(" ")[0])}
      <div class="wc-cols">${item(`<div class="cv-panel wc-tile">${card(s)}</div>`, `<div class="wc-mode">Light</div>`)}
        ${item(dark(`<div class="cv-panel wc-tile">${card(s)}</div>`), `<div class="wc-mode">Dark</div>`)}</div></div>`).join("");
    return `<div class="wc-page" id="wcCanvas">
      <div class="wc-top"><div class="wc-topin">
        <div class="wc-row1"><a href="../../index.html" class="wc-back">${I("back", 18)}</a><h1>Winner card</h1>
          <button class="theme-toggle wc-themebtn" onclick="toggleTheme()">🌙 Dark</button></div>
        <div class="wc-tabsnav" id="wcTabs">${TABS.map(([k, t]) => `<button data-t="${k}">${t}</button>`).join("")}</div>
        <div class="wc-ctrls">
          <div><span class="lab">Phone width</span><span class="wc-seg" id="wcW"><button class="on" data-w="343">375 pt</button><button data-w="398">430 pt</button></span></div>
          <div><span class="lab">Viewing as</span><span class="wc-seg" id="wcV"><button class="on" data-v="other">Someone else</button><button data-v="winner">The winner</button></span></div>
        </div></div></div>

      ${sec("feed", "In the feed", "A photo post, then the Winner card, then an Activity card. It stands out, but keeps the same header layout, radius and action bar as the other cards.",
        `<div class="wc-cols">${item(`<div class="cv-panel mx-feed boxed">${photoPost()}${card(SAMPLES[0])}${activityCard()}</div>`)}
          ${item(`<div class="wc-howto"><b>Try it</b><ul>
            <li>The post comes from the <b>challenge</b> (cover and title on top), not from the winner, because nobody posted it by hand.</li>
            <li>Tap the card or its header to open the challenge. Tap the winner's photo or name to open their profile.</li>
            <li>Switch <b>Viewing as</b> to <b>The winner</b>: their own card says <b>You</b> instead of their name.</li>
            <li>Tap ♡ to love it, and <b>Share</b> to open the share image.</li>
            <li><b>⋯</b> changes with <b>Viewing as</b> at the top: the winner gets Change audience and Delete, everyone else gets Report post.</li></ul></div>`)}</div>`)}

      ${sec("samples", "Winner card · 8 samples", "Every case from the brief, in light and dark. Gold, silver, bronze and the draw differ by the ribbon text, not only by colour. The panel keeps its tier colours in dark mode.", pairs)}

      ${sec("won", "“You won!” sheet", "Shown once to the winner, the first time they open the challenge after results are final. Tap a preview to open it as a live sheet.",
        `<div class="wc-cols">
          ${item(wonPrev(SAMPLES[0]), lbl(0, "1st place, prize, post made"))}
          ${item(wonPrev(SAMPLES[3]), lbl(0, "Random draw"))}
          ${item(wonPrev(SAMPLES[5]), lbl(0, "Elimination win"))}
          ${item(wonPrev(SAMPLES[1], { posted: false }), lbl(0, "2nd place, no prize, auto-post off", "no feed line"))}
          ${item(dark(wonPrev(SAMPLES[0])), lbl(0, "Dark mode"))}</div>`)}

      ${sec("share", "Share your win", "The existing share popup with a new title. It shows a 1080 × 1350 (4:5) image. Post appears only when no automatic post was made.",
        `<div class="wc-cols">
          ${item(sharePrev(SAMPLES[0]), lbl(0, "Auto post made", "Save · Share"))}
          ${item(sharePrev(Object.assign({}, SAMPLES[1], { posted: false })), lbl(0, "No auto post", "Post · Save · Share"))}
          ${item(shareImg(SAMPLES[3]), lbl(0, "Random draw"))}
          ${item(shareImg(SAMPLES[5]), lbl(0, "Elimination"))}
          ${item(shareImg(SAMPLES[7]), lbl(0, "No photo, long name and title"))}
          ${item(`<div class="wc-thumbs"><div style="width:120px">${shareImg(SAMPLES[0])}<div class="cap">120 px</div></div><div style="width:86px">${shareImg(SAMPLES[2])}<div class="cap">86 px</div></div></div>`,
            lbl(0, "As a small thumbnail", "the tier, ribbon and face still read"))}</div>`)}

      ${sec("trophy", "Trophy case", "On the profile, between the stats and the tabs. Newest first; tap a tile to open that challenge.",
        `<div class="wc-cols">
          ${item(profileMock("me", TROPHIES.slice(0, 3)), lbl(0, "Your profile · 3 wins"))}
          ${item(profileMock("me", TROPHIES, 14), lbl(0, "Many wins", "more load at the end"))}
          ${item(profileMock("other", [TROPHIES[1], TROPHIES[3]]), lbl(0, "Someone else's profile", "public wins + private ones you're in"))}
          ${item(profileMock("other", []), lbl(0, "No wins", "the strip is hidden"))}</div>`)}

      ${sec("spec", "Build spec", "Sizes in pt (iOS) and dp (Android). Fonts are Nunito.", `<div class="wc-specwrap">${spec()}</div>`)}
    </div>`;
  }

  function tab(k) {
    if (!TABS.some((t) => t[0] === k)) k = "feed";
    document.querySelectorAll("#wcTabs button").forEach((b) => b.classList.toggle("on", b.dataset.t === k));
    document.querySelectorAll(".wc-sec").forEach((x) => x.classList.toggle("on", x.dataset.s === k));
    const on = document.querySelector(`#wcTabs [data-t="${k}"]`); if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
    try { history.replaceState(null, "", "#" + k); } catch (e) {}
    window.scrollTo(0, 0);
  }

  function start(el) {
    el.innerHTML = page();
    window.Icons.init(el);
    const seg = (id, fn) => document.getElementById(id).addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      document.querySelectorAll(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b)); fn(b);
    });
    seg("wcW", (b) => document.getElementById("wcCanvas").style.setProperty("--cardw", b.dataset.w + "px"));
    seg("wcV", (b) => { viewer = b.dataset.v; SAMPLES.forEach((x) => repaint(x.id)); });
    document.getElementById("wcTabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) tab(b.dataset.t); });
    const p = new URLSearchParams(location.search);
    if (p.get("w") === "430") document.querySelector('#wcW [data-w="398"]').click();
    tab(p.get("tab") || (location.hash || "").slice(1) || "feed");
  }

  return { start, tab, like, likers, open, profile, menu, audience, setAud, del, share, act, openWon, card, shareImg, won };
})();
