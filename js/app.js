/* ===== Nutterando — App, Router & Views ===== */
(function () {
  "use strict";
  const { el, stars, ratingLine, toast, modal, timeAgo, clock } = UI;
  const view = document.getElementById("view");

  /* ---------- Boot: age gate ---------- */
  function boot() {
    const gate = document.getElementById("age-gate");
    const shell = document.getElementById("app-shell");
    if (Store.isAgeConfirmed()) {
      shell.hidden = false;
    } else {
      gate.hidden = false;
    }
    document.getElementById("age-confirm").addEventListener("click", () => {
      Store.confirmAge();
      gate.hidden = true;
      shell.hidden = false;
      render();
    });
    setupChrome();
    render();
  }

  /* ---------- Chrome: nav, role switch, hamburger ---------- */
  function setupChrome() {
    // role switch
    const rs = document.getElementById("role-switch");
    rs.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.role === Store.session.role);
      b.addEventListener("click", () => {
        Store.setRole(b.dataset.role);
        rs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        toast(b.dataset.role === "provider" ? "Anbieter:innen-Ansicht aktiv" : "Kunden-Ansicht aktiv");
        render();
      });
    });
    // hamburger
    document.getElementById("hamburger").addEventListener("click", () => {
      document.getElementById("main-nav").classList.toggle("open");
    });
    document.getElementById("main-nav").addEventListener("click", (e) => {
      if (e.target.tagName === "A") document.getElementById("main-nav").classList.remove("open");
    });
    // auto-reply re-render when viewing messages
    window.addEventListener("nutterando:autoreply", () => {
      if (location.hash.startsWith("#/messages")) render();
      updateBadges();
    });
  }

  function updateNav() {
    const path = (location.hash.replace(/^#/, "") || "/").split("?")[0];
    document.querySelectorAll("#main-nav a").forEach((a) => {
      const r = a.getAttribute("data-route");
      a.classList.toggle("is-active", r === path || (r !== "/" && path.startsWith(r)));
    });
  }

  function updateBadges() {
    const badge = document.getElementById("msg-badge");
    badge.hidden = Store.threads().length === 0;
  }

  /* ---------- Router ---------- */
  const routes = [];
  function route(pattern, handler) {
    const keys = [];
    const rx = new RegExp("^" + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return "([^/]+)"; }) + "$");
    routes.push({ rx, keys, handler });
  }

  function render() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, query] = raw.split("?");
    const params = Object.fromEntries(new URLSearchParams(query || ""));
    for (const r of routes) {
      const m = path.match(r.rx);
      if (m) {
        const args = {};
        r.keys.forEach((k, i) => (args[k] = decodeURIComponent(m[i + 1])));
        view.innerHTML = "";
        r.handler(args, params);
        window.scrollTo(0, 0);
        updateNav();
        updateBadges();
        return;
      }
    }
    view.innerHTML = "";
    view.appendChild(emptyState("🤷", "Seite nicht gefunden", "Diese Seite gibt es nicht.", "#/", "Zur Startseite"));
  }

  window.addEventListener("hashchange", render);

  /* ---------- Shared components ---------- */
  function emptyState(em, title, text, href, cta) {
    return el("div.empty", [
      el("span.em", em),
      el("h3", title),
      el("p.muted", text),
      href ? el("a.btn.btn--primary", { href, style: "margin-top:14px" }, cta || "Weiter") : null,
    ]);
  }

  function backLink(href, label) {
    return el("a.back-link", { href }, "← " + (label || "Zurück"));
  }

  function tagRow(items) {
    return el("div.card__tags", items.map((s) => el("span.tag", s)));
  }

  function profileCard(p) {
    const fav = Store.isFavorite(p.id);
    const r = Store.ratingOf(p.id);
    const favBtn = el("button.fav", { title: "Zu Favoriten", html: fav ? "❤️" : "🤍" });
    favBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const on = Store.toggleFavorite(p.id);
      favBtn.innerHTML = on ? "❤️" : "🤍";
      toast(on ? "Zu Favoriten hinzugefügt" : "Aus Favoriten entfernt");
    });

    const card = el("a.card", { href: `#/profile/${p.id}` }, [
      el("div.card__media", { style: "background: radial-gradient(120% 120% at 50% 0%, rgba(255,77,141,.22), rgba(177,92,255,.12) 60%, transparent)" }, [
        el("span", p.avatar),
        favBtn,
        p.verified ? el("span.verified", [el("span.chip-verified", ["✓ Verifiziert"])]) : null,
      ]),
      el("div.card__body", [
        el("div.card__name", [`${p.name}, ${p.age}`]),
        el("div.card__meta", `${p.gender} · ${p.city}`),
        el("div.rating-line", [stars(r.avg), el("span", r.count ? `${r.avg.toFixed(1)} (${r.count})` : "neu")]),
        tagRow(p.services.slice(0, 3)),
        el("div.card__foot", [
          el("span.price", { html: `${p.rate}${p.currency} <span>/ ${p.rateUnit}</span>` }),
          el("span.btn.btn--ghost.btn--sm", "Ansehen"),
        ]),
      ]),
    ]);
    return card;
  }

  /* ---------- View: Home / Discover ---------- */
  route("/", function (_args, params) {
    const all = Store.profiles();

    // Hero
    view.appendChild(el("section.hero", [
      el("h1", "Finde stilvolle Begleitung — diskret & auf Augenhöhe."),
      el("p", "Verifizierte Profile, transparente Bewertungen und sichere Kontaktaufnahme. Nutterando bringt Anbieter:innen und Kund:innen unkompliziert zusammen."),
      el("div.hero__actions", [
        el("a.btn.btn--primary", { href: "#/dashboard" }, "Profil erstellen"),
        el("a.btn.btn--ghost", { href: "#/safety" }, "So funktioniert's sicher"),
      ]),
      el("div.hero__stats", [
        el("div", { html: `<strong>${all.length}</strong> aktive Profile` }),
        el("div", { html: `<strong>${Store.listings().length}</strong> Inserate` }),
        el("div", { html: `<strong>${all.filter((p) => p.verified).length}</strong> verifiziert` }),
      ]),
    ]));

    // Filters
    const f = {
      q: params.q || "", city: params.city || "", service: params.service || "",
      gender: params.gender || "", max: params.max || "", sort: params.sort || "new",
    };

    function opt(label, value) { const o = el("option", label); o.value = value; return o; }
    function buildSelect(name, placeholder, values, current) {
      const sel = el("select", { name });
      sel.appendChild(opt(placeholder, ""));
      values.forEach((v) => sel.appendChild(opt(v, v)));
      sel.value = current;
      return sel;
    }

    const qIn = el("input", { type: "search", placeholder: "Name oder Stichwort…", value: f.q });
    const citySel = buildSelect("city", "Alle Städte", Store.constants.CITIES, f.city);
    const svcSel = buildSelect("service", "Alle Services", Store.constants.SERVICES, f.service);
    const genderSel = buildSelect("gender", "Alle", ["weiblich", "männlich", "divers"], f.gender);
    const maxIn = el("input", { type: "number", min: "0", step: "10", placeholder: "z.B. 200", value: f.max });
    const sortSel = el("select", { name: "sort" }, [opt("Neueste", "new"), opt("Beste Bewertung", "rating"), opt("Preis aufsteigend", "price")]);
    sortSel.value = f.sort;

    const filters = el("section.filters", [
      el("div.field", [el("label", "Suche"), qIn]),
      el("div.field", [el("label", "Stadt"), citySel]),
      el("div.field", [el("label", "Service"), svcSel]),
      el("div.field", [el("label", "Geschlecht"), genderSel]),
      el("div.field", [el("label", "Max. Preis / Std."), maxIn]),
      el("div.field", [el("label", "Sortieren"), sortSel]),
    ]);
    view.appendChild(filters);

    const gridWrap = el("div");
    view.appendChild(gridWrap);

    function apply() {
      let list = Store.profiles();
      const q = qIn.value.trim().toLowerCase();
      if (q) list = list.filter((p) => (p.name + " " + p.tagline + " " + p.about + " " + p.services.join(" ")).toLowerCase().includes(q));
      if (citySel.value) list = list.filter((p) => p.city === citySel.value);
      if (svcSel.value) list = list.filter((p) => p.services.includes(svcSel.value));
      if (genderSel.value) list = list.filter((p) => p.gender === genderSel.value);
      if (maxIn.value) list = list.filter((p) => p.rate <= Number(maxIn.value));
      if (sortSel.value === "rating") list.sort((a, b) => Store.ratingOf(b.id).avg - Store.ratingOf(a.id).avg);
      else if (sortSel.value === "price") list.sort((a, b) => a.rate - b.rate);
      else list.sort((a, b) => b.createdAt - a.createdAt);

      // sync hash (without re-render storm)
      const sp = new URLSearchParams();
      if (qIn.value) sp.set("q", qIn.value);
      if (citySel.value) sp.set("city", citySel.value);
      if (svcSel.value) sp.set("service", svcSel.value);
      if (genderSel.value) sp.set("gender", genderSel.value);
      if (maxIn.value) sp.set("max", maxIn.value);
      if (sortSel.value !== "new") sp.set("sort", sortSel.value);
      history.replaceState(null, "", "#/" + (sp.toString() ? "?" + sp.toString() : ""));

      gridWrap.innerHTML = "";
      gridWrap.appendChild(el("div.section-title", [
        el("h2", "Profile entdecken"),
        el("span.muted", `${list.length} Treffer`),
      ]));
      if (!list.length) {
        gridWrap.appendChild(emptyState("🔍", "Keine Treffer", "Versuch es mit anderen Filtern."));
      } else {
        const grid = el("div.grid");
        list.forEach((p) => grid.appendChild(profileCard(p)));
        gridWrap.appendChild(grid);
      }
    }

    [qIn, citySel, svcSel, genderSel, maxIn, sortSel].forEach((c) => c.addEventListener("input", apply));
    apply();

    // Latest listings
    const listings = Store.listings().slice(0, 6);
    if (listings.length) {
      view.appendChild(el("div.section-title", { style: "margin-top:34px" }, [el("h2", "Neueste Inserate")]));
      const lg = el("div.grid");
      listings.forEach((l) => {
        const p = Store.profile(l.profileId);
        lg.appendChild(el("a.card", { href: `#/profile/${l.profileId}` }, [
          el("div.card__body", [
            el("div.card__meta", `${l.city} · ${l.service} · ${timeAgo(l.createdAt)}`),
            el("div.card__name", l.title),
            el("p.muted", { style: "font-size:.9rem; margin:4px 0" }, l.body),
            el("div.card__foot", [
              el("span.price", { html: `${l.price}€` }),
              p ? el("span.faint", `von ${p.name} ${p.avatar}`) : null,
            ]),
          ]),
        ]));
      });
      view.appendChild(lg);
    }
  });

  /* ---------- View: Profile detail ---------- */
  route("/profile/:id", function (args) {
    const p = Store.profile(args.id);
    if (!p) { view.appendChild(emptyState("🚫", "Profil nicht gefunden", "", "#/", "Zur Übersicht")); return; }
    view.appendChild(backLink("#/", "Alle Profile"));

    const fav = Store.isFavorite(p.id);
    const favBtn = el("button.btn.btn--ghost", { html: fav ? "❤️ Gemerkt" : "🤍 Merken" });
    favBtn.addEventListener("click", () => {
      const on = Store.toggleFavorite(p.id);
      favBtn.innerHTML = on ? "❤️ Gemerkt" : "🤍 Merken";
      toast(on ? "Zu Favoriten hinzugefügt" : "Entfernt");
    });

    const msgBtn = el("button.btn.btn--primary", "✉️ Nachricht senden");
    msgBtn.addEventListener("click", () => {
      const t = Store.openThread(p.id);
      location.hash = `#/messages?t=${t.id}`;
    });

    const reportBtn = el("button.btn.btn--danger.btn--sm", "Melden");
    reportBtn.addEventListener("click", () => openReport(p));

    // left media
    const left = el("div", [
      el("div.detail__media", { style: "background: radial-gradient(120% 120% at 50% 0%, rgba(255,77,141,.25), rgba(177,92,255,.14) 60%, transparent)" }, [
        el("span", p.avatar),
        p.verified ? el("span", { style: "position:absolute;top:12px;left:12px" }, [el("span.chip-verified", "✓ Verifiziert")]) : null,
      ]),
      el("div.gallery", (p.photos || []).map((ph) => el("div", ph))),
    ]);

    // right info
    const ratingObj = Store.ratingOf(p.id);
    const right = el("div", [
      el("h1", [`${p.name}, ${p.age}`, p.verified ? el("span.chip-verified", "✓ Verifiziert") : null]),
      el("p.muted", { style: "font-size:1.05rem;margin:0" }, p.tagline),
      el("div.rating-line", { style: "margin-top:8px" }, [stars(ratingObj.avg), el("span", ratingObj.count ? `${ratingObj.avg.toFixed(1)} aus ${ratingObj.count} Bewertungen` : "Noch keine Bewertungen")]),
      el("div.hero__actions", { style: "margin:18px 0" }, [msgBtn, favBtn, reportBtn]),
      el("dl.kv", [
        el("dt", "Stadt"), el("dd", p.city),
        el("dt", "Geschlecht"), el("dd", p.gender),
        el("dt", "Preis"), el("dd", { html: `<strong>${p.rate}${p.currency}</strong> / ${p.rateUnit}` }),
        el("dt", "Sprachen"), el("dd", (p.languages || []).join(", ")),
        p.height ? el("dt", "Größe") : null, p.height ? el("dd", p.height + " cm") : null,
        el("dt", "Verfügbarkeit"), el("dd", p.availability || "Auf Anfrage"),
        el("dt", "Kontakt"), el("dd", p.contactPref || "Nachricht"),
      ].filter(Boolean)),
      el("div.panel", [el("h3", "Über mich"), el("p.muted", p.about)]),
      el("div.panel", [el("h3", "Services"), tagRow(p.services)]),
    ]);

    view.appendChild(el("div.detail", [left, right]));

    // Listings of this profile
    const ls = Store.listingsByProfile(p.id);
    if (ls.length) {
      view.appendChild(el("div.section-title", { style: "margin-top:30px" }, [el("h2", "Inserate")]));
      const g = el("div.grid");
      ls.forEach((l) => g.appendChild(el("div.card", [el("div.card__body", [
        el("div.card__meta", `${l.service} · ${timeAgo(l.createdAt)}`),
        el("div.card__name", l.title),
        el("p.muted", { style: "font-size:.9rem" }, l.body),
        el("div.card__foot", [el("span.price", { html: `${l.price}€` })]),
      ])])));
      view.appendChild(g);
    }

    // Reviews
    view.appendChild(renderReviews(p));
  });

  function renderReviews(p) {
    const wrap = el("div.panel", { style: "margin-top:24px" });
    const rs = Store.reviews(p.id);
    const r = Store.ratingOf(p.id);
    wrap.appendChild(el("div.section-title", { style: "margin-bottom:8px" }, [
      el("h3", { style: "margin:0" }, "Bewertungen"),
      el("span.rating-line", [stars(r.avg), el("span", r.count ? `${r.avg.toFixed(1)} · ${r.count}` : "neu")]),
    ]));

    // add review form (only as customer)
    if (!Store.isProvider()) {
      let chosen = 0;
      const starIn = el("div.star-input");
      for (let i = 1; i <= 5; i++) {
        const s = el("span", "★");
        s.addEventListener("mouseenter", () => paint(i));
        s.addEventListener("click", () => { chosen = i; paint(i); });
        starIn.appendChild(s);
      }
      starIn.addEventListener("mouseleave", () => paint(chosen));
      function paint(n) { starIn.querySelectorAll("span").forEach((s, idx) => s.classList.toggle("on", idx < n)); }

      const text = el("textarea", { placeholder: "Deine Erfahrung (optional)…", rows: "2" });
      const submit = el("button.btn.btn--primary.btn--sm", "Bewertung abgeben");
      submit.addEventListener("click", () => {
        if (!chosen) { toast("Bitte wähle eine Sternebewertung."); return; }
        Store.addReview(p.id, chosen, text.value.trim() || "(keine Worte hinterlassen)");
        toast("Danke für deine Bewertung!");
        render();
      });
      wrap.appendChild(el("div.field", { style: "margin-bottom:14px" }, [
        el("label", "Bewertung abgeben"), starIn, text, el("div", { style: "margin-top:8px" }, [submit]),
      ]));
    }

    if (!rs.length) {
      wrap.appendChild(el("p.faint", "Sei der/die Erste, der/die eine Bewertung hinterlässt."));
    } else {
      rs.forEach((rev) => wrap.appendChild(el("div.review", [
        el("div.review__head", [
          el("span.review__author", rev.author),
          el("span", [stars(rev.stars), el("span.faint", { style: "margin-left:8px;font-size:.8rem" }, timeAgo(rev.createdAt))]),
        ]),
        el("p", rev.text),
      ])));
    }
    return wrap;
  }

  function openReport(p) {
    let reason = "Spam / Fake";
    const sel = el("select", { style: "width:100%;margin-top:8px;background:var(--bg);border:1px solid var(--line);color:var(--text);padding:10px;border-radius:10px" },
      ["Spam / Fake", "Unangemessene Inhalte", "Verdacht auf Zwang / Menschenhandel", "Betrugsversuch", "Sonstiges"].map((o) => { const x = el("option", o); x.value = o; return x; }));
    sel.addEventListener("change", () => (reason = sel.value));
    modal({
      title: `${p.name} melden`,
      body: el("div", [
        el("p.muted", "Hilf uns, Nutterando sicher zu halten. Bei Verdacht auf Zwang oder Menschenhandel wende dich bitte zusätzlich an die Polizei (110) oder den Hilfetelefon-Notruf."),
        sel,
      ]),
      actions: [
        { label: "Abbrechen", kind: "ghost" },
        { label: "Melden", kind: "danger", onClick: (close) => { Store.report(p.id, reason); close(); toast("Meldung übermittelt. Danke!"); } },
      ],
    });
  }

  /* ---------- View: Favorites ---------- */
  route("/favorites", function () {
    view.appendChild(el("div.section-title", [el("h2", "Deine Favoriten")]));
    const ids = Store.favorites();
    if (!ids.length) {
      view.appendChild(emptyState("🤍", "Noch keine Favoriten", "Tippe auf das Herz, um Profile zu merken.", "#/", "Profile entdecken"));
      return;
    }
    const grid = el("div.grid");
    ids.map((id) => Store.profile(id)).filter(Boolean).forEach((p) => grid.appendChild(profileCard(p)));
    view.appendChild(grid);
  });

  /* ---------- View: Messages ---------- */
  route("/messages", function (_args, params) {
    view.appendChild(el("div.section-title", [
      el("h2", "Nachrichten"),
      el("span.muted", Store.isProvider() ? "Anbieter:innen-Ansicht" : "Kunden-Ansicht"),
    ]));

    const threads = Store.threads();
    if (!threads.length) {
      view.appendChild(emptyState("✉️", "Noch keine Unterhaltungen", "Schreib einem Profil, um ein Gespräch zu starten.", "#/", "Profile entdecken"));
      return;
    }

    const activeId = params.t || threads[0].id;
    const me = Store.session.role; // 'customer' or 'provider'

    const threadList = el("div.threads", threads.map((t) => {
      const p = Store.profile(t.profileId);
      const last = t.messages[t.messages.length - 1];
      const node = el("div.thread" + (t.id === activeId ? ".is-active" : ""), {
        onClick: () => { location.hash = `#/messages?t=${t.id}`; },
      }, [
        el("div.thread__avatar", p ? p.avatar : "👤"),
        el("div", [
          el("div.thread__name", p ? p.name : "Unbekannt"),
          el("div.thread__last", last ? last.text : "Neue Unterhaltung"),
        ]),
      ]);
      return node;
    }));

    const active = Store.thread(activeId);
    const p = active ? Store.profile(active.profileId) : null;

    const body = el("div.chat__body");
    function renderBubbles() {
      body.innerHTML = "";
      active.messages.forEach((m) => {
        const mine = m.from === me;
        body.appendChild(el("div.bubble." + (mine ? "me" : "them"), [
          m.text, el("small", clock(m.at)),
        ]));
      });
      body.scrollTop = body.scrollHeight;
    }

    const input = el("input", { placeholder: "Nachricht schreiben…", type: "text" });
    const sendBtn = el("button.btn.btn--primary", "Senden");
    function doSend() {
      const txt = input.value.trim();
      if (!txt) return;
      Store.sendMessage(active.id, me, txt);
      input.value = "";
      renderBubbles();
      // refresh list previews + badges
      setTimeout(renderBubbles, 1300);
    }
    sendBtn.addEventListener("click", doSend);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });

    const chat = el("div.chat", [
      el("div.chat__head", [p ? p.avatar : "👤", p ? `${p.name}, ${p.age} · ${p.city}` : "Unterhaltung",
        p ? el("a.btn.btn--ghost.btn--sm", { href: `#/profile/${p.id}`, style: "margin-left:auto" }, "Profil") : null]),
      body,
      el("div.chat__compose", [input, sendBtn]),
    ]);

    view.appendChild(el("div.messenger", [threadList, chat]));
    renderBubbles();

    view.appendChild(el("p.faint", { style: "margin-top:12px;font-size:.85rem" },
      "Demo-Hinweis: Antworten werden automatisch simuliert. Mit dem Umschalter oben rechts kannst du zwischen Kunden- und Anbieter:innen-Ansicht wechseln."));
  });

  /* ---------- View: Dashboard (provider area) ---------- */
  route("/dashboard", function () {
    if (!Store.isProvider()) {
      view.appendChild(el("section.hero", [
        el("h1", "Dein Anbieter:innen-Bereich"),
        el("p", "Wechsle oben rechts in die Anbieter:innen-Ansicht, um ein Profil zu erstellen, Inserate zu schalten und Bewertungen zu sehen."),
        el("div.hero__actions", [
          el("button.btn.btn--primary", { onClick: () => { Store.setRole("provider"); document.querySelectorAll("#role-switch button").forEach((b) => b.classList.toggle("is-active", b.dataset.role === "provider")); render(); } }, "Jetzt als Anbieter:in fortfahren"),
        ]),
      ]));
      return;
    }

    const mine = Store.myProfile();
    view.appendChild(el("div.section-title", [el("h2", "Mein Bereich")]));

    if (!mine) {
      view.appendChild(el("div.notice", "Du hast noch kein Profil. Lege jetzt eines an, damit Kund:innen dich finden."));
      view.appendChild(profileForm(null));
      return;
    }

    const r = Store.ratingOf(mine.id);
    const myThreads = Store.threads().filter((t) => t.profileId === mine.id);
    view.appendChild(el("div.dashboard-grid", [
      statCard(mine.avatar + " " + mine.name, "Mein Profil"),
      statCard(r.count ? r.avg.toFixed(1) + " ★" : "—", `${r.count} Bewertungen`),
      statCard(String(Store.listingsByProfile(mine.id).length), "Aktive Inserate"),
      statCard(String(myThreads.length), "Unterhaltungen"),
    ]));

    view.appendChild(el("div.hero__actions", { style: "margin-bottom:24px" }, [
      el("a.btn.btn--primary", { href: `#/profile/${mine.id}` }, "Profil ansehen"),
      el("a.btn.btn--ghost", { href: "#/dashboard/edit" }, "Profil bearbeiten"),
    ]));

    // listing manager
    view.appendChild(el("div.section-title", [el("h2", { style: "font-size:1.2rem" }, "Inserate verwalten")]));
    view.appendChild(listingForm(mine));

    const ls = Store.listingsByProfile(mine.id);
    const lwrap = el("div", { style: "margin-top:16px" });
    if (!ls.length) lwrap.appendChild(el("p.faint", "Noch keine Inserate."));
    ls.forEach((l) => {
      const del = el("button.btn.btn--danger.btn--sm", "Löschen");
      del.addEventListener("click", () => { Store.deleteListing(l.id); toast("Inserat gelöscht"); render(); });
      lwrap.appendChild(el("div.panel", { style: "display:flex;justify-content:space-between;gap:12px;align-items:center" }, [
        el("div", [el("strong", l.title), el("div.faint", { style: "font-size:.85rem" }, `${l.service} · ${l.price}€ · ${timeAgo(l.createdAt)}`)]),
        del,
      ]));
    });
    view.appendChild(lwrap);
  });

  route("/dashboard/edit", function () {
    if (!Store.isProvider()) { location.hash = "#/dashboard"; return; }
    view.appendChild(backLink("#/dashboard", "Mein Bereich"));
    view.appendChild(el("div.section-title", [el("h2", "Profil bearbeiten")]));
    view.appendChild(profileForm(Store.myProfile()));
  });

  function statCard(big, label) {
    return el("div.stat-card", [el("strong", big), el("span", label)]);
  }

  /* ---------- Forms ---------- */
  function profileForm(existing) {
    const p = existing || {};
    const form = el("form.form");

    const name = field("Künstlername", el("input", { value: p.name || "", required: true, placeholder: "z.B. Lena" }));
    const age = field("Alter", el("input", { type: "number", min: "18", max: "99", value: p.age || "", required: true }));
    const gender = field("Geschlecht", selectFrom(["weiblich", "männlich", "divers"], p.gender));
    const city = field("Stadt", selectFrom(Store.constants.CITIES, p.city));
    const rate = field("Preis pro Stunde (€)", el("input", { type: "number", min: "0", step: "10", value: p.rate || "", required: true }));
    const height = field("Größe (cm, optional)", el("input", { type: "number", min: "120", max: "220", value: p.height || "" }));
    const tagline = field("Slogan", el("input", { value: p.tagline || "", placeholder: "In einem Satz, was dich ausmacht", maxlength: "80" }));
    const about = field("Über mich", el("textarea", { placeholder: "Beschreibe dich, deinen Stil und was Kund:innen erwartet…" }, p.about || ""));
    const avail = field("Verfügbarkeit", el("input", { value: p.availability || "", placeholder: "z.B. Di–Sa, ab 18 Uhr" }));
    const contact = field("Kontaktwunsch", el("input", { value: p.contactPref || "", placeholder: "z.B. Nur Nachricht, Vorgespräch" }));

    // services multi-select
    const chosenSvc = new Set(p.services || []);
    const svcWrap = el("div.checks");
    Store.constants.SERVICES.forEach((s) => {
      const cb = el("input", { type: "checkbox" });
      cb.checked = chosenSvc.has(s);
      const label = el("label.check" + (cb.checked ? ".is-on" : ""), [cb, s]);
      cb.addEventListener("change", () => {
        if (cb.checked) chosenSvc.add(s); else chosenSvc.delete(s);
        label.classList.toggle("is-on", cb.checked);
      });
      svcWrap.appendChild(label);
    });

    // languages multi-select
    const chosenLang = new Set(p.languages || ["Deutsch"]);
    const langWrap = el("div.checks");
    Store.constants.LANGS.forEach((s) => {
      const cb = el("input", { type: "checkbox" });
      cb.checked = chosenLang.has(s);
      const label = el("label.check" + (cb.checked ? ".is-on" : ""), [cb, s]);
      cb.addEventListener("change", () => {
        if (cb.checked) chosenLang.add(s); else chosenLang.delete(s);
        label.classList.toggle("is-on", cb.checked);
      });
      langWrap.appendChild(label);
    });

    const verifyNote = el("div.notice.notice--warn",
      "Verifizierung: In der echten Plattform würdest du hier per Ausweis-Check & Selfie verifiziert. In dieser Demo erhältst du das Badge automatisch.");

    const submit = el("button.btn.btn--primary.btn--block", existing ? "Änderungen speichern" : "Profil veröffentlichen");

    form.append(
      el("div.row", [name, age]),
      el("div.row", [gender, city]),
      el("div.row", [rate, height]),
      tagline, about,
      el("div.field", [el("label", "Services"), svcWrap]),
      el("div.field", [el("label", "Sprachen"), langWrap]),
      el("div.row", [avail, contact]),
      verifyNote,
      submit,
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!chosenSvc.size) { toast("Bitte wähle mindestens einen Service."); return; }
      const data = {
        id: p.id, name: name.qs("input").value.trim(), age: Number(age.qs("input").value),
        gender: gender.qs("select").value, city: city.qs("select").value,
        rate: Number(rate.qs("input").value), currency: "€", rateUnit: "Std.",
        height: height.qs("input").value ? Number(height.qs("input").value) : null,
        tagline: tagline.qs("input").value.trim() || "Begleitung auf Augenhöhe.",
        about: about.qs("textarea").value.trim() || "Schreib mir für mehr Infos.",
        availability: avail.qs("input").value.trim(), contactPref: contact.qs("input").value.trim(),
        services: Array.from(chosenSvc), languages: Array.from(chosenLang),
        verified: existing ? p.verified : true,
        avatar: p.avatar,
      };
      const saved = Store.saveProfile(data);
      toast(existing ? "Profil aktualisiert" : "Profil veröffentlicht! 🎉");
      location.hash = `#/profile/${saved.id}`;
    });

    return form;
  }

  function listingForm(profile) {
    const form = el("form.form", { style: "max-width:none" });
    const title = el("input", { placeholder: "Titel des Inserats", required: true });
    const service = selectFrom(profile.services.length ? profile.services : Store.constants.SERVICES);
    const price = el("input", { type: "number", min: "0", step: "10", placeholder: "Preis €", required: true });
    const body = el("textarea", { placeholder: "Beschreibung deines Angebots…" });
    const submit = el("button.btn.btn--primary", "Inserat schalten");

    form.append(
      el("div.row", [field("Titel", title), field("Service", service)]),
      el("div.row", [field("Preis (€)", price), field("Stadt", el("input", { value: profile.city, readonly: true }))]),
      field("Beschreibung", body),
      submit,
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      Store.saveListing({
        profileId: profile.id, title: title.value.trim(), service: service.value,
        price: Number(price.value), city: profile.city, body: body.value.trim() || "—",
      });
      toast("Inserat geschaltet! 🚀");
      render();
    });
    return form;
  }

  function field(label, control) {
    const f = el("div.field", [el("label", label), control]);
    f.qs = (sel) => f.querySelector(sel);
    return f;
  }
  function selectFrom(values, current) {
    const sel = el("select");
    values.forEach((v) => { const o = el("option", v); o.value = v; sel.appendChild(o); });
    if (current) sel.value = current;
    return sel;
  }

  /* ---------- Static pages ---------- */
  route("/safety", function () {
    view.appendChild(el("div.prose", [
      el("h1", "Sicherheit & Tipps"),
      el("div.notice", "Deine Sicherheit hat oberste Priorität. Nutterando ist eine Plattform für einvernehmliche Dienstleistungen zwischen Erwachsenen."),
      el("h2", "Für Kund:innen"),
      el("ul", [
        el("li", "Kommuniziere zunächst über die Plattform-Nachrichten — gib persönliche Daten erst weiter, wenn du dich sicher fühlst."),
        el("li", "Achte auf das ✓ Verifiziert-Badge und auf Bewertungen anderer Nutzer:innen."),
        el("li", "Triff dich bei Erstkontakten an einem öffentlichen Ort und informiere eine Vertrauensperson."),
        el("li", "Respektiere Grenzen und vereinbarte Konditionen. Konsens ist nicht verhandelbar."),
      ].map((x) => x)),
      el("h2", "Für Anbieter:innen"),
      el("ul", [
        el("li", "Veröffentliche keine privaten Kontaktdaten in deinem öffentlichen Profil."),
        el("li", "Lege deine Grenzen und Konditionen klar fest — du bestimmst, was du anbietest."),
        el("li", "Nutze die Melden-Funktion bei übergriffigem Verhalten."),
        el("li", "Lass dich verifizieren, um Vertrauen aufzubauen."),
      ]),
      el("h2", "Hilfe & Notruf"),
      el("p", "Bei Verdacht auf Zwang, Ausbeutung oder Menschenhandel: Polizei 110. Bundesweites Hilfetelefon „Gewalt gegen Frauen“: 116 016 (kostenlos, rund um die Uhr)."),
    ]));
  });

  route("/legal", function () {
    view.appendChild(el("div.prose", [
      el("h1", "Rechtliches & AGB"),
      el("div.notice.notice--warn", "Demo-Hinweis: Dies ist ein Prototyp (MVP). Die folgenden Texte sind Platzhalter und stellen keine Rechtsberatung dar."),
      el("h2", "Volljährigkeit"),
      el("p", "Die Nutzung von Nutterando ist ausschließlich Personen ab 18 Jahren gestattet. Mit der Registrierung bestätigst du deine Volljährigkeit."),
      el("h2", "Zulässige Inhalte"),
      el("p", "Es dürfen nur legale Dienstleistungen zwischen einwilligungsfähigen Erwachsenen angeboten werden. Inhalte, die Minderjährige betreffen, Zwang, Menschenhandel oder andere Straftaten fördern, sind strengstens verboten und werden den Behörden gemeldet."),
      el("h2", "Datenschutz"),
      el("p", "Diese Demo speichert alle Eingaben ausschließlich lokal in deinem Browser (localStorage). Es werden keine Daten an einen Server übertragen. Über die Einstellungen deines Browsers kannst du die Daten jederzeit löschen."),
      el("h2", "Haftung"),
      el("p", "Nutterando ist ein Vermittlungsmarktplatz und nicht Vertragspartei der zwischen Nutzer:innen geschlossenen Vereinbarungen."),
      el("p", { style: "margin-top:24px" }, [
        el("button.btn.btn--ghost", { onClick: () => modal({
          title: "Demo-Daten zurücksetzen?",
          body: "Alle lokal gespeicherten Profile, Nachrichten und Bewertungen werden auf den Ausgangszustand zurückgesetzt.",
          actions: [
            { label: "Abbrechen", kind: "ghost" },
            { label: "Zurücksetzen", kind: "danger", onClick: (c) => { Store.reset(); c(); location.hash = "#/"; toast("Demo zurückgesetzt"); } },
          ],
        }) }, "🔄 Demo-Daten zurücksetzen"),
      ]),
    ]));
  });

  route("/about", function () {
    view.appendChild(el("div.prose", [
      el("h1", "Über Nutterando"),
      el("p", "Nutterando ist ein MVP-Prototyp für einen diskreten Marktplatz, der Anbieter:innen von Begleitservices und Kund:innen zusammenbringt — mit Fokus auf Sicherheit, Transparenz und Respekt."),
      el("h2", "Funktionen in dieser Demo"),
      el("ul", [
        el("li", "Profile mit Standardangaben (Stadt, Services, Preise, Sprachen, Verfügbarkeit)"),
        el("li", "Inserate erstellen und durchsuchen"),
        el("li", "Filter & Suche nach Stadt, Service, Geschlecht und Preis"),
        el("li", "Bewertungssystem mit Sternen & Rezensionen"),
        el("li", "Direktnachrichten zwischen Kund:innen und Anbieter:innen"),
        el("li", "Favoriten, Verifizierungs-Badges und Melde-Funktion"),
        el("li", "Alterskontrolle (18+) und Sicherheitshinweise"),
      ]),
      el("p.faint", "Technisch: reine Frontend-App (HTML/CSS/Vanilla-JS) mit lokalem Speicher — ganz ohne Backend, ideal als GitHub-Pages-Preview."),
    ]));
  });

  boot();
})();
