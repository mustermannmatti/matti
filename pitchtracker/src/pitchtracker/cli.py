"""Command line interface.

  pitchtracker frame   — export a frame as PNG to read off the pitch corners
  pitchtracker analyze — run the full analysis on a match video (YOLO)
  pitchtracker demo    — synthetic match, full pipeline, no model needed
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import cv2

from .annotate import VideoAnnotator
from .pipeline import analyze_frames, analyze_video, video_fps, video_frame_count
from .pitch import PitchCalibration, parse_corners
from .report import render_html_report


class _Progress:
    """Prints progress + ETA every `every` analyzed frames — essential for full halves."""

    def __init__(self, total: int | None, every: int = 100):
        self.total = total
        self.every = every
        self.count = 0
        self.t0 = time.time()

    def __call__(self, frame_index, frame, matches) -> None:
        self.count += 1
        if self.count % self.every:
            return
        rate = self.count / max(1e-6, time.time() - self.t0)
        if self.total:
            pct = 100.0 * self.count / self.total
            eta_min = (self.total - self.count) / max(1e-6, rate) / 60
            print(
                f"  {self.count}/{self.total} Frames ({pct:.0f} %) – "
                f"{len(matches)} Spieler im Bild – Rest ca. {eta_min:.0f} min",
                flush=True,
            )
        else:
            print(f"  {self.count} Frames analysiert ({rate:.1f}/s)", flush=True)


def _chain(*hooks):
    hooks = [h for h in hooks if h is not None]

    def on_frame(frame_index, frame, matches):
        for h in hooks:
            h(frame_index, frame, matches)

    return on_frame


def cmd_frame(args: argparse.Namespace) -> int:
    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        print(f"Video nicht lesbar: {args.video}", file=sys.stderr)
        return 1
    cap.set(cv2.CAP_PROP_POS_MSEC, args.time * 1000.0)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        print("Frame konnte nicht gelesen werden.", file=sys.stderr)
        return 1
    cv2.imwrite(args.output, frame)
    print(f"Frame gespeichert: {args.output}")
    print("Öffne das Bild und notiere die Pixelkoordinaten der 4 Platz-Ecken")
    print("(Reihenfolge: oben-links, oben-rechts, unten-rechts, unten-links).")
    return 0


def cmd_analyze(args: argparse.Namespace) -> int:
    from .detect import YoloDetector  # lazy: needs the optional [yolo] extra

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    corners = parse_corners(args.corners)
    length_m, width_m = (float(v) for v in args.pitch.split("x"))
    calibration = PitchCalibration(corners, length_m, width_m)
    detector = YoloDetector(model_name=args.model, confidence=args.confidence)

    fps = video_fps(args.video)
    start_frame = int(args.start_seconds * fps)
    annotator = None
    if args.annotate:
        annotator = VideoAnnotator(str(out_dir / "annotated.mp4"), fps / args.stride)

    total_available = max(0, (video_frame_count(args.video) - start_frame)) // args.stride
    max_frames = None
    if args.max_seconds is not None:
        max_frames = int(args.max_seconds * fps / args.stride)
    total = min(total_available, max_frames) if max_frames else total_available

    print(f"Analysiere {args.video} … (Stride {args.stride}, ab Sekunde {args.start_seconds:.0f})")
    analysis = analyze_video(
        args.video, detector, calibration,
        stride=args.stride, max_frames=max_frames, start_frame=start_frame,
        on_frame=_chain(annotator, _Progress(total or None)),
    )
    if annotator is not None:
        annotator.close()

    report_path = out_dir / "report.html"
    # encoding explicitly: Windows would otherwise write cp1252 and choke on emoji
    report_path.write_text(
        render_html_report(analysis, title=Path(args.video).stem), encoding="utf-8"
    )
    print(f"{len(analysis.players)} Spieler getrackt über {analysis.frames_analyzed} Frames.")
    print(f"Report: {report_path}")
    if annotator is not None:
        print(f"Annotiertes Video: {out_dir / 'annotated.mp4'}")
    return 0


def cmd_demo(args: argparse.Namespace) -> int:
    from .synthetic import ScriptedDetector, SyntheticMatch, scripted_frames, write_video

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    match = SyntheticMatch(n_per_team=args.players, duration_s=args.seconds)

    annotator = VideoAnnotator(str(out_dir / "annotated.mp4"), match.fps)
    detector = ScriptedDetector()
    analysis = analyze_frames(
        scripted_frames(match, detector),
        detector,
        match.calibration(),
        fps=match.fps,
        video_path="synthetic://demo",
        on_frame=annotator,
    )
    annotator.close()
    write_video(match, str(out_dir / "raw.mp4"))

    report_path = out_dir / "report.html"
    report_path.write_text(
        render_html_report(analysis, title="Demo-Spiel (synthetisch)"), encoding="utf-8"
    )
    print(f"Demo fertig: {len(analysis.players)} Spieler getrackt.")
    print(f"Report: {report_path}")
    print(f"Videos: {out_dir / 'raw.mp4'} (Eingabe), {out_dir / 'annotated.mp4'} (getrackt)")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="pitchtracker",
        description="Spieler-Tracking und Statistiken aus Sportvideos.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_frame = sub.add_parser("frame", help="Einzelframe als PNG exportieren (für Kalibrierung)")
    p_frame.add_argument("video")
    p_frame.add_argument("--time", type=float, default=0.0, help="Zeitpunkt in Sekunden")
    p_frame.add_argument("-o", "--output", default="frame.png")
    p_frame.set_defaults(func=cmd_frame)

    p_an = sub.add_parser("analyze", help="Spiel analysieren (benötigt [yolo]-Extra)")
    p_an.add_argument("video")
    p_an.add_argument(
        "--corners", required=True,
        help='Platz-Ecken in Pixeln: "x1,y1 x2,y2 x3,y3 x4,y4" (TL TR BR BL)',
    )
    p_an.add_argument("--pitch", default="105x68", help="Platzmaße in Metern, z.B. 100x64")
    p_an.add_argument("--model", default="yolov8s.pt")
    p_an.add_argument("--confidence", type=float, default=0.3)
    p_an.add_argument("--stride", type=int, default=2, help="jeden n-ten Frame analysieren")
    p_an.add_argument("--max-seconds", type=float, default=None, help="nur die ersten N Sekunden")
    p_an.add_argument(
        "--start-seconds", type=float, default=0.0,
        help="Analyse erst ab diesem Zeitpunkt starten (z.B. Anpfiff überspringen)",
    )
    p_an.add_argument("--annotate", action="store_true", help="annotiertes Video schreiben")
    p_an.add_argument("--out", default="pitchtracker-out")
    p_an.set_defaults(func=cmd_analyze)

    p_demo = sub.add_parser("demo", help="Synthetisches Demo-Spiel analysieren")
    p_demo.add_argument("--players", type=int, default=5, help="Spieler pro Team")
    p_demo.add_argument("--seconds", type=float, default=30.0)
    p_demo.add_argument("--out", default="pitchtracker-demo")
    p_demo.set_defaults(func=cmd_demo)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
