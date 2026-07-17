"""Synthetic match generator.

Simulates 2 teams moving on a virtual pitch, renders camera-like frames and
provides ground-truth detections. Serves two purposes:
  * end-to-end tests with known ground truth (distances, identities, teams)
  * the `pitchtracker demo` command, which shows the full output without
    needing real footage or a GPU.
"""
from __future__ import annotations

from collections import deque
from collections.abc import Iterator
from dataclasses import dataclass, field

import cv2
import numpy as np

from .pitch import PitchCalibration
from .types import Detection

IMAGE_SIZE = (1280, 720)  # (width, height)
# Pitch corners as seen by a typical elevated sideline camera (trapezoid):
# far-left, far-right, near-right, near-left.
IMAGE_CORNERS = np.array(
    [[220.0, 130.0], [1060.0, 130.0], [1230.0, 650.0], [50.0, 650.0]], dtype=np.float32
)
TEAM_JERSEY_BGR = {0: (40, 40, 210), 1: (200, 120, 30)}  # red kits vs. blue kits


@dataclass
class _PlayerSim:
    home: np.ndarray
    pos: np.ndarray
    target: np.ndarray
    speed: float = 2.0


@dataclass
class SyntheticMatch:
    n_per_team: int = 5
    duration_s: float = 30.0
    fps: float = 25.0
    pitch_length_m: float = 105.0
    pitch_width_m: float = 68.0
    seed: int = 7
    trajectories: np.ndarray = field(init=False)  # (players, frames, 2) meters
    teams: list[int] = field(init=False)

    def __post_init__(self) -> None:
        rng = np.random.default_rng(self.seed)
        n_frames = int(self.duration_s * self.fps)
        players: list[_PlayerSim] = []
        self.teams = []
        for team in (0, 1):
            for i in range(self.n_per_team):
                # Spread home positions over each half, away from the exact border.
                x = (0.15 + 0.3 * (i % 3) + 0.35 * team) * self.pitch_length_m
                y = (0.2 + 0.6 * ((i // 3) + rng.random() * 0.5) / 2) * self.pitch_width_m
                home = np.array([x, y])
                players.append(_PlayerSim(home=home, pos=home.copy(), target=home.copy()))
                self.teams.append(team)

        dt = 1.0 / self.fps
        traj = np.zeros((len(players), n_frames, 2))
        for f in range(n_frames):
            for pi, p in enumerate(players):
                if np.linalg.norm(p.target - p.pos) < 0.5:
                    p.target = np.clip(
                        p.home + rng.uniform([-18, -12], [18, 12]),
                        [1, 1],
                        [self.pitch_length_m - 1, self.pitch_width_m - 1],
                    )
                    mode = rng.random()
                    p.speed = 7.0 if mode < 0.15 else (1.5 if mode < 0.35 else 3.0)
                direction = p.target - p.pos
                dist = np.linalg.norm(direction)
                if dist > 1e-6:
                    step = min(p.speed * dt, dist)
                    p.pos = p.pos + direction / dist * step
                traj[pi, f] = p.pos
        self.trajectories = traj
        self._world_to_image = cv2.getPerspectiveTransform(
            np.array(
                [
                    [0, 0],
                    [self.pitch_length_m, 0],
                    [self.pitch_length_m, self.pitch_width_m],
                    [0, self.pitch_width_m],
                ],
                dtype=np.float32,
            ),
            IMAGE_CORNERS,
        )

    @property
    def n_frames(self) -> int:
        return self.trajectories.shape[1]

    def calibration(self) -> PitchCalibration:
        return PitchCalibration(IMAGE_CORNERS, self.pitch_length_m, self.pitch_width_m)

    def gt_distance_m(self, player_index: int) -> float:
        steps = np.diff(self.trajectories[player_index], axis=0)
        return float(np.linalg.norm(steps, axis=1).sum())

    def _project(self, points_m: np.ndarray) -> np.ndarray:
        pts = np.asarray(points_m, dtype=np.float32).reshape(-1, 1, 2)
        return cv2.perspectiveTransform(pts, self._world_to_image).reshape(-1, 2)

    def _boxes(self, frame_index: int) -> list[tuple[int, Detection]]:
        feet = self._project(self.trajectories[:, frame_index])
        boxes = []
        for pi, (fx, fy) in enumerate(feet):
            # Apparent player height shrinks with distance (image y).
            h = 25 + (fy - 130) / 520 * 45
            w = 0.45 * h
            boxes.append((pi, Detection(fx - w / 2, fy - h, fx + w / 2, fy, 1.0)))
        return boxes

    def render_frame(self, frame_index: int) -> np.ndarray:
        img = np.full((IMAGE_SIZE[1], IMAGE_SIZE[0], 3), (50, 105, 40), dtype=np.uint8)
        # Pitch outline + halfway line.
        outline = self._project(
            np.array(
                [
                    [0, 0],
                    [self.pitch_length_m, 0],
                    [self.pitch_length_m, self.pitch_width_m],
                    [0, self.pitch_width_m],
                ]
            )
        ).astype(np.int32)
        cv2.polylines(img, [outline], True, (230, 230, 230), 2)
        half = self._project(
            np.array([[self.pitch_length_m / 2, 0], [self.pitch_length_m / 2, self.pitch_width_m]])
        ).astype(np.int32)
        cv2.line(img, tuple(half[0]), tuple(half[1]), (230, 230, 230), 2)

        for pi, det in self._boxes(frame_index):
            jersey = TEAM_JERSEY_BGR[self.teams[pi]]
            x1, y1, x2, y2 = int(det.x1), int(det.y1), int(det.x2), int(det.y2)
            bh = y2 - y1
            # Legs (dark), torso (jersey color), head (skin tone).
            cv2.rectangle(img, (x1 + 2, y1 + int(0.55 * bh)), (x2 - 2, y2), (40, 40, 40), -1)
            cv2.rectangle(img, (x1, y1 + int(0.15 * bh)), (x2, y1 + int(0.55 * bh)), jersey, -1)
            cv2.circle(
                img, ((x1 + x2) // 2, y1 + int(0.08 * bh)), max(2, int(0.1 * bh)), (150, 180, 220), -1
            )
        return img

    def detections(self, frame_index: int, rng: np.random.Generator) -> list[Detection]:
        """Ground-truth boxes with realistic noise: jitter and missed detections."""
        out = []
        for _, det in self._boxes(frame_index):
            if rng.random() < 0.05:  # 5% miss rate
                continue
            jx, jy = rng.normal(0, 1.5, size=2)
            out.append(
                Detection(det.x1 + jx, det.y1 + jy, det.x2 + jx, det.y2 + jy, 0.9)
            )
        return out


class ScriptedDetector:
    """Detector fed from a queue — paired with `scripted_frames` below."""

    def __init__(self) -> None:
        self.queue: deque[list[Detection]] = deque()

    def detect(self, frame_bgr: np.ndarray) -> list[Detection]:
        return self.queue.popleft()


def scripted_frames(
    match: SyntheticMatch, detector: ScriptedDetector, stride: int = 1, seed: int = 11
) -> Iterator[tuple[int, np.ndarray]]:
    """Yield rendered frames while queueing the matching noisy detections."""
    rng = np.random.default_rng(seed)
    for f in range(0, match.n_frames, stride):
        detector.queue.append(match.detections(f, rng))
        yield f, match.render_frame(f)


def write_video(match: SyntheticMatch, path: str, stride: int = 1) -> None:
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(path, fourcc, match.fps / stride, IMAGE_SIZE)
    try:
        for f in range(0, match.n_frames, stride):
            writer.write(match.render_frame(f))
    finally:
        writer.release()
