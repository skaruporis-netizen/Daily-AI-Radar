# Daily AI Radar – unabhängige Webanwendung

Ein eigenständiges, responsives **Technology Intelligence Dashboard** ohne Backend, API-Schlüssel oder Framework: über einen lokalen HTTP-Server (`python3 -m http.server 8000`) oder GitHub Pages betreiben.

## Was vorhanden ist

- Dashboard mit strategischen Thesen und INFO / WATCH / ACTION
- 60-Tage-Rückblick mit Quellen und Fachimplikationen
- Model Benchmarks mit transparentem Quellenstand, Scores, Kosten pro Benchmark-Aufgabe und Effort-Stufen
- Modellfamilien und Entwicklungs-Linien
- Neue Quellen mit Such- und Themenfilter, getrennt von redaktionell geprüften News
- **Jetzt aktualisieren**: lädt den neuesten veröffentlichten JSON-Stand mit Cache-Busting neu
- **Täglich circa 08:00 Uhr Europe/Berlin**: GitHub Actions sammelt neue RSS-/Atom-Quellen, speichert und committet `data/inbox.json`

## GitHub Pages veröffentlichen

1. Alle Dateien in den **Root** des GitHub-Repositories `skaruporis-netizen/Daily-AI-Radar` kopieren/committen.
2. `Settings → Pages → Build and deployment → Deploy from a branch → main → / (root)` einstellen. URL: `https://skaruporis-netizen.github.io/Daily-AI-Radar/` (erst nach erfolgreicher Aktivierung erreichbar).
3. In `Settings → Actions → General` sicherstellen, dass Workflows erlaubt sind; `Workflow permissions` benötigt `Read and write permissions` bzw. ein genehmigtes Repo-Setup. Workflow `.github/workflows/daily-update.yml` verwendet minimal `contents: write`.
4. In `Actions → Daily AI Radar · Quellen aktualisieren` kann per `Run workflow` ein manueller Server-Lauf gestartet werden. Danach `Jetzt aktualisieren` in der Web-App klicken.

## Wichtige Begrenzungen

- Der Refresh-Button **lädt den neu veröffentlichten Stand**; er löst keine privilegierte GitHub Action direkt aus. Eine anonyme statische Webseite darf kein GitHub-Write-Token enthalten.
- Der tägliche Job **sammelt Quellen automatisiert**, aber klassifiziert diese ausdrücklich als **ungeprüfte Inbox**. Er aktualisiert **nicht** eigenmächtig Benchmarkwerte, strategische Einordnung oder die redaktionelle 60-Tage-Zusammenfassung.
- Für vollständig **KI-kuratierte Tagesanalysen** ist anschließend ein autorisierter Agenten-/LLM-Workflow mit Review- und Quellenprüfung einzurichten. Der bereits bestehende ChatGPT-Task ist zunächst unabhängig von dieser GitHub-Seite.
- Manche Feeds blockieren automatisierte Abrufe. Jeder Fehler erscheint als Datenstatus, nicht als erfundene Aktualisierung. Wegen GitHub-Actions-Queueing ist 08:00 keine garantierte sekundengenaue Ausführungszeit.
- Das öffentliche Repository darf keine internen Engineering-Daten oder geschützten Informationen enthalten.

## Lokal testen

```sh
python3 -m http.server 8000
# Browser: http://localhost:8000
python3 -m unittest discover -s tests -v
python3 scripts/refresh.py --force   # braucht Internet; aktualisiert data/inbox.json
```

## Daten-Governance

| Datei | Herkunft | Pflege |
|---|---|---|
| `data/editorial.json` | Manuell überprüfte Primärquellen und unabhängige Modellseiten | Review / Commit |
| `data/inbox.json` | Automatisch eingetroffene RSS-/Atom-Quellen | Täglich via GitHub Actions |
| `.github/workflows/daily-update.yml` | Zeitplan + sichere Repository-Schreibrechte | Versionskontrolliert |

Die Benchmarkwerte sind ein eingefrorener Snapshot vom **17. Oktober 2026**, mit Links auf die jeweiligen Modellseiten von Artificial Analysis. Modellvergleiche sind effort- und konfigurationsabhängig. Kein 'Zeitverlauf' aus erfundenen Datenpunkten: Die Entwicklungsübersicht zeigt nachweisbare Veröffentlichungsereignisse.
