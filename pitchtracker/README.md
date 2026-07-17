# ⚽ pitchtracker

**Spieler-Tracking und Profi-Statistiken aus Amateur-Sportvideos.**

Veo, Spiideo, Pixellot & Co. haben die Aufnahme von Amateurspielen gelöst —
aber die Daten, die Profis selbstverständlich bekommen (Laufleistung,
Sprints, Heatmaps, Passquoten), gibt es für Amateure kaum. `pitchtracker`
setzt als zweiter Tracker auf das vorhandene Videomaterial auf und rechnet
daraus individuelle Spielerstatistiken.

**Input:** ein Spielvideo (z.B. Veo-Export als MP4).
**Output:** ein HTML-Report mit Statistiken + Heatmaps pro Spieler und
optional ein annotiertes Video mit den Tracking-Boxen.

## Was v0.1 kann

| Feature | Status |
|---|---|
| Spieler erkennen (YOLO) | ✅ |
| Spieler über Zeit verfolgen (eigener Tracker) | ✅ |
| Team-Zuordnung über Trikotfarben | ✅ |
| Bild → Platzkoordinaten in Metern (Homographie) | ✅ |
| Laufdistanz, Ø-Tempo, Top-Tempo, Sprints | ✅ |
| Heatmap pro Spieler | ✅ |
| HTML-Report + annotiertes Video | ✅ |
| Ball-Tracking | 🔜 Roadmap |
| Pässe / Passquote / Zweikämpfe | 🔜 Roadmap (braucht Ball) |
| Spieler-Identität über Halbzeiten (Re-ID) | 🔜 Roadmap |

## Installation

```bash
cd pitchtracker
pip install -e ".[yolo]"    # mit YOLO-Detektor für echtes Videomaterial
pip install -e ".[dev]"     # Tests
```

## Schnellstart: Demo ohne eigenes Video

```bash
pitchtracker demo --out demo
# → demo/report.html, demo/annotated.mp4, demo/raw.mp4
```

Simuliert ein Spiel, jagt es durch die komplette Pipeline und erzeugt den
Report — so sieht man den Output, bevor man eigenes Material einspeist.

## Eigenes Spiel analysieren (z.B. Veo-Aufnahme)

**Schritt 1 — Kalibrierung:** Einen Frame exportieren und die Pixel-Koordinaten
der vier Platz-Ecken ablesen (jedes Bildbetrachtungsprogramm zeigt
Cursor-Koordinaten, z.B. GIMP):

```bash
pitchtracker frame spiel.mp4 --time 30 -o frame.png
```

Reihenfolge der Ecken: **oben-links, oben-rechts, unten-rechts, unten-links**
(so wie der Platz im Bild erscheint).

**Schritt 2 — Analyse:**

```bash
pitchtracker analyze spiel.mp4 \
  --corners "210,140 1710,135 1890,1020 30,1030" \
  --pitch 105x68 \
  --annotate \
  --max-seconds 300 \
  --out analyse/
```

- `--pitch`: echte Platzmaße in Metern (Amateurplätze sind oft kleiner als 105×68)
- `--max-seconds`: erst mit einem kurzen Ausschnitt testen
- `--stride 2`: analysiert jeden 2. Frame (Standard; schneller, kaum Genauigkeitsverlust)
- `--model yolov8n.pt` für schneller / `yolov8x.pt` für genauer

Ergebnis: `analyse/report.html` mit Statistik-Tabelle und Heatmaps.

## Wichtige Einschränkungen (ehrlich)

- **Kamerafahrten:** Die Kalibrierung gilt pro Kameraeinstellung. Veo-Systeme
  schwenken virtuell — für v0.1 den **Panorama-/Weitwinkel-Export** verwenden,
  nicht den geschnittenen "Follow"-Modus.
- **Identität:** Der Tracker hält IDs über Verdeckungen von ~1 Sekunde. Läuft
  ein Spieler minutenlang aus dem Bild oder durch dichte Trauben, bekommt er
  eine neue ID. Re-Identifikation ist der nächste große Baustein.
- **Torhüter/Schiri** landen aktuell im farblich näheren Team.

## Architektur

```
Video ──► Detektor (YOLO) ──► Tracker (IDs) ──► Team-Clustering (Trikotfarben)
                                   │
                          Homographie (px → Meter)
                                   │
                          Statistiken (Distanz, Tempo, Sprints, Heatmap)
                                   │
                          Report (HTML) + annotiertes Video
```

Jede Stufe ist austauschbar (`detect.Detector` ist ein Protocol) — der
Detektor lässt sich z.B. durch ein auf Fußball feingetuntes Modell ersetzen,
der Tracker durch ByteTrack, ohne den Rest anzufassen.

## Roadmap

1. **v0.2 — Qualität:** ByteTrack-Tracking, automatische Platzerkennung
   (Linien-Detektion statt manueller Ecken), Schiri als drittes Cluster
2. **v0.3 — Ball & Events:** Ball-Tracking, Ballbesitz pro Team,
   einfache Pass-Erkennung (Ballbesitzwechsel innerhalb eines Teams)
3. **v0.4 — Identität:** Spieler-Re-ID über Trikotnummern-OCR + einmaliges
   Selbst-Tagging in der App ("das bin ich")
4. **v1.0 — Produkt:** Web-App mit Upload, Spielerprofilen über mehrere
   Spiele, Bestenlisten unter Freunden, Saison-Statistiken

## Entwicklung

```bash
pip install -e ".[dev]"
python -m pytest
```

Die Test-Suite enthält einen End-to-End-Test mit einem synthetischen Spiel
und bekannter Ground-Truth: gemessene Laufdistanzen müssen auf ±15 % mit den
simulierten übereinstimmen, Teams korrekt getrennt werden.
