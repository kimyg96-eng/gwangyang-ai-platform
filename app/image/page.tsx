import PageLayout from "@/components/PageLayout";

export default function ImagePage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">
          AI Image Generation
        </p>
        <h1 className="mt-3 text-4xl font-bold">AI 이미지 생성</h1>
        <p className="mt-6 max-w-3xl leading-8 text-slate-600">
          학습자가 상상한 광양 지역문화 장면을 생성형 AI 이미지로
          표현하는 창작 학습 공간입니다.
        </p>
      </section>
    </PageLayout>
  );
}