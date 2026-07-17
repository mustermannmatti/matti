"""Multi-object tracking: keeps player identities stable across frames.

A deliberately simple, dependency-free tracker for the prototype:
greedy matching between predicted track positions (constant-velocity model)
and new detections, scored by IoU with a center-distance fallback.
Good enough for wide-angle pitch footage where players are small and
motion between frames is modest. Roadmap: swap in ByteTrack/BoT-SORT.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from .types import Detection, Track, TrackObservation


def iou(a: Detection, b: Detection) -> float:
    ix1, iy1 = max(a.x1, b.x1), max(a.y1, b.y1)
    ix2, iy2 = min(a.x2, b.x2), min(a.y2, b.y2)
    inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    union = a.area + b.area - inter
    return inter / union if union > 0 else 0.0


@dataclass
class _ActiveTrack:
    track: Track
    last_detection: Detection
    vx: float = 0.0
    vy: float = 0.0
    missed: int = 0

    def predicted(self, dt_frames: int) -> Detection:
        """Constant-velocity prediction of the box after dt_frames."""
        d = self.last_detection
        dx, dy = self.vx * dt_frames, self.vy * dt_frames
        return Detection(d.x1 + dx, d.y1 + dy, d.x2 + dx, d.y2 + dy, d.confidence)


@dataclass
class GreedyTracker:
    """Greedy IoU tracker with constant-velocity prediction.

    max_missed: frames a track survives without a matching detection.
    min_iou: below this, fall back to center-distance gating.
    max_center_dist: maximum allowed center distance (px) for a match.
    """

    max_missed: int = 25
    min_iou: float = 0.1
    max_center_dist: float = 80.0
    _next_id: int = 1
    _active: list[_ActiveTrack] = field(default_factory=list)
    _finished: list[Track] = field(default_factory=list)

    def update(self, frame_index: int, detections: list[Detection]) -> list[tuple[int, Detection]]:
        """Feed one frame of detections. Returns (track_id, detection) pairs matched this frame."""
        # Score all (track, detection) pairs.
        candidates: list[tuple[float, int, int]] = []  # (score, track_idx, det_idx)
        for ti, at in enumerate(self._active):
            pred = at.predicted(at.missed + 1)
            for di, det in enumerate(detections):
                overlap = iou(pred, det)
                pcx, pcy = pred.center
                dcx, dcy = det.center
                dist = ((pcx - dcx) ** 2 + (pcy - dcy) ** 2) ** 0.5
                if overlap >= self.min_iou:
                    candidates.append((1.0 + overlap, ti, di))  # IoU matches rank first
                elif dist <= self.max_center_dist:
                    candidates.append((1.0 - dist / self.max_center_dist, ti, di))
        candidates.sort(key=lambda c: -c[0])

        matched_tracks: set[int] = set()
        matched_dets: set[int] = set()
        assignments: list[tuple[int, int]] = []
        for _, ti, di in candidates:
            if ti in matched_tracks or di in matched_dets:
                continue
            matched_tracks.add(ti)
            matched_dets.add(di)
            assignments.append((ti, di))

        results: list[tuple[int, Detection]] = []
        for ti, di in assignments:
            at = self._active[ti]
            det = detections[di]
            prev = at.last_detection
            dt = at.missed + 1
            pcx, pcy = prev.center
            ccx, ccy = det.center
            # Exponentially smoothed velocity estimate.
            at.vx = 0.6 * at.vx + 0.4 * (ccx - pcx) / dt
            at.vy = 0.6 * at.vy + 0.4 * (ccy - pcy) / dt
            at.last_detection = det
            at.missed = 0
            at.track.observations.append(TrackObservation(frame_index, det))
            results.append((at.track.track_id, det))

        # Age unmatched tracks, retire the stale ones.
        still_active: list[_ActiveTrack] = []
        for ti, at in enumerate(self._active):
            if ti in matched_tracks:
                still_active.append(at)
            else:
                at.missed += 1
                if at.missed > self.max_missed:
                    self._finished.append(at.track)
                else:
                    still_active.append(at)
        self._active = still_active

        # Unmatched detections start new tracks.
        for di, det in enumerate(detections):
            if di in matched_dets:
                continue
            track = Track(self._next_id, [TrackObservation(frame_index, det)])
            self._next_id += 1
            self._active.append(_ActiveTrack(track=track, last_detection=det))
            results.append((track.track_id, det))
        return results

    def all_tracks(self) -> list[Track]:
        return self._finished + [at.track for at in self._active]
