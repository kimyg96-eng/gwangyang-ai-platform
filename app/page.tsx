import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <section className="mt-16 rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-emerald-600">
            Generative AI Cultural Learning Platform
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight">
            생성형 AI 기반 광양 지역문화자산 학습 플랫폼
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            매화마을, 섬진강, 백운산, 정채봉 문학 콘텐츠를 AI 문화해설사와
            함께 탐색하고, 스토리와 이미지를 창작하는 체험형 학습 환경입니다.
          </p>
          <div className="mt-8 flex gap-4">
            <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
              AI 문화해설사 시작
            </button>
            <button className="rounded-xl border border-slate-300 px-6 py-3 font-semibold">
              학습 시나리오 보기
            </button>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            ["AI 문화해설사", "광양 지역문화자산에 대해 질문하고 답변을 받습니다."],
            ["AI 정채봉 아바타", "정채봉 작가의 생애와 작품세계를 대화형으로 학습합니다."],
            ["AI 스토리 생성", "매화마을, 섬진강, 백운산을 소재로 이야기를 만듭니다."],
            ["AI 이미지 생성", "상상한 지역문화 장면을 이미지로 표현합니다."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">학습 프로세스</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {["지역문화 탐색", "AI 상호작용", "창작 활동", "발표 및 공유"].map(
              (step, index) => (
                <div key={step} className="rounded-xl bg-slate-100 p-5">
                  <p className="text-sm font-semibold text-emerald-600">
                    STEP {index + 1}
                  </p>
                  <p className="mt-2 font-bold">{step}</p>
                </div>
              )
            )}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}