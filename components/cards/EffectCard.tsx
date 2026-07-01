type EffectCardProps = {
  title: string;
};

export default function EffectCard({ title }: EffectCardProps) {
  return (
    <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-sm transition hover:bg-emerald-700">
      <p className="text-lg font-bold">{title}</p>
    </div>
  );
}