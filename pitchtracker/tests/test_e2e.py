"""End-to-end test: synthetic match -> full pipeline -> plausible stats."""
import numpy as np
import pytest

from pitchtracker.pipeline import analyze_frames
from pitchtracker.report import render_html_report
from pitchtracker.synthetic import ScriptedDetector, SyntheticMatch, scripted_frames


@pytest.fixture(scope="module")
def analysis_and_match():
    match = SyntheticMatch(n_per_team=4, duration_s=20.0, fps=25.0, seed=42)
    detector = ScriptedDetector()
    analysis = analyze_frames(
        scripted_frames(match, detector, stride=1),
        detector,
        match.calibration(),
        fps=match.fps,
        video_path="synthetic://test",
    )
    return analysis, match


def test_all_players_tracked(analysis_and_match):
    analysis, match = analysis_and_match
    # 8 simulated players; allow one fragmented identity but no big explosion.
    assert 8 <= len(analysis.players) <= 10


def test_distances_close_to_ground_truth(analysis_and_match):
    analysis, match = analysis_and_match
    gt_total = sum(match.gt_distance_m(i) for i in range(2 * match.n_per_team))
    measured_total = sum(p.distance_m for p in analysis.players)
    # Detection noise, smoothing and 5% dropped frames cost some accuracy;
    # totals must still be within 15%.
    assert abs(measured_total - gt_total) / gt_total < 0.15


def test_teams_split_evenly(analysis_and_match):
    analysis, _ = analysis_and_match
    teams = [p.team for p in analysis.players if p.team is not None]
    assert set(teams) == {0, 1}
    counts = np.bincount(teams)
    assert counts.min() >= 3  # 4 players per team, at most one lost/fragmented


def test_speeds_are_human(analysis_and_match):
    analysis, _ = analysis_and_match
    for p in analysis.players:
        assert 0 < p.avg_speed_kmh < 15
        assert p.top_speed_kmh < 40


def test_report_renders(analysis_and_match, tmp_path):
    analysis, _ = analysis_and_match
    html = render_html_report(analysis, title="E2E-Test")
    assert "Spielerstatistiken" in html
    assert "data:image/png;base64," in html
    out = tmp_path / "report.html"
    out.write_text(html)
    assert out.stat().st_size > 10_000
