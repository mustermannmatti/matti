"""Pitch calibration: map image pixels to metric pitch coordinates.

The user marks the four pitch corners in one video frame (e.g. via the
`pitchtracker frame` command). A homography then maps any ground-plane
point (a player's foot point) to meters on the pitch.

Corner order: top-left, top-right, bottom-right, bottom-left — as the
pitch appears in the image. They map to (0,0), (L,0), (L,W), (0,W).
"""
from __future__ import annotations

import cv2
import numpy as np

FIFA_PITCH_LENGTH_M = 105.0
FIFA_PITCH_WIDTH_M = 68.0


class PitchCalibration:
    def __init__(
        self,
        image_corners: np.ndarray,
        pitch_length_m: float = FIFA_PITCH_LENGTH_M,
        pitch_width_m: float = FIFA_PITCH_WIDTH_M,
    ) -> None:
        corners = np.asarray(image_corners, dtype=np.float32).reshape(4, 2)
        world = np.array(
            [
                [0.0, 0.0],
                [pitch_length_m, 0.0],
                [pitch_length_m, pitch_width_m],
                [0.0, pitch_width_m],
            ],
            dtype=np.float32,
        )
        self.pitch_length_m = pitch_length_m
        self.pitch_width_m = pitch_width_m
        self.homography = cv2.getPerspectiveTransform(corners, world)

    def to_pitch(self, points_px: np.ndarray) -> np.ndarray:
        """Transform (N, 2) image points to (N, 2) pitch coordinates in meters."""
        pts = np.asarray(points_px, dtype=np.float32).reshape(-1, 1, 2)
        out = cv2.perspectiveTransform(pts, self.homography)
        return out.reshape(-1, 2)

    def inside_pitch(self, points_m: np.ndarray, margin_m: float = 3.0) -> np.ndarray:
        """Boolean mask: which points lie on the pitch (with tolerance for touchline play)."""
        pts = np.asarray(points_m).reshape(-1, 2)
        return (
            (pts[:, 0] >= -margin_m)
            & (pts[:, 0] <= self.pitch_length_m + margin_m)
            & (pts[:, 1] >= -margin_m)
            & (pts[:, 1] <= self.pitch_width_m + margin_m)
        )


def parse_corners(spec: str) -> np.ndarray:
    """Parse "x1,y1 x2,y2 x3,y3 x4,y4" into a (4, 2) array."""
    parts = spec.replace(";", " ").split()
    if len(parts) != 4:
        raise ValueError(f"Expected 4 corners, got {len(parts)}: {spec!r}")
    return np.array([[float(v) for v in p.split(",")] for p in parts], dtype=np.float32)
