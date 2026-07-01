import EffectCard from "@/components/cards/EffectCard";

const effects = [
  "지역문화 인식 향상",
  "학습몰입 향상",
  "창의적 표현력 향상",
  "지역정체성 강화",
];

export default function EffectSection() {
  return (
    <section className="mt-10 grid gap-6 md:grid-cols-4">
      {effects.map((effect) => (
        <EffectCard key={effect} title={effect} />
      ))}
    </section>
  );
}