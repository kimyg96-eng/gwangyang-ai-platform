export default function LearningSection() {
  return (
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
  );
}