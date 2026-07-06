"use client";

import { useEffect, useState } from "react";
import { getQuizResults } from "@/services/quizService";
import type { QuizResult } from "@/types/quizResult";

export function useQuizResults() {
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      const result = await getQuizResults();
      setQuizzes(result as QuizResult[]);
      setLoading(false);
    }

    loadQuizzes();
  }, []);

  return { quizzes, loading };
}