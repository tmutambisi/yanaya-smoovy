"use client";

import { useState } from "react";
import { useInstall } from "@/lib/pwa";

/**
 * "Add Yanaya to your home screen".
 * Android/Chrome: opens the browser's install dialog.
 * iPhone/iPad: shows the Share → Add to Home Screen steps (Safari has no install dialog).
 * Hidden when already installed or when the browser can't install.
 */
export function InstallApp() {
  const { installed, canPrompt, showIOSSteps, install } = useInstall();
  const [showSteps, setShowSteps] = useState(false);

  if (installed || (!canPrompt && !showIOSSteps)) return null;

  return (
    <div className="m-2 rounded-2xl border-2 border-night bg-leaf-700 p-4 text-white shadow-[0_4px_0_0_#9ab46c]">
      <p className="font-bold">Get the Yanaya app</p>
      <p className="mt-0.5 text-xs text-white/80">
        Add it to your home screen: opens full screen, with order updates on your phone.
      </p>
      {canPrompt ? (
        <button
          onClick={() => void install()}
          className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-bold text-leaf-700"
        >
          Add to home screen
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowSteps((s) => !s)}
            className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-bold text-leaf-700"
            aria-expanded={showSteps}
          >
            {showSteps ? "Hide steps" : "How to add it"}
          </button>
          {showSteps ? (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-white/90">
              <li>
                Tap the <b>Share</b> button <ShareGlyph /> at the bottom of Safari.
              </li>
              <li>
                Scroll and tap <b>Add to Home Screen</b>.
              </li>
              <li>
                Tap <b>Add</b>. Yanaya appears with your other apps.
              </li>
            </ol>
          ) : null}
        </>
      )}
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="inline h-4 w-4 align-[-2px]" fill="none" stroke="currentColor" strokeWidth={2} aria-label="Share icon">
      <path d="M12 3v12M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11H5v10h14V11h-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
