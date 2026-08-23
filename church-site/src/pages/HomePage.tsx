import { useReveal } from "@/lib/useReveal";
import Hero from "@/sections/Hero";
import CardRow from "@/sections/CardRow";
import Scripture from "@/sections/Scripture";
import Gatherings from "@/sections/Gatherings";
import Sermons from "@/sections/Sermons";
import FirstVisit from "@/sections/FirstVisit";
import Community from "@/sections/Community";
import Prayer from "@/sections/Prayer";
import MapSection from "@/sections/MapSection";
import Give from "@/sections/Give";

export default function HomePage() {
  useReveal();

  return (
    <main id="main">
      <Hero />
      <CardRow />
      <Scripture />
      <Gatherings />
      <Sermons />
      <FirstVisit />
      <Community />
      <Prayer />
      <MapSection />
      <Give />
    </main>
  );
}
