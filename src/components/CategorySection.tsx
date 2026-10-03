import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import FadeUp from "./FadeUp";

export default function CategorySection() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-froska">
        <FadeUp className="mx-auto max-w-xl text-center">
          <span className="section-label mx-auto">Services</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            What can we organise?
          </h2>
          <p className="mt-4 text-base text-ink/60">
            From one messy corner to an entire home, we help you create spaces that
            work better for you.
          </p>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, i) => (
            <FadeUp key={category.slug} delay={0.05 * (i % 3)}>
              <Link
                href={`/book?area=${encodeURIComponent(category.name)}`}
                className="group block overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-ink/55">{category.description}</p>
                  </div>
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-green-500 group-hover:text-green-600">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
