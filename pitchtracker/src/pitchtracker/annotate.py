"""Write an annotated copy of the video: boxes + track IDs on every analyzed frame."""
from __future__ import annotations

import cv2
import numpy as np

from .types import Detection

_ID_COLORS = [
    (57, 106, 230), (26, 188, 156), (241, 196, 15), (155, 89, 182),
    (52, 152, 219), (230, 126, 34), (46, 204, 113), (231, 76, 60),
]


class VideoAnnotator:
    """Collects annotated frames and writes them as an MP4.

    Used as the `on_frame` hook of the pipeline so the video is read only once.
    """

    def __init__(self, out_path: str, fps: float):
        self.out_path = out_path
        self.fps = fps
        self._writer: cv2.VideoWriter | None = None

    def __call__(self, frame_index: int, frame: np.ndarray, matches: list[tuple[int, Detection]]) -> None:
        canvas = frame.copy()
        for track_id, det in matches:
            color = _ID_COLORS[track_id % len(_ID_COLORS)]
            p1 = (int(det.x1), int(det.y1))
            p2 = (int(det.x2), int(det.y2))
            cv2.rectangle(canvas, p1, p2, color, 2)
            cv2.putText(
                canvas, f"#{track_id}", (p1[0], max(0, p1[1] - 6)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2,
            )
        if self._writer is None:
            h, w = canvas.shape[:2]
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            self._writer = cv2.VideoWriter(self.out_path, fourcc, self.fps, (w, h))
        self._writer.write(canvas)

    def close(self) -> None:
        if self._writer is not None:
            self._writer.release()
            self._writer = None
