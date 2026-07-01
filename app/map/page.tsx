import PageLayout from "@/components/PageLayout";

export default function MapPage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">
          Gwangyang Cultural Map
        </p>
        <h1 className="mt-3 text-4xl font-bold">광양 문화지도</h1>
        <p className="mt-6 max-w-3xl leading-8 text-slate-600">
          매화마을, 섬진강, 백운산, 정채봉 문학 등 광양 지역문화자산을
          지도 기반으로 탐색하는 공간입니다.
        </p>
      </section>
    </PageLayout>
  );
}