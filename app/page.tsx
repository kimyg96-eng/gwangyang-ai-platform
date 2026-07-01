import Header from "@/components/Header";
import Footer from "@/components/Footer";

import HeroSection from "@/components/sections/HeroSection";
import FeatureSection from "@/components/sections/FeatureSection";
import AssetSection from "@/components/sections/AssetSection";
import LearningSection from "@/components/sections/LearningSection";
import ProcessSection from "@/components/sections/ProcessSection";
import EffectSection from "@/components/sections/EffectSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <HeroSection />
        <FeatureSection />
        <AssetSection />
        <LearningSection />
        <ProcessSection />
        <EffectSection />
      </section>

      <Footer />
    </main>
  );
}