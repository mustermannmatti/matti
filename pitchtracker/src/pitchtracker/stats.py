"""Movement statistics from tracked positions in pitch coordinates.

Everything here works on meters + seconds, independent of camera/detector.
Positions are smoothed and speed-capped before computing distance so that
detector jitter and occasional track jumps don't inflate the numbers.
"""
from __future__ import annotations

import numpy as np

from .pitch import PitchCalibration
from .types import PlayerStats, Track

MAX_HUMAN_SPEED_MS = 11.0  # anything above this is a tracking glitch
SPRINT_SPEED_MS = 5.5  # ~20 km/h, common sprint threshold in match analysis
MIN_SPRINT_SECONDS = 1.0
HEATMAP_BINS = (30, 20)  # (length, width) grid cells


def smooth_positions(positions: np.ndarray, window: int = 5) -> np.ndarray:
    """Moving-average smoothing along the time axis of an (N, 2) array."""
    if len(positions) < 2 or window <= 1:
        return positions.copy()
    kernel = np.ones(window) / window
    out = np.empty_like(positions, dtype=np.float64)
    for dim in range(positions.shape[1]):
        padded = np.pad(positions[:, dim], (window // 2, window - 1 - window // 2), mode="edge")
        out[:, dim] = np.convolve(padded, kernel, mode="valid")
    return out


def compute_player_stats(
    track: Track,
    calibration: PitchCalibration,
    fps: float,
) -> PlayerStats | None:
    """Turn one image-space track into pitch-space statistics.

    Returns None for tracks with too little usable data.
    """
    if len(track) < 3 or fps <= 0:
        return None
    frames = np.array([o.frame_index for o in track.observations], dtype=np.float64)
    feet_px = np.array([o.detection.foot_point for o in track.observations], dtype=np.float32)
    pos_m = calibration.to_pitch(feet_px).astype(np.float64)

    # Drop observations projected far off the pitch (bad detections, spectators).
    on_pitch = calibration.inside_pitch(pos_m)
    if on_pitch.sum() < 3:
        return None
    frames, pos_m = frames[on_pitch], pos_m[on_pitch]

    pos_m = smooth_positions(pos_m)
    # Observations carry true video frame indices, so stride is already baked in.
    dt = np.diff(frames) / fps  # seconds between observations
    steps = np.linalg.norm(np.diff(pos_m, axis=0), axis=1)
    with np.errstate(divide="ignore", invalid="ignore"):
        speeds = np.where(dt > 0, steps / dt, 0.0)

    # Cap glitch steps instead of counting teleports as sprints.
    valid = speeds <= MAX_HUMAN_SPEED_MS
    distance_m = float(np.where(valid, steps, 0.0).sum())
    speeds = np.where(valid, speeds, 0.0)

    seconds = float(dt.sum())
    if seconds <= 0:
        return None
    avg_speed_ms = distance_m / seconds
    top_speed_ms = float(np.percentile(speeds, 98)) if len(speeds) else 0.0

    sprint_count = _count_sprints(speeds, dt)

    heatmap, _, _ = np.histogram2d(
        pos_m[:, 0],
        pos_m[:, 1],
        bins=HEATMAP_BINS,
        range=[[0, calibration.pitch_length_m], [0, calibration.pitch_width_m]],
    )

    return PlayerStats(
        track_id=track.track_id,
        team=track.team,
        seconds_tracked=seconds,
        distance_m=distance_m,
        avg_speed_kmh=avg_speed_ms * 3.6,
        top_speed_kmh=top_speed_ms * 3.6,
        sprint_count=sprint_count,
        heatmap=heatmap,
        positions_m=pos_m,
    )


def _count_sprints(speeds: np.ndarray, dt: np.ndarray) -> int:
    """Count contiguous runs above the sprint threshold lasting long enough."""
    count = 0
    run_seconds = 0.0
    in_sprint = False
    for speed, step_dt in zip(speeds, dt):
        if speed >= SPRINT_SPEED_MS:
            run_seconds += step_dt
            if not in_sprint and run_seconds >= MIN_SPRINT_SECONDS:
                count += 1
                in_sprint = True
        else:
            run_seconds = 0.0
            in_sprint = False
    return count
