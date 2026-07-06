"use client";

import { useEffect, useState } from "react";
import { getStoryResults } from "@/services/storyService";
import type { StoryResult } from "@/types/storyResult";

export function useStoryResults() {
  const [stories, setStories] = useState<StoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      const result = await getStoryResults();
      setStories(result as StoryResult[]);
      setLoading(false);
    }

    loadStories();
  }, []);

  return { stories, loading };
}