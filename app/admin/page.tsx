"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import { useChatHistory } from "@/hooks/useChatHistory";
import AdminMenuGrid from "@/components/admin/AdminMenuGrid";
import AdminStats from "@/components/admin/AdminStats";
import AssetForm from "@/components/admin/AssetForm";
import AssetTable from "@/components/admin/AssetTable";
import ChatHistoryTable from "@/components/admin/ChatHistoryTable";
import type { CulturalAsset } from "@/types/culturalAsset";

export default function AdminPage() {
  const { assets, loading } = useAssets();
  const { chats, loading: chatLoading } = useChatHistory();
  const [editingAsset, setEditingAsset] = useState<CulturalAsset | null>(null);

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="Admin Dashboard"
          title="관리자 페이지"
          description="광양 지역문화자산 학습 플랫폼의 콘텐츠, 학습기록, AI 생성 결과 및 RAG 문서를 관리하는 공간입니다."
        />
      </section>

      <AdminStats assetCount={assets.length} chatCount={chats.length} />

      <AdminMenuGrid />

      <AssetForm
        editingAsset={editingAsset}
        onFinish={() => setEditingAsset(null)}
      />

      <AssetTable
        assets={assets}
        loading={loading}
        onEdit={(asset) => setEditingAsset(asset)}
      />

      <ChatHistoryTable chats={chats} loading={chatLoading} />
    </PageLayout>
  );
}