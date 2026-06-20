/* ===== Nutterando — UI-Hilfsfunktionen ===== */
(function (global) {
  "use strict";

  // tiny element factory: el("div.card", {onClick}, [children]) or el("p", "text")
  function el(spec, attrs, children) {
    const parts = spec.split(/(?=[.#])/);
    const tag = parts[0] || "div";
    const node = document.createElement(tag);
    parts.slice(1).forEach((p) => {
      if (p[0] === ".") node.classList.add(p.slice(1));
      else if (p[0] === "#") node.id = p.slice(1);
    });
    if (attrs != null && (typeof attrs === "string" || typeof attrs === "number")) {
      node.textContent = String(attrs);
      return node;
    }
    if (Array.isArray(attrs)) { children = attrs; attrs = null; }
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) node.setAttribute(k, "");
        else if (v !== false && v != null) node.setAttribute(k, v);
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
      });
    }
    return node;
  }

  function stars(value, max) {
    max = max || 5;
    const full = Math.round(value);
    const wrap = el("span.stars");
    for (let i = 1; i <= max; i++) {
      const s = el("span", i <= full ? "★" : "☆");
      if (i > full) s.classList.add("empty");
      wrap.appendChild(s);
    }
    return wrap;
  }

  function ratingLine(pid) {
    const r = Store.ratingOf(pid);
    const line = el("span.rating-line");
    line.appendChild(stars(r.avg));
    line.appendChild(el("span", r.count ? `${r.avg.toFixed(1)} (${r.count})` : "Noch keine Bewertung"));
    return line;
  }

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function modal(opts) {
    const root = document.getElementById("modal-root");
    const close = () => { root.innerHTML = ""; };
    const body = typeof opts.body === "string" ? el("p.muted", opts.body) : opts.body;
    const backdrop = el("div.modal-backdrop", { onClick: (e) => { if (e.target === backdrop) close(); } }, [
      el("div.modal", [
        el("h3", opts.title || ""),
        body,
        el("div.modal__actions", (opts.actions || [
          { label: "Schließen", kind: "ghost", onClick: close },
        ]).map((a) =>
          el("button.btn." + (a.kind === "primary" ? "btn--primary" : a.kind === "danger" ? "btn--danger" : "btn--ghost"),
            { onClick: () => { if (a.onClick) a.onClick(close); else close(); } }, a.label)
        )),
      ]),
    ]);
    root.innerHTML = "";
    root.appendChild(backdrop);
    return close;
  }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "gerade eben";
    const m = Math.floor(s / 60); if (m < 60) return `vor ${m} Min.`;
    const h = Math.floor(m / 60); if (h < 24) return `vor ${h} Std.`;
    const d = Math.floor(h / 24); if (d < 30) return `vor ${d} Tg.`;
    return new Date(ts).toLocaleDateString("de-DE");
  }

  function clock(ts) {
    return new Date(ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  global.UI = { el, stars, ratingLine, toast, modal, timeAgo, clock };
})(window);
