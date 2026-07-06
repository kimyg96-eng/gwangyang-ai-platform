"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import SectionTitle from "@/components/ui/SectionTitle";
import { saveQuizResult } from "@/services/quizService";

const themes = ["매화마을", "섬진강", "백운산", "정채봉 문학"];
const levels = ["초등학생", "중학생", "고등학생"];
const quizTypes = ["객관식", "OX", "단답형"];

type QuizItem = {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export default function QuizPage() {
  const [theme, setTheme] = useState(themes[0]);
  const [targetLevel, setTargetLevel] = useState(levels[0]);
  const [quizType, setQuizType] = useState(quizTypes[0]);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [referenceSource, setReferenceSource] = useState("");

  const generateQuiz = async () => {
    setLoading(true);
    setShowResult(false);
    setSelectedAnswers({});

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          targetLevel,
          quizType,
          storyText: "",
        }),
      });

      const data = await res.json();
      const items: QuizItem[] = data.quizzes ?? [];

      setQuizzes(items);
      setReferenceSource(data.reference_source ?? "");

      for (const item of items) {
        await saveQuizResult({
          theme,
          quiz_type: quizType,
          target_level: targetLevel,
          question: item.question,
          options: item.options ?? null,
          answer: item.answer,
          explanation: item.explanation,
          model_name: data.model_name ?? "gpt-5-mini",
          reference_source: data.reference_source ?? "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const score = quizzes.filter(
    (quiz, index) => selectedAnswers[index] === quiz.answer
  ).length;

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="AI Quiz Generation"
          title="AI 퀴즈 생성"
          description="광양 지역문화자산과 RAG 문서를 기반으로 학습용 퀴즈를 자동 생성하고 즉시 채점합니다."
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">퀴즈 설정</h2>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            주제 선택
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {themes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            학습 대상
          </label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {levels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            문제 유형
          </label>
          <select
            value={quizType}
            onChange={(e) => setQuizType(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {quizTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <div className="mt-6">
            <AppButton onClick={generateQuiz} disabled={loading}>
              {loading ? "퀴즈 생성 중..." : "AI 퀴즈 생성"}
            </AppButton>
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">생성된 퀴즈</h2>

          {referenceSource && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">
                📚 참고 문서
              </p>
              <p className="mt-2 text-sm text-slate-700">{referenceSource}</p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            {quizzes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                왼쪽에서 주제와 문제 유형을 선택한 뒤 AI 퀴즈 생성을 눌러주세요.
              </div>
            ) : (
              quizzes.map((quiz, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="font-bold">
                    Q{index + 1}. {quiz.question}
                  </p>

                  <div className="mt-4 space-y-2">
                    {(quiz.options && quiz.options.length > 0
                      ? quiz.options
                      : ["O", "X"]
                    ).map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [index]: option,
                          }))
                        }
                        className={`block w-full rounded-xl border px-4 py-3 text-left ${
                          selectedAnswers[index] === option
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:bg-emerald-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className="mt-4 rounded-xl bg-white p-4">
                      <p className="font-semibold">
                        정답:{" "}
                        <span className="text-emerald-600">{quiz.answer}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        해설: {quiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {quizzes.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AppButton onClick={() => setShowResult(true)}>
                채점하기
              </AppButton>

              {showResult && (
                <p className="font-bold text-emerald-700">
                  점수: {score} / {quizzes.length}
                </p>
              )}
            </div>
          )}
        </section>
      </section>
    </PageLayout>
  );
}