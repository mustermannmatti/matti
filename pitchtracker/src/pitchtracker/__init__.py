"""pitchtracker — Spieler-Tracking und Statistiken aus Amateur-Sportvideos."""
from .pipeline import analyze_frames, analyze_video
from .pitch import PitchCalibration, parse_corners
from .report import render_html_report
from .types import Detection, MatchAnalysis, PlayerStats, Track

__version__ = "0.1.0"

__all__ = [
    "analyze_frames",
    "analyze_video",
    "PitchCalibration",
    "parse_corners",
    "render_html_report",
    "Detection",
    "MatchAnalysis",
    "PlayerStats",
    "Track",
    "__version__",
]
