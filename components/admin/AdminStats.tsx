type AdminStatsProps = {
  assetCount: number;
  chatCount: number;
};

export default function AdminStats({ assetCount, chatCount }: AdminStatsProps) {
  const stats = [
    ["등록 문화자산", `${assetCount}건`],
    ["AI 학습기록", `${chatCount}건`],
    ["스토리 결과", "0건"],
    ["이미지 결과", "0건"],
  ];

  return (
    <section className="mt-8 grid gap-6 md:grid-cols-4">
      {stats.map(([title, value]) => (
        <div key={title} className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{value}</p>
        </div>
      ))}
    </section>
  );
}