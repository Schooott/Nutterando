/* ===== Nutterando — Datenschicht (localStorage) =====
 * Komplett clientseitig. Kein Backend, keine echten Daten.
 * Alle Daten werden im Browser unter dem Schlüssel `nutterando.v1` gespeichert.
 */
(function (global) {
  "use strict";

  const KEY = "nutterando.v1";
  const AVATARS = ["🌹", "💋", "✨", "🦋", "🌙", "🔥", "💎", "🍒", "🌷", "🖤"];

  const SERVICES = [
    "Begleitung", "Dinner-Date", "Massage", "Tantra", "Reisebegleitung",
    "Events & Gala", "Striptease", "Domina", "Paar-Service", "Video-Call", "Overnight",
  ];

  const CITIES = [
    "Berlin", "Hamburg", "München", "Köln", "Frankfurt",
    "Stuttgart", "Düsseldorf", "Leipzig", "Dresden", "Hannover",
  ];

  const LANGS = ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch", "Russisch", "Polnisch"];

  function uid(prefix) {
    return (prefix || "id") + "_" + Math.random().toString(36).slice(2, 9);
  }

  /* ----- Seed-Daten (fiktiv) ----- */
  function seed() {
    const now = Date.now();
    const day = 86400000;

    const profiles = [
      {
        id: "p_lena", owner: false, avatar: "🌹", name: "Lena", age: 26, gender: "weiblich",
        city: "Berlin", services: ["Begleitung", "Dinner-Date", "Tantra"], languages: ["Deutsch", "Englisch"],
        rate: 180, currency: "€", rateUnit: "Std.", verified: true,
        tagline: "Stilvolle Begleitung für besondere Abende.",
        about: "Hallo, ich bin Lena. Ich begleite dich charmant und niveauvoll zu Dinner, Events oder einem ruhigen Abend zu zweit. Diskretion ist für mich selbstverständlich.",
        availability: "Di–Sa, ab 18 Uhr", height: 172, contactPref: "Nachricht oder Telefon",
        photos: ["💃", "🍷", "🌆", "👗"], createdAt: now - 12 * day,
      },
      {
        id: "p_mara", owner: false, avatar: "💋", name: "Mara", age: 31, gender: "weiblich",
        city: "Hamburg", services: ["Massage", "Tantra", "Overnight"], languages: ["Deutsch", "Spanisch"],
        rate: 150, currency: "€", rateUnit: "Std.", verified: true,
        tagline: "Entspannung & Achtsamkeit in ruhiger Atmosphäre.",
        about: "Ausgebildete Masseurin mit Faible für Tantra. Bei mir steht Entschleunigung im Vordergrund — Zeit nur für dich.",
        availability: "Mo–Fr, 10–20 Uhr", height: 168, contactPref: "Nur Nachricht",
        photos: ["🕯️", "🌿", "🛁", "🤍"], createdAt: now - 30 * day,
      },
      {
        id: "p_julian", owner: false, avatar: "🔥", name: "Julian", age: 29, gender: "männlich",
        city: "München", services: ["Begleitung", "Events & Gala", "Reisebegleitung"], languages: ["Deutsch", "Englisch", "Italienisch"],
        rate: 200, currency: "€", rateUnit: "Std.", verified: false,
        tagline: "Dein Gentleman für jeden Anlass.",
        about: "Sportlich, weltgewandt und ein guter Zuhörer. Ob Gala, Geschäftsessen oder Wochenendtrip — ich bin der passende Begleiter an deiner Seite.",
        availability: "Nach Absprache", height: 186, contactPref: "Nachricht",
        photos: ["🤵", "✈️", "🥂", "🏔️"], createdAt: now - 5 * day,
      },
      {
        id: "p_sofia", owner: false, avatar: "✨", name: "Sofia", age: 24, gender: "weiblich",
        city: "Köln", services: ["Striptease", "Begleitung", "Video-Call"], languages: ["Deutsch", "Englisch"],
        rate: 130, currency: "€", rateUnit: "Std.", verified: true,
        tagline: "Verspielt, lebensfroh, immer für ein Lächeln gut.",
        about: "Ich liebe gute Gespräche, Tanzen und neue Menschen kennenzulernen. Lass uns gemeinsam eine unvergessliche Zeit verbringen.",
        availability: "Mi–So", height: 165, contactPref: "Nachricht oder Video-Call",
        photos: ["💄", "🎶", "🍸", "🎭"], createdAt: now - 2 * day,
      },
      {
        id: "p_nadja", owner: false, avatar: "🖤", name: "Nadja", age: 35, gender: "weiblich",
        city: "Frankfurt", services: ["Domina", "Begleitung"], languages: ["Deutsch", "Englisch", "Russisch"],
        rate: 220, currency: "€", rateUnit: "Std.", verified: true,
        tagline: "Souveräne Herrin mit klaren Regeln.",
        about: "Erfahrene Domina für stilvolle Sessions im sicheren Rahmen. SSC (safe, sane, consensual) ist für mich Grundvoraussetzung. Vorgespräch erforderlich.",
        availability: "Do–Sa, Termine nach Vereinbarung", height: 175, contactPref: "Nur Nachricht, Vorgespräch",
        photos: ["🖤", "⛓️", "🥀", "🕸️"], createdAt: now - 18 * day,
      },
      {
        id: "p_emilia", owner: false, avatar: "🌙", name: "Emilia", age: 28, gender: "divers",
        city: "Leipzig", services: ["Begleitung", "Dinner-Date", "Paar-Service"], languages: ["Deutsch", "Französisch"],
        rate: 160, currency: "€", rateUnit: "Std.", verified: false,
        tagline: "Offen, neugierig, herzlich — für Singles & Paare.",
        about: "Ich begleite Singles und Paare gleichermaßen und schaffe einen wertfreien, vertrauensvollen Raum. Kommunikation ist mir das Wichtigste.",
        availability: "Flexibel, auch kurzfristig", height: 170, contactPref: "Nachricht",
        photos: ["🌙", "📖", "🍇", "🎨"], createdAt: now - 8 * day,
      },
    ];

    const listings = [
      { id: uid("l"), profileId: "p_lena", title: "Stilvolles Dinner-Date in Berlin-Mitte", body: "Begleite mich (oder ich dich) zu einem schönen Abendessen. Ich freue mich auf gute Gespräche und ein Glas Wein.", price: 180, city: "Berlin", service: "Dinner-Date", createdAt: now - 1 * day },
      { id: uid("l"), profileId: "p_mara", title: "Tantra-Massage — Auszeit vom Alltag", body: "90 Minuten reine Entspannung in ruhiger Atmosphäre. Ideal für gestresste Seelen.", price: 200, city: "Hamburg", service: "Tantra", createdAt: now - 3 * day },
      { id: uid("l"), profileId: "p_julian", title: "Begleitung zur Wirtschaftsgala", body: "Souveräner Begleiter für dein nächstes Event. Smoking vorhanden, Etikette sicher.", price: 250, city: "München", service: "Events & Gala", createdAt: now - 4 * day },
      { id: uid("l"), profileId: "p_sofia", title: "Privater Tanzabend in Köln", body: "Verspielter, lockerer Abend mit guter Musik und bester Laune.", price: 150, city: "Köln", service: "Striptease", createdAt: now - 6 * day },
      { id: uid("l"), profileId: "p_nadja", title: "Session im sicheren Rahmen (Frankfurt)", body: "Erfahrene Domina, Vorgespräch erforderlich. Grenzen werden respektiert.", price: 220, city: "Frankfurt", service: "Domina", createdAt: now - 7 * day },
    ];

    const reviews = [
      { id: uid("r"), profileId: "p_lena", author: "Anonym", stars: 5, text: "Absolut bezaubernd und pünktlich. Ein wunderschöner Abend.", createdAt: now - 9 * day },
      { id: uid("r"), profileId: "p_lena", author: "M.", stars: 4, text: "Sehr angenehme Begleitung, gerne wieder.", createdAt: now - 4 * day },
      { id: uid("r"), profileId: "p_mara", author: "Anonym", stars: 5, text: "Die Massage war Weltklasse. Komplett abgeschaltet.", createdAt: now - 11 * day },
      { id: uid("r"), profileId: "p_nadja", author: "Anonym", stars: 5, text: "Professionell, sicher und sehr einfühlsam trotz strenger Rolle.", createdAt: now - 14 * day },
      { id: uid("r"), profileId: "p_sofia", author: "L.", stars: 4, text: "Mega lustig und sympathisch, die Zeit verging viel zu schnell.", createdAt: now - 1 * day },
    ];

    const threads = [
      {
        id: uid("t"), profileId: "p_lena",
        messages: [
          { from: "customer", text: "Hi Lena! Bist du nächsten Freitagabend in Berlin verfügbar?", at: now - 2 * day },
          { from: "provider", text: "Hallo :) Ja, Freitag ab 19 Uhr habe ich noch Zeit. Worauf hättest du Lust?", at: now - 2 * day + 3600000 },
        ],
      },
    ];

    return {
      profiles, listings, reviews, threads,
      favorites: [], reports: [],
      session: { role: "customer", myProfileId: null },
      ageConfirmed: false,
    };
  }

  /* ----- Persistence ----- */
  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : seed();
    } catch (e) {
      state = seed();
    }
    return state;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function ensure() { if (!state) load(); return state; }

  /* ----- API ----- */
  const Store = {
    constants: { SERVICES, CITIES, LANGS, AVATARS },

    get state() { return ensure(); },

    reset() { state = seed(); save(); },

    // session
    get session() { return ensure().session; },
    setRole(role) { ensure().session.role = role; save(); },
    isProvider() { return ensure().session.role === "provider"; },

    // age
    isAgeConfirmed() { return ensure().ageConfirmed; },
    confirmAge() { ensure().ageConfirmed = true; save(); },

    // profiles
    profiles() { return ensure().profiles.slice(); },
    profile(id) { return ensure().profiles.find((p) => p.id === id) || null; },
    myProfile() {
      const s = ensure();
      return s.session.myProfileId ? this.profile(s.session.myProfileId) : null;
    },
    saveProfile(data) {
      const s = ensure();
      if (data.id) {
        const i = s.profiles.findIndex((p) => p.id === data.id);
        if (i >= 0) s.profiles[i] = Object.assign({}, s.profiles[i], data);
      } else {
        data.id = uid("p");
        data.owner = true;
        data.avatar = data.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)];
        data.createdAt = Date.now();
        data.photos = data.photos || ["✨", "🌆", "🍷", "🌙"];
        s.profiles.unshift(data);
        s.session.myProfileId = data.id;
      }
      save();
      return data;
    },

    // listings
    listings() {
      return ensure().listings.slice().sort((a, b) => b.createdAt - a.createdAt);
    },
    listing(id) { return ensure().listings.find((l) => l.id === id) || null; },
    listingsByProfile(pid) { return ensure().listings.filter((l) => l.profileId === pid); },
    saveListing(data) {
      const s = ensure();
      data.id = uid("l");
      data.createdAt = Date.now();
      s.listings.unshift(data);
      save();
      return data;
    },
    deleteListing(id) {
      const s = ensure();
      s.listings = s.listings.filter((l) => l.id !== id);
      save();
    },

    // reviews
    reviews(pid) {
      return ensure().reviews.filter((r) => r.profileId === pid).sort((a, b) => b.createdAt - a.createdAt);
    },
    addReview(pid, stars, text) {
      const s = ensure();
      s.reviews.unshift({ id: uid("r"), profileId: pid, author: "Du", stars, text, createdAt: Date.now() });
      save();
    },
    ratingOf(pid) {
      const rs = this.reviews(pid);
      if (!rs.length) return { avg: 0, count: 0 };
      const avg = rs.reduce((a, r) => a + r.stars, 0) / rs.length;
      return { avg: Math.round(avg * 10) / 10, count: rs.length };
    },

    // favorites
    favorites() { return ensure().favorites.slice(); },
    isFavorite(pid) { return ensure().favorites.includes(pid); },
    toggleFavorite(pid) {
      const s = ensure();
      const i = s.favorites.indexOf(pid);
      if (i >= 0) s.favorites.splice(i, 1); else s.favorites.push(pid);
      save();
      return this.isFavorite(pid);
    },

    // messaging
    threads() { return ensure().threads.slice(); },
    threadByProfile(pid) { return ensure().threads.find((t) => t.profileId === pid) || null; },
    thread(id) { return ensure().threads.find((t) => t.id === id) || null; },
    openThread(pid) {
      const s = ensure();
      let t = this.threadByProfile(pid);
      if (!t) {
        t = { id: uid("t"), profileId: pid, messages: [] };
        s.threads.unshift(t);
        save();
      }
      return t;
    },
    sendMessage(threadId, from, text) {
      const t = this.thread(threadId);
      if (!t) return;
      t.messages.push({ from, text, at: Date.now() });
      // demo: simple auto-reply from the provider side
      if (from === "customer") {
        const replies = [
          "Hey! Schön von dir zu hören 😊 Wann hättest du Zeit?",
          "Danke für deine Nachricht! Erzähl mir mehr.",
          "Klingt gut — lass uns Details besprechen.",
        ];
        setTimeout(() => {
          t.messages.push({ from: "provider", text: replies[Math.floor(Math.random() * replies.length)], at: Date.now() });
          save();
          global.dispatchEvent(new CustomEvent("nutterando:autoreply", { detail: { threadId } }));
        }, 1100);
      }
      save();
    },

    // reports / safety
    report(pid, reason) {
      const s = ensure();
      s.reports.push({ id: uid("rep"), profileId: pid, reason, at: Date.now() });
      save();
    },

    uid,
  };

  global.Store = Store;
})(window);
