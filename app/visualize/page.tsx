import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { VisualizeHero } from "@/components/visualize/VisualizeHero";
import { VisualizeWorkspace } from "@/components/visualize/VisualizeWorkspace";

export const metadata: Metadata = {
  title: "Visualize",
  description:
    "Paste a passage from a book and see how Bookfy could turn the scene into manga panels.",
};

export default function VisualizePage() {
  return (
    <Section className="pt-14 pb-20 sm:pt-16 lg:pt-20">
      <VisualizeHero />
      <div className="mt-12">
        <VisualizeWorkspace />
      </div>
    </Section>
  );
}
