"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAssets } from "@/hooks/useAssets";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useDocuments } from "@/hooks/useDocuments";
import AdminMenuGrid from "@/components/admin/AdminMenuGrid";
import AdminStats from "@/components/admin/AdminStats";
import AssetForm from "@/components/admin/AssetForm";
import AssetTable from "@/components/admin/AssetTable";
import ChatHistoryTable from "@/components/admin/ChatHistoryTable";
import DocumentForm from "@/components/admin/DocumentForm";
import DocumentTable from "@/components/admin/DocumentTable";
import type { CulturalAsset } from "@/types/culturalAsset";

type AdminTab = "assets" | "chats" | "documents" | "stats";

export default function AdminPage() {
  const { assets, loading } = useAssets();
  const { chats, loading: chatLoading } = useChatHistory();
  const { documents, loading: documentLoading } = useDocuments();
  const [editingAsset, setEditingAsset] = useState<CulturalAsset | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("assets");

  const tabs = [
    ["assets", "문화자산 관리"],
    ["chats", "AI 학습기록"],
    ["documents", "PDF 문서관리"],
    ["stats", "통계"],
  ] as const;

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="Admin Dashboard"
          title="관리자 페이지"
          description="광양 지역문화자산 학습 플랫폼의 콘텐츠, 학습기록, AI 생성 결과 및 RAG 문서를 관리하는 공간입니다."
        />
      </section>

      <AdminStats
        assetCount={assets.length}
        chatCount={chats.length}
        documentCount={documents.length}
      />

      <section className="mt-8 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                activeTab === key
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-emerald-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "assets" && (
        <>
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
        </>
      )}

      {activeTab === "chats" && (
        <ChatHistoryTable chats={chats} loading={chatLoading} />
      )}

      {activeTab === "documents" && (
        <>
          <DocumentForm assets={assets} />
          <DocumentTable documents={documents} loading={documentLoading} />
        </>
      )}

      {activeTab === "stats" && (
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">학습 통계</h2>
          <p className="mt-3 text-slate-600">
            등록 문화자산, AI 학습기록, 스토리 생성, 이미지 생성 결과를
            분석하는 통계 영역입니다.
          </p>
        </section>
      )}
    </PageLayout>
  );
}