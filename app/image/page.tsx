import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppTextarea from "@/components/ui/AppTextarea";
import SectionTitle from "@/components/ui/SectionTitle";

const styles = ["수채화", "일러스트", "동화책", "애니메이션", "사실적 표현"];
const examples = [
  "봄날의 매화마을",
  "섬진강을 걷는 소년",
  "백운산 숲속 친구들",
  "정채봉 동화 속 마을",
];

export default function ImagePage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="AI Image Generation"
          title="AI 이미지 생성"
          description="학습자가 상상한 광양 지역문화 장면을 텍스트로 입력하면, 생성형 AI를 통해 이미지로 시각화하는 창작 학습 공간입니다."
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">이미지 생성 설정</h2>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            프롬프트 입력
          </label>
          <div className="mt-2">
            <AppTextarea placeholder="예: 봄날의 매화마을과 섬진강을 배경으로 아이들이 산책하는 모습" />
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            표현 스타일
          </label>
          <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
            {styles.map((style) => (
              <option key={style}>{style}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            화면 비율
          </label>
          <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
            <option>16:9</option>
            <option>1:1</option>
            <option>4:3</option>
          </select>

          <div className="mt-6">
            <AppButton>이미지 생성하기</AppButton>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="font-bold">프롬프트 예시</p>
            <div className="mt-3 space-y-2">
              {examples.map((example) => (
                <p key={example} className="text-sm text-slate-600">
                  · {example}
                </p>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">생성 이미지 예시</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[
              ["매화마을", "봄날의 매화마을 풍경"],
              ["섬진강", "섬진강을 따라 걷는 학습자"],
              ["백운산", "백운산 생태문화 체험 장면"],
              ["정채봉 문학", "동화 속 따뜻한 마을 장면"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
              >
                <div className="text-center">
                  <p className="font-bold text-slate-700">{title}</p>
                  <p className="mt-2 text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AppButton variant="secondary">다시 생성</AppButton>
            <AppButton variant="secondary">다운로드</AppButton>
            <AppButton>학습 결과로 저장</AppButton>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}