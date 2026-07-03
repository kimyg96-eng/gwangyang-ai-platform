export type ChatHistory = {
  id: string;
  session_id: string | null;
  agent_type: string;
  asset_name: string | null;
  question: string;
  answer: string | null;
  response_time: number | null;
  model_name: string | null;
  user_role: string | null;
  reference_source: string | null;
  tokens_used: number | null;
  feedback: string | null;
  created_at: string;
};