import Link from "next/link";
import { getLaunchOfferStatus } from "@/lib/bookings";
import ProgressBar from "./ProgressBar";
import FadeUp from "./FadeUp";

export default async function LaunchOffer() {
  const { claimed, total } = await getLaunchOfferStatus();
  const percent = Math.min(100, Math.round((claimed / total) * 100));

  return (
    <section id="launch-offer" className="bg-white py-20 md:py-28">
      <div className="container-froska">
        <FadeUp>
          <div className="overflow-hidden rounded-xl2 bg-green-800 px-6 py-12 text-center sm:px-14 sm:py-16">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-100">
              Launch offer
            </span>

            <h2 className="mx-auto mt-5 max-w-lg font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              We&rsquo;re starting with 20.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-green-50/80 sm:text-base">
              To celebrate the launch of frsqo, the first 20 confirmed bookings are
              completely free.
            </p>

            <div className="mx-auto mt-9 max-w-xs">
              <div className="mb-2 flex items-baseline justify-between text-sm font-semibold text-white">
                <span>
                  {String(claimed).padStart(2, "0")} / {total}
                </span>
                <span className="text-green-100/70">bookings claimed</span>
              </div>
              <ProgressBar percent={percent} />
            </div>

            <Link href="/book" className="mt-9 inline-flex btn-primary bg-white text-green-700 hover:bg-green-50">
              Claim Your Free Slot
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
