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