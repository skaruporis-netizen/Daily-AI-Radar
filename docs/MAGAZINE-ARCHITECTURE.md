# Daily AI Radar 2.0 – Erweiterbare Architektur

## Ziele
- Magazin statt reines Dashboard; vollständige, strukturierte Artikel mit Quellen, INFO/WATCH/ACTION, IMPLICATION/EXPERIMENT/MATURITY.
- Individuelle Lesbarkeit: Schriftgröße (15–25px), hell/dunkel, mobil.
- Modell-Intelligence: geprüfte Benchmarks, Quellen, keine erfundenen Zeitreihen.
- Redaktionell kuratierte Artikel getrennt von ungeprüften Quellen.
- Langfristig Community-Signale, Lernmodule, persönliche Watchlist, Monitoring und Automatisierung.

## Vorhandener Stand
Die alte `index.html` und `assets/app.js` bleiben unverändert. `magazine.html`, `assets/magazine.css` und `assets/magazine.js` bilden eine neue, isolierte Darstellungsschicht. Datenquelle bleibt `data/editorial.json` plus `data/inbox.json`. Dadurch ist ein schrittweiser Rollout ohne Datenmigration möglich.

## Erweiterbares Zieldatenmodell
- `data/articles/YYYY/MM/<slug>.json`: id, title, deck, published_at, observed_at, updated_at, category, priority, summary, sections[] (heading, paragraphs, tables, citations), implications, experiments, maturity, sources[] (url, source_type, verified_at), revision.
- `data/models/catalog.json`: Modellfamilien, Varianten, Release-/Retirement-Daten, Lizenz, Verfügbarkeit, Provenienz.
- `data/benchmarks/snapshots/YYYY-MM-DD.json`: Benchmark-ID + Version, Konfiguration, Modell-ID, Datum, Score, Einheiten, Kosten, Quellen und Missing-Value-Status.
- `data/glossary.json`: erklärbare Begriffe mit Schwierigkeitsstufen.
- `data/community/inbox.json`: Reddit/Hacker News/GitHub/X Signale mit Herkunft, Status und redaktioneller Bewertung.
- `data/radar.json`: WATCH/ASSESS/TRIAL/ADOPT mit Begründung und Statushistorie.

## Datenpipeline
1. Quellen sammeln (GitHub Actions, RSS, APIs; keine geheimen Schlüssel im Browser).
2. Normalisieren, deduplizieren, Datum und Quelle verifizieren.
3. Redaktionelle Prüfung: Fakten vs Herstellerclaims vs Interpretation.
4. Freigegebene Artikel versioniert committen.
5. Statische Veröffentlichung via GitHub Pages; Refresh lädt ausschließlich publizierte Daten.

## Sicherheit & Qualität
- Keine internen Daten in öffentlichem Repo; niemals API-Schlüssel in JavaScript.
- Externe Texte nicht als Instruktionen interpretieren; URLs nur HTTPS.
- Keine Benchmark-Zeitreihen interpolieren, keine Nullwerte als 0 ausgeben.
- Kein behaupteter Live-Refresh, wenn nur Inbox neu geladen wird.
- Persönliche Leseeinstellungen und Lesezeichen aktuell nur im lokalen Browser (localStorage), nicht geräteübergreifend.
- HTML-Escaping aller dynamischen Inhalte; Links nur über sichere URLs.
- Review und automatisierte Tests vor Merge.

## Roadmap
1. **Jetzt:** separate Magazinoberfläche, Artikel-/Themenansicht, vergrößerbare Schrift, Themes, Model Explorer, Quellen-Inbox, Glossar, Lesezeichen.
2. Volltextartikel in eigenständigen JSON-/Markdown-Dateien mit geprüftem Rendering und Archiv.
3. Zeitreihen- und Benchmark-Importer mit unabhängiger Datenvalidierung.
4. Community-Signalquellen und redaktionelle Gewichtung.
5. Automatisierte, reviewpflichtige tägliche Artikelerstellung und Versionshistorie.
6. Optional Benutzerkonten und geräteübergreifende Kommentare/Watchlists über sicheres Backend.

## Test- und Releasekriterien
- Bestehende `index.html` bleibt benutzbar.
- Magazin muss bei fehlenden Daten einen Fehlerzustand zeigen, nicht fiktive Meldungen.
- Responsive Darstellung und Zoom 200 %.
- Quelle und Datenstand für jeden Benchmark erkennbar.
- Vor Produktivschaltung Browser-/Accessibility- und Funktionstests sowie redaktionelles Review.
