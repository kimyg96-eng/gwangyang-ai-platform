"use client";

import { useEffect, useState } from "react";
import { getImageResults } from "@/services/imageService";
import type { ImageResult } from "@/types/imageResult";

export function useImageResults() {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      const result = await getImageResults();
      setImages(result as ImageResult[]);
      setLoading(false);
    }

    loadImages();
  }, []);

  return { images, loading };
}