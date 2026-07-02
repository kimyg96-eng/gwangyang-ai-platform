"use client";

import AssetCard from "@/components/cards/AssetCard";
import { useAssets } from "@/hooks/useAssets";

export default function AssetSection() {
  const { assets, loading } = useAssets();

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">광양 지역문화자산</h2>

      {loading ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
          문화자산 데이터를 불러오는 중입니다...
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              title={asset.name}
              description={asset.description}
              imageUrl={asset.image_url}
            />
          ))}
        </div>
      )}
    </section>
  );
}