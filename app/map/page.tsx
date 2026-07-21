"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  useCallback,
  useMemo,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import KakaoMap from "@/components/map/KakaoMap";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import { useDocuments } from "@/hooks/useDocuments";
import type { CulturalAsset } from "@/types/culturalAsset";

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetIdFromHome = searchParams.get("assetId");

  const { assets, loading } = useAssets();
  const { documents } = useDocuments();

  /*
   * 선택 상태를 별도의 state로 중복 관리하지 않고,
   * URL의 assetId와 assets를 기준으로 계산합니다.
   *
   * 이렇게 하면 useEffect 내부의 동기 setState가 제거되어
   * React 19의 react-hooks/set-state-in-effect 오류가 발생하지 않습니다.
   */
  const currentAsset = useMemo<CulturalAsset | null>(() => {
    if (assets.length === 0) {
      return null;
    }

    if (!assetIdFromHome) {
      return assets[0];
    }

    return (
      assets.find(
        (asset) => asset.id === assetIdFromHome
      ) ?? assets[0]
    );
  }, [assetIdFromHome, assets]);

  const relatedDocuments = useMemo(
    () =>
      currentAsset
        ? documents.filter(
            (document) =>
              document.asset_name === currentAsset.name
          )
        : [],
    [currentAsset, documents]
  );

  /*
   * 목록 또는 지도 마커에서 문화자산을 선택하면 URL만 변경합니다.
   * currentAsset은 변경된 searchParams를 기준으로 자동 재계산됩니다.
   */
  const handleSelectAsset = useCallback(
    (asset: CulturalAsset) => {
      router.replace(
        `/map?assetId=${encodeURIComponent(asset.id)}`,
        { scroll: false }
      );
    },
    [router]
  );

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
          <h2 className="text-xl font-bold">
            문화자산 목록
          </h2>

          {loading ? (
            <p className="mt-6 text-slate-500">
              문화자산 데이터를 불러오는 중입니다...
            </p>
          ) : assets.length === 0 ? (
            <p className="mt-6 text-slate-500">
              등록된 문화자산이 없습니다.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {assets.map((asset) => {
                const isSelected =
                  currentAsset?.id === asset.id;

                return (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() =>
                      handleSelectAsset(asset)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <p className="font-bold">
                      {asset.name}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {asset.description}
                    </p>

                    <p className="mt-2 line-clamp-1 text-xs text-slate-400">
                      {asset.location || "위치 정보 없음"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">
            지도 영역
          </h2>

          <div className="mt-6">
            <KakaoMap
              assets={assets}
              selectedAsset={currentAsset}
              onSelectAsset={handleSelectAsset}
            />
          </div>

          {currentAsset && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-slate-50">
              {currentAsset.image_url ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={currentAsset.image_url}
                    alt={currentAsset.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-400">
                  등록된 이미지가 없습니다.
                </div>
              )}

              <div className="p-6">
                <p className="text-sm font-semibold text-emerald-600">
                  선택된 문화자산
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {currentAsset.name}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {currentAsset.description}
                </p>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-800">
                      분류:
                    </span>{" "}
                    {currentAsset.category ||
                      "분류 정보 없음"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      위치:
                    </span>{" "}
                    {currentAsset.location ||
                      "위치 정보 없음"}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/guide?asset=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    AI 문화해설사로 질문하기
                  </Link>

                  <Link
                    href={`/story?theme=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    스토리 만들기
                  </Link>

                  <Link
                    href={`/quiz?theme=${encodeURIComponent(
                      currentAsset.name
                    )}`}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
                  >
                    퀴즈 만들기
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
                            rel="noreferrer"
                            className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-emerald-100"
                          >
                            {document.title}
                          </a>
                        ) : (
                          <div
                            key={document.id}
                            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-400 shadow-sm"
                          >
                            {document.title}
                          </div>
                        )
                      )}
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

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="rounded-3xl bg-white p-8 text-slate-500 shadow-sm">
            문화지도를 불러오는 중입니다...
          </div>
        </PageLayout>
      }
    >
      <MapContent />
    </Suspense>
  );
}