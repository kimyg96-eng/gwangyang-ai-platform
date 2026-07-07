"use client";

import Link from "next/link";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import type { CulturalAsset } from "@/types/culturalAsset";
import KakaoMap from "@/components/map/KakaoMap";
import { useDocuments } from "@/hooks/useDocuments";

export default function MapPage() {
  const { assets, loading } = useAssets();
  const { documents } = useDocuments();
  const [selectedAsset, setSelectedAsset] = useState<CulturalAsset | null>(null);

  const currentAsset = selectedAsset ?? assets[0];
  const relatedDocuments = currentAsset
  ? documents.filter((doc) => doc.asset_name === currentAsset.name)
  : [];
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

          <div className="mt-6">
           <KakaoMap
            assets={assets}
            selectedAsset={currentAsset}
            onSelectAsset={setSelectedAsset}
          />
          </div>

          {currentAsset && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-slate-50">
              {currentAsset.image_url ? (
                <img
                  src={currentAsset.image_url}
                  alt={currentAsset.name}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-400">
                  등록된 이미지가 없습니다.
                </div>
              )}

              <div className="p-6">
                <p className="text-sm font-semibold text-emerald-600">
                  선택된 문화자산
                </p>
                <h3 className="mt-2 text-2xl font-bold">{currentAsset.name}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {currentAsset.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                {[
                  currentAsset.category,
                  currentAsset.location,
                  currentAsset.name.includes("매화") ? "봄꽃 문화" : null,
                  currentAsset.name.includes("섬진강") ? "생태·강 문화" : null,
                  currentAsset.name.includes("백운산") ? "산림·자연 학습" : null,
                  currentAsset.name.includes("정채봉") ? "문학·인성 교육" : null,
                ]
                .filter(Boolean)
                .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm"
                >
                #{tag}
                </span>
                ))}
              </div>
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
                <div className="mt-6 flex flex-wrap gap-3">
  <Link
    href={`/guide?asset=${encodeURIComponent(currentAsset.name)}`}
    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
  >
    AI 문화해설사로 질문하기
  </Link>

  <Link
    href={`/story?theme=${encodeURIComponent(currentAsset.name)}`}
    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
  >
    스토리 만들기
  </Link>

  <Link
    href={`/quiz?theme=${encodeURIComponent(currentAsset.name)}`}
    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
  >
    퀴즈 만들기
  </Link>

  <Link
    href={`/image?theme=${encodeURIComponent(currentAsset.name)}`}
    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
  >
    이미지 만들기
  </Link>
</div>
{relatedDocuments.length > 0 && (
  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
    <p className="text-sm font-semibold text-emerald-700">
      📚 관련 PDF 문서
    </p>

    <div className="mt-3 space-y-2">
      {relatedDocuments.map((doc) => (
        <a
          key={doc.id}
          href={doc.file_url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-emerald-100"
        >
          {doc.title}
        </a>
      ))}
    </div>
  </div>
)}
              </div>
            </div>
          )}
        </section>
      </section>
    </PageLayout>
  );
}