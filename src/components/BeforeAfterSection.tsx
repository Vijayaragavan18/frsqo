import FadeUp from "./FadeUp";
import BeforeAfterSlider from "./BeforeAfterSlider";

export default function BeforeAfterSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-froska">
        <FadeUp className="mx-auto max-w-xl text-center">
          <span className="section-label mx-auto">Before &amp; after</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            See what a little organisation can do.
          </h2>
          <p className="mt-4 text-base text-ink/60">
            Small changes can completely change how a space feels.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mx-auto mt-12 max-w-3xl">
          <BeforeAfterSlider
            before="/images/bedroom-glowup-before.jpg"
            after="/images/bedroom-glowup-after.jpg"
            beforeAlt="A cluttered bedroom before frsqo's organisation service"
            afterAlt="The same bedroom after frsqo's organisation service, calm and cosy"
          />
          <p className="mt-4 text-center text-sm text-ink/45">
            Drag the handle to compare — or use the arrow keys.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
