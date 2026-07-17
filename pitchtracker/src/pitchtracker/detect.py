"""Player detection backends.

The pipeline only needs `detect(frame) -> list[Detection]`, so backends are
pluggable: YOLO (ultralytics) for real footage, and any callable/mock for
tests and synthetic demos.
"""
from __future__ import annotations

from typing import Protocol

import numpy as np

from .types import Detection


class Detector(Protocol):
    def detect(self, frame_bgr: np.ndarray) -> list[Detection]: ...


class YoloDetector:
    """Person detection via ultralytics YOLO (optional dependency).

    Install with: pip install "pitchtracker[yolo]"
    """

    PERSON_CLASS_ID = 0  # COCO class "person"

    def __init__(self, model_name: str = "yolov8s.pt", confidence: float = 0.3, device: str | None = None):
        try:
            from ultralytics import YOLO
        except ImportError as exc:  # pragma: no cover
            raise ImportError(
                "ultralytics ist nicht installiert. Installiere mit: pip install 'pitchtracker[yolo]'"
            ) from exc
        self.model = YOLO(model_name)
        self.confidence = confidence
        self.device = device

    def detect(self, frame_bgr: np.ndarray) -> list[Detection]:
        results = self.model.predict(
            frame_bgr,
            classes=[self.PERSON_CLASS_ID],
            conf=self.confidence,
            device=self.device,
            verbose=False,
        )
        detections: list[Detection] = []
        for r in results:
            if r.boxes is None:
                continue
            for box, conf in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.conf.cpu().numpy()):
                x1, y1, x2, y2 = (float(v) for v in box)
                detections.append(Detection(x1, y1, x2, y2, float(conf)))
        return detections
