import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { PartnerForm } from "@/components/site/PartnerForm";
import { SiteNav } from "@/components/site/SiteNav";

export const metadata: Metadata = {
  title: "Partnership & ordering inquiry",
  description:
    "Stock Smoovy in your shop, gym, restaurant or office, or become a distributor. Send us your details on WhatsApp.",
  alternates: { canonical: "/partner" },
};

export default function PartnerPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="bg-night-2 pt-28 pb-20 md:pt-36 md:pb-28">
        <section className="mx-auto max-w-5xl px-5 md:px-8" aria-labelledby="partner-title">
          <PartnerForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
