"use client";

import { useEffect, useState } from "react";
import {
  createCulturalAsset,
  updateCulturalAsset,
  uploadAssetImage,
} from "@/services/assetService";
import type { CulturalAsset } from "@/types/culturalAsset";

type AssetFormProps = {
  editingAsset?: CulturalAsset | null;
  onFinish?: () => void;
};

export default function AssetForm({ editingAsset, onFinish }: AssetFormProps) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    latitude: "",
    longitude: "",
    description: "",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingAsset) {
      setForm({
        name: editingAsset.name ?? "",
        category: editingAsset.category ?? "",
        location: editingAsset.location ?? "",
        latitude: String(editingAsset.latitude ?? ""),
        longitude: String(editingAsset.longitude ?? ""),
        description: editingAsset.description ?? "",
        image_url: editingAsset.image_url ?? "",
      });
    }
  }, [editingAsset]);

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.description) {
      alert("문화자산명, 분류, 설명은 필수입니다.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = form.image_url || null;

      if (imageFile) {
        imageUrl = await uploadAssetImage(imageFile);
      }

      const payload = {
        name: form.name,
        category: form.category,
        location: form.location,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        description: form.description,
        image_url: imageUrl,
      };

      if (editingAsset) {
        await updateCulturalAsset(editingAsset.id, payload);
        alert("문화자산이 수정되었습니다.");
      } else {
        await createCulturalAsset(payload);
        alert("문화자산이 등록되었습니다.");
      }

      onFinish?.();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        {editingAsset ? "문화자산 수정" : "문화자산 신규 등록"}
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="문화자산명"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="분류"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="위치"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="위도"
          value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
        />

        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="경도"
          value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
        />

        <input
          type="file"
          accept="image/*"
          className="rounded-xl border border-slate-300 px-4 py-3"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {form.image_url && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-600">
            현재 등록된 이미지
          </p>
          <img
            src={form.image_url}
            alt={form.name}
            className="h-40 w-64 rounded-2xl object-cover"
          />
        </div>
      )}

      <textarea
        className="mt-4 h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
        placeholder="문화자산 설명"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
      >
        {saving
          ? "저장 중..."
          : editingAsset
          ? "문화자산 수정"
          : "문화자산 등록"}
      </button>
    </section>
  );
}