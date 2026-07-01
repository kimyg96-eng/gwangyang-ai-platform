type AssetCardProps = {
  title: string;
  description: string;
};

export default function AssetCard({ title, description }: AssetCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
      <p className="text-sm font-semibold text-emerald-600">Cultural Asset</p>
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}