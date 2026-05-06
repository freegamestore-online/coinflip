import { useState } from "react";
import { Shell } from "./components/Shell";

const FLIP_DURATION_MS = 700;

export default function App() {
  const [face, setFace] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<("heads" | "tails")[]>([]);

  function flip() {
    if (flipping) return;
    setFlipping(true);
    // Decide the result up-front so the spin animation lands on it.
    const result: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    window.setTimeout(() => {
      setFace(result);
      setHistory((prev) => [result, ...prev].slice(0, 20));
      setFlipping(false);
    }, FLIP_DURATION_MS);
  }

  const heads = history.filter((h) => h === "heads").length;
  const tails = history.length - heads;

  return (
    <Shell>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 0", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.25rem",
          }}
        >
          Coin flip
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
          Tap the coin to flip it. Last 20 flips are tallied below.
        </p>

        <button
          type="button"
          onClick={flip}
          aria-label="Flip the coin"
          disabled={flipping}
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            border: "1px solid var(--line-strong)",
            background: "var(--panel)",
            fontFamily: "Fraunces, serif",
            fontWeight: 700,
            fontSize: face ? "1.6rem" : "1.1rem",
            color: "var(--ink)",
            cursor: flipping ? "wait" : "pointer",
            transition: "transform 0.7s cubic-bezier(.2,.8,.4,1)",
            transform: flipping ? "rotateY(1080deg)" : "rotateY(0deg)",
            margin: "0 auto",
            display: "block",
          }}
        >
          {flipping ? "…" : face ? face.toUpperCase() : "FLIP"}
        </button>

        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "2rem" }}>
          <Stat label="Heads" value={heads} />
          <Stat label="Tails" value={tails} />
          <Stat label="Total" value={history.length} />
        </div>

        {history.length > 0 && (
          <p
            aria-label="recent flips"
            style={{
              marginTop: "1.5rem",
              color: "var(--muted)",
              fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
              fontSize: "0.95rem",
              letterSpacing: "0.15em",
            }}
          >
            {history.map((h) => (h === "heads" ? "H" : "T")).join(" ")}
          </p>
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: "1.6rem", fontWeight: 700 }}>{value}</div>
      <div
        style={{
          color: "var(--muted)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
