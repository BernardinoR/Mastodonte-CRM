function TrackLines() {
  return (
    <div
      className="absolute h-full w-full opacity-50"
      style={{
        background:
          "repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)",
        transform: "perspective(500px) rotateX(60deg) scale(2)",
        animation: "moveTrack 2s linear infinite",
      }}
    />
  );
}

function PulseBg() {
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[60vw] w-[60vw] rounded-full"
      style={{
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)",
        animation: "heartbeat 4s infinite ease-in-out",
      }}
    />
  );
}

function StoicCircle() {
  return (
    <div
      className="pointer-events-none absolute h-[400px] w-[400px] rounded-full"
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        animation: "rotateCircle 60s linear infinite",
      }}
    />
  );
}

function Spotlight() {
  return (
    <div
      className="absolute h-[200%] w-[200%]"
      style={{
        top: "-50%",
        left: "-50%",
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 40%)",
        animation: "spotlightMove 10s infinite alternate ease-in-out",
      }}
    />
  );
}

function SpeedLines() {
  return (
    <div
      className="absolute left-0 top-0 h-full w-full"
      style={{
        background:
          "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)",
      }}
    />
  );
}

export type VisualEffectType =
  | "track-lines"
  | "pulse-bg"
  | "stoic-circle"
  | "spotlight"
  | "speed-lines";

export function VisualEffect({ effect }: { effect: VisualEffectType | string }) {
  switch (effect) {
    case "track-lines":
      return <TrackLines />;
    case "pulse-bg":
      return <PulseBg />;
    case "stoic-circle":
      return <StoicCircle />;
    case "spotlight":
      return <Spotlight />;
    case "speed-lines":
      return <SpeedLines />;
    default:
      return null;
  }
}
