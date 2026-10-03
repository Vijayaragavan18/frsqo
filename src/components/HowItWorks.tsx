import { CalendarCheck2, ClipboardList, Sparkles } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";
import FadeUp from "./FadeUp";

const ICONS = [ClipboardList, CalendarCheck2, Sparkles];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="container-froska">
        <FadeUp className="mx-auto max-w-xl text-center">
          <span className="section-label mx-auto">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Three steps to a better space.
          </h2>
        </FadeUp>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {HOW_IT_WORKS.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <FadeUp key={item.step} delay={0.1 * i} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Icon size={20} />
                </div>
                <span className="mt-5 block font-display text-sm font-semibold text-green-600">
                  {item.step}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.description}</p>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
