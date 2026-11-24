"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { PROCESS } from "@/lib/smoovy";
import { CheckIcon, PlayTri, XIcon } from "./icons";
import { Reveal } from "./Reveal";

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} id="process" className="relative scroll-mt-16 overflow-hidden" aria-labelledby="process-title">
      {/* hook on white */}
      <div className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pt-20 pb-10 md:grid-cols-[1.2fr_1fr] md:px-8 md:pt-28">
          <div>
            <Reveal>
              <p className="font-display text-5xl leading-[0.92] font-extrabold uppercase md:text-7xl">{PROCESS.hook}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-display mt-4 text-5xl leading-[0.92] font-extrabold text-sage uppercase md:text-7xl">
                {PROCESS.hook2}
              </p>
            </Reveal>
          </div>
          <motion.div style={{ rotate, y }} className="relative mx-auto w-[62%] max-w-[300px] md:w-full">
            <Image
              src="/smoovy/blender.webp"
              alt="A blender full of creamy smoothie"
              width={290}
              height={519}
              sizes="(max-width: 768px) 60vw, 300px"
              className="h-auto w-full drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* process on charcoal */}
      <div className="bg-night text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <h2 id="process-title" className="font-display flex items-center gap-4 text-6xl leading-none font-extrabold uppercase md:text-8xl">
              <PlayTri className="h-10 w-8 text-sage md:h-14 md:w-12" />
              <span>
                Our <span className="text-sage">Smoove</span> process
              </span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border-2 border-white/15 bg-white/[0.04] p-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#b3261e]/90">
                    <XIcon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-3xl font-extrabold text-white/60 uppercase line-through decoration-[#b3261e] decoration-4">
                    {PROCESS.easy.label}
                  </p>
                </div>
                <p className="mt-4 text-xl leading-relaxed text-white/70">{PROCESS.easy.text}</p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="h-full rounded-3xl bg-sage p-7 text-night shadow-[8px_9px_0_0_#485030]">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-night text-sage">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-3xl font-extrabold uppercase">{PROCESS.right.label}</p>
                </div>
                <p className="mt-4 text-xl leading-relaxed font-medium">{PROCESS.right.text}</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <p className="font-display mt-12 text-4xl font-extrabold uppercase md:text-6xl">{PROCESS.close}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
