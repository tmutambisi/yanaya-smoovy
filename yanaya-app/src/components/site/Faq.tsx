import { FAQ } from "@/lib/smoovy";
import { ChevronDown } from "./icons";
import { Reveal } from "./Reveal";

export function Faq() {
  return (
    <section className="bg-cream py-20 md:py-28" aria-labelledby="faq-title">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <Reveal>
          <h2 id="faq-title" className="font-display text-6xl font-extrabold uppercase md:text-7xl">
            Good to know
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {FAQ.map((item, k) => (
            <Reveal key={item.q} delay={k * 0.05}>
              <details className="group sticker rounded-2xl bg-white open:bg-sage-100">
                <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-2xl font-bold uppercase [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="h-6 w-6 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-lg leading-relaxed text-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
