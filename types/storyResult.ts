export type StoryResult = {
  id: string;
  session_id: string | null;

  theme: string | null;

  story_type: string | null;

  target_level: string | null;

  story_length: string | null;

  character: string | null;

  character_name: string |null;

  idea: string | null;

  prompt: string | null;

  title: string | null;

  story: string | null;

  reference_source: string | null;

  model_name: string | null;

  created_at: string;
};