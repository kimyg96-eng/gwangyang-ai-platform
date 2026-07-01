"use client";

import type { CulturalAsset } from "@/types/culturalAsset";
import { deleteCulturalAsset } from "@/services/assetService";

type AssetTableProps = {
  assets: CulturalAsset[];
  loading: boolean;
  onEdit: (asset: CulturalAsset) => void;
};

export default function AssetTable({ assets, loading, onEdit }: AssetTableProps) {
  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteCulturalAsset(id);
    alert("삭제되었습니다.");
    window.location.reload();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">등록된 문화자산 목록</h2>

      {loading ? (
        <p className="mt-6 text-slate-500">문화자산 데이터를 불러오는 중입니다...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-bold">이름</th>
                <th className="p-4 font-bold">분류</th>
                <th className="p-4 font-bold">위치</th>
                <th className="p-4 font-bold">위도</th>
                <th className="p-4 font-bold">경도</th>
                <th className="p-4 text-center font-bold">관리</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t border-slate-200">
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
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}