import PageLayout from "@/components/PageLayout";

const topics = [
  "작가의 생애",
  "주요 작품",
  "오세암",
  "자연과 인간",
  "나눔과 배려",
];

export default function AvatarPage() {
  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">대화 주제</h2>
          <div className="mt-6 space-y-3">
            {topics.map((topic) => (
              <button
                key={topic}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-medium hover:bg-emerald-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-emerald-600">
            AI Jeong Chae-bong Avatar
          </p>
          <h1 className="mt-3 text-4xl font-bold">AI 정채봉 아바타</h1>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            정채봉 작가의 생애와 작품세계, 문학적 가치관을 AI 아바타와의
            대화를 통해 이해하는 학습 공간입니다.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 정채봉 아바타</p>
              <p className="mt-3 leading-7 text-slate-700">
                안녕하세요. 저는 정채봉 작가의 삶과 작품세계를 안내하는
                AI 아바타입니다. 작품에 담긴 사랑, 나눔, 자연의 의미에 대해
                함께 이야기해 봅시다.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="max-w-xl rounded-2xl bg-emerald-600 p-5 text-white">
                작가님은 『오세암』을 통해 어떤 메시지를 전하고 싶었나요?
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 정채봉 아바타</p>
              <p className="mt-3 leading-7 text-slate-700">
                『오세암』은 순수한 마음, 믿음, 사랑의 가치를 담은 작품입니다.
                저는 아이들의 맑은 시선을 통해 인간이 잃지 말아야 할 따뜻한
                마음과 생명에 대한 존중을 이야기하고자 했습니다.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <input
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="정채봉 작가에게 질문해 보세요."
              />
              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
                전송
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              "정채봉 작가의 대표 작품은 무엇인가요?",
              "정채봉 문학에 나타난 자연 사랑은 무엇인가요?",
              "정채봉 문학과 광양은 어떻게 연결되나요?",
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