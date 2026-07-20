"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

type AssetFormValues = {
  name: string;
  category: string;
  location: string;
  latitude: string;
  longitude: string;
  description: string;
  image_url: string;
};

function createInitialForm(asset?: CulturalAsset | null): AssetFormValues {
  return {
    name: asset?.name ?? "",
    category: asset?.category ?? "",
    location: asset?.location ?? "",
    latitude: asset?.latitude == null ? "" : String(asset.latitude),
    longitude: asset?.longitude == null ? "" : String(asset.longitude),
    description: asset?.description ?? "",
    image_url: asset?.image_url ?? "",
  };
}

function parseOptionalCoordinate(value: string, fieldName: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} 값을 올바른 숫자로 입력해 주세요.`);
  }

  return parsed;
}

function AssetFormFields({ editingAsset, onFinish }: AssetFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AssetFormValues>(() =>
    createInitialForm(editingAsset)
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = <Key extends keyof AssetFormValues>(
    key: Key,
    value: AssetFormValues[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const category = form.category.trim();
    const description = form.description.trim();

    if (!name || !category || !description) {
      alert("문화자산명, 분류, 설명은 필수입니다.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl: string | null = form.image_url.trim() || null;

      if (imageFile) {
        imageUrl = await uploadAssetImage(imageFile);
      }

      const payload = {
        name,
        category,
        location: form.location.trim(),
        latitude: parseOptionalCoordinate(form.latitude, "위도"),
        longitude: parseOptionalCoordinate(form.longitude, "경도"),
        description,
        image_url: imageUrl,
      };

      if (editingAsset) {
        await updateCulturalAsset(editingAsset.id, payload);
        alert("문화자산이 수정되었습니다.");
      } else {
        await createCulturalAsset(payload);
        alert("문화자산이 등록되었습니다.");
        setForm(createInitialForm());
        setImageFile(null);
      }

      onFinish?.();
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "저장 중 알 수 없는 오류가 발생했습니다.";

      console.error("Failed to save cultural asset:", error);
      alert(message);
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
          onChange={(event) => updateField("name", event.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="분류"
          value={form.category}
          onChange={(event) => updateField("category", event.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="위치"
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
        />

        <input
          inputMode="decimal"
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="위도"
          value={form.latitude}
          onChange={(event) => updateField("latitude", event.target.value)}
        />

        <input
          inputMode="decimal"
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="경도"
          value={form.longitude}
          onChange={(event) => updateField("longitude", event.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="rounded-xl border border-slate-300 px-4 py-3"
          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {form.image_url && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-600">
            현재 등록된 이미지
          </p>
          {/* 관리자 등록 이미지는 Supabase 등 동적 외부 URL이므로 일반 img를 사용합니다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.image_url}
            alt={form.name || "현재 등록된 문화자산 이미지"}
            className="h-40 w-64 rounded-2xl object-cover"
          />
        </div>
      )}

      <textarea
        className="mt-4 h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
        placeholder="문화자산 설명"
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
      />

      <button
        type="button"
        onClick={() => void handleSubmit()}
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

export default function AssetForm(props: AssetFormProps) {
  const formKey = props.editingAsset?.id ?? "new-cultural-asset";

  return <AssetFormFields key={formKey} {...props} />;
}