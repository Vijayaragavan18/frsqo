import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, Wand2 } from "lucide-react";
import FadeUp from "@/components/FadeUp";

export const metadata = {
  title: "About — frsqo",
  description: "frsqo launched in 2026 to make professional home organisation more accessible.",
};

const APPROACH = ["Understand", "Organise", "Clean", "Restructure", "Transform"];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-20 md:py-28">
        <div className="container-froska">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="section-label mx-auto">About frsqo</span>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              A better organised home starts with a better system.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-ink/65 sm:text-lg">
              frsqo launched in 2026 to make professional home organisation more
              accessible — bringing organisation, cleaning, restructuring, space
              optimisation, practical storage and full home transformation under one
              simple booking.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Image row */}
      <section className="bg-white py-4">
        <div className="container-froska grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { src: "/images/entryway-organized.jpg", alt: "An organised entryway with shoe storage and hooks" },
            { src: "/images/hero-desk.jpg", alt: "A clean, minimal home workspace" },
            { src: "/images/bedroom-glowup-after.jpg", alt: "A calm, organised bedroom with warm lighting" },
          ].map((img, i) => (
            <FadeUp key={img.src} delay={i * 0.08} className="relative aspect-[4/5] overflow-hidden rounded-xl2">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Why frsqo */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-froska grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeUp>
            <span className="section-label">Why frsqo?</span>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Because organisation should make life easier, not just make a room look
              better.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink/60">
              A tidy photo is easy. A system that keeps working after the team leaves is
              harder — and it&rsquo;s what we actually care about. Every booking is built
              around how you use a space day to day, not just how it looks for an
              afternoon.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <span className="section-label">Our philosophy</span>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Less clutter. Better systems. More room to live.
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: Layers, label: "Fewer things, chosen well" },
                { icon: Wand2, label: "Systems that stick" },
                { icon: Sparkles, label: "Spaces that feel calm" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="card-surface p-4">
                  <Icon size={18} className="text-green-600" />
                  <p className="mt-3 text-sm font-medium text-ink/75">{label}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Our approach */}
      <section className="bg-cream py-20 md:py-28">
        <div className="container-froska">
          <FadeUp className="mx-auto max-w-xl text-center">
            <span className="section-label mx-auto">Our approach</span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Understand → Organise → Clean → Restructure → Transform
            </h2>
          </FadeUp>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {APPROACH.map((stage, i) => (
              <FadeUp key={stage} delay={i * 0.06} className="card-surface flex flex-col items-center gap-3 px-4 py-8 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 font-display text-sm font-semibold text-green-700">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-ink">{stage}</span>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-froska">
          <FadeUp className="flex flex-col items-center gap-6 rounded-xl2 border border-line bg-cream px-6 py-14 text-center sm:px-14">
            <h2 className="max-w-lg font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Ready to see what your space could feel like?
            </h2>
            <Link href="/book" className="btn-primary">
              Book a Slot <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
