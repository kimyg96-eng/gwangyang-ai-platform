"use client";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";

import { useAssets } from "@/hooks/useAssets";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useDocuments } from "@/hooks/useDocuments";
import { useStoryResults } from "@/hooks/useStoryResults";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useImageResults } from "@/hooks/useImageResults";

import AdminMenuGrid from "@/components/admin/AdminMenuGrid";
import AdminStats from "@/components/admin/AdminStats";
import AssetForm from "@/components/admin/AssetForm";
import AssetTable from "@/components/admin/AssetTable";
import ChatHistoryTable from "@/components/admin/ChatHistoryTable";
import DocumentForm from "@/components/admin/DocumentForm";
import DocumentTable from "@/components/admin/DocumentTable";
import StoryResultTable from "@/components/admin/StoryResultTable";
import QuizResultTable from "@/components/admin/QuizResultTable";
import ImageResultTable from "@/components/admin/ImageResultTable";

import type { CulturalAsset } from "@/types/culturalAsset";

type AdminTab =
  | "assets"
  | "chats"
  | "documents"
  | "stories"
  | "quizzes"
  | "images"
  | "stats";

const tabs: readonly [AdminTab, string][] = [
  ["assets", "문화자산 관리"],
  ["chats", "AI 학습기록"],
  ["documents", "PDF 문서관리"],
  ["stories", "AI 스토리 관리"],
  ["quizzes", "AI 퀴즈 관리"],
  ["images", "AI 이미지 관리"],
  ["stats", "통계"],
];

export default function AdminDashboard() {
  const { assets, loading } = useAssets();
  const { chats, loading: chatLoading } = useChatHistory();
  const { documents, loading: documentLoading } = useDocuments();
  const { stories, loading: storyLoading } = useStoryResults();
  const { quizzes, loading: quizLoading } = useQuizResults();
  const { images, loading: imageLoading } = useImageResults();

  const [editingAsset, setEditingAsset] = useState<CulturalAsset | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("assets");

  const helpfulCount = chats.filter((chat) => chat.feedback === "helpful").length;
  const badCount = chats.filter((chat) => chat.feedback === "bad").length;
  const feedbackTotal = helpfulCount + badCount;
  const satisfactionRate =
    feedbackTotal > 0 ? Math.round((helpfulCount / feedbackTotal) * 100) : 0;

  const averageResponseTime = useMemo(() => {
    const validTimes = chats
      .map((chat) => chat.response_time)
      .filter((time): time is number => typeof time === "number");

    if (validTimes.length === 0) return 0;

    return Math.round(
      validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
    );
  }, [chats]);

  const mostAskedAsset = useMemo(() => {
    const counts: Record<string, number> = {};

    chats.forEach((chat) => {
      const asset = chat.asset_name ?? "미지정";
      counts[asset] = (counts[asset] ?? 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ?? ["데이터 없음", 0];
  }, [chats]);

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
    <SectionTitle
      label="Admin Dashboard"
      title="관리자 페이지"
      description="광양 지역문화자산 학습 플랫폼의 콘텐츠, 학습기록, AI 생성 결과 및 RAG 문서를 관리하는 공간입니다."
    />

    <AdminLogoutButton />
  </div>
</section>

      <AdminStats
        assetCount={assets.length}
        chatCount={chats.length}
        documentCount={documents.length}
        helpfulCount={helpfulCount}
        badCount={badCount}
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

      {activeTab === "stories" && (
        <StoryResultTable stories={stories} loading={storyLoading} />
      )}

      {activeTab === "quizzes" && (
        <QuizResultTable quizzes={quizzes} loading={quizLoading} />
      )}

      {activeTab === "images" && (
        <ImageResultTable images={images} loading={imageLoading} />
      )}

      {activeTab === "stats" && (
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">학습 통계</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">평균 응답시간</p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {averageResponseTime}ms
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">도움됨</p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {helpfulCount}건
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">부족함</p>
              <p className="mt-3 text-3xl font-bold text-red-500">
                {badCount}건
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">AI 만족도</p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {feedbackTotal > 0 ? `${satisfactionRate}%` : "대기"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                가장 많이 질문된 문화자산
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {mostAskedAsset[0]}
              </p>
              <p className="mt-2 text-slate-600">{mostAskedAsset[1]}건 질문</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                생성된 AI 스토리
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {stories.length}건
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                생성된 AI 퀴즈
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {quizzes.length}건
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                생성된 AI 이미지
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {images.length}건
              </p>
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}