import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlavourBottle } from "@/components/site/FlavourBottle";
import { Footer } from "@/components/site/Footer";
import { ArrowRight, LeafIcon, WhatsAppIcon } from "@/components/site/icons";
import { Reveal } from "@/components/site/Reveal";
import { SiteNav } from "@/components/site/SiteNav";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { FLAVOURS, flavourBySlug, orderFlavourMessage, SITE, whatsappLink } from "@/lib/smoovy";

export const dynamicParams = false;

export function generateStaticParams() {
  return FLAVOURS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = flavourBySlug(slug);
  if (!f) return {};
  const title = `${f.name}: ${f.badge}`;
  return {
    title,
    description: `${f.line} ${f.kind}, ${SITE.size}. Order on WhatsApp ${SITE.whatsappDisplay}.`,
    alternates: { canonical: `/flavours/${f.slug}` },
    openGraph: {
      title: `Smoovy ${f.name}`,
      description: f.line,
      url: `${SITE.url}/flavours/${f.slug}`,
      images: [{ url: `/og/${f.slug}.jpg`, width: 1200, height: 630, alt: `Smoovy ${f.name}` }],
    },
    twitter: { card: "summary_large_image", images: [`/og/${f.slug}.jpg`] },
  };
}

export default async function FlavourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = flavourBySlug(slug);
  if (!f) notFound();
  const others = FLAVOURS.filter((x) => x.slug !== f.slug);

  return (
    <>
      <SiteNav />
      <main id="main">
        {/* Hero in the flavour's colour */}
        <section
          className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24"
          style={{ backgroundColor: f.color.bg, color: f.color.ink }}
        >
          <p
            aria-hidden
            className="font-display pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] leading-none font-extrabold whitespace-nowrap uppercase opacity-[0.08] md:text-[18vw]"
          >
            {f.name.split(" ")[0]}
          </p>
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-2 md:px-8">
            <div className="order-2 md:order-1">
              <Reveal>
                <Link href="/#flavours" className="font-display text-lg font-bold uppercase opacity-70 hover:opacity-100">
                  ← All flavours
                </Link>
              </Reveal>
              <Reveal delay={0.05}>
                <span
                  className="font-display mt-4 inline-block rounded-md px-3 py-1 text-lg font-bold text-white uppercase"
                  style={{ backgroundColor: f.color.accent }}
                >
                  {f.badge}
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="font-display mt-3 text-7xl leading-[0.85] font-extrabold uppercase md:text-9xl">{f.name}</h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-2xl font-medium md:text-3xl">{f.line}</p>
                <p className="font-display mt-6 inline-block rounded-full bg-night px-4 py-1.5 text-lg font-bold text-white uppercase">
                  {f.kind} · {SITE.size}
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(orderFlavourMessage(f))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display sticker sticker-press inline-flex items-center gap-2 rounded-full bg-night px-6 py-3 text-xl font-extrabold text-white uppercase"
                  >
                    <WhatsAppIcon className="h-6 w-6 text-sage" /> Order {f.name.split(" ")[0]}
                  </a>
                </div>
              </Reveal>
            </div>
            <div className="order-1 md:order-2">
              <FlavourBottle src={f.bottle} alt={`Smoovy ${f.name} bottle, ${SITE.size}`} />
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:px-8">
            <Reveal>
              <p className="font-display text-4xl leading-tight font-bold md:text-5xl" style={{ color: f.color.accent }}>
                {f.story[0]}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xl leading-relaxed text-muted md:text-2xl">{f.story[1]}</p>
              <ul className="mt-8 grid grid-cols-2 gap-3">
                {SITE.badges.map((b) => (
                  <li key={b} className="sticker flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                    <LeafIcon className="h-5 w-5 shrink-0" />
                    <span className="font-display text-lg font-bold uppercase">{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* Other flavours */}
        <section className="bg-white py-20 md:py-24" aria-labelledby="more-title">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Reveal>
              <h2 id="more-title" className="font-display text-5xl font-extrabold uppercase md:text-6xl">
                More energy
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {others.map((o, k) => (
                <Reveal key={o.slug} delay={k * 0.06}>
                  <Link
                    href={`/flavours/${o.slug}`}
                    className="group sticker block overflow-hidden rounded-3xl"
                    style={{ backgroundColor: o.color.bg, color: o.color.ink }}
                  >
                    <div className="relative flex h-56 items-end justify-center pt-4 md:h-72">
                      <Image
                        src={o.bottle}
                        alt={`Smoovy ${o.name}`}
                        width={259}
                        height={555}
                        sizes="(max-width: 768px) 30vw, 140px"
                        className="h-[92%] w-auto transition duration-500 group-hover:-translate-y-2 group-hover:rotate-3"
                      />
                    </div>
                    <p className="font-display flex items-center justify-between px-4 py-3 text-xl font-bold uppercase">
                      {o.name} <ArrowRight className="h-5 w-5" />
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
