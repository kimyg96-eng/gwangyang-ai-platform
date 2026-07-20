import { supabase } from "@/services/supabase";
import type { CulturalAsset } from "@/types/culturalAsset";

export async function getCulturalAssets(): Promise<CulturalAsset[]> {
  const { data, error } = await supabase
    .from("cultural_assets")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch cultural assets:", error);
    return [];
  }

  return data ?? [];
}

export async function uploadAssetImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `assets/${fileName}`;

  const { error } = await supabase.storage
    .from("cultural-assets")
    .upload(filePath, file);

  if (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from("cultural-assets")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createCulturalAsset(asset: {
  name: string;
  category: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  image_url?: string | null;
}) {
  const { data, error } = await supabase
    .from("cultural_assets")
    .insert(asset)
    .select()
    .single();

  if (error) {
    console.error("Failed to create cultural asset:", error);
    throw error;
  }

  return data;
}

export async function updateCulturalAsset(
  id: string,
  asset: {
    name: string;
    category: string;
    description: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    image_url?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("cultural_assets")
    .update(asset)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update cultural asset:", error);
    throw error;
  }

  return data;
}

export async function deleteCulturalAsset(id: string) {
  const { error } = await supabase
    .from("cultural_assets")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete cultural asset:", error);
    throw error;
  }
}