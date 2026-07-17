"""Core data types shared across the pipeline."""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np


@dataclass(frozen=True)
class Detection:
    """A single player detection in one frame (image pixel coordinates)."""

    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float = 1.0

    @property
    def center(self) -> tuple[float, float]:
        return ((self.x1 + self.x2) / 2.0, (self.y1 + self.y2) / 2.0)

    @property
    def foot_point(self) -> tuple[float, float]:
        """Bottom-center of the box — approximates where the player touches the ground."""
        return ((self.x1 + self.x2) / 2.0, self.y2)

    @property
    def area(self) -> float:
        return max(0.0, self.x2 - self.x1) * max(0.0, self.y2 - self.y1)


@dataclass
class TrackObservation:
    """One observed position of a track in a specific frame."""

    frame_index: int
    detection: Detection


@dataclass
class Track:
    """A player followed across frames."""

    track_id: int
    observations: list[TrackObservation] = field(default_factory=list)
    # Sampled jersey colors (BGR) collected during the run, used for team assignment.
    color_samples: list[np.ndarray] = field(default_factory=list)
    team: int | None = None  # 0 or 1 after team assignment

    @property
    def first_frame(self) -> int:
        return self.observations[0].frame_index

    @property
    def last_frame(self) -> int:
        return self.observations[-1].frame_index

    def __len__(self) -> int:
        return len(self.observations)


@dataclass
class PlayerStats:
    """Aggregated statistics for one track, in pitch coordinates (meters)."""

    track_id: int
    team: int | None
    seconds_tracked: float
    distance_m: float
    avg_speed_kmh: float
    top_speed_kmh: float
    sprint_count: int
    heatmap: np.ndarray  # 2D histogram over the pitch grid
    positions_m: np.ndarray  # (N, 2) smoothed positions in meters


@dataclass
class MatchAnalysis:
    """Everything the pipeline produced for one video."""

    video_path: str
    fps: float
    frames_analyzed: int
    pitch_length_m: float
    pitch_width_m: float
    players: list[PlayerStats] = field(default_factory=list)
