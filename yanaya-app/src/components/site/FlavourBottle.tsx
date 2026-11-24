"use client";

import Image from "next/image";
import { motion } from "motion/react";

/** Big bottle on a flavour page: spins up into place, then floats. */
export function FlavourBottle({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      className="relative"
      initial={{ y: 140, rotate: 14, opacity: 0, scale: 0.85 }}
      animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 70, damping: 13, delay: 0.1 }}
    >
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-white/25 blur-3xl" />
      <div className="float" style={{ ["--r" as string]: "1.5deg" }}>
        <Image
          src={src}
          alt={alt}
          width={259}
          height={555}
          priority
          sizes="(max-width: 768px) 55vw, 340px"
          className="relative mx-auto h-auto w-[55vw] max-w-[340px] drop-shadow-[0_35px_40px_rgba(0,0,0,0.35)]"
        />
      </div>
    </motion.div>
  );
}
