import Hero from "@/components/Hero";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import CategorySection from "@/components/CategorySection";
import HowItWorks from "@/components/HowItWorks";
import ServiceLevels from "@/components/ServiceLevels";
import LaunchOffer from "@/components/LaunchOffer";
import AboutPreview from "@/components/AboutPreview";
import FinalCTA from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BeforeAfterSection />
      <CategorySection />
      <HowItWorks />
      <ServiceLevels />
      <LaunchOffer />
      <AboutPreview />
      <FinalCTA />
    </>
  );
}
