"use client";

/**
 * Brand intro shown the first time the app opens in a session (~2s).
 * - Tap anywhere to skip.
 * - Skipped entirely for "reduce motion" users and for the rest of the session once seen.
 * - Renders a solid green cover on first paint so returning users never see a flash of
 *   the home screen before we know whether to play it (home is green underneath anyway).
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SEEN_KEY = "yanaya-intro-seen";
const LOGO = "/brand/yanaya-logo.png";
const TOTAL_MS = 2200;

type Phase = "cover" | "playing" | "leaving" | "gone";

/** Decided once per page load (React dev mode runs effects twice). */
let shouldPlay: boolean | null = null;
function decideOnce() {
  if (shouldPlay !== null) return shouldPlay;
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === "1";
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage blocked: just play it */
  }
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  shouldPlay = !seen && !reduce;
  return shouldPlay;
}

export function IntroSplash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("cover");
  const timers = useRef<number[]>([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!decideOnce()) {
      setPhase("gone");
      doneRef.current();
      return;
    }
    timers.current = [];
    setPhase("playing");
    timers.current.push(window.setTimeout(() => setPhase("leaving"), TOTAL_MS - 450));
    timers.current.push(
      window.setTimeout(() => {
        shouldPlay = false; // don't replay when navigating back home in the same visit
        setPhase("gone");
        doneRef.current();
      }, TOTAL_MS),
    );
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const skip = () => {
    if (phase !== "playing") return;
    timers.current.forEach((id) => window.clearTimeout(id));
    setPhase("leaving");
    shouldPlay = false;
    timers.current = [
      window.setTimeout(() => {
        setPhase("gone");
        doneRef.current();
      }, 250),
    ];
  };

  if (phase === "gone") return null;

  const leaving = phase === "leaving";

  return (
    <div
      className="fixed inset-0 z-[60] bg-cream"
      onClick={skip}
      role="presentation"
      style={leaving ? { animation: "y-fade-out .45s ease forwards" } : undefined}
    >
      {/* green flood */}
      <div
        className="absolute inset-0 bg-leaf-700"
        style={phase === "playing" ? { animation: "y-flood .5s cubic-bezier(.6,0,.3,1) both" } : undefined}
      >
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-leaf-500/40" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-sage-400/25" />
      </div>

      {phase !== "cover" ? (
        <div className="absolute inset-0 grid place-items-center px-6">
          <div style={leaving ? { animation: "y-lift .45s ease-in forwards" } : undefined}>
            <div
              className="relative w-80 max-w-[85vw]"
              style={{
                animation:
                  "y-pop .7s cubic-bezier(.3,1.4,.5,1) .3s both, y-land .25s ease-out 1s both",
              }}
            >
              <Image src={LOGO} alt="Yanaya: It Will End In Health" width={640} height={250} priority />
              {/* light sweep, masked to the logo's shape */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  WebkitMaskImage: `url(${LOGO})`,
                  maskImage: `url(${LOGO})`,
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  backgroundImage:
                    "linear-gradient(105deg, transparent 35%, rgba(255,255,255,.75) 50%, transparent 65%)",
                  backgroundSize: "60% 100%",
                  backgroundRepeat: "no-repeat",
                  animation: "y-shine .6s ease-in-out 1.15s both",
                }}
              />
            </div>
          </div>
          <p className="absolute bottom-10 text-xs font-medium text-white/60">Tap to skip</p>
        </div>
      ) : null}
    </div>
  );
}
