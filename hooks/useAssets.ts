"use client";

import { useEffect, useState } from "react";
import { getCulturalAssets } from "@/services/assetService";
import type { CulturalAsset } from "@/types/culturalAsset";

export function useAssets() {
  const [assets, setAssets] = useState<CulturalAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      const result = await getCulturalAssets();
      setAssets(result);
      setLoading(false);
    }

    loadAssets();
  }, []);

  return { assets, loading };
}