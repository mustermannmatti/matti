import numpy as np

from pitchtracker.pitch import PitchCalibration
from pitchtracker.stats import compute_player_stats, smooth_positions
from pitchtracker.types import Detection, Track, TrackObservation

# Identity-like calibration: image pixels == pitch decimeters (scaled) for easy math.
# Corners chosen so 1 px = 0.1 m.
CORNERS = np.array([[0, 0], [1050, 0], [1050, 680], [0, 680]], dtype=np.float32)


def make_track(positions_m: np.ndarray, fps: float = 25.0) -> Track:
    """Build a track whose foot points project exactly to the given meters."""
    obs = []
    for i, (x, y) in enumerate(positions_m):
        px, py = x * 10, y * 10  # meters -> pixels under the calibration above
        obs.append(TrackObservation(i, Detection(px - 5, py - 20, px + 5, py)))
    return Track(1, obs)


def calibration() -> PitchCalibration:
    return PitchCalibration(CORNERS)


def test_constant_speed_distance_and_speed():
    fps = 25.0
    seconds = 10
    speed_ms = 3.0
    n = int(seconds * fps)
    xs = 10 + np.arange(n) * speed_ms / fps
    ys = np.full(n, 30.0)
    track = make_track(np.stack([xs, ys], axis=1), fps)
    stats = compute_player_stats(track, calibration(), fps)
    assert stats is not None
    expected = speed_ms * (n - 1) / fps
    assert abs(stats.distance_m - expected) < 0.5
    assert abs(stats.avg_speed_kmh - speed_ms * 3.6) < 0.5
    assert stats.sprint_count == 0  # 3 m/s is jogging


def test_sprint_detected():
    fps = 25.0
    # 5s jog at 2 m/s, 3s sprint at 7 m/s, 5s jog again.
    segments = [(5, 2.0), (3, 7.0), (5, 2.0)]
    xs, x = [], 5.0
    for seconds, speed in segments:
        for _ in range(int(seconds * fps)):
            x += speed / fps
            xs.append(x)
    ys = np.full(len(xs), 30.0)
    track = make_track(np.stack([np.array(xs), ys], axis=1), fps)
    stats = compute_player_stats(track, calibration(), fps)
    assert stats is not None
    assert stats.sprint_count == 1
    assert stats.top_speed_kmh > 20.0


def test_teleport_glitch_does_not_inflate_distance():
    fps = 25.0
    n = 250
    xs = 10 + np.arange(n) * 0.08  # 2 m/s
    ys = np.full(n, 30.0)
    pos = np.stack([xs, ys], axis=1)
    pos[100] = [90.0, 60.0]  # single-frame teleport across the pitch
    track = make_track(pos, fps)
    stats = compute_player_stats(track, calibration(), fps)
    assert stats is not None
    clean = np.stack([10 + np.arange(n) * 0.08, np.full(n, 30.0)], axis=1)
    clean_track = make_track(clean, fps)
    clean_stats = compute_player_stats(clean_track, calibration(), fps)
    # The glitch may add a little (smoothing spreads it) but not the ~150 m
    # a raw teleport would contribute.
    assert stats.distance_m < clean_stats.distance_m + 30


def test_short_track_returns_none():
    track = make_track(np.array([[10.0, 10.0], [10.1, 10.0]]))
    assert compute_player_stats(track, calibration(), 25.0) is None


def test_smoothing_preserves_endpoints_roughly():
    pos = np.stack([np.linspace(0, 10, 50), np.zeros(50)], axis=1)
    smoothed = smooth_positions(pos)
    assert abs(smoothed[0, 0] - 0) < 0.5
    assert abs(smoothed[-1, 0] - 10) < 0.5


def test_heatmap_concentrated_where_player_stood():
    fps = 25.0
    n = 200
    pos = np.tile(np.array([[26.25, 17.0]]), (n, 1))  # stands in one quadrant
    pos += np.random.default_rng(0).normal(0, 0.2, size=pos.shape)
    track = make_track(pos, fps)
    stats = compute_player_stats(track, calibration(), fps)
    assert stats is not None
    ix, iy = np.unravel_index(stats.heatmap.argmax(), stats.heatmap.shape)
    # Bin centers: 30 bins over 105 m, 20 bins over 68 m.
    assert abs((ix + 0.5) * 105 / 30 - 26.25) < 5
    assert abs((iy + 0.5) * 68 / 20 - 17.0) < 5
