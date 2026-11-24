"use client";

/**
 * Brand intro shown the first time the site opens in a visit (~2.2s):
 * charcoal floods in, the "smoovy" sticker pops, its sage shadow lands, a light
 * sweep passes, "by Yanaya" rises, then it lifts away.
 * - Tap anywhere to skip.
 * - Skipped for "reduce motion" visitors and for the rest of the visit once seen.
 * - Paints a solid charcoal cover first so returning visitors don't see a flash.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SEEN_KEY = "smoovy-intro-seen";
const LOGO = "/smoovy/smoovy-logo.webp";
const TOTAL_MS = 2300;

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

export function IntroSplash({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = useState<Phase>("cover");
  const timers = useRef<number[]>([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!decideOnce()) {
      setPhase("gone");
      doneRef.current?.();
      return;
    }
    timers.current = [];
    setPhase("playing");
    timers.current.push(window.setTimeout(() => setPhase("leaving"), TOTAL_MS - 450));
    timers.current.push(
      window.setTimeout(() => {
        shouldPlay = false;
        setPhase("gone");
        doneRef.current?.();
      }, TOTAL_MS),
    );
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const skip = () => {
    if (phase !== "playing") return;
    timers.current.forEach((id) => window.clearTimeout(id));
    shouldPlay = false;
    setPhase("leaving");
    timers.current = [
      window.setTimeout(() => {
        setPhase("gone");
        doneRef.current?.();
      }, 250),
    ];
  };

  if (phase === "gone") return null;
  const leaving = phase === "leaving";

  return (
    <div
      className="fixed inset-0 z-[90] bg-cream"
      onClick={skip}
      role="presentation"
      style={leaving ? { animation: "y-fade-out .45s ease forwards" } : undefined}
    >
      <div
        className="absolute inset-0 bg-night"
        style={phase === "playing" ? { animation: "y-flood .5s cubic-bezier(.6,0,.3,1) both" } : undefined}
      >
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-sage/15 blur-2xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-olive/40 blur-2xl" />
      </div>

      {phase !== "cover" ? (
        <div className="absolute inset-0 grid place-items-center px-6">
          <div
            className="flex flex-col items-center"
            style={leaving ? { animation: "y-lift .45s ease-in forwards" } : undefined}
          >
            <div
              className="relative w-80 max-w-[80vw]"
              style={{ animation: "y-pop .7s cubic-bezier(.3,1.4,.5,1) .3s both, y-land .25s ease-out 1s both" }}
            >
              <Image src={LOGO} alt="Smoovy" width={287} height={95} priority className="h-auto w-full" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  WebkitMaskImage: `url(${LOGO})`,
                  maskImage: `url(${LOGO})`,
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  backgroundImage:
                    "linear-gradient(105deg, transparent 35%, rgba(255,255,255,.8) 50%, transparent 65%)",
                  backgroundSize: "60% 100%",
                  backgroundRepeat: "no-repeat",
                  animation: "y-shine .6s ease-in-out 1.15s both",
                }}
              />
            </div>
            <p
              className="font-display mt-5 text-xl font-semibold tracking-[0.35em] text-sage uppercase"
              style={{ animation: "y-rise .5s ease-out 1.25s both" }}
            >
              by Yanaya
            </p>
          </div>
          <p className="absolute bottom-10 text-xs font-medium text-white/50">Tap to skip</p>
        </div>
      ) : null}
    </div>
  );
}
