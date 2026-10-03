import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FadeUp from "./FadeUp";

export default function AboutPreview() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-froska grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeUp className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl2 shadow-lift">
            <Image
              src="/images/shelves-organized.jpg"
              alt="Neatly organised open shelving with books and personal items"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <span className="section-label">About frsqo</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            We&rsquo;re building homes that feel easier to live in.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/65">
            frsqo started in 2026 with a simple idea: organisation shouldn&rsquo;t mean
            throwing everything away or buying more storage. It should mean creating a
            space that actually works for the people living in it.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:gap-2.5 transition-all"
          >
            More About frsqo <ArrowRight size={16} />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
