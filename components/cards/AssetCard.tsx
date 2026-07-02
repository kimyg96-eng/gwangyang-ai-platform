type AssetCardProps = {
  title: string;
  description: string;
  imageUrl?: string | null;
};

export default function AssetCard({
  title,
  description,
  imageUrl,
}: AssetCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-400">
          이미지 없음
        </div>
      )}

      <div className="p-6">
        <p className="text-sm font-semibold text-emerald-600">
          Cultural Asset
        </p>
        <h3 className="mt-2 text-xl font-bold">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}