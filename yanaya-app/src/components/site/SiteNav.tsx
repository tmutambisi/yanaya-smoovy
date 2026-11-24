"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS, ORDER_MESSAGE, whatsappLink } from "@/lib/smoovy";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./icons";

/** Fixed top bar: transparent over the hero, charcoal glass once you scroll. */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open ? "bg-night/85 shadow-lg shadow-black/10 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:h-20 md:px-8" aria-label="Main">
          <Link href="/" className="shrink-0" aria-label="Smoovy home" onClick={() => setOpen(false)}>
            <Image src="/smoovy/smoovy-logo.webp" alt="Smoovy" width={287} height={95} priority className="h-9 w-auto md:h-11" />
          </Link>

          <ul className="ml-auto hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-display text-lg font-semibold tracking-wide text-white/80 uppercase transition hover:text-sage"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={whatsappLink(ORDER_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display ml-auto hidden items-center gap-2 rounded-full bg-sage px-5 py-2.5 text-lg font-bold tracking-wide text-night uppercase transition hover:bg-white sm:flex lg:ml-0"
          >
            <WhatsAppIcon className="h-5 w-5" /> Place order
          </a>

          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto grid h-11 w-11 place-items-center rounded-full text-white sm:ml-0 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-night px-6 pt-24 pb-10 lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.5, ease: [0.6, 0, 0.3, 1] }}
          >
            <ul className="space-y-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="font-display block py-1 text-5xl font-extrabold text-white uppercase hover:text-sage"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.a
              href={whatsappLink(ORDER_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display sticker mt-auto flex items-center justify-center gap-3 rounded-full bg-sage py-4 text-2xl font-extrabold text-night uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <WhatsAppIcon className="h-7 w-7" /> Place order
            </motion.a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
