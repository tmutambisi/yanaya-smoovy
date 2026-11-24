"use client";

import { MotionConfig } from "motion/react";

/** Respect the visitor's "reduce motion" setting for every motion component. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
