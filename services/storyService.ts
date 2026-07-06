import { supabase } from "@/services/supabase";

export async function saveStoryResult(story: {
  theme: string;
  story_type: string;
  target_level: string;
  story_length: string;
  character: string;
  idea: string;
  story: string;
  reference_source?: string | null;
  model_name?: string | null;
}) {
  const { data, error } = await supabase
    .from("story_results")
    .insert({
      session_id: null,
      theme: story.theme,
      story_type: story.story_type,
      target_level: story.target_level,
      story_length: story.story_length,
      character: story.character,
      character_name: story.character,
      idea: story.idea,
      prompt: story.idea,
      title: story.theme + " 이야기",
      story: story.story,
      reference_source: story.reference_source ?? null,
      model_name: story.model_name ?? "gpt-5-mini",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save story result:", error);
    throw error;
  }

  return data;
}

export async function getStoryResults() {
  const { data, error } = await supabase
    .from("story_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch story results:", error);
    return [];
  }

  return data ?? [];
}

export async function deleteStoryResult(id: string) {
  const { error } = await supabase
    .from("story_results")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete story result:", error);
    throw error;
  }
}