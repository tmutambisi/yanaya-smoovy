"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ORDER_MESSAGE, whatsappLink } from "@/lib/smoovy";
import { WhatsAppIcon } from "./icons";

/** Floating "order on WhatsApp" button, shown after the hero. The future chatbot takes this spot. */
export function WhatsAppFab() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.85);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.a
          href={whatsappLink(ORDER_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order on WhatsApp"
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 md:right-8 md:bottom-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <span aria-hidden className="pulse-ring absolute inset-0 rounded-full bg-[#25d366]" />
          <span className="sticker relative grid h-16 w-16 place-items-center rounded-full bg-[#25d366] text-white">
            <WhatsAppIcon className="h-8 w-8" />
          </span>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
