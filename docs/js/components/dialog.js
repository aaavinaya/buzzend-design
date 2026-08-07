/* Reusable popup dialog component.
   Include css/components/dialog.css + this file on any screen, then:

     Buzzend.confirm({ title, message, confirmLabel, cancelLabel, danger, icon,
                       onConfirm });
     Buzzend.alert({ title, message, confirmLabel, icon });
     Buzzend.sheet({ title, html });

   Mounts inside the nearest .screen-box (so it stays within the device frame),
   or full-window if none is present. */
(function () {
  function host() {
    return document.querySelector(".screen-box") || document.body;
  }

  function build({ sheet = false, danger = false, icon, title, message, html, closeBtn = true }) {
    const overlay = document.createElement("div");
    overlay.className = "bz-overlay" + (sheet ? " sheet" : "") +
      (host() === document.body ? " fixed" : "");

    const dialog = document.createElement("div");
    dialog.className = "bz-dialog";

    if (sheet) dialog.innerHTML = '<div class="bz-grip"></div>';
    if (closeBtn) {
      const x = document.createElement("button");
      x.className = "bz-close"; x.innerHTML = "✕";
      x.onclick = () => close(overlay);
      dialog.appendChild(x);
    }
    if (icon) {
      const ic = document.createElement("div");
      ic.className = "bz-icon" + (danger ? " danger" : "");
      if (window.Icons && Icons.has(icon)) ic.innerHTML = Icons.svg(icon, 28);
      else ic.textContent = icon; // fallback (e.g. a flag emoji)
      dialog.appendChild(ic);
    }
    if (title) {
      const t = document.createElement("div");
      t.className = "bz-title"; t.textContent = title; dialog.appendChild(t);
    }
    if (message) {
      const m = document.createElement("div");
      m.className = "bz-msg"; m.textContent = message; dialog.appendChild(m);
    }
    if (html) {
      const c = document.createElement("div"); c.innerHTML = html; dialog.appendChild(c);
    }

    overlay.appendChild(dialog);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(overlay); });
    host().appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("open"));
    return { overlay, dialog };
  }

  function close(overlay) {
    overlay.classList.remove("open");
    setTimeout(() => overlay.remove(), 220);
  }

  window.Buzzend = window.Buzzend || {};

  window.Buzzend.confirm = function (opts) {
    const { overlay, dialog } = build(opts);
    const actions = document.createElement("div");
    actions.className = "bz-actions";

    const cancel = document.createElement("button");
    cancel.className = "btn btn-ghost";
    cancel.textContent = opts.cancelLabel || "Cancel";
    cancel.onclick = () => { close(overlay); opts.onCancel && opts.onCancel(); };

    const ok = document.createElement("button");
    ok.className = "btn " + (opts.danger ? "btn-danger" : "btn-primary");
    ok.textContent = opts.confirmLabel || "Confirm";
    ok.onclick = () => { close(overlay); opts.onConfirm && opts.onConfirm(); };

    actions.appendChild(cancel); actions.appendChild(ok);
    dialog.appendChild(actions);
  };

  window.Buzzend.alert = function (opts) {
    const { overlay, dialog } = build(opts);
    const actions = document.createElement("div");
    actions.className = "bz-actions";
    const ok = document.createElement("button");
    ok.className = "btn btn-primary";
    ok.textContent = opts.confirmLabel || "Got it";
    ok.onclick = () => { close(overlay); opts.onConfirm && opts.onConfirm(); };
    actions.appendChild(ok);
    dialog.appendChild(actions);
  };

  window.Buzzend.sheet = function (opts) {
    return build(Object.assign({ sheet: true }, opts));
  };

  /* Dismiss the topmost dialog/sheet. Lets a sheet's own buttons close it before acting —
     a chooser sheet must be gone before whatever it chose appears over the same spot. */
  window.Buzzend.closeTop = function () {
    const all = document.querySelectorAll(".bz-overlay");
    if (all.length) close(all[all.length - 1]);
  };

  // non-dismissible loading dialog → returns a handle with .close()
  window.Buzzend.loading = function (message) {
    const { overlay, dialog } = build({ closeBtn: false, message });
    const sp = document.createElement("div");
    sp.className = "bz-spinner";
    dialog.insertBefore(sp, dialog.firstChild);
    return { close: () => close(overlay) };
  };

  /* Toast — a one-line, self-dismissing nudge.
     Use this, NOT alert(), when the app is only telling the user why something did not
     happen. A dialog demands a tap to acknowledge a fact they can already see (the photo
     they picked is not in the post), which is friction for nothing. Media-selection rules
     are the canonical case. Keep the message to one short clause; anything needing more
     words than a second of reading affords wants a different surface. */
  let toastEl = null, toastTimer = null;
  window.Buzzend.toast = function (message, ms) {
    if (toastTimer) clearTimeout(toastTimer);
    if (toastEl) toastEl.remove();
    const h = host();
    toastEl = document.createElement("div");
    toastEl.className = "bz-toast";
    toastEl.setAttribute("role", "status");
    toastEl.textContent = message;
    h.appendChild(toastEl);
    const node = toastEl;
    toastTimer = setTimeout(() => {
      node.classList.add("out");
      setTimeout(() => { if (node === toastEl) { node.remove(); toastEl = null; } }, 200);
    }, ms || 2000);
  };
})();
