import PageLayout from "@/components/PageLayout";

export default function AvatarPage() {
  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">
          AI Jeong Chae-bong Avatar
        </p>
        <h1 className="mt-3 text-4xl font-bold">AI 정채봉 아바타</h1>
        <p className="mt-6 max-w-3xl leading-8 text-slate-600">
          정채봉 작가의 생애, 작품세계, 문학적 가치를 AI 아바타와의
          대화를 통해 학습하는 공간입니다.
        </p>
      </section>
    </PageLayout>
  );
}