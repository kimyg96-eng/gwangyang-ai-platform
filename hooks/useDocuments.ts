"use client";

import { useEffect, useState } from "react";
import { getCulturalDocuments } from "@/services/documentService";
import type { CulturalDocument } from "@/types/culturalDocument";

export function useDocuments() {
  const [documents, setDocuments] = useState<CulturalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      const result = await getCulturalDocuments();
      setDocuments(result);
      setLoading(false);
    }

    loadDocuments();
  }, []);

  return { documents, loading };
}