"use client";

/**
 * Install-to-home-screen support.
 * Android/Chrome fire `beforeinstallprompt`, which we keep so a button can show the
 * install dialog later. iPhone Safari has no such event, so we show
 * "Share → Add to Home Screen" instructions instead.
 */
import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let listening = false;

/** Call once, as early as possible (see PwaSetup). */
export function listenForInstallPrompt() {
  if (listening) return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // keep it for our own button
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useInstall() {
  const canPrompt = useSyncExternalStore(
    subscribe,
    () => deferred !== null,
    () => false,
  );
  const [env, setEnv] = useState({ isIOS: false, standalone: false });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setEnv({ isIOS, standalone });
  }, []);

  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    emit();
    return outcome === "accepted";
  };

  return {
    /** Already running as an installed app. */
    installed: env.standalone,
    /** Android/Chrome: we can open the install dialog. */
    canPrompt,
    /** iPhone/iPad: show manual steps. */
    showIOSSteps: env.isIOS && !env.standalone,
    install,
  };
}
