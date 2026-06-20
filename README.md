# 🌹 Nutterando

> Diskreter Marktplatz für Begleitservice — ein **MVP-Prototyp** (Frontend-only).

Nutterando bringt Anbieter:innen von (legalen) Begleitdienstleistungen und Kund:innen
zusammen: Profile anlegen, Inserate schalten, durchsuchen, bewerten und sicher
Kontakt aufnehmen. Diese Demo läuft **vollständig im Browser** (keine Server, keine
echten Daten) und eignet sich als Live-Preview über GitHub Pages.

> ⚠️ **Demo-Hinweis:** Alle Profile, Inserate und Bewertungen sind **fiktiv**. Daten
> werden ausschließlich lokal im Browser (`localStorage`) gespeichert. Nur für
> Erwachsene (18+).

---

## ✨ Features

| Bereich | Funktion |
| --- | --- |
| 🔞 Zugang | Alterskontrolle (18+ Age-Gate) |
| 👤 Profile | Standardangaben: Stadt, Alter, Geschlecht, Services, Preis, Sprachen, Verfügbarkeit, „Über mich" |
| 📢 Inserate | Anbieter:innen erstellen & verwalten Inserate (Titel, Service, Preis, Beschreibung) |
| 🔍 Entdecken | Volltextsuche + Filter nach Stadt, Service, Geschlecht, Max-Preis & Sortierung |
| ⭐ Bewertungen | 5-Sterne-System mit Rezensionen und Durchschnittswertung |
| ✉️ Nachrichten | Direktnachrichten Kund:in ↔ Anbieter:in (mit simulierter Auto-Antwort) |
| ❤️ Favoriten | Profile merken |
| ✓ Verifizierung | Verifizierungs-Badge für Vertrauen |
| 🛡️ Sicherheit | Melde-Funktion, Sicherheitstipps, Notruf-Hinweise |
| 🔄 Rollen-Demo | Umschalter zwischen Kunden- und Anbieter:innen-Ansicht |

## 🧱 Tech-Stack

- **Reines Frontend:** HTML + CSS + Vanilla JavaScript (kein Build-Schritt, keine Abhängigkeiten)
- **Persistenz:** `localStorage` (clientseitig)
- **Routing:** Hash-basierter Mini-Router
- **Hosting:** GitHub Pages via GitHub Actions

```
.
├── index.html          # App-Shell + Age-Gate
├── assets/styles.css   # Design-System
├── js/
│   ├── store.js        # Datenschicht + Seed-Daten (localStorage)
│   ├── ui.js           # UI-Helfer (Elemente, Sterne, Toast, Modal)
│   └── app.js          # Router + Views
└── .github/workflows/deploy.yml
```

## 🚀 Lokal starten

Einfach `index.html` im Browser öffnen — oder ein kleiner Static-Server:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## 🌐 Live-Preview (GitHub Pages)

Live unter: **https://schooott.github.io/Nutterando/**

Deployment via GitHub Pages mit Quelle **„Deploy from a branch"** → Branch
`main` → `/ (root)`. Da der MVP komplett statisch im Repo-Root liegt
(`index.html`), serviert GitHub die Seite direkt — bei jedem Push auf `main`
wird automatisch neu deployt. Voraussetzung: das Repo ist **public** (oder ein
bezahlter GitHub-Plan).

## 🗺️ Mögliche nächste Schritte

- Echtes Backend (Auth, DB) statt `localStorage`
- Bild-Uploads & Galerie statt Emoji-Platzhalter
- Echte Identitäts-Verifizierung & Zahlungsabwicklung
- Geo-/Umkreissuche, Buchungskalender, Push-Benachrichtigungen
- Moderations-Dashboard für gemeldete Inhalte

---

_Gebaut als MVP-Demo. Keine Rechtsberatung; Platzhalter-Texte für AGB/Datenschutz._
