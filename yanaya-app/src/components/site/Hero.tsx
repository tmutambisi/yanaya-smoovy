"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { FLAVOURS, ORDER_MESSAGE, SITE, whatsappLink } from "@/lib/smoovy";
import { ArrowRight, ChevronDown, WhatsAppIcon } from "./icons";

/** Bottle line-up order (Baobalicious in the middle, the hero flavour). */
const LINEUP = ["berry-nice", "whey-strawberry", "baobalicious", "pineapple-express", "choco-mint"]
  .map((s) => FLAVOURS.find((f) => f.slug === s)!)
  .filter(Boolean);
const SCALE = [0.74, 0.87, 1, 0.87, 0.74];
const DEPTH = [18, 10, 4, 10, 18]; // parallax strength (px)
const TILT = [-7, -4, 0, 4, 7];

export function Hero({ ready }: { ready: boolean }) {
  // Pointer parallax (desktop): springs so it feels smooth, not jittery
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const line = (i: number) => ({
    initial: { y: "110%" },
    animate: ready ? { y: "0%" } : { y: "110%" },
    transition: { duration: 0.8, delay: 0.1 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <section
      onPointerMove={onMove}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-night pt-24 text-white md:pt-28"
      aria-label="Smoovy"
    >
      {/* background glows + ghost words */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[38%] left-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 rounded-full bg-sage/20 blur-[90px]" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-olive/50 blur-3xl" />
        <p className="font-display absolute bottom-[8%] left-1/2 -translate-x-1/2 text-[28vw] leading-none font-extrabold whitespace-nowrap text-white/[0.035] uppercase md:text-[19vw]">
          Smoovy
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <h1 className="font-display text-[15vw] leading-[0.86] font-extrabold tracking-tight uppercase sm:text-[12vw] lg:text-[8.6rem]">
          <span className="block overflow-hidden pb-[0.04em]">
            <motion.span className="block" {...line(0)}>
              Energy in
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <motion.span className="block" {...line(1)}>
              a bottle.
            </motion.span>
          </span>
        </h1>
        <p className="font-display mt-3 overflow-hidden text-[8.5vw] leading-none font-extrabold uppercase sm:text-[6vw] lg:text-6xl">
          <motion.span className="block" {...line(2)}>
            <span className="text-sage">Happiness you </span>
            <span className="text-sage">can</span> taste.
          </motion.span>
        </p>

        <motion.div
          className="mt-7 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <a
            href="#flavours"
            className="font-display sticker sticker-press inline-flex items-center gap-2 rounded-full bg-sage px-6 py-3 text-xl font-extrabold text-night uppercase"
          >
            {SITE.slogan} <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href={whatsappLink(ORDER_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 text-xl font-bold text-white uppercase transition hover:border-sage hover:text-sage"
          >
            <WhatsAppIcon className="h-5 w-5" /> Place order
          </a>
        </motion.div>
      </div>

      {/* bottle line-up */}
      <div className="relative mx-auto mt-auto flex w-full max-w-5xl items-end justify-center px-2 pt-8 pb-14 md:pb-16">
        {LINEUP.map((f, i) => (
          <Bottle key={f.slug} index={i} src={f.bottle} name={f.name} ready={ready} sx={sx} sy={sy} />
        ))}
        {/* floor shadow */}
        <div aria-hidden className="absolute inset-x-[12%] bottom-12 h-6 rounded-[50%] bg-black/45 blur-xl md:bottom-14" />
      </div>

      <motion.a
        href="#flavours"
        aria-label="Scroll to flavours"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60 hover:text-sage"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1, y: [0, 6, 0] } : {}}
        transition={{ delay: 1.6, y: { repeat: Infinity, duration: 1.8 } }}
      >
        <ChevronDown className="h-7 w-7" />
      </motion.a>
    </section>
  );
}

function Bottle({
  index,
  src,
  name,
  ready,
  sx,
  sy,
}: {
  index: number;
  src: string;
  name: string;
  ready: boolean;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}) {
  const x = useTransform(sx, (v) => v * DEPTH[index] * 2);
  const y = useTransform(sy, (v) => v * DEPTH[index]);
  const scale = SCALE[index];
  const centre = index === 2;
  return (
    <motion.div
      className="relative -mx-[5%] w-[calc(var(--s)*30%)] shrink-0 md:-mx-[2.2%] md:w-[calc(var(--s)*22%)]"
      style={{ zIndex: 10 - Math.abs(index - 2) * 2, ["--s" as string]: scale, maxWidth: 240 * scale }}
      initial={{ y: 160, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.35 + Math.abs(index - 2) * 0.12 }}
    >
      <motion.div style={{ x, y }}>
      <div className="float" style={{ ["--r" as string]: `${TILT[index] * 0.25}deg`, animationDelay: `${index * -1.2}s` }}>
        <Image
          src={src}
          alt={`Smoovy ${name} bottle`}
          width={259}
          height={555}
          priority={centre}
          sizes="(max-width: 768px) 30vw, 240px"
          className="h-auto w-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.45)]"
          style={{ rotate: `${TILT[index]}deg` }}
        />
      </div>
      </motion.div>
    </motion.div>
  );
}
