import { supabase } from "@/services/supabase";

export async function saveChatHistory(chat: {
  session_id?: string | null;
  agent_type: string;
  asset_name?: string | null;
  question: string;
  answer?: string | null;
  response_time?: number | null;
  model_name?: string | null;
  user_role?: string | null;
  reference_source?: string | null;
  tokens_used?: number | null;
}) {
  const { data, error } = await supabase
    .from("chat_history")
    .insert({
      session_id: chat.session_id ?? null,
      agent_type: chat.agent_type,
      asset_name: chat.asset_name ?? null,
      question: chat.question,
      answer: chat.answer ?? null,
      response_time: chat.response_time ?? null,
      model_name: chat.model_name ?? null,
      user_role: chat.user_role ?? "student",
      reference_source: chat.reference_source ?? null,
      tokens_used: chat.tokens_used ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save chat history:", error);
    throw error;
  }

  return data;
}

export async function getChatHistory() {
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }

  return data ?? [];
}