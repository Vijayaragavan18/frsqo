import Link from "next/link";
import { Check } from "lucide-react";
import { SERVICE_LEVELS } from "@/lib/constants";
import FadeUp from "./FadeUp";

export default function ServiceLevels() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-froska">
        <FadeUp className="mx-auto max-w-xl text-center">
          <span className="section-label mx-auto">Service levels</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Choose the level of transformation you need.
          </h2>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {SERVICE_LEVELS.map((level, i) => (
            <FadeUp key={level.id} delay={0.06 * i} className="h-full">
              <div
                className={`flex h-full flex-col rounded-xl2 border p-6 transition-shadow duration-300 ${
                  level.highlighted
                    ? "border-green-600 bg-green-800 text-white shadow-lift lg:scale-[1.03]"
                    : "border-line bg-white text-ink shadow-card"
                }`}
              >
                {level.highlighted && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-50">
                    Most popular
                  </span>
                )}

                <h3 className="font-display text-lg font-semibold">{level.name}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${level.highlighted ? "text-green-50/85" : "text-ink/60"}`}>
                  {level.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {level.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${level.highlighted ? "text-green-200" : "text-green-600"}`}
                      />
                      <span className={level.highlighted ? "text-green-50/90" : "text-ink/75"}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/book?service=${level.id}`}
                  className={`mt-7 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                    level.highlighted
                      ? "bg-white text-green-700 hover:bg-green-50"
                      : "border border-line text-ink hover:border-green-500 hover:text-green-700"
                  }`}
                >
                  Choose {level.name}
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
