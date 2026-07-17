"""HTML match report: stats table + per-player heatmaps, self-contained file."""
from __future__ import annotations

import base64
from html import escape

import cv2
import numpy as np

from .types import MatchAnalysis, PlayerStats

TEAM_NAMES = {0: "Team A", 1: "Team B", None: "–"}
TEAM_COLORS = {0: "#e63946", 1: "#457b9d", None: "#888888"}


def render_heatmap_png(stats: PlayerStats, length_m: float, width_m: float, scale: int = 8) -> bytes:
    """Render a player's position heatmap onto a pitch drawing, returns PNG bytes."""
    hm = stats.heatmap.T  # histogram2d: x=length rows -> transpose so rows=width
    if hm.max() > 0:
        hm = hm / hm.max()
    hm_img = (np.sqrt(hm) * 255).astype(np.uint8)  # sqrt boosts low-occupancy cells
    h, w = hm_img.shape
    hm_big = cv2.resize(hm_img, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
    hm_big = cv2.GaussianBlur(hm_big, (0, 0), sigmaX=scale * 0.8)
    colored = cv2.applyColorMap(hm_big, cv2.COLORMAP_TURBO)

    pitch = np.full_like(colored, (60, 110, 45))  # grass green (BGR)
    alpha = (hm_big.astype(np.float32) / 255.0 * 0.85)[..., None]
    out = (colored * alpha + pitch * (1 - alpha)).astype(np.uint8)
    _draw_pitch_lines(out, length_m, width_m)
    ok, buf = cv2.imencode(".png", out)
    if not ok:
        raise RuntimeError("PNG encoding failed")
    return buf.tobytes()


def _draw_pitch_lines(img: np.ndarray, length_m: float, width_m: float) -> None:
    h, w = img.shape[:2]
    white = (240, 240, 240)

    def px(x_m: float, y_m: float) -> tuple[int, int]:
        return (int(x_m / length_m * (w - 1)), int(y_m / width_m * (h - 1)))

    cv2.rectangle(img, px(0, 0), px(length_m, width_m), white, 2)
    cv2.line(img, px(length_m / 2, 0), px(length_m / 2, width_m), white, 2)
    cv2.circle(img, px(length_m / 2, width_m / 2), int(9.15 / length_m * w), white, 2)
    for x0 in (0.0, length_m - 16.5):  # penalty boxes
        cv2.rectangle(
            img, px(x0, width_m / 2 - 20.16), px(x0 + 16.5, width_m / 2 + 20.16), white, 2
        )


def render_html_report(analysis: MatchAnalysis, title: str = "Spielanalyse") -> str:
    rows = []
    cards = []
    for p in analysis.players:
        team_color = TEAM_COLORS.get(p.team, "#888888")
        team_name = TEAM_NAMES.get(p.team, "–")
        rows.append(
            f"<tr><td><span class='dot' style='background:{team_color}'></span> "
            f"Spieler #{p.track_id}</td><td>{team_name}</td>"
            f"<td>{p.seconds_tracked / 60:.1f} min</td>"
            f"<td>{p.distance_m / 1000:.2f} km</td>"
            f"<td>{p.avg_speed_kmh:.1f} km/h</td>"
            f"<td>{p.top_speed_kmh:.1f} km/h</td>"
            f"<td>{p.sprint_count}</td></tr>"
        )
        png = render_heatmap_png(p, analysis.pitch_length_m, analysis.pitch_width_m)
        b64 = base64.b64encode(png).decode("ascii")
        cards.append(
            f"<div class='card'><h3><span class='dot' style='background:{team_color}'></span> "
            f"Spieler #{p.track_id} <small>({team_name})</small></h3>"
            f"<img src='data:image/png;base64,{b64}' alt='Heatmap Spieler {p.track_id}'>"
            f"<p>{p.distance_m / 1000:.2f} km · Top {p.top_speed_kmh:.1f} km/h · "
            f"{p.sprint_count} Sprints</p></div>"
        )

    total_km = sum(p.distance_m for p in analysis.players) / 1000
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<style>
  body {{ font-family: system-ui, sans-serif; margin: 0; background: #f4f6f8; color: #1a1a2e; }}
  header {{ background: #14532d; color: #fff; padding: 24px 32px; }}
  header h1 {{ margin: 0 0 4px; font-size: 1.5rem; }}
  header p {{ margin: 0; opacity: .8; }}
  main {{ padding: 24px 32px; max-width: 1100px; margin: 0 auto; }}
  table {{ border-collapse: collapse; width: 100%; background: #fff; border-radius: 8px;
           overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }}
  th, td {{ padding: 10px 14px; text-align: left; border-bottom: 1px solid #eee; }}
  th {{ background: #1f2937; color: #fff; font-weight: 600; }}
  tr:last-child td {{ border-bottom: none; }}
  .dot {{ display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
           gap: 16px; margin-top: 24px; }}
  .card {{ background: #fff; border-radius: 8px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }}
  .card img {{ width: 100%; border-radius: 4px; }}
  .card h3 {{ margin: 0 0 8px; font-size: 1rem; }}
  .card p {{ margin: 8px 0 0; color: #555; font-size: .9rem; }}
</style>
</head>
<body>
<header>
  <h1>⚽ {escape(title)}</h1>
  <p>{analysis.frames_analyzed} Frames analysiert · {len(analysis.players)} Spieler getrackt ·
     Gesamtdistanz {total_km:.1f} km</p>
</header>
<main>
  <h2>Spielerstatistiken</h2>
  <table>
    <thead><tr><th>Spieler</th><th>Team</th><th>Getrackt</th><th>Distanz</th>
    <th>Ø Tempo</th><th>Top-Tempo</th><th>Sprints</th></tr></thead>
    <tbody>{''.join(rows)}</tbody>
  </table>
  <h2 style="margin-top:32px">Heatmaps</h2>
  <div class="grid">{''.join(cards)}</div>
</main>
</body>
</html>
"""
