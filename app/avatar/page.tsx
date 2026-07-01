import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";

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
          <SectionTitle
            label="AI Jeong Chae-bong Avatar"
            title="AI 정채봉 아바타"
            description="정채봉 작가의 생애와 작품세계, 문학적 가치관을 AI 아바타와의 대화를 통해 이해하는 학습 공간입니다."
          />

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
                아이들의 맑은 시선을 통해 인간이 잃지 말아야 할 따뜻한 마음과
                생명에 대한 존중을 이야기합니다.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <AppInput placeholder="정채봉 작가에게 질문해 보세요." />
              <AppButton>전송</AppButton>
            </div>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}