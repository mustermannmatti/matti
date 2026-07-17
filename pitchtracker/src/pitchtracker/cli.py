"""Command line interface.

  pitchtracker frame   — export a frame as PNG to read off the pitch corners
  pitchtracker analyze — run the full analysis on a match video (YOLO)
  pitchtracker demo    — synthetic match, full pipeline, no model needed
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import cv2

from .annotate import VideoAnnotator
from .pipeline import analyze_frames, analyze_video
from .pitch import PitchCalibration, parse_corners
from .report import render_html_report


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

    annotator = None
    if args.annotate:
        from .pipeline import video_fps

        annotator = VideoAnnotator(
            str(out_dir / "annotated.mp4"), video_fps(args.video) / args.stride
        )

    max_frames = None
    if args.max_seconds is not None:
        from .pipeline import video_fps

        max_frames = int(args.max_seconds * video_fps(args.video) / args.stride)

    print(f"Analysiere {args.video} … (Stride {args.stride})")
    analysis = analyze_video(
        args.video, detector, calibration,
        stride=args.stride, max_frames=max_frames, on_frame=annotator,
    )
    if annotator is not None:
        annotator.close()

    report_path = out_dir / "report.html"
    report_path.write_text(render_html_report(analysis, title=Path(args.video).stem))
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
    report_path.write_text(render_html_report(analysis, title="Demo-Spiel (synthetisch)"))
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
