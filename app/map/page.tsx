import PageLayout from "@/components/PageLayout";

const places = [
  ["매화마을", "광양의 봄과 매화축제를 대표하는 문화마을"],
  ["섬진강", "자연·생태·생활문화가 어우러진 광양의 대표 강"],
  ["백운산", "생태적 가치와 산림문화를 지닌 광양의 명산"],
  ["광양읍성", "광양의 역사와 지역 정체성을 보여주는 역사문화자산"],
  ["정채봉 문학", "광양 출신 문학가 정채봉의 생애와 작품세계"],
];

export default function MapPage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">
          Gwangyang Cultural Map
        </p>
        <h1 className="mt-3 text-4xl font-bold">광양 문화지도</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          매화마을, 섬진강, 백운산, 광양읍성, 정채봉 문학 등 광양의
          지역문화자산을 지도 기반으로 탐색하는 학습 공간입니다.
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">문화자산 목록</h2>
          <div className="mt-6 space-y-3">
            {places.map(([title, desc]) => (
              <button
                key={title}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:bg-emerald-50"
              >
                <p className="font-bold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">지도 영역</h2>

          <div className="mt-6 flex h-[480px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-700">
                Kakao Map API 연동 예정
              </p>
              <p className="mt-3 text-slate-500">
                이 영역에 광양 지역문화자산 위치 기반 지도가 표시됩니다.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-6">
            <p className="font-bold">선택된 문화자산 설명</p>
            <p className="mt-3 leading-7 text-slate-600">
              문화자산을 선택하면 해당 장소의 역사, 문화적 의미, 관련 이미지,
              AI 추천 질문 및 학습 활동이 함께 표시됩니다.
            </p>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}