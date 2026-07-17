"""Browser-based calibration helper.

Alongside the exported frame we write an HTML page with the frame embedded.
The user clicks the four pitch corners in the browser; the page shows the
pixel coordinates and a ready-to-paste analyze command. No image editor,
no GUI toolkit dependencies.
"""
from __future__ import annotations

_TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>pitchtracker – Platz-Kalibrierung</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; background: #f4f6f8; color: #1a1a2e; }
  header { background: #14532d; color: #fff; padding: 16px 24px; }
  header h1 { margin: 0; font-size: 1.2rem; }
  main { padding: 16px 24px; max-width: 1400px; margin: 0 auto; }
  .steps b { color: #14532d; }
  #wrap { position: relative; display: inline-block; max-width: 100%;
          box-shadow: 0 2px 8px rgba(0,0,0,.25); cursor: crosshair; }
  #wrap img { display: block; max-width: 100%; height: auto; }
  .marker { position: absolute; transform: translate(-50%, -50%); background: #e63946;
            color: #fff; border: 2px solid #fff; border-radius: 50%; width: 26px; height: 26px;
            line-height: 22px; text-align: center; font-weight: 700; pointer-events: none;
            box-shadow: 0 1px 4px rgba(0,0,0,.5); }
  button { padding: 8px 14px; border: 0; border-radius: 6px; background: #1f2937; color: #fff;
           cursor: pointer; font-size: .95rem; margin-right: 8px; }
  button:hover { background: #374151; }
  #result { display: none; background: #fff; border-radius: 8px; padding: 16px;
            margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.15); }
  textarea, input[type=text] { width: 100%; box-sizing: border-box; font-family: Consolas, monospace;
             font-size: .9rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
  #copied { color: #14532d; font-weight: 600; display: none; margin-left: 8px; }
  .hint { color: #555; font-size: .9rem; }
</style>
</head>
<body>
<header><h1>⚽ pitchtracker – Platz-Kalibrierung</h1></header>
<main>
  <p class="steps">Klicke die <b>4 Ecken des Spielfelds</b> im Bild an, in dieser Reihenfolge:<br>
  <b>① oben links → ② oben rechts → ③ unten rechts → ④ unten links</b></p>
  <div id="wrap"><img id="img" src="data:image/png;base64,__B64__" alt="Videoframe"></div>
  <p>
    <button id="undo">↩ Letzten Punkt löschen</button>
    <button id="reset">Neu anfangen</button>
    <span id="status" class="hint">Noch 4 Ecken anklicken …</span>
  </p>
  <div id="result">
    <p><b>Fertig!</b> Deine Ecken-Koordinaten:</p>
    <input type="text" id="corners" readonly>
    <p style="margin-bottom:4px"><b>Fertiger Probelauf-Befehl</b> (2 Minuten, mit Kontroll-Video):</p>
    <textarea id="cmd" rows="3" readonly></textarea>
    <p>
      <button id="copy">📋 Befehl kopieren</button><span id="copied">Kopiert!</span>
    </p>
    <p class="hint">Danach in PowerShell einfügen. Für die ganze Halbzeit später
    <code>--max-seconds 120 --annotate</code> durch
    <code>--stride 5 --model yolov8n.pt</code> ersetzen.</p>
  </div>
</main>
<script>
  const img = document.getElementById('img');
  const wrap = document.getElementById('wrap');
  const result = document.getElementById('result');
  const statusEl = document.getElementById('status');
  const labels = ['① oben links', '② oben rechts', '③ unten rechts', '④ unten links'];
  let pts = [];

  function redraw() {
    wrap.querySelectorAll('.marker').forEach(m => m.remove());
    pts.forEach((p, i) => {
      const m = document.createElement('div');
      m.className = 'marker';
      m.textContent = i + 1;
      m.style.left = (p.x / img.naturalWidth * 100) + '%';
      m.style.top = (p.y / img.naturalHeight * 100) + '%';
      wrap.appendChild(m);
    });
    if (pts.length === 4) {
      const s = pts.map(p => p.x + ',' + p.y).join(' ');
      document.getElementById('corners').value = s;
      document.getElementById('cmd').value =
        'python -m pitchtracker analyze __VIDEO__ --corners "' + s +
        '" --pitch 105x68 --max-seconds 120 --start-seconds 60 --annotate --out test';
      result.style.display = 'block';
      statusEl.textContent = 'Alle 4 Ecken gesetzt.';
    } else {
      result.style.display = 'none';
      statusEl.textContent = 'Als Nächstes anklicken: ' + labels[pts.length];
    }
  }

  img.addEventListener('click', e => {
    if (pts.length >= 4) return;
    const r = img.getBoundingClientRect();
    pts.push({
      x: Math.round((e.clientX - r.left) * img.naturalWidth / r.width),
      y: Math.round((e.clientY - r.top) * img.naturalHeight / r.height),
    });
    redraw();
  });
  document.getElementById('undo').addEventListener('click', () => { pts.pop(); redraw(); });
  document.getElementById('reset').addEventListener('click', () => { pts = []; redraw(); });
  document.getElementById('copy').addEventListener('click', () => {
    const ta = document.getElementById('cmd');
    ta.select();
    navigator.clipboard ? navigator.clipboard.writeText(ta.value) : document.execCommand('copy');
    document.getElementById('copied').style.display = 'inline';
    setTimeout(() => document.getElementById('copied').style.display = 'none', 2000);
  });
  redraw();
</script>
</body>
</html>
"""


def render_calibration_html(png_base64: str, video_name: str) -> str:
    return _TEMPLATE.replace("__B64__", png_base64).replace("__VIDEO__", video_name)
