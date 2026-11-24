import { SITE } from "@/lib/smoovy";
import { LeafIcon } from "./icons";

const WORDS = [...SITE.badges, SITE.size, "Made in Zimbabwe", "Find your energy"];

/** Two slanted ticker bands running in opposite directions. */
export function BadgeMarquee() {
  return (
    <div className="relative -my-6 overflow-hidden py-10" aria-label={WORDS.join(", ")}>
      <Band className="-rotate-2 bg-sage text-night" />
      <Band className="-mt-3 rotate-1 bg-night text-sage" reverse />
    </div>
  );
}

function Band({ className, reverse }: { className: string; reverse?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <div className={`relative w-[110%] -translate-x-[5%] border-y-[3px] border-night py-3 ${className}`} aria-hidden>
      <div className={`marquee-track flex w-max ${reverse ? "reverse" : ""}`}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((w, i) => (
              <span key={`${k}-${i}`} className="font-display flex items-center text-2xl font-extrabold tracking-wide uppercase md:text-3xl">
                <span className="px-5">{w}</span>
                <LeafIcon className="h-5 w-5 opacity-70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
