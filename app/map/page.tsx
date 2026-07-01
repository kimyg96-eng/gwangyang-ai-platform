"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import type { CulturalAsset } from "@/types/culturalAsset";

export default function MapPage() {
  const { assets, loading } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<CulturalAsset | null>(null);

  const currentAsset = selectedAsset ?? assets[0];

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="Gwangyang Cultural Map"
          title="광양 문화지도"
          description="광양의 지역문화자산을 지도 기반으로 탐색하고, 선택한 문화자산의 위치와 설명을 확인하는 학습 공간입니다."
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">문화자산 목록</h2>

          {loading ? (
            <p className="mt-6 text-slate-500">
              문화자산 데이터를 불러오는 중입니다...
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    currentAsset?.id === asset.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:bg-emerald-50"
                  }`}
                >
                  <p className="font-bold">{asset.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {asset.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {asset.location}
                  </p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">지도 영역</h2>

          <div className="mt-6 flex h-[480px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-700">
                Kakao Map API 연동 예정
              </p>
              <p className="mt-3 text-slate-500">
                선택한 문화자산의 위도·경도 기반 위치가 표시됩니다.
              </p>
            </div>
          </div>

          {currentAsset && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-emerald-600">
                선택된 문화자산
              </p>
              <h3 className="mt-2 text-2xl font-bold">{currentAsset.name}</h3>
              <p className="mt-3 leading-7 text-slate-600">
                {currentAsset.description}
              </p>

              <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <p>
                  <span className="font-semibold text-slate-800">분류:</span>{" "}
                  {currentAsset.category}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">위치:</span>{" "}
                  {currentAsset.location}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">위도:</span>{" "}
                  {currentAsset.latitude}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">경도:</span>{" "}
                  {currentAsset.longitude}
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </PageLayout>
  );
}