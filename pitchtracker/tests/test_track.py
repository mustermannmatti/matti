import numpy as np

from pitchtracker.track import GreedyTracker, iou
from pitchtracker.types import Detection


def box(cx: float, cy: float, w: float = 30, h: float = 60) -> Detection:
    return Detection(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)


def test_iou_identical_and_disjoint():
    a = box(100, 100)
    assert iou(a, a) == 1.0
    assert iou(a, box(500, 500)) == 0.0


def test_stable_ids_for_two_moving_players():
    tracker = GreedyTracker()
    # Two players moving horizontally in opposite directions, well separated.
    for f in range(30):
        detections = [box(100 + 4 * f, 100), box(800 - 4 * f, 400)]
        matches = tracker.update(f, detections)
        assert len(matches) == 2
    tracks = tracker.all_tracks()
    assert len(tracks) == 2
    assert all(len(t) == 30 for t in tracks)


def test_track_survives_missed_detections():
    tracker = GreedyTracker(max_missed=10)
    for f in range(10):
        tracker.update(f, [box(100 + 5 * f, 100)])
    # 5 frames with no detection at all.
    for f in range(10, 15):
        tracker.update(f, [])
    # Player reappears where constant-velocity motion predicts.
    matches = tracker.update(15, [box(100 + 5 * 15, 100)])
    assert len(tracker.all_tracks()) == 1, "reappearing player must keep their ID"
    assert matches[0][0] == tracker.all_tracks()[0].track_id


def test_new_track_created_for_distant_detection():
    tracker = GreedyTracker()
    tracker.update(0, [box(100, 100)])
    tracker.update(1, [box(100, 100), box(1000, 600)])
    assert len(tracker.all_tracks()) == 2


def test_crossing_players_do_not_spawn_new_ids():
    tracker = GreedyTracker()
    # Two players approach on the same line, pass through, continue.
    ids_start: set[int] = set()
    matches: list = []
    for f in range(41):
        x1 = 100 + 10 * f   # moving right
        x2 = 500 - 10 * f   # moving left, cross at f=20
        matches = tracker.update(f, [box(x1, 300), box(x2, 300)])
        if f == 5:
            ids_start = {m[0] for m in matches}
    # Identity swap at the crossing would be acceptable for a greedy tracker,
    # but no *new* identities may be created.
    assert {m[0] for m in matches} == ids_start
    assert len(tracker.all_tracks()) == 2
