export default function HeroSection() {
  return (
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
  );
}