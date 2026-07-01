"use client";

import { useState } from "react";
import { createCulturalAsset } from "@/services/assetService";

export default function AssetForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    latitude: "",
    longitude: "",
    description: "",
  });

  const handleCreateAsset = async () => {
    if (!form.name || !form.category || !form.description) {
      alert("문화자산명, 분류, 설명은 필수입니다.");
      return;
    }

    await createCulturalAsset({
      name: form.name,
      category: form.category,
      location: form.location,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      description: form.description,
    });

    alert("문화자산이 등록되었습니다.");
    window.location.reload();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">문화자산 신규 등록</h2>

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
        onClick={handleCreateAsset}
        className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
      >
        문화자산 등록
      </button>
    </section>
  );
}