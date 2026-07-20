"use client";

import { useMemo, useState } from "react";
import type { CulturalAsset } from "@/types/culturalAsset";
import { deleteCulturalAsset } from "@/services/assetService";
import Image from "next/image";

type AssetTableProps = {
  assets: CulturalAsset[];
  loading: boolean;
  onEdit: (asset: CulturalAsset) => void;
};

type SortKey = "name" | "category" | "location";

export default function AssetTable({ assets, loading, onEdit }: AssetTableProps) {
  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const filteredAssets = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    const result = !q
      ? assets
      : assets.filter((asset) =>
          asset.name.toLowerCase().includes(q) ||
          asset.category.toLowerCase().includes(q) ||
          (asset.location ?? "").toLowerCase().includes(q) ||
          asset.description.toLowerCase().includes(q)
        );

    return [...result].sort((a, b) => {
      const aValue = String(a[sortKey] ?? "");
      const bValue = String(b[sortKey] ?? "");
      return aValue.localeCompare(bValue, "ko");
    });
  }, [assets, keyword, sortKey]);

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteCulturalAsset(id);
    alert("삭제되었습니다.");
    window.location.reload();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">등록된 문화자산 목록</h2>
          <p className="mt-2 text-sm text-slate-500">
            총 {assets.length}개 중 {filteredAssets.length}개 표시
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="name">이름순</option>
            <option value="category">분류순</option>
            <option value="location">위치순</option>
          </select>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 md:w-80"
            placeholder="문화자산명, 분류, 위치 검색"
          />
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">
          문화자산 데이터를 불러오는 중입니다...
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-bold">이미지</th>
                <th className="p-4 font-bold">이름</th>
                <th className="p-4 font-bold">분류</th>
                <th className="p-4 font-bold">위치</th>
                <th className="p-4 font-bold">위도</th>
                <th className="p-4 font-bold">경도</th>
                <th className="p-4 text-center font-bold">관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-t border-slate-200">
                  <td className="p-4">
                    {asset.image_url ? (
                      <div className="relative h-16 w-24">
                        <Image
                          src={asset.image_url}
                          alt={asset.name}
                          fill
                          sizes="96px"
                          className="rounded-xl object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                        이미지 없음
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{asset.name}</td>
                  <td className="p-4">{asset.category}</td>
                  <td className="p-4">{asset.location}</td>
                  <td className="p-4">{asset.latitude}</td>
                  <td className="p-4">{asset.longitude}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onEdit(asset)}
                      className="mr-2 rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}