export type CulturalAsset = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  created_at: string;
};