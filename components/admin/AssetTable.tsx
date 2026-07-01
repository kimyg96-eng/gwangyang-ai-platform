import type { CulturalAsset } from "@/types/culturalAsset";

type AssetTableProps = {
  assets: CulturalAsset[];
  loading: boolean;
};

export default function AssetTable({ assets, loading }: AssetTableProps) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">등록된 문화자산 목록</h2>

      {loading ? (
        <p className="mt-6 text-slate-500">
          문화자산 데이터를 불러오는 중입니다...
        </p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}