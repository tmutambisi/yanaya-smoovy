"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { FLAVOURS, STORY } from "@/lib/smoovy";
import { Reveal } from "./Reveal";

const TILES = FLAVOURS.filter((f) => f.tile);

export function HealthMosaic() {
  return (
    <section className="bg-cream py-20 md:py-28" aria-labelledby="otg-title">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-[1fr_1.15fr] md:px-8">
        <div>
          <Reveal>
            <h2 id="otg-title" className="font-display text-6xl leading-[0.9] font-extrabold uppercase md:text-8xl">
              {STORY.onTheGo}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-display mt-5 text-3xl leading-tight font-bold text-sage uppercase md:text-4xl">
              {STORY.onTheGoMore}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {TILES.map((f, k) => (
            <motion.div
              key={f.slug}
              initial={{ opacity: 0, scale: 0.85, rotate: k % 2 ? 4 : -4 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ type: "spring", stiffness: 90, damping: 14, delay: k * 0.08 }}
            >
              <Link
                href={`/flavours/${f.slug}`}
                className="group sticker relative block aspect-square overflow-hidden rounded-3xl"
                aria-label={`Discover ${f.name}`}
              >
                <Image
                  src={f.tile!}
                  alt={`${f.name} mood artwork`}
                  fill
                  sizes="(max-width: 768px) 50vw, 340px"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                <span className="font-display absolute inset-x-0 bottom-0 translate-y-full bg-night/85 px-3 py-2 text-center text-lg font-bold text-white uppercase transition duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  {f.name} →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
