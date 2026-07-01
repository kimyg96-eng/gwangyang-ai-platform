type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg">
      <h3 className="text-lg font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}