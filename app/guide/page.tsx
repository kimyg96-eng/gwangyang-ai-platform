import PageLayout from "@/components/PageLayout";

export default function GuidePage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">
          AI Cultural Guide
        </p>
        <h1 className="mt-3 text-4xl font-bold">AI 문화해설사</h1>
        <p className="mt-6 max-w-3xl leading-8 text-slate-600">
          광양 지역문화자산에 대해 질문하고, AI 문화해설사로부터 설명과
          관련 자료를 제공받는 대화형 학습 공간입니다.
        </p>
      </section>
    </PageLayout>
  );
}