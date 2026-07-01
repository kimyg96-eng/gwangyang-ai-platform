import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppTextarea from "@/components/ui/AppTextarea";
import SectionTitle from "@/components/ui/SectionTitle";

const themes = ["매화마을", "섬진강", "백운산", "정채봉 문학"];
const types = ["동화", "모험 이야기", "환경 이야기", "우정 이야기"];

export default function StoryPage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="AI Story Generation"
          title="AI 스토리 생성"
          description="광양 지역문화자산과 정채봉 문학 콘텐츠를 소재로 학습자가 직접 이야기의 주제와 아이디어를 입력하고, AI와 함께 창작 이야기를 만드는 공간입니다."
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">스토리 설정</h2>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            주제 선택
          </label>
          <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
            {themes.map((theme) => (
              <option key={theme}>{theme}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            이야기 유형
          </label>
          <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            등장인물
          </label>
          <div className="mt-2">
            <AppInput placeholder="예: 섬진강을 좋아하는 소년 민우" />
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            이야기 아이디어
          </label>
          <div className="mt-2">
            <AppTextarea placeholder="예: 민우가 섬진강에서 신비한 물고기를 만나 자연을 지키는 방법을 배우는 이야기" />
          </div>

          <div className="mt-6">
            <AppButton>스토리 생성하기</AppButton>
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">생성된 이야기 예시</h2>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-emerald-600">
              제목: 섬진강의 비밀 친구
            </p>
            <h3 className="mt-3 text-2xl font-bold">섬진강의 비밀 친구</h3>
            <p className="mt-5 leading-8 text-slate-700">
              봄날의 섬진강 마을에 사는 민우는 강가에서 반짝이는 은빛
              물고기를 만났습니다. 물고기는 민우에게 말했습니다. “강이
              아프면 마을도 함께 아파진단다.”
            </p>
            <p className="mt-4 leading-8 text-slate-700">
              그날 이후 민우와 친구들은 섬진강을 지키는 어린 수호대가
              되었습니다. 아이들은 강가의 생물을 관찰하며 자연과 사람이 함께
              살아가는 방법을 배워 갔습니다.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AppButton variant="secondary">다시 생성</AppButton>
            <AppButton variant="secondary">내용 수정</AppButton>
            <AppButton>저장하기</AppButton>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}