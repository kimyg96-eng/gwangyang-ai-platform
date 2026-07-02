import { supabase } from "@/services/supabase";
import type { CulturalDocument } from "@/types/culturalDocument";

export async function uploadDocument(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName =
    Date.now() + "-" + Math.random().toString(36).substring(2) + "." + ext;

  const path = `documents/${fileName}`;

  const { error } = await supabase.storage
    .from("cultural-documents")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("cultural-documents")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function createCulturalDocument(document: {
  asset_name: string;
  title: string;
  content?: string | null;
  source_url?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  page_count?: number | null;
}) {
  const { data, error } = await supabase
    .from("cultural_documents")
    .insert({
      ...document,
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCulturalDocuments(): Promise<CulturalDocument[]> {
  const { data, error } = await supabase
    .from("cultural_documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function deleteCulturalDocument(id: string) {
  const { error } = await supabase
    .from("cultural_documents")
    .delete()
    .eq("id", id);

  if (error) throw error;
}