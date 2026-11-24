import Image from "next/image";
import Link from "next/link";
import { FLAVOURS, NAV_LINKS, ORDER_MESSAGE, SITE, whatsappLink } from "@/lib/smoovy";
import { WhatsAppIcon } from "./icons";
import { Reveal } from "./Reveal";

/** Big closing call to action + footer. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
        <Reveal>
          <p className="font-display text-[14vw] leading-[0.85] font-extrabold uppercase md:text-[9rem]">
            Thirsty?
            <br />
            <span className="text-sage">Find your energy.</span>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <a
            href={whatsappLink(ORDER_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display sticker sticker-press mt-10 inline-flex items-center gap-3 rounded-full bg-sage px-7 py-4 text-2xl font-extrabold text-night uppercase md:text-3xl"
          >
            <WhatsAppIcon className="h-7 w-7" /> {SITE.whatsappDisplay}
          </a>
        </Reveal>

        <div className="mt-20 grid gap-10 border-t border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/smoovy/smoovy-logo.webp" alt="Smoovy" width={287} height={95} className="h-12 w-auto" />
            <p className="mt-4 text-white/70">
              {SITE.tagline} {SITE.tagline2}
            </p>
            <Image
              src="/brand/yanaya-logo.png"
              alt="A Yanaya brand"
              width={640}
              height={250}
              className="mt-5 h-12 w-auto opacity-90"
            />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-sage uppercase">Flavours</p>
            <ul className="mt-3 space-y-1.5">
              {FLAVOURS.map((f) => (
                <li key={f.slug}>
                  <Link href={`/flavours/${f.slug}`} className="text-white/80 hover:text-sage">
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-sage uppercase">Explore</p>
            <ul className="mt-3 space-y-1.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/80 hover:text-sage">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-xl font-bold text-sage uppercase">Talk to us</p>
            <ul className="mt-3 space-y-1.5 text-white/80">
              <li>
                <a href={whatsappLink(ORDER_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hover:text-sage">
                  WhatsApp {SITE.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`tel:+${SITE.whatsappIntl}`} className="hover:text-sage">
                  Call {SITE.whatsappDisplay}
                </a>
              </li>
              {SITE.email ? (
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:text-sage">
                    {SITE.email}
                  </a>
                </li>
              ) : null}
              {SITE.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-sage">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>sipsmoovy.com</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Yanaya. Smoovy is a Yanaya brand. Made in Zimbabwe.</p>
          <p>Site by Tungasonic Softwares</p>
        </div>
      </div>
    </footer>
  );
}
