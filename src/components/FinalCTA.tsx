import Link from "next/link";
import FadeUp from "./FadeUp";

export default function FinalCTA() {
  return (
    <section className="bg-green-900 py-20 md:py-28">
      <div className="container-froska text-center">
        <FadeUp>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your home could feel completely different next week.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-green-100/70">
            Tell us what needs changing. We&rsquo;ll take it from there.
          </p>
          <Link href="/book" className="btn-primary mt-8 bg-white text-green-800 hover:bg-green-50">
            Book a Slot
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
