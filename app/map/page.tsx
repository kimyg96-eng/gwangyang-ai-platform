"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import KakaoMap from "@/components/map/KakaoMap";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import { useDocuments } from "@/hooks/useDocuments";
import type { CulturalAsset } from "@/types/culturalAsset";

export default function MapPage() {
  const { assets, loading } = useAssets();
  const { documents } = useDocuments();

  const [selectedAsset, setSelectedAsset] =
    useState<CulturalAsset | null>(null);

  const currentAsset = selectedAsset ?? assets[0] ?? null;

  const relatedDocuments = currentAsset
    ? documents.filter(
        (document) => document.asset_name === currentAsset.name
      )
    : [];

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle
          label="Gwangyang Cultural Map"
          title="광양 문화지도"
          description="광양의 지역문화자산을 지도 기반으로 탐색하고, 선택한 문화자산의 위치와 설명을 확인하는 학습 공간입니다."
        />
      </section>

      <section className="mt-8 grid items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">문화자산 목록</h2>

            {!loading && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                총 {assets.length}개
              </span>
            )}
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">
              문화자산 데이터를 불러오는 중입니다...
            </p>
          ) : assets.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              등록된 문화자산이 없습니다.
            </div>
          ) : (
            <div className="mt-6 max-h-[680px] space-y-3 overflow-y-auto pr-2">
              {assets.map((asset) => {
                const isSelected = currentAsset?.id === asset.id;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAsset(asset)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-900">
                        {asset.name}
                      </p>

                      {asset.category && (
                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
                          {asset.category}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-4 break-words text-sm leading-6 text-slate-600">
                      {asset.description}
                    </p>

                    {asset.location && (
                      <p className="mt-3 truncate text-xs text-slate-400">
                        📍 {asset.location}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">지도 영역</h2>

          <div className="mt-6 overflow-hidden rounded-3xl">
            <KakaoMap
              assets={assets}
              selectedAsset={currentAsset}
              onSelectAsset={setSelectedAsset}
            />
          </div>

          {currentAsset ? (
            <article className="mt-6 overflow-hidden rounded-2xl bg-slate-50">
              {currentAsset.image_url ? (
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 sm:h-72 lg:h-80">
                  <Image
                    src={currentAsset.image_url}
                    alt={`${currentAsset.name} 문화자산 이미지`}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 900px"
                    className="object-cover object-center"
                  />
                </div>
              ) : (
                <div className="flex h-52 items-center justify-center bg-slate-100 text-sm text-slate-400 sm:h-72 lg:h-80">
                  등록된 이미지가 없습니다.
                </div>
              )}

              <div className="p-5 sm:p-6">
                <p className="text-sm font-semibold text-emerald-600">
                  선택된 문화자산
                </p>

                <h3 className="mt-2 break-words text-2xl font-bold text-slate-900">
                  {currentAsset.name}
                </h3>

                <p className="mt-4 whitespace-pre-line break-words leading-8 text-slate-600">
                  {currentAsset.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    currentAsset.category,
                    currentAsset.location,
                    currentAsset.name.includes("매화")
                      ? "봄꽃 문화"
                      : null,
                    currentAsset.name.includes("섬진강")
                      ? "생태·강 문화"
                      : null,
                    currentAsset.name.includes("백운산")
                      ? "산림·자연 학습"
                      : null,
                    currentAsset.name.includes("정채봉")
                      ? "문학·인성 교육"
                      : null,
                  ]
                    .filter(
                      (tag): tag is string =>
                        typeof tag === "string" && tag.length > 0
                    )
                    .map((tag) => (
                      <span
                        key={tag}
                        className="max-w-full break-words rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                <div className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <p className="break-words">
                    <span className="font-semibold text-slate-800">
                      분류:
                    </span>{" "}
                    {currentAsset.category || "-"}
                  </p>

                  <p className="break-words">
                    <span className="font-semibold text-slate-800">
                      위치:
                    </span>{" "}
                    {currentAsset.location || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      위도:
                    </span>{" "}
                    {currentAsset.latitude ?? "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      경도:
                    </span>{" "}
                    {currentAsset.longitude ?? "-"}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/guide?asset=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    AI 문화해설사로 질문하기
                  </Link>

                  <Link
                    href={`/story?theme=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    스토리 만들기
                  </Link>

                  <Link
                    href={`/quiz?theme=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                  >
                    퀴즈 만들기
                  </Link>

                  <Link
                    href={`/image?theme=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
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
                      {relatedDocuments.map((document) =>
                        document.file_url ? (
                          <a
                            key={document.id}
                            href={document.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-words rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-100"
                          >
                            {document.title}
                          </a>
                        ) : (
                          <div
                            key={document.id}
                            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-400 shadow-sm"
                          >
                            {document.title} · 파일 URL 없음
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ) : (
            !loading && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                지도에서 확인할 문화자산이 없습니다.
              </div>
            )
          )}
        </section>
      </section>
    </PageLayout>
  );
}