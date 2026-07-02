"use client";

import { useState } from "react";
import { createCulturalDocument, uploadDocument } from "@/services/documentService";
import type { CulturalAsset } from "@/types/culturalAsset";

type DocumentFormProps = {
  assets: CulturalAsset[];
};

export default function DocumentForm({ assets }: DocumentFormProps) {
  const [assetName, setAssetName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUpload = async () => {
    if (!assetName || !title || !file) {
      alert("문화자산, 문서 제목, PDF 파일은 필수입니다.");
      return;
    }

    setSaving(true);

    try {
      const fileUrl = await uploadDocument(file);

      await createCulturalDocument({
        asset_name: assetName,
        title,
        content,
        file_url: fileUrl,
        file_size: file.size,
      });

      alert("PDF 문서가 등록되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("PDF 업로드 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">PDF 문서 업로드</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <select
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">문화자산 선택</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.name}>
              {asset.name}
            </option>
          ))}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="문서 제목"
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-4 h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
        placeholder="문서 설명 또는 요약"
      />

      <button
        onClick={handleUpload}
        disabled={saving}
        className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
      >
        {saving ? "업로드 중..." : "PDF 문서 등록"}
      </button>
    </section>
  );
}