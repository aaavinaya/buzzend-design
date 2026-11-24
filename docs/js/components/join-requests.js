/* ── JoinRequests — the creator's side of "Require approval to join" (iOS ChallengeJoinRequestsView) ──
   · JoinRequests.entry(n, onclick)  the card under the CTA: "Join requests · N waiting for your review" +
                                     a count pill + chevron. Render it only when n > 0.
   · JoinRequests.open(list, opts)   the queue as a bottom sheet: oldest first, one user card per request
                                     with Reject / Approve; "No pending requests" when empty.
   list: [{ id, name, username, av }] — opts.onChange(list, req, approved) fires after each approve / reject
   so the caller can update its count.
   Private challenges (up to 10 members): opts.room() returns the places left (Infinity = no limit) and
   opts.name is the challenge name. While it's full the header reads "Full · N waiting", Approve opens
   "This challenge is full" (the request stays pending), and "Approve all" approves only what fits.
   Viewer-side states (Request to join → Requested — waiting for approval + Cancel) live in each detail
   screen's CTA. */
window.JoinRequests = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  const grad = (av) => `linear-gradient(135deg,${av})`;
  let cur = null;   // { list, opts, el }

  function entry(n, onclick) {
    return `<button class="jr-entry" onclick="${onclick}">
      <span class="jr-ic">${I("users", 20)}</span>
      <span class="jr-tx"><b>Join requests</b><span>${n} waiting for your review</span></span>
      <span class="jr-n">${n}</span><span class="jr-chev">${I("chevron", 16)}</span></button>`;
  }
  const room = () => cur.opts.room ? cur.opts.room() : Infinity;
  function head() {
    if (!cur.list.length) return "";
    const full = room() <= 0;
    return `<div class="jr-head"><span class="${full ? "full" : ""}">${full ? `${I("lock", 13)} Full · ${cur.list.length} waiting` : `${cur.list.length} waiting`}</span>
      ${cur.list.length > 1 ? `<button class="jr-all" onclick="JoinRequests.approveAll()">Approve all</button>` : ""}</div>`;
  }
  function body() {
    if (!cur.list.length) return `<div class="jr-empty">${I("users", 30)}<b>No pending requests</b>
      <span>When someone asks to join, they'll show up here for you to approve.</span></div>`;
    return head() + cur.list.map((r) => `<div class="jr-row">
      <span class="jr-av" style="background-image:${grad(r.av)}"></span>
      <span class="jr-who"><b>${r.name}</b><span>@${r.username}</span></span>
      <button class="jr-btn" onclick="JoinRequests.act('${r.id}',false)">Reject</button>
      <button class="jr-btn on" onclick="JoinRequests.act('${r.id}',true)">Approve</button></div>`).join("");
  }
  function paint() { if (cur && cur.el) { cur.el.innerHTML = body(); window.Icons.init(cur.el); } }
  function open(list, opts) {
    cur = { list, opts: opts || {} };
    window.Buzzend.sheet({ title: "Join requests", html: `<div class="jr-list">${body()}</div>` });
    const els = document.querySelectorAll(".jr-list");
    cur.el = els[els.length - 1];
  }
  function act(id, approve) {
    const r = cur.list.find((x) => x.id === id);
    if (approve && room() <= 0) { window.PrivateLimit.fullApproveDialog(cur.opts.name); return; }   // stays pending
    cur.list = cur.list.filter((x) => x.id !== id);
    if (cur.opts.onChange) cur.opts.onChange(cur.list, r, approve);   // caller updates its count first…
    paint();                                                          // …so the header can turn "Full"
  }
  // approve as many as fit; the rest stay waiting
  function approveAll() {
    const fit = Math.min(cur.list.length, room());
    if (fit <= 0) { window.PrivateLimit.fullApproveDialog(cur.opts.name); return; }
    const done = cur.list.slice(0, fit), left = cur.list.length - fit;
    cur.list = cur.list.slice(fit);
    done.forEach((r) => cur.opts.onChange && cur.opts.onChange(cur.list, r, true));
    paint();
    window.Buzzend.toast(left ? `Approved ${fit}. The challenge is now full, so ${left} request${left > 1 ? "s are" : " is"} still waiting.` : `Approved ${fit}.`, 3200);
  }
  return { entry, open, act, approveAll };
})();
