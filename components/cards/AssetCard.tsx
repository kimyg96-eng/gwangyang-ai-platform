import Image from "next/image";
import Link from "next/link";

type AssetCardProps = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
};

export default function AssetCard({
  id,
  title,
  description,
  imageUrl,
}: AssetCardProps) {
  const mapHref = `/map?assetId=${encodeURIComponent(id)}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {imageUrl ? (
        <Link
          href={mapHref}
          aria-label={`${title} 문화지도에서 보기`}
          className="block"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>
        </Link>
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-400">
          이미지 없음
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-semibold text-emerald-600">
          Cultural Asset
        </p>

        <h3 className="mt-2 text-xl font-bold text-slate-900">
          <Link
            href={mapHref}
            className="transition hover:text-emerald-600 focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div className="mt-auto pt-5">
          <Link
            href={mapHref}
            className="inline-flex items-center text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            문화지도 보기
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}