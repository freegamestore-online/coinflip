import { useRef, useState } from "react";
import { GameShell, GameTopbar, GameAuth, useGameSounds } from "@freegamestore/games";

const FLIP_DURATION_MS = 700;

type SoundsApi = ReturnType<typeof useGameSounds>;

function AudioBridge({ apiRef }: { apiRef: React.MutableRefObject<SoundsApi | null> }) {
  const sounds = useGameSounds();
  apiRef.current = sounds;
  return null;
}

export default function App() {
  const [face, setFace] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<("heads" | "tails")[]>([]);
  const [guess, setGuess] = useState<"heads" | "tails" | null>(null);
  const audioRef = useRef<SoundsApi | null>(null);

  function flip() {
    if (flipping) return;
    setFlipping(true);
    audioRef.current?.playTick();
    // Decide the result up-front so the spin animation lands on it.
    const result: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const userGuess = guess;
    window.setTimeout(() => {
      setFace(result);
      setHistory((prev) => [result, ...prev].slice(0, 20));
      setFlipping(false);
      if (userGuess) {
        if (userGuess === result) audioRef.current?.playScore();
        else audioRef.current?.playError();
      } else {
        // No guess called — still acknowledge the flip landed.
        audioRef.current?.playScore();
      }
    }, FLIP_DURATION_MS);
  }

  const heads = history.filter((h) => h === "heads").length;
  const tails = history.length - heads;

  return (
    <GameShell
      topbar={
        <GameTopbar
          title="Coin Flip"
          stats={[
            { label: "Heads", value: heads },
            { label: "Tails", value: tails },
          ]}
          actions={<GameAuth />}
          rules={<div><h3 style={{fontWeight:700}}>Coin Flip</h3><h4 style={{fontWeight:600}}>How to Play</h4><ul><li>Tap the coin to flip it</li><li>Result is heads or tails</li></ul><h4 style={{fontWeight:600}}>Tracking</h4><ul><li>Tracks last 20 results</li><li>Running totals for heads and tails</li></ul></div>}
        />
      }
    >
      <AudioBridge apiRef={audioRef} />
      <div className="relative w-full h-full">
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 0", textAlign: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
            {(["heads", "tails"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => !flipping && setGuess(guess === opt ? null : opt)}
                disabled={flipping}
                aria-pressed={guess === opt}
                style={{
                  padding: "0.5rem 1rem",
                  minHeight: "2.5rem",
                  border: "1px solid var(--line)",
                  borderRadius: "0.5rem",
                  background: guess === opt ? "var(--accent)" : "transparent",
                  color: guess === opt ? "white" : "var(--ink)",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: flipping ? "wait" : "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Call {opt}
              </button>
            ))}
          </div>

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
      </div>
    </GameShell>
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
