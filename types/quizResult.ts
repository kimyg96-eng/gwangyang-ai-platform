export type QuizResult = {
  id: string;
  session_id: string | null;
  theme: string | null;
  source_story_id: string | null;
  quiz_type: string | null;
  target_level: string | null;
  question: string | null;
  options: string[] | null;
  answer: string | null;
  explanation: string | null;
  model_name: string | null;
  reference_source: string | null;
  created_at: string;
};