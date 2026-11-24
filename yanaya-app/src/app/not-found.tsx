import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site/SiteNav";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="main" className="grid min-h-svh place-items-center bg-night px-5 pt-20 text-center text-white">
        <div>
          <Image
            src="/smoovy/bottles/berry-nice.webp"
            alt=""
            width={259}
            height={555}
            className="float mx-auto h-56 w-auto -rotate-12 drop-shadow-2xl"
          />
          <h1 className="font-display mt-6 text-7xl font-extrabold uppercase md:text-8xl">Oops, spilled.</h1>
          <p className="mt-3 text-xl text-white/70">This page doesn&apos;t exist. Let&apos;s get you back to the good stuff.</p>
          <Link
            href="/"
            className="font-display sticker sticker-press mt-8 inline-block rounded-full bg-sage px-7 py-3 text-2xl font-extrabold text-night uppercase"
          >
            Back to Smoovy
          </Link>
        </div>
      </main>
    </>
  );
}
