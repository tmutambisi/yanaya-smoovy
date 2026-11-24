import Image from "next/image";
import { MENU_BANNER, MENU_ITEMS } from "@/lib/config";
import { Reveal } from "./Reveal";

const ITEMS = MENU_ITEMS.filter((m) => m.id !== "smoovy");

/** The wider Yanaya family. Native scroll-snap carousel (swipe on phones, scroll/drag on desktop). */
export function YanayaCarousel() {
  return (
    <section className="overflow-hidden bg-leaf py-20 text-white md:py-28" aria-labelledby="yanaya-title">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="font-display text-xl font-bold tracking-[0.25em] text-sage uppercase">Born from the heart of</p>
            <h2 id="yanaya-title" className="sr-only">
              Also from Yanaya
            </h2>
            <Image
              src="/brand/yanaya-logo.png"
              alt="Yanaya: It Will End In Health"
              width={640}
              height={250}
              className="mt-3 h-auto w-72 drop-shadow-[6px_7px_0_rgba(154,180,108,0.9)] md:w-96"
            />
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Smoovy&apos;s parent company: Zimbabwe&apos;s healthy food kitchen. Salads, smoothies, juices, wraps and
              snacks, available in store.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[562/313] w-full max-w-sm overflow-hidden rounded-2xl border-[3px] border-night">
              <Image src={MENU_BANNER} alt="Yanaya: a healthy lifestyle" fill sizes="384px" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </div>

      <div
        className="mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:thin] md:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        tabIndex={0}
        aria-label="Yanaya menu, scroll sideways"
      >
        {ITEMS.map((m) => (
          <figure key={m.id} className="w-[68vw] max-w-[300px] shrink-0 snap-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-[3px] border-night bg-white/10">
              <Image src={m.image} alt={m.name} fill sizes="300px" className="object-cover transition duration-500 hover:scale-105" />
            </div>
            <figcaption className="font-display mt-3 text-2xl font-bold uppercase">
              {m.name}
              <span className="block text-base font-semibold tracking-wide text-sage">{m.category}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
