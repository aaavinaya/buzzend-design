/* ── PrivateLimit — private challenges hold up to 10 members (the admin included) ──────────────────
   Public challenges have no limit. When support raises it for an account, the challenge has no limit.
   ONLY the challenge's admin ever sees the limit, the "x / 10" counter and the support option; everyone
   else sees a normal private challenge. Nothing is paid — it's always "Contact Buzzend support".

     PrivateLimit.LIMIT                         10
     PrivateLimit.supportUrl(name?, back?)      the Help & Support form, pre-filled (category, subject,
                                                message — no challenge name from the create flow)
     PrivateLimit.contactSupport(name?)         go there
     PrivateLimit.fullApproveDialog(name)       admin approving while full  (Contact Support / Not now)
     PrivateLimit.joinFullDialog()              non-admin joining by link / code while full (OK)
     PrivateLimit.tooManyDialog(n, name, onKeep) Public → Private refused (Contact Support / Keep public) */
window.PrivateLimit = (function () {
  const LIMIT = 10;
  const here = () => location.pathname.split("/").slice(-2).join("/") + location.search;
  function supportUrl(name, back) {
    const msg = name
      ? `Hi Buzzend, I'd like more than 10 members in my private challenge “${name}”. Number of members I need: `
      : "Hi Buzzend, I'd like more than 10 members in my private challenge. Number of members I need: ";
    const q = new URLSearchParams({ cat: "Private challenge", subject: "More members for my private challenge", msg, back: back || here() });
    return "../home/support.html?" + q.toString();
  }
  function contactSupport(name) { location.href = supportUrl(name); }
  function fullApproveDialog(name) {
    window.Buzzend.confirm({ icon: "users", title: "This challenge is full", message: "Remove a member or contact support to add more.",
      confirmLabel: "Contact Support", cancelLabel: "Not now", onConfirm: () => contactSupport(name) });
  }
  function joinFullDialog() {
    window.Buzzend.alert({ icon: "lock", title: "This challenge is full", message: "Ask the challenge admin to make room.", confirmLabel: "OK" });
  }
  function tooManyDialog(n, name, onKeep) {
    window.Buzzend.confirm({ icon: "lock", title: "Too many members for private",
      message: `A private challenge can have up to 10 members. This one has ${n}. Keep it public, or contact support for more.`,
      confirmLabel: "Contact Support", cancelLabel: "Keep public", onConfirm: () => contactSupport(name), onCancel: onKeep });
  }
  return { LIMIT, supportUrl, contactSupport, fullApproveDialog, joinFullDialog, tooManyDialog };
})();
