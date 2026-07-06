import { supabase } from "@/services/supabase";

export async function saveQuizResult(quiz: {
  theme: string;
  source_story_id?: string | null;
  quiz_type: string;
  target_level: string;
  question: string;
  options?: string[] | null;
  answer: string;
  explanation: string;
  model_name?: string | null;
  reference_source?: string | null;
}) {
  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      session_id: null,
      theme: quiz.theme,
      source_story_id: quiz.source_story_id ?? null,
      quiz_type: quiz.quiz_type,
      target_level: quiz.target_level,
      question: quiz.question,
      options: quiz.options ?? null,
      answer: quiz.answer,
      explanation: quiz.explanation,
      model_name: quiz.model_name ?? "gpt-5-mini",
      reference_source: quiz.reference_source ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save quiz result:", error);
    throw error;
  }

  return data;
}

export async function getQuizResults() {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch quiz results:", error);
    return [];
  }

  return data ?? [];
}

export async function deleteQuizResult(id: string) {
  const { error } = await supabase
    .from("quiz_results")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete quiz result:", error);
    throw error;
  }
}