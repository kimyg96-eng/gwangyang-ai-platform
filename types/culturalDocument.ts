export type DocumentIndexStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type CulturalDocument = {
  id: string;
  asset_name: string;
  title: string;
  content?: string | null;
  source_url?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  page_count?: number | null;
  uploaded_at?: string | null;
  indexed_status?: string | null;
  created_at: string;
};