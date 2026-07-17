import numpy as np

from pitchtracker.teams import assign_teams, sample_torso_color
from pitchtracker.types import Detection, Track


def solid_frame(bgr: tuple[int, int, int]) -> np.ndarray:
    return np.full((200, 200, 3), bgr, dtype=np.uint8)


def test_sample_torso_color_reads_center_of_box():
    frame = solid_frame((10, 20, 200))  # reddish
    det = Detection(50, 50, 150, 150)
    color = sample_torso_color(frame, det)
    assert color is not None
    assert np.allclose(color, [10, 20, 200], atol=1)


def test_sample_torso_color_degenerate_box():
    frame = solid_frame((0, 0, 0))
    assert sample_torso_color(frame, Detection(10, 10, 10, 10)) is None


def test_assign_teams_separates_red_and_blue():
    red = np.array([30, 30, 210], dtype=np.float32)
    blue = np.array([200, 120, 30], dtype=np.float32)
    rng = np.random.default_rng(3)
    tracks = []
    for i in range(6):
        base = red if i < 3 else blue
        t = Track(i)
        t.color_samples = [
            np.clip(base + rng.normal(0, 10, 3), 0, 255).astype(np.float32) for _ in range(20)
        ]
        tracks.append(t)
    assign_teams(tracks)
    team_red = {tracks[i].team for i in range(3)}
    team_blue = {tracks[i].team for i in range(3, 6)}
    assert len(team_red) == 1 and len(team_blue) == 1
    assert team_red != team_blue


def test_assign_teams_too_few_tracks_is_noop():
    t = Track(1)
    t.color_samples = [np.array([1, 2, 3], dtype=np.float32)]
    assign_teams([t])
    assert t.team is None
