"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { STORY } from "@/lib/smoovy";
import { Reveal } from "./Reveal";

/** "Yanaya is the nourishing rain. Smoovy is the brilliant sunshine that follows." lit word by word. */
export function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const words = STORY.philosophy.split(" ");

  return (
    <section id="story" className="relative scroll-mt-16 overflow-hidden bg-cream py-24 md:py-36" aria-labelledby="story-title">
      <div aria-hidden className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-sage/25 blur-3xl" />
      <div aria-hidden className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#ffde8d]/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p id="story-title" className="font-display flex items-center gap-3 text-xl font-bold tracking-[0.25em] text-olive uppercase">
            <span className="h-[3px] w-10 bg-sage" /> Our philosophy
          </p>
        </Reveal>

        <div ref={ref} className="mt-6">
          <p className="font-display text-[11vw] leading-[0.95] font-extrabold uppercase sm:text-7xl lg:text-8xl">
            {words.map((w, k) => (
              <Word key={k} word={w} progress={scrollYProgress} range={[k / words.length, (k + 1) / words.length]} />
            ))}
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="text-xl leading-relaxed text-muted md:text-2xl">{STORY.philosophyMore}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="sticker rounded-3xl bg-white p-6 md:p-8">
              <Image src="/smoovy/smoovy-logo.webp" alt="Smoovy" width={287} height={95} className="h-12 w-auto" />
              <p className="font-display mt-4 text-3xl leading-tight font-extrabold uppercase">{STORY.origin}</p>
              <p className="mt-2 text-lg text-muted">{STORY.originMore}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const highlight = /Smoovy|sunshine/i.test(word);
  const rain = /Yanaya|rain/i.test(word);
  return (
    <motion.span
      style={{ opacity }}
      className={`mr-[0.22em] inline-block ${highlight ? "text-[#c49930]" : rain ? "text-leaf" : "text-night"}`}
    >
      {word}
    </motion.span>
  );
}
