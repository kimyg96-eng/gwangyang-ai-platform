"use client";

import { useEffect, useState } from "react";
import { createCulturalAsset, updateCulturalAsset } from "@/services/assetService";
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
  });

  useEffect(() => {
    if (editingAsset) {
      setForm({
        name: editingAsset.name ?? "",
        category: editingAsset.category ?? "",
        location: editingAsset.location ?? "",
        latitude: String(editingAsset.latitude ?? ""),
        longitude: String(editingAsset.longitude ?? ""),
        description: editingAsset.description ?? "",
      });
    }
  }, [editingAsset]);

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.description) {
      alert("문화자산명, 분류, 설명은 필수입니다.");
      return;
    }

    const payload = {
      name: form.name,
      category: form.category,
      location: form.location,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      description: form.description,
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
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        {editingAsset ? "문화자산 수정" : "문화자산 신규 등록"}
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="문화자산명" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="분류" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="위치" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="위도" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-4 py-3" placeholder="경도" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
      </div>

      <textarea
        className="mt-4 h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
        placeholder="문화자산 설명"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button
        onClick={handleSubmit}
        className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
      >
        {editingAsset ? "문화자산 수정" : "문화자산 등록"}
      </button>
    </section>
  );
}