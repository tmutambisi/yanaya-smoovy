"use client";

import { useState } from "react";
import { IntroSplash } from "@/components/IntroSplash";
import { Hero } from "./Hero";

/** Plays the brand intro, then lets the hero animate in. */
export function HomeHero() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <IntroSplash onDone={() => setReady(true)} />
      <Hero ready={ready} />
    </>
  );
}
