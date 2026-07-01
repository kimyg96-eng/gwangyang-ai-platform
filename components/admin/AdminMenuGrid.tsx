const adminMenus = [
  ["문화자산 관리", "광양 지역문화자산 등록·수정·삭제"],
  ["학습기록 관리", "학생 질문, AI 답변, 학습 이력 확인"],
  ["스토리 결과 관리", "AI 스토리 생성 결과 확인"],
  ["이미지 결과 관리", "AI 이미지 생성 결과 확인"],
  ["퀴즈 결과 관리", "학습 평가 및 정답률 확인"],
  ["RAG 문서 관리", "문화자료, 문헌, PDF 콘텐츠 관리"],
];

export default function AdminMenuGrid() {
  return (
    <section className="mt-8 grid gap-6 md:grid-cols-3">
      {adminMenus.map(([title, desc]) => (
        <div key={title} className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-3 leading-7 text-slate-600">{desc}</p>
        </div>
      ))}
    </section>
  );
}