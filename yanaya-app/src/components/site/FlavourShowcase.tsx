"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { FLAVOURS, orderFlavourMessage, SITE, whatsappLink } from "@/lib/smoovy";
import { ArrowRight, WhatsAppIcon } from "./icons";

const FRUIT: Record<string, string | undefined> = {
  baobalicious: "/smoovy/fruit/baobab-pod.webp",
  "berry-nice": "/smoovy/fruit/blackberry.webp",
  // TODO: add strawberry / mint / pineapple cut-outs once the designer's originals arrive
};

/**
 * Pinned scroll section: each flavour gets one screen-height of scroll.
 * The background colour morphs, the bottle swaps, and the copy animates in.
 */
export function FlavourShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const n = FLAVOURS.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(p * n * 0.999)));
    setI((cur) => (cur === next ? cur : next));
  });

  const f = FLAVOURS[i];
  const fruit = FRUIT[f.slug];

  // Keep the active tab visible in the (horizontally scrolling) tab row on phones
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row?.children[i] as HTMLElement | undefined;
    if (!row || !tab) return;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [i]);

  const jumpTo = (k: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const step = (el.offsetHeight - window.innerHeight) / n;
    window.scrollTo({ top: top + step * k + 2, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      id="flavours"
      aria-label="Smoovy flavours"
      className="relative scroll-mt-0"
      style={{ height: `${n * 100}svh` }}
    >
      <motion.div
        className="sticky top-0 flex h-svh flex-col overflow-hidden pt-20 md:pt-24"
        initial={false}
        style={{ backgroundColor: FLAVOURS[0].color.bg, color: FLAVOURS[0].color.ink }}
        animate={{ backgroundColor: f.color.bg, color: f.color.ink }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* header + flavour tabs */}
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-3xl leading-none font-extrabold uppercase md:text-5xl">
              Five flavours. <span className="opacity-60">{SITE.slogan}.</span>
            </h2>
            <span className="font-display text-lg font-bold tabular-nums opacity-70">
              0{i + 1} / 0{n}
            </span>
          </div>
          <div
            ref={tabsRef}
            className="relative mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
            role="tablist"
            aria-label="Choose a flavour"
          >
            {FLAVOURS.map((x, k) => (
              <button
                key={x.slug}
                role="tab"
                aria-selected={k === i}
                onClick={() => jumpTo(k)}
                className={`font-display shrink-0 rounded-full border-2 px-4 py-1.5 text-base font-bold uppercase transition ${
                  k === i ? "border-current bg-night text-white" : "border-current/30 opacity-70 hover:opacity-100"
                }`}
              >
                {x.name}
              </button>
            ))}
          </div>
        </div>

        {/* stage */}
        <div className="relative mx-auto grid w-full max-w-7xl flex-1 grid-rows-[minmax(0,1fr)_auto] items-center gap-2 px-5 pb-6 md:grid-cols-2 md:grid-rows-1 md:gap-10 md:px-8 md:pb-10">
          {/* giant ghost name */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`ghost-${f.slug}`}
              aria-hidden
              className="font-display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[22vw] leading-none font-extrabold whitespace-nowrap uppercase opacity-[0.08] md:text-[13vw]"
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 0.08 }}
              exit={{ x: -80, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {f.name.split(" ")[0]}
            </motion.p>
          </AnimatePresence>

          {/* bottle */}
          <div className="relative flex h-full min-h-0 items-center justify-center">
            <div aria-hidden className="absolute h-[70%] max-h-[420px] w-[70%] max-w-[420px] rounded-full bg-white/20 blur-2xl" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={f.slug}
                className="relative h-full max-h-[62svh] md:max-h-[70svh]"
                initial={{ y: 120, rotate: 10, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                exit={{ y: -120, rotate: -10, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 90, damping: 16 }}
              >
                <Image
                  src={f.bottle}
                  alt={`Smoovy ${f.name} bottle, ${SITE.size}`}
                  width={259}
                  height={555}
                  sizes="(max-width: 768px) 40vw, 320px"
                  className="h-full w-auto object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)]"
                />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {fruit ? (
                <motion.div
                  key={`fruit-${f.slug}`}
                  aria-hidden
                  className="absolute top-[8%] right-[6%] w-[22%] max-w-[150px] md:right-[12%]"
                  initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                  transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.15 }}
                >
                  <Image src={fruit} alt="" width={200} height={200} className="float h-auto w-full drop-shadow-xl" />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* copy */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={f.slug}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              >
                <motion.span
                  variants={item}
                  className="font-display inline-block rounded-md px-3 py-1 text-base font-bold text-white uppercase md:text-lg"
                  style={{ backgroundColor: f.color.accent }}
                >
                  {f.badge}
                </motion.span>
                <motion.h3
                  variants={item}
                  className="font-display mt-2 text-5xl leading-[0.9] font-extrabold uppercase md:text-7xl lg:text-8xl"
                >
                  {f.name}
                </motion.h3>
                <motion.p variants={item} className="mt-2 text-lg font-medium md:text-2xl">
                  {f.line}
                </motion.p>
                <motion.p variants={item} className="mt-3 hidden max-w-xl text-base leading-relaxed opacity-85 sm:block md:text-lg">
                  {f.story[0]}
                </motion.p>
                <motion.div variants={item} className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(orderFlavourMessage(f))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display sticker sticker-press inline-flex items-center gap-2 rounded-full bg-night px-5 py-2.5 text-lg font-extrabold text-white uppercase"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-sage" /> Order {f.name.split(" ")[0]}
                  </a>
                  <Link
                    href={`/flavours/${f.slug}`}
                    className="font-display inline-flex items-center gap-2 rounded-full border-2 border-current px-5 py-2.5 text-lg font-bold uppercase transition hover:bg-white/15"
                  >
                    Discover <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* progress */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/10">
          <motion.div className="h-full origin-left bg-night" style={{ scaleX: scrollYProgress }} />
        </div>
      </motion.div>
    </section>
  );
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } },
};
