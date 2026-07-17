"""Team assignment via jersey color clustering.

During tracking we sample the average torso color of each detection.
Afterwards, all samples are clustered into two groups (the two kits)
with k-means; each track is assigned the team most of its samples
belong to. Referees/keepers end up in whichever cluster is closer —
handling them as a third cluster is on the roadmap.
"""
from __future__ import annotations

import cv2
import numpy as np

from .types import Detection, Track


def sample_torso_color(frame_bgr: np.ndarray, det: Detection) -> np.ndarray | None:
    """Mean BGR color of the central torso region of a detection box."""
    h, w = frame_bgr.shape[:2]
    bw = det.x2 - det.x1
    bh = det.y2 - det.y1
    # Torso: horizontally centered half, vertically the 20%-55% band of the box.
    x1 = int(np.clip(det.x1 + 0.25 * bw, 0, w - 1))
    x2 = int(np.clip(det.x2 - 0.25 * bw, 0, w))
    y1 = int(np.clip(det.y1 + 0.20 * bh, 0, h - 1))
    y2 = int(np.clip(det.y1 + 0.55 * bh, 0, h))
    if x2 <= x1 or y2 <= y1:
        return None
    crop = frame_bgr[y1:y2, x1:x2]
    return crop.reshape(-1, 3).mean(axis=0).astype(np.float32)


def assign_teams(tracks: list[Track]) -> None:
    """Cluster jersey color samples into 2 teams and set track.team in place."""
    sampled = [t for t in tracks if t.color_samples]
    if len(sampled) < 2:
        return
    all_samples = np.concatenate(
        [np.stack(t.color_samples) for t in sampled], axis=0
    ).astype(np.float32)
    # Lab space separates kit colors more reliably than raw BGR.
    lab = cv2.cvtColor(all_samples.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_BGR2Lab)
    lab = lab.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.5)
    _, labels, _ = cv2.kmeans(lab, 2, None, criteria, 5, cv2.KMEANS_PP_CENTERS)
    labels = labels.ravel()

    offset = 0
    for t in sampled:
        n = len(t.color_samples)
        votes = labels[offset : offset + n]
        offset += n
        t.team = int(np.bincount(votes, minlength=2).argmax())
