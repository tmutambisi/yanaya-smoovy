"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useScroll, useTransform } from "motion/react";
import { SOURCE } from "@/lib/smoovy";
import { Reveal } from "./Reveal";

export function Source() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} id="source" className="relative scroll-mt-16 overflow-hidden bg-white" aria-labelledby="source-title">
      <div className="mx-auto grid max-w-7xl items-end gap-6 px-5 pt-20 md:grid-cols-2 md:px-8 md:pt-28">
        <div className="pb-10 md:order-2 md:pb-28">
          <Reveal>
            <p className="font-display text-xl font-bold tracking-[0.25em] text-olive uppercase">▸ The source</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="source-title" className="font-display mt-3 text-6xl leading-[0.88] font-extrabold uppercase md:text-8xl">
              We buy from <span className="text-sage">Zimbabwean farmers</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex items-end gap-4">
              <CountUp to={100} className="font-display text-8xl leading-[0.8] font-extrabold text-sage md:text-9xl" />
              <p className="font-display pb-1 text-2xl leading-tight font-bold uppercase md:text-3xl">
                Organic
                <br />
                locally sourced fruit
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-8 text-xl leading-relaxed md:text-2xl">
              <b>{SOURCE.lead}</b> {SOURCE.body}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">{SOURCE.partners}</p>
          </Reveal>
        </div>

        <div className="relative md:order-1">
          <div aria-hidden className="absolute inset-x-[8%] bottom-0 aspect-square rounded-t-full bg-sage" />
          <motion.div style={{ y: imgY }} className="relative">
            <Image
              src="/smoovy/farmer.webp"
              alt="A Zimbabwean farmer holding fresh baobab fruit"
              width={902}
              height={976}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="relative h-auto w-full"
            />
          </motion.div>
        </div>
      </div>
      <div className="relative bg-sage">
        <p className="font-display mx-auto max-w-7xl px-5 py-5 text-2xl font-extrabold text-night uppercase md:px-8 md:text-3xl">
          Greatness starts at the source.
        </p>
      </div>
    </section>
  );
}

function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setV(to);
      return;
    }
    const c = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className} aria-label={`${to}%`}>
      {v}%
    </span>
  );
}
