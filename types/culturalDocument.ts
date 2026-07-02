export type CulturalDocument = {
  id: string;
  asset_name: string | null;
  title: string;
  content: string | null;
  source_url: string | null;
  file_url: string | null;
  file_size: number | null;
  page_count: number | null;
  uploaded_at: string | null;
  created_at: string;
};