type AdminStatsProps = {
  assetCount: number;
  chatCount: number;
  documentCount: number;
  helpfulCount: number;
  badCount: number;
};

export default function AdminStats({
  assetCount,
  chatCount,
  documentCount,
  helpfulCount,
  badCount,
}: AdminStatsProps) {
  const feedbackTotal = helpfulCount + badCount;
  const satisfactionRate =
    feedbackTotal > 0 ? Math.round((helpfulCount / feedbackTotal) * 100) : 0;

  const stats = [
    ["등록 문화자산", `${assetCount}건`],
    ["AI 학습기록", `${chatCount}건`],
    ["PDF 문서", `${documentCount}건`],
    ["AI 만족도", feedbackTotal > 0 ? `${satisfactionRate}%` : "대기"],
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