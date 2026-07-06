"use client";

import { useMemo, useState } from "react";
import type { QuizResult } from "@/types/quizResult";
import { deleteQuizResult } from "@/services/quizService";

type Props = {
  quizzes: QuizResult[];
  loading: boolean;
};

export default function QuizResultTable({
  quizzes,
  loading,
}: Props) {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const q = keyword.toLowerCase().trim();

    if (!q) return quizzes;

    return quizzes.filter((quiz) => {
      return (
        (quiz.theme ?? "").toLowerCase().includes(q) ||
        (quiz.quiz_type ?? "").toLowerCase().includes(q) ||
        (quiz.target_level ?? "").toLowerCase().includes(q) ||
        (quiz.question ?? "").toLowerCase().includes(q) ||
        (quiz.answer ?? "").toLowerCase().includes(q)
      );
    });
  }, [quizzes, keyword]);

  const handleDelete = async (id: string) => {
    if (!confirm("이 퀴즈를 삭제하시겠습니까?")) return;

    await deleteQuizResult(id);

    alert("삭제되었습니다.");
    window.location.reload();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold">
            AI 퀴즈 관리
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            총 {quizzes.length}건
          </p>
        </div>

        <input
          className="w-96 rounded-xl border border-slate-300 px-4 py-3"
          placeholder="문제 검색"
          value={keyword}
          onChange={(e)=>setKeyword(e.target.value)}
        />

      </div>

      {loading ? (

        <p className="mt-8">
          불러오는 중...
        </p>

      ) : (

        <div className="mt-6 overflow-x-auto">

          <table className="w-full min-w-[1400px] text-sm">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4">생성일</th>

                <th className="p-4">주제</th>

                <th className="p-4">유형</th>

                <th className="p-4">대상</th>

                <th className="p-4">문제</th>

                <th className="p-4">정답</th>

                <th className="p-4">참고문서</th>

                <th className="p-4">모델</th>

                <th className="p-4">관리</th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((quiz)=>(
                <tr
                  key={quiz.id}
                  className="border-t"
                >

                  <td className="p-4">
                    {new Date(quiz.created_at).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {quiz.theme}
                  </td>

                  <td className="p-4">
                    {quiz.quiz_type}
                  </td>

                  <td className="p-4">
                    {quiz.target_level}
                  </td>

                  <td className="p-4">
                    <div className="max-w-sm">
                      {quiz.question}
                    </div>
                  </td>

                  <td className="p-4 font-bold text-emerald-600">
                    {quiz.answer}
                  </td>

                  <td className="p-4">
                    {quiz.reference_source}
                  </td>

                  <td className="p-4">
                    {quiz.model_name}
                  </td>

                  <td className="p-4">

                    <button
                      onClick={()=>handleDelete(quiz.id)}
                      className="rounded-lg bg-red-500 px-3 py-2 text-white"
                    >
                      삭제
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
}