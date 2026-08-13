import { Hero } from "@/components/marketing/Hero";
import { ProductExplanation } from "@/components/marketing/ProductExplanation";
import { ScenePreview } from "@/components/marketing/ScenePreview";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CtaSection } from "@/components/marketing/CtaSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductExplanation />
      <ScenePreview />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
