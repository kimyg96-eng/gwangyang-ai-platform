const steps = ["지역문화 탐색", "AI 상호작용", "창작 활동", "발표 및 공유"];

export default function ProcessSection() {
  return (
    <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">학습 프로세스</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="rounded-xl bg-slate-100 p-5">
            <p className="text-sm font-semibold text-emerald-600">
              STEP {index + 1}
            </p>
            <p className="mt-2 font-bold">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}