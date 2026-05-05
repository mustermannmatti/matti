import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

// ── helpers ──────────────────────────────────────────────────────────────────

function easeOut(frame: number, start: number, dur: number): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function pop(frame: number, start: number, dur: number): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ── sub-components ────────────────────────────────────────────────────────────

const FlashOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 12], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ background: "#fff", opacity, pointerEvents: "none" }}
    />
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  // subtle vignette + moving gradient
  const shift = interpolate(frame, [0, 210], [0, 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${50 + shift * 0.1}% 50%, #1a0505 0%, #080808 70%)`,
      }}
    />
  );
};

const ScanlineOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)",
      pointerEvents: "none",
    }}
  />
);

// Red accent bar that grows from left
const AccentBar: React.FC<{ top: number; delay: number }> = ({
  top,
  delay,
}) => {
  const frame = useCurrentFrame();
  const scaleX = easeOut(frame, delay, 20);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height: 5,
        background: "#E30613",
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
      }}
    />
  );
};

// Main title: ESCHBORN × FRANKFURT
const MainTitle: React.FC = () => {
  const frame = useCurrentFrame();

  const leftX = interpolate(frame, [20, 50], [-600, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightX = interpolate(frame, [25, 55], [600, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crossScale = pop(frame, 45, 15);
  const crossOpacity = easeOut(frame, 45, 10);

  const titleStyle: React.CSSProperties = {
    fontFamily,
    fontSize: 148,
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "0.02em",
    lineHeight: 1,
    textShadow: "0 4px 40px rgba(0,0,0,0.8)",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        transform: "translateY(-60%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div style={{ ...titleStyle, transform: `translateX(${leftX}px)` }}>
        ESCHBORN
      </div>
      <div
        style={{
          ...titleStyle,
          fontSize: 120,
          color: "#E30613",
          transform: `scale(${crossScale})`,
          opacity: crossOpacity,
        }}
      >
        ×
      </div>
      <div style={{ ...titleStyle, transform: `translateX(${rightX}px)` }}>
        FRANKFURT
      </div>
    </div>
  );
};

// Subtitle: DER RADKLASSIKER
const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const translateY = interpolate(frame, [0, 25], [40, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = easeOut(frame, 0, 20);
  const barScale = easeOut(frame, 10, 25);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        transform: "translateY(30%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity,
      }}
    >
      <div
        style={{
          width: "60%",
          height: 3,
          background: "#E30613",
          transformOrigin: "center",
          transform: `scaleX(${barScale}) translateY(${translateY}px)`,
        }}
      />
      <div
        style={{
          fontFamily,
          fontSize: 52,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          transform: `translateY(${translateY}px)`,
        }}
      >
        DER RADKLASSIKER
      </div>
    </div>
  );
};

// Race info bar
const RaceInfo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = easeOut(frame, 0, 18);
  const translateY = interpolate(frame, [0, 18], [20, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stats = [
    "63. AUSGABE",
    "1. MAI 2026",
    "210 KM",
    "3.300 HM",
    "147 STARTER",
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 0,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s}
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            color: i === 0 ? "#E30613" : "#cccccc",
            letterSpacing: "0.12em",
            padding: "0 28px",
            borderRight: i < stats.length - 1 ? "2px solid #333" : "none",
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
};

// Winner reveal
const WinnerReveal: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = easeOut(frame, 0, 12);
  const nameSlide = interpolate(frame, [8, 35], [80, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameOpacity = easeOut(frame, 8, 25);
  const teamOpacity = easeOut(frame, 30, 15);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* SIEGER 2026 label */}
      <div
        style={{
          fontFamily,
          fontSize: 36,
          fontWeight: 700,
          color: "#E30613",
          letterSpacing: "0.3em",
          marginBottom: 20,
          opacity: labelOpacity,
        }}
      >
        ★ SIEGER 2026 ★
      </div>

      {/* Winner name */}
      <div
        style={{
          fontFamily,
          fontSize: 110,
          fontWeight: 900,
          color: "#FFD700",
          letterSpacing: "0.03em",
          lineHeight: 1,
          textShadow: "0 0 60px rgba(255, 215, 0, 0.4)",
          transform: `translateY(${nameSlide}px)`,
          opacity: nameOpacity,
        }}
      >
        ZIMMERMANN
      </div>

      {/* First name */}
      <div
        style={{
          fontFamily,
          fontSize: 52,
          fontWeight: 400,
          color: "#ffffff",
          letterSpacing: "0.2em",
          marginTop: 8,
          opacity: nameOpacity,
        }}
      >
        GEORG
      </div>

      {/* Team */}
      <div
        style={{
          fontFamily,
          fontSize: 28,
          fontWeight: 400,
          color: "#999999",
          letterSpacing: "0.15em",
          marginTop: 24,
          opacity: teamOpacity,
        }}
      >
        LOTTO INTERMARCHÉ
      </div>
    </AbsoluteFill>
  );
};

// Podium results
const Podium: React.FC = () => {
  const frame = useCurrentFrame();

  const riders = [
    { pos: "1", name: "GEORG ZIMMERMANN", team: "Lotto Intermarché", color: "#FFD700" },
    { pos: "2", name: "TOM PIDCOCK", team: "Pinarello Q36.5", color: "#C0C0C0" },
    { pos: "3", name: "BEN TULETT", team: "Visma | Lease a Bike", color: "#CD7F32" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 700,
          color: "#E30613",
          letterSpacing: "0.3em",
          marginBottom: 8,
          opacity: easeOut(frame, 0, 12),
        }}
      >
        ERGEBNISSE 2026
      </div>

      {riders.map((r, i) => {
        const delay = i * 12;
        const opacity = easeOut(frame, delay, 15);
        const tx = interpolate(frame, [delay, delay + 15], [-60, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={r.pos}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              opacity,
              transform: `translateX(${tx}px)`,
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: 72,
                fontWeight: 900,
                color: r.color,
                width: 80,
                textAlign: "center",
                lineHeight: 1,
              }}
            >
              {r.pos}
            </div>
            <div
              style={{
                width: 4,
                height: 64,
                background: r.color,
                opacity: 0.6,
                borderRadius: 2,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily,
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "0.05em",
                }}
              >
                {r.name}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: 22,
                  fontWeight: 400,
                  color: "#888",
                  letterSpacing: "0.1em",
                  marginTop: 4,
                }}
              >
                {r.team}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── main composition ──────────────────────────────────────────────────────────

export const FrankfurtIntro: React.FC = () => {
  // Timeline (at 30fps):
  // 0-20:   Flash + background
  // 20-80:  Main title ESCHBORN × FRANKFURT
  // 65-110: Subtitle DER RADKLASSIKER
  // 95-140: Race info stats
  // 130-185: Winner reveal
  // 180-215: Podium

  return (
    <AbsoluteFill style={{ background: "#080808" }}>
      <Background />
      <ScanlineOverlay />

      {/* Scene 1: Flash */}
      <FlashOverlay />

      {/* Scene 2: Main title */}
      <Sequence from={18} durationInFrames={120}>
        <MainTitle />
      </Sequence>

      {/* Scene 3: Subtitle */}
      <Sequence from={62} durationInFrames={75} layout="none">
        <Subtitle />
      </Sequence>

      {/* Scene 4: Race stats */}
      <Sequence from={95} durationInFrames={50} layout="none">
        <RaceInfo />
      </Sequence>

      {/* Scene 5: Winner reveal – full screen takeover */}
      <Sequence from={130} durationInFrames={58}>
        <AbsoluteFill style={{ background: "#080808" }}>
          <Background />
          <ScanlineOverlay />
          <WinnerReveal />
          <AccentBar top={0} delay={5} />
          <AccentBar top={1075} delay={8} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: Podium */}
      <Sequence from={188} durationInFrames={32}>
        <AbsoluteFill style={{ background: "#080808" }}>
          <Background />
          <ScanlineOverlay />
          <Podium />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
