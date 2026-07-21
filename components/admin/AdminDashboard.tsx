"use client";

import { useEffect, useMemo, useState } from "react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminMenuGrid from "@/components/admin/AdminMenuGrid";
import AdminStats from "@/components/admin/AdminStats";
import AssetForm from "@/components/admin/AssetForm";
import AssetTable from "@/components/admin/AssetTable";
import ChatHistoryTable from "@/components/admin/ChatHistoryTable";
import DocumentForm from "@/components/admin/DocumentForm";
import DocumentTable from "@/components/admin/DocumentTable";
import ImageResultTable from "@/components/admin/ImageResultTable";
import QuizResultTable from "@/components/admin/QuizResultTable";
import StoryResultTable from "@/components/admin/StoryResultTable";
import PageLayout from "@/components/PageLayout";
import SectionTitle from "@/components/ui/SectionTitle";

import { useAssets } from "@/hooks/useAssets";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useDocuments } from "@/hooks/useDocuments";
import { useImageResults } from "@/hooks/useImageResults";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useStoryResults } from "@/hooks/useStoryResults";

import type { CulturalAsset } from "@/types/culturalAsset";

type AdminTab =
  | "overview"
  | "assets"
  | "chats"
  | "documents"
  | "stories"
  | "quizzes"
  | "images"
  | "stats";

type UnknownRecord = Record<string, unknown>;


type CacheTopQuestion = {
  question: string;
  assetName: string | null;
  agentType: string;
  hitCount: number;
  lastHitAt: string | null;
};

type CacheStats = {
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
  totalHits: number;
  reusedCacheCount: number;
  topQuestions: CacheTopQuestion[];
  generatedAt: string;
};

const tabs: readonly [AdminTab, string][] = [
  ["overview", "운영 현황"],
  ["assets", "문화자산 관리"],
  ["chats", "AI 학습기록"],
  ["documents", "PDF 문서관리"],
  ["stories", "AI 스토리 관리"],
  ["quizzes", "AI 퀴즈 관리"],
  ["images", "AI 이미지 관리"],
  ["stats", "상세 통계"],
];

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : {};
}

function getStringField(
  value: unknown,
  fieldNames: readonly string[]
): string {
  const record = asRecord(value);

  for (const fieldName of fieldNames) {
    const fieldValue = record[fieldName];

    if (typeof fieldValue === "string" && fieldValue.trim()) {
      return fieldValue.trim();
    }
  }

  return "";
}

function getDateField(
  value: unknown,
  fieldNames: readonly string[]
): Date | null {
  const rawValue = getStringField(value, fieldNames);

  if (!rawValue) {
    return null;
  }

  const date = new Date(rawValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isToday(date: Date | null): boolean {
  if (!date) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatDateTime(date: Date | null): string {
  if (!date) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminDashboard() {
  const { assets, loading } = useAssets();
  const { chats, loading: chatLoading } = useChatHistory();
  const { documents, loading: documentLoading } = useDocuments();
  const { stories, loading: storyLoading } = useStoryResults();
  const { quizzes, loading: quizLoading } = useQuizResults();
  const { images, loading: imageLoading } = useImageResults();

  const [editingAsset, setEditingAsset] =
    useState<CulturalAsset | null>(null);
  const [activeTab, setActiveTab] =
    useState<AdminTab>("overview");

  const [cacheStats, setCacheStats] =
    useState<CacheStats | null>(null);
  const [cacheStatsLoading, setCacheStatsLoading] =
    useState(true);
  const [cacheStatsError, setCacheStatsError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCacheStats = async () => {
      try {
        setCacheStatsLoading(true);
        setCacheStatsError(null);

        const response = await fetch(
          "/api/admin/cache-stats",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = (await response.json()) as
          | CacheStats
          | {
              error?: string;
              detail?: string;
            };

        if (!response.ok) {
          const errorResult = result as {
            error?: string;
            detail?: string;
          };

          throw new Error(
            errorResult.detail ||
              errorResult.error ||
              "AI 캐시 통계를 불러오지 못했습니다."
          );
        }

        if (mounted) {
          setCacheStats(result as CacheStats);
        }
      } catch (error: unknown) {
        if (mounted) {
          setCacheStatsError(
            error instanceof Error
              ? error.message
              : "AI 캐시 통계를 불러오지 못했습니다."
          );
        }
      } finally {
        if (mounted) {
          setCacheStatsLoading(false);
        }
      }
    };

    void loadCacheStats();

    return () => {
      mounted = false;
    };
  }, []);

  const helpfulCount = chats.filter(
    (chat) => chat.feedback === "helpful"
  ).length;

  const badCount = chats.filter(
    (chat) => chat.feedback === "bad"
  ).length;

  const feedbackTotal = helpfulCount + badCount;

  const satisfactionRate =
    feedbackTotal > 0
      ? Math.round((helpfulCount / feedbackTotal) * 100)
      : 0;

  const tokenUsageSummary = useMemo(() => {
    const validTokenCounts = chats
      .map((chat) => {
        const record = asRecord(chat);
        const value = record.tokens_used;

        return typeof value === "number" &&
          Number.isFinite(value)
          ? value
          : 0;
      })
      .filter((value) => value > 0);

    const totalTokens = validTokenCounts.reduce(
      (sum, value) => sum + value,
      0
    );

    const apiCallCount = validTokenCounts.length;

    return {
      totalTokens,
      apiCallCount,
      averageTokens:
        apiCallCount > 0
          ? Math.round(totalTokens / apiCallCount)
          : 0,
    };
  }, [chats]);

  const averageResponseTime = useMemo(() => {
    const validTimes = chats
      .map((chat) => chat.response_time)
      .filter(
        (time): time is number =>
          typeof time === "number" &&
          Number.isFinite(time)
      );

    if (validTimes.length === 0) return 0;

    return Math.round(
      validTimes.reduce((sum, time) => sum + time, 0) /
        validTimes.length
    );
  }, [chats]);

  const mostAskedAsset = useMemo(() => {
    const counts: Record<string, number> = {};

    chats.forEach((chat) => {
      const asset = chat.asset_name ?? "미지정";
      counts[asset] = (counts[asset] ?? 0) + 1;
    });

    const sorted = Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );

    return sorted[0] ?? ["데이터 없음", 0];
  }, [chats]);

  const todayChatCount = useMemo(() => {
    return chats.filter((chat) =>
      isToday(
        getDateField(chat, [
          "created_at",
          "createdAt",
          "asked_at",
          "timestamp",
        ])
      )
    ).length;
  }, [chats]);

  const documentStatusSummary = useMemo(() => {
    return documents.reduce(
      (summary, document) => {
        const status = getStringField(document, [
          "indexed_status",
          "indexedStatus",
          "status",
        ]).toLowerCase();

        if (status === "indexed") {
          summary.indexed += 1;
        } else if (
          status === "failed" ||
          status === "error"
        ) {
          summary.failed += 1;
        } else if (
          status === "indexing" ||
          status === "processing"
        ) {
          summary.indexing += 1;
        } else {
          summary.pending += 1;
        }

        return summary;
      },
      {
        indexed: 0,
        failed: 0,
        indexing: 0,
        pending: 0,
      }
    );
  }, [documents]);

  const recentChats = useMemo(() => {
    return [...chats]
      .sort((a, b) => {
        const dateA = getDateField(a, [
          "created_at",
          "createdAt",
          "asked_at",
          "timestamp",
        ]);
        const dateB = getDateField(b, [
          "created_at",
          "createdAt",
          "asked_at",
          "timestamp",
        ]);

        return (
          (dateB?.getTime() ?? 0) -
          (dateA?.getTime() ?? 0)
        );
      })
      .slice(0, 5);
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
              type="button"
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

      {activeTab === "overview" && (
        <section className="mt-8 space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                오늘 질문
              </p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {todayChatCount}건
              </p>
              <p className="mt-2 text-sm text-slate-500">
                전체 질문 {chats.length}건
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                색인 완료 문서
              </p>
              <p className="mt-3 text-3xl font-bold text-blue-600">
                {documentStatusSummary.indexed}건
              </p>
              <p className="mt-2 text-sm text-slate-500">
                전체 문서 {documents.length}건
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                평균 응답시간
              </p>
              <p className="mt-3 text-3xl font-bold text-violet-600">
                {averageResponseTime.toLocaleString("ko-KR")}ms
              </p>
              <p className="mt-2 text-sm text-slate-500">
                저장된 대화 기준
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                AI 만족도
              </p>
              <p className="mt-3 text-3xl font-bold text-amber-600">
                {feedbackTotal > 0
                  ? `${satisfactionRate}%`
                  : "대기"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                피드백 {feedbackTotal}건
              </p>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_1.35fr]">
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    RAG 문서 상태
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    PDF 색인 진행 상태를 확인합니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  문서관리
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    label: "색인 완료",
                    value: documentStatusSummary.indexed,
                    className: "bg-emerald-500",
                  },
                  {
                    label: "색인 중",
                    value: documentStatusSummary.indexing,
                    className: "bg-blue-500",
                  },
                  {
                    label: "색인 실패",
                    value: documentStatusSummary.failed,
                    className: "bg-red-500",
                  },
                  {
                    label: "대기 또는 미분류",
                    value: documentStatusSummary.pending,
                    className: "bg-slate-400",
                  },
                ].map((item) => {
                  const ratio =
                    documents.length > 0
                      ? Math.round(
                          (item.value / documents.length) * 100
                        )
                      : 0;

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-slate-500">
                          {item.value}건 · {ratio}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.className}`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    최근 AI 질문
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    최근 저장된 학습 질문 5건입니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("chats")}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  전체 기록
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {recentChats.length > 0 ? (
                  recentChats.map((chat, index) => {
                    const question =
                      getStringField(chat, [
                        "question",
                        "message",
                        "prompt",
                      ]) || "질문 내용 없음";

                    const createdAt = getDateField(chat, [
                      "created_at",
                      "createdAt",
                      "asked_at",
                      "timestamp",
                    ]);

                    return (
                      <div
                        key={`${question}-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="line-clamp-2 font-semibold text-slate-800">
                            {question}
                          </p>
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatDateTime(createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          문화자산:{" "}
                          <b className="text-slate-700">
                            {chat.asset_name ?? "미지정"}
                          </b>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    저장된 AI 질문이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm">
            <div>
              <h2 className="text-xl font-bold">
                OpenAI 사용량
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                새로 생성된 답변의 저장 토큰 기준 통계입니다.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-violet-50 p-5">
                <p className="text-sm font-semibold text-violet-700">
                  GPT 호출 기록
                </p>
                <p className="mt-2 text-3xl font-bold text-violet-700">
                  {tokenUsageSummary.apiCallCount.toLocaleString(
                    "ko-KR"
                  )}건
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-700">
                  누적 사용 토큰
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-700">
                  {tokenUsageSummary.totalTokens.toLocaleString(
                    "ko-KR"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-700">
                  평균 토큰
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  {tokenUsageSummary.averageTokens.toLocaleString(
                    "ko-KR"
                  )}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              캐시 응답은 OpenAI를 호출하지 않으므로 사용 토큰이
              0으로 저장됩니다. 기존 기록 중 tokens_used가 비어 있는
              데이터는 집계에서 제외됩니다.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_1.35fr]">
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">
                  AI 답변 캐시
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  반복 질문에 재사용된 답변 현황입니다.
                </p>
              </div>

              {cacheStatsLoading ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                  캐시 통계를 불러오는 중입니다.
                </div>
              ) : cacheStatsError ? (
                <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                  {cacheStatsError}
                </div>
              ) : cacheStats ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-5">
                    <p className="text-sm font-semibold text-emerald-700">
                      캐시 재사용
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">
                      {cacheStats.totalHits.toLocaleString("ko-KR")}회
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-700">
                      활성 캐시
                    </p>
                    <p className="mt-2 text-3xl font-bold text-blue-700">
                      {cacheStats.activeEntries.toLocaleString("ko-KR")}건
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-700">
                      재사용된 질문
                    </p>
                    <p className="mt-2 text-3xl font-bold text-amber-700">
                      {cacheStats.reusedCacheCount.toLocaleString("ko-KR")}건
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-5">
                    <p className="text-sm font-semibold text-slate-600">
                      만료 캐시
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-700">
                      {cacheStats.expiredEntries.toLocaleString("ko-KR")}건
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">
                  많이 재사용된 질문
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  캐시 적중 횟수가 높은 질문 순위입니다.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {cacheStatsLoading ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    질문 순위를 불러오는 중입니다.
                  </div>
                ) : cacheStats?.topQuestions.length ? (
                  cacheStats.topQuestions.map(
                    (item, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {index + 1}. {item.question}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.assetName ?? "문화자산 미지정"} ·{" "}
                            {item.agentType === "avatar"
                              ? "정채봉 아바타"
                              : "AI 문화해설사"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                          {item.hitCount.toLocaleString("ko-KR")}회
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    아직 재사용된 캐시가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                문화자산
              </p>
              <p className="mt-3 text-2xl font-bold">
                {assets.length}건
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                AI 스토리
              </p>
              <p className="mt-3 text-2xl font-bold">
                {stories.length}건
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                AI 퀴즈
              </p>
              <p className="mt-3 text-2xl font-bold">
                {quizzes.length}건
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                AI 이미지
              </p>
              <p className="mt-3 text-2xl font-bold">
                {images.length}건
              </p>
            </div>
          </div>
        </section>
      )}

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
        <ChatHistoryTable
          chats={chats}
          loading={chatLoading}
        />
      )}

      {activeTab === "documents" && (
        <>
          <DocumentForm assets={assets} />
          <DocumentTable
            documents={documents}
            loading={documentLoading}
          />
        </>
      )}

      {activeTab === "stories" && (
        <StoryResultTable
          stories={stories}
          loading={storyLoading}
        />
      )}

      {activeTab === "quizzes" && (
        <QuizResultTable
          quizzes={quizzes}
          loading={quizLoading}
        />
      )}

      {activeTab === "images" && (
        <ImageResultTable
          images={images}
          loading={imageLoading}
        />
      )}

      {activeTab === "stats" && (
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">학습 통계</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                평균 응답시간
              </p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {averageResponseTime}ms
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                도움됨
              </p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {helpfulCount}건
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                부족함
              </p>
              <p className="mt-3 text-3xl font-bold text-red-500">
                {badCount}건
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">
                AI 만족도
              </p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">
                {feedbackTotal > 0
                  ? `${satisfactionRate}%`
                  : "대기"}
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
              <p className="mt-2 text-slate-600">
                {mostAskedAsset[1]}건 질문
              </p>
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