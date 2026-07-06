import { supabase } from "@/services/supabase";

export async function saveImageResult(image: {
  session_id?: string | null;
  theme: string;
  story_id?: string | null;
  prompt: string;
  image_url: string;
  model_name?: string | null;
}) {
  const { data, error } = await supabase
    .from("image_results")
    .insert({
      session_id: image.session_id ?? null,
      theme: image.theme,
      story_id: image.story_id ?? null,
      prompt: image.prompt,
      image_url: image.image_url,
      model_name: image.model_name ?? "gpt-image-1",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save image result:", error);
    throw error;
  }

  return data;
}

export async function getImageResults() {
  const { data, error } = await supabase
    .from("image_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch image results:", error);
    return [];
  }

  return data ?? [];
}

export async function deleteImageResult(id: string) {
  const { error } = await supabase
    .from("image_results")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete image result:", error);
    throw error;
  }
}