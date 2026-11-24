import { BadgeMarquee } from "@/components/site/BadgeMarquee";
import { Faq } from "@/components/site/Faq";
import { FlavourShowcase } from "@/components/site/FlavourShowcase";
import { Footer } from "@/components/site/Footer";
import { HealthMosaic } from "@/components/site/HealthMosaic";
import { HomeHero } from "@/components/site/HomeHero";
import { PartnerForm } from "@/components/site/PartnerForm";
import { Philosophy } from "@/components/site/Philosophy";
import { Process } from "@/components/site/Process";
import { SiteNav } from "@/components/site/SiteNav";
import { Source } from "@/components/site/Source";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { YanayaCarousel } from "@/components/site/YanayaCarousel";
import { FLAVOURS, SITE } from "@/lib/smoovy";

/** Structured data: helps Google show the brand and its products. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#org`,
      name: "Smoovy by Yanaya",
      url: SITE.url,
      logo: `${SITE.url}/icons/icon-512.png`,
      parentOrganization: { "@type": "Organization", name: "Yanaya" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: `+${SITE.whatsappIntl}`,
        contactType: "sales",
        areaServed: "ZW",
      },
    },
    ...FLAVOURS.map((f) => ({
      "@type": "Product",
      name: `Smoovy ${f.name}`,
      description: `${f.line} ${f.kind}, ${SITE.size}.`,
      image: `${SITE.url}${f.bottle}`,
      brand: { "@type": "Brand", name: "Smoovy" },
      url: `${SITE.url}/flavours/${f.slug}`,
    })),
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />
      <main id="main">
        <HomeHero />
        <BadgeMarquee />
        <FlavourShowcase />
        <Philosophy />
        <Source />
        <Process />
        <HealthMosaic />
        <YanayaCarousel />
        <section id="partner" className="scroll-mt-16 bg-night-2 py-20 md:py-28" aria-labelledby="partner-title">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <PartnerForm />
          </div>
        </section>
        <Faq />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
