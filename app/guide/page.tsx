import PageLayout from "@/components/PageLayout";

const assets = ["매화마을", "섬진강", "백운산", "광양읍성", "정채봉 문학"];

export default function GuidePage() {
  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">지역문화자산</h2>
          <div className="mt-6 space-y-3">
            {assets.map((asset) => (
              <button
                key={asset}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-medium hover:bg-emerald-50"
              >
                {asset}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-emerald-600">
            AI Cultural Guide
          </p>
          <h1 className="mt-3 text-4xl font-bold">AI 문화해설사</h1>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            광양 지역문화자산에 대해 자유롭게 질문하면 AI 문화해설사가
            역사·문화·생태적 의미를 설명합니다.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 문화해설사</p>
              <p className="mt-3 leading-7 text-slate-700">
                안녕하세요. 저는 광양 지역문화자산을 안내하는 AI 문화해설사입니다.
                매화마을, 섬진강, 백운산, 정채봉 문학에 대해 무엇이든 물어보세요.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="max-w-xl rounded-2xl bg-emerald-600 p-5 text-white">
                섬진강은 왜 광양의 대표적인 문화자산인가요?
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 문화해설사</p>
              <p className="mt-3 leading-7 text-slate-700">
                섬진강은 광양의 자연환경과 생활문화가 함께 형성된 중요한
                지역문화자산입니다. 강 주변의 생태환경, 주민들의 삶, 문학과
                예술적 상상력이 결합되어 지역 정체성을 이해하는 핵심 자원으로
                활용될 수 있습니다.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <input
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="궁금한 내용을 입력하세요."
              />
              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
                전송
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              "매화마을은 왜 유명한가요?",
              "백운산의 생태적 가치는 무엇인가요?",
              "정채봉 문학과 광양은 어떤 관련이 있나요?",
            ].map((q) => (
              <button
                key={q}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm hover:bg-slate-50"
              >
                {q}
              </button>
            ))}
          </div>
        </section>
      </section>
    </PageLayout>
  );
}