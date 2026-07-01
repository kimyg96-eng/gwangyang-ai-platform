"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import { createCulturalAsset } from "@/services/assetService";
import AssetForm from "@/components/admin/AssetForm";
import AssetTable from "@/components/admin/AssetTable";
import AdminMenuGrid from "@/components/admin/AdminMenuGrid";

const adminMenus = [
  ["문화자산 관리", "광양 지역문화자산 등록·수정·삭제"],
  ["학습기록 관리", "학생 질문, AI 답변, 학습 이력 확인"],
  ["스토리 결과 관리", "AI 스토리 생성 결과 확인"],
  ["이미지 결과 관리", "AI 이미지 생성 결과 확인"],
  ["퀴즈 결과 관리", "학습 평가 및 정답률 확인"],
  ["RAG 문서 관리", "문화자료, 문헌, PDF 콘텐츠 관리"],
];

export default function AdminPage() {
  const { assets, loading } = useAssets();

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
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="Admin Dashboard"
          title="관리자 페이지"
          description="광양 지역문화자산 학습 플랫폼의 콘텐츠, 학습기록, AI 생성 결과 및 RAG 문서를 관리하는 공간입니다."
        />
      </section>

<AdminMenuGrid />

      <AssetForm />
     <AssetTable assets={assets} loading={loading} />
    </PageLayout>
  );
}