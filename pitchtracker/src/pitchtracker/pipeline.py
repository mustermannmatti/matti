"""The end-to-end analysis pipeline: video in, MatchAnalysis out."""
from __future__ import annotations

from collections.abc import Callable, Iterator

import cv2
import numpy as np

from .detect import Detector
from .pitch import PitchCalibration
from .stats import compute_player_stats
from .teams import assign_teams, sample_torso_color
from .track import GreedyTracker
from .types import MatchAnalysis, PlayerStats

MIN_TRACK_SECONDS = 3.0  # discard flickering short tracks


def iter_video_frames(
    video_path: str, stride: int = 1, max_frames: int | None = None
) -> Iterator[tuple[int, np.ndarray]]:
    """Yield (frame_index, frame_bgr) every `stride` frames."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Video nicht lesbar: {video_path}")
    try:
        index = 0
        yielded = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if index % stride == 0:
                yield index, frame
                yielded += 1
                if max_frames is not None and yielded >= max_frames:
                    break
            index += 1
    finally:
        cap.release()


def video_fps(video_path: str) -> float:
    cap = cv2.VideoCapture(video_path)
    try:
        fps = cap.get(cv2.CAP_PROP_FPS)
    finally:
        cap.release()
    return fps if fps and fps > 0 else 25.0


def analyze_frames(
    frames: Iterator[tuple[int, np.ndarray]],
    detector: Detector,
    calibration: PitchCalibration,
    fps: float,
    stride: int = 1,
    video_path: str = "",
    on_frame: Callable[[int, np.ndarray, list[tuple[int, object]]], None] | None = None,
) -> MatchAnalysis:
    """Run detection + tracking + team sampling over a frame stream.

    `on_frame(frame_index, frame, matches)` is an optional hook, used by the
    annotator to draw results while the video is streamed only once.
    """
    tracker = GreedyTracker()
    frames_analyzed = 0
    track_lookup = {}

    for frame_index, frame in frames:
        detections = detector.detect(frame)
        matches = tracker.update(frame_index, detections)
        frames_analyzed += 1

        # Sample jersey colors for team clustering (every match, cheap).
        for track_id, det in matches:
            if track_id not in track_lookup:
                track_lookup = {t.track_id: t for t in tracker.all_tracks()}
            color = sample_torso_color(frame, det)
            if color is not None:
                track_lookup[track_id].color_samples.append(color)

        if on_frame is not None:
            on_frame(frame_index, frame, matches)

    tracks = tracker.all_tracks()
    min_frames = MIN_TRACK_SECONDS * fps / stride
    tracks = [t for t in tracks if len(t) >= min_frames]
    assign_teams(tracks)

    players: list[PlayerStats] = []
    for track in tracks:
        stats = compute_player_stats(track, calibration, fps)
        if stats is not None:
            players.append(stats)
    players.sort(key=lambda p: -p.distance_m)

    return MatchAnalysis(
        video_path=video_path,
        fps=fps,
        frames_analyzed=frames_analyzed,
        pitch_length_m=calibration.pitch_length_m,
        pitch_width_m=calibration.pitch_width_m,
        players=players,
    )


def analyze_video(
    video_path: str,
    detector: Detector,
    calibration: PitchCalibration,
    stride: int = 2,
    max_frames: int | None = None,
    on_frame: Callable[[int, np.ndarray, list[tuple[int, object]]], None] | None = None,
) -> MatchAnalysis:
    fps = video_fps(video_path)
    frames = iter_video_frames(video_path, stride=stride, max_frames=max_frames)
    return analyze_frames(
        frames, detector, calibration, fps, stride=stride, video_path=video_path, on_frame=on_frame
    )
