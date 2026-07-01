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

export async function createCulturalAsset(asset: {
  name: string;
  category: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
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
    latitude: number;
    longitude: number;
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