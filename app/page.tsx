import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  ["AI 문화해설사", "광양 지역문화자산에 대해 질문하고 답변을 받습니다."],
  ["AI 정채봉 아바타", "정채봉 작가의 생애와 작품세계를 대화형으로 학습합니다."],
  ["AI 스토리 생성", "매화마을, 섬진강, 백운산을 소재로 이야기를 만듭니다."],
  ["AI 이미지 생성", "상상한 지역문화 장면을 이미지로 표현합니다."],
];

const assets = [
  ["매화마을", "광양의 봄과 매화문화를 대표하는 지역문화자산"],
  ["섬진강", "자연·생태·생활문화가 함께 흐르는 광양의 대표 강"],
  ["백운산", "생태적 가치와 자연문화가 살아있는 광양의 명산"],
  ["정채봉 문학", "나눔, 배려, 자연사랑의 가치를 담은 문학 콘텐츠"],
];

const effects = [
  "지역문화 인식 향상",
  "학습몰입 향상",
  "창의적 표현력 향상",
  "지역정체성 강화",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-10 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-emerald-600">
            Generative AI Cultural Learning Platform
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            생성형 AI 기반 광양 지역문화자산 학습 플랫폼
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            매화마을, 섬진강, 백운산, 정채봉 문학 콘텐츠를 AI 문화해설사와
            함께 탐색하고, 스토리와 이미지를 창작하는 체험형 학습 환경입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/guide"
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
            >
              AI 문화해설사 시작
            </a>
            <a
              href="/story"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold"
            >
              스토리 생성하기
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-4">
          {features.map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">광양 지역문화자산</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {assets.map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-emerald-600">
                  Cultural Asset
                </p>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">오늘의 추천 학습</h2>
          <p className="mt-3 text-slate-600">
            AI 문화해설사에게 “섬진강은 왜 광양의 대표 문화자산인가요?”라고
            질문해 보세요.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-100 p-6">
            <p className="font-bold">추천 질문</p>
            <p className="mt-2 text-slate-600">
              “정채봉 문학에 나타난 자연 사랑은 광양 지역문화와 어떻게
              연결될까요?”
            </p>
          </div>
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

        <section className="mt-10 grid gap-6 md:grid-cols-4">
          {effects.map((effect) => (
            <div key={effect} className="rounded-2xl bg-emerald-600 p-6 text-white">
              <p className="text-lg font-bold">{effect}</p>
            </div>
          ))}
        </section>
      </section>

      <Footer />
    </main>
  );
}