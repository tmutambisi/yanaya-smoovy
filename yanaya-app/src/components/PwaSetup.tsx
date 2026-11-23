"use client";

import { useEffect } from "react";
import { listenForInstallPrompt } from "@/lib/pwa";

/**
 * Registers the service worker (production builds only — in development it would
 * cache pages and hide your changes) and starts listening for the install prompt.
 */
export function PwaSetup() {
  useEffect(() => {
    listenForInstallPrompt();
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is a bonus; ordering still works without it */
    });
  }, []);
  return null;
}
