import PageLayout from "@/components/PageLayout";

export default function StoryPage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">
          AI Story Generation
        </p>
        <h1 className="mt-3 text-4xl font-bold">AI 스토리 생성</h1>
        <p className="mt-6 max-w-3xl leading-8 text-slate-600">
          광양 지역문화자산과 정채봉 문학을 소재로 새로운 이야기와
          동화를 창작하는 학습 공간입니다.
        </p>
      </section>
    </PageLayout>
  );
}