"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";
import LoadingState from "@/components/ui/LoadingState";
import {
  createLearningSession,
  saveChatHistory,
  updateChatFeedback,
} from "@/services/chatService";

const assets = ["매화마을", "섬진강", "백운산", "광양읍성", "정채봉 문학"];

type ReferenceFile = {
  title: string;
  url: string | null;
};

type Citation = {
  number: number;
  file_id: string;
  title: string;
  filename: string;
  url: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  chatId?: string;
  feedback?: "helpful" | "bad";
  referenceSource?: string;
  referenceFiles?: ReferenceFile[];
  modelName?: string;
  responseTime?: number;
  citations?: Citation[];
  streaming?: boolean;
  statusMessage?: string;
  suggestedQuestions?: string[];
  totalTokens?: number;
  cacheHit?: boolean;
};

type StreamStatusEvent = {
  type: "status";
  message: string;
};

type StreamDeltaEvent = {
  type: "delta";
  delta: string;
};

type StreamCompleteEvent = {
  type: "complete";
  reply: string;
  model_name?: string;
  reference_source?: string;
  reference_files?: ReferenceFile[];
  citations?: Citation[];
  cache_hit?: boolean;
  token_usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
};

type StreamErrorEvent = {
  type: "error";
  error?: string;
  detail?: string;
};

type ChatStreamEvent =
  | StreamStatusEvent
  | StreamDeltaEvent
  | StreamCompleteEvent
  | StreamErrorEvent;


function extractSuggestedQuestions(content: string): string[] {
  const headingPattern =
    /(?:^|\n)#{1,4}\s*(?:함께 살펴볼 질문|추천 질문|이런 질문도 해보세요)\s*\n([\s\S]*)$/i;

  const sectionMatch = content.match(headingPattern);
  if (!sectionMatch) {
    return [];
  }

  return sectionMatch[1]
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
        .trim()
    )
    .filter((line) => line.length >= 5 && line.length <= 120)
    .slice(0, 3);
}

function removeSuggestedQuestionSection(content: string): string {
  return content
    .replace(
      /(?:^|\n)#{1,4}\s*(?:함께 살펴볼 질문|추천 질문|이런 질문도 해보세요)\s*\n[\s\S]*$/i,
      ""
    )
    .trim();
}

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "안녕하세요. 저는 광양 지역문화자산을 안내하는 AI 문화해설사입니다. 매화마을, 섬진강, 백운산, 정채봉 문학에 대해 무엇이든 물어보세요.",
};

function GuideContent() {
  const searchParams = useSearchParams();
  const assetFromMap = searchParams.get("asset");

  return (
    <GuideChat
      key={assetFromMap ?? "guide-default"}
      initialAsset={assetFromMap}
    />
  );
}

type GuideChatProps = {
  initialAsset: string | null;
};

function GuideChat({ initialAsset }: GuideChatProps) {
  const [message, setMessage] = useState(
    initialAsset ? `${initialAsset}에 대해 설명해 주세요.` : ""
  );
  const [selectedAsset, setSelectedAsset] = useState<string | null>(
    initialAsset
  );
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  const sessionPromiseRef = useRef<Promise<string> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startNewChat = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setMessages([initialMessage]);
    setMessage("");
    setSelectedAsset(null);
    setSessionId(null);
    setLoading(false);
    sessionPromiseRef.current = null;
  };

  const getSessionId = async (): Promise<string> => {
    if (sessionId) return sessionId;

    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = createLearningSession().then((session) => {
        setSessionId(session.id);
        return session.id;
      });
    }

    return sessionPromiseRef.current;
  };

  const handleFeedback = async (
    index: number,
    chatId: string,
    feedback: "helpful" | "bad"
  ) => {
    await updateChatFeedback(chatId, feedback);

    setMessages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, feedback } : item))
    );
  };

  const updateLastMessage = (
    updater: (message: ChatMessage) => ChatMessage
  ) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const next = [...prev];
      const lastIndex = next.length - 1;
      next[lastIndex] = updater(next[lastIndex]);

      return next;
    });
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    updateLastMessage((item) => ({
      ...item,
      streaming: false,
      statusMessage: "사용자가 생성을 중지했습니다.",
      content: item.content || "답변 생성이 중지되었습니다.",
    }));

    setLoading(false);
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    const history = messages
      .filter(
        (item) =>
          (item.role === "user" || item.role === "assistant") &&
          !item.streaming
      )
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    setMessage("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedMessage,
      },
      {
        role: "assistant",
        content: "",
        streaming: true,
        statusMessage: "AI 문화해설사가 요청을 준비하고 있습니다...",
      },
    ]);

    const startTime = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const currentSessionId = await getSessionId();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          assetName: selectedAsset,
          agentType: "guide",
          history,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          error?: string;
          detail?: string;
        };

        throw new Error(
          [errorData.error, errorData.detail].filter(Boolean).join("\n") ||
            `요청 실패: ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error("스트리밍 응답 본문을 읽을 수 없습니다.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completeEvent: StreamCompleteEvent | undefined;

      const processLine = (line: string) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const event = JSON.parse(trimmedLine) as ChatStreamEvent;

        if (event.type === "status") {
          updateLastMessage((item) => ({
            ...item,
            statusMessage: event.message,
          }));
          return;
        }

        if (event.type === "delta") {
          updateLastMessage((item) => ({
            ...item,
            content: item.content + event.delta,
            statusMessage: "답변을 생성하고 있습니다...",
          }));
          return;
        }

        if (event.type === "complete") {
          completeEvent = event;

          const completedReply = event.reply || "";
          const suggestedQuestions =
            extractSuggestedQuestions(completedReply);
          const visibleReply =
            removeSuggestedQuestionSection(completedReply);

          updateLastMessage((item) => ({
            ...item,
            content: visibleReply || item.content,
            streaming: false,
            statusMessage: "생성 완료",
            referenceSource: event.reference_source ?? "",
            referenceFiles: event.reference_files ?? [],
            citations: event.citations ?? [],
            modelName: event.model_name ?? "gpt-5-mini",
            responseTime: Date.now() - startTime,
            suggestedQuestions,
            totalTokens:
              event.token_usage?.total_tokens ?? 0,
            cacheHit: event.cache_hit ?? false,
          }));
          return;
        }

        if (event.type === "error") {
          throw new Error(
            [event.error, event.detail].filter(Boolean).join("\n") ||
              "AI 응답 생성에 실패했습니다."
          );
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          processLine(line);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!completeEvent) {
        throw new Error("AI 응답이 완료되기 전에 연결이 종료되었습니다.");
      }

      const responseTime = Date.now() - startTime;
      const answerText =
        removeSuggestedQuestionSection(completeEvent.reply) ||
        completeEvent.reply.trim() ||
        "응답 내용이 비어 있습니다.";

      const savedChat = await saveChatHistory({
        session_id: currentSessionId,
        agent_type: "AI 문화해설사",
        asset_name: selectedAsset,
        question: trimmedMessage,
        answer: answerText,
        response_time: responseTime,
        model_name: completeEvent.model_name ?? "gpt-5-mini",
        user_role: "student",
        reference_source:
          completeEvent.reference_source ?? "RAG 문서 없음",
        tokens_used:
          completeEvent.token_usage?.total_tokens ?? 0,
      });

      updateLastMessage((item) => ({
        ...item,
        chatId: savedChat.id,
        responseTime,
      }));
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("AI 문화해설사 스트리밍 실패:", error);

      updateLastMessage((item) => ({
        ...item,
        streaming: false,
        statusMessage: "오류 발생",
        content:
          item.content ||
          (error instanceof Error
            ? error.message
            : "요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
      }));
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">지역문화자산</h2>

          <button
            type="button"
            onClick={startNewChat}
            className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
          >
            새 대화 시작
          </button>

          <div className="mt-6 space-y-3">
            {assets.map((asset) => (
              <button
                type="button"
                key={asset}
                onClick={() => {
                  setSelectedAsset(asset);
                  setMessage(`${asset}에 대해 설명해 주세요.`);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left font-medium ${
                  selectedAsset === asset
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>

          {sessionId && (
            <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              현재 학습 세션이 저장 중입니다.
            </p>
          )}
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <SectionTitle
            label="AI Cultural Guide"
            title="AI 문화해설사"
            description="광양 지역문화자산에 대해 질문하면 업로드된 PDF 문서를 기반으로 대화형 답변을 제공합니다."
          />

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="max-h-[620px] space-y-5 overflow-y-auto pr-2">
              {messages.map((chat, index) => (
                <div
                  key={`${chat.role}-${index}-${chat.chatId ?? chat.content.slice(0, 20)}`}
                  className={`flex ${
                    chat.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${
                      chat.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    <p className="text-sm font-bold">
                      {chat.role === "user" ? "학습자" : "AI 문화해설사"}
                    </p>

                    {chat.statusMessage && chat.role === "assistant" && (
                      <p className="mt-3 text-xs font-semibold text-emerald-700">
                        {chat.statusMessage}
                      </p>
                    )}

                    <p className="mt-3 whitespace-pre-line leading-7">
                      {chat.content}
                      {chat.streaming && (
                        <span
                          aria-hidden="true"
                          className="ml-1 inline-block animate-pulse font-bold text-emerald-600"
                        >
                          █
                        </span>
                      )}
                    </p>

                    {chat.role === "assistant" &&
                      !chat.streaming &&
                      chat.citations &&
                      chat.citations.length > 0 && (
                        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm font-bold text-blue-700">
                            📚 참고한 문서 ({chat.citations.length})
                          </p>

                          <div className="mt-4 space-y-3">
                            {chat.citations.map((citation) => (
                              <div
                                key={citation.file_id}
                                className="flex flex-col gap-3 rounded-lg bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="font-semibold">
                                    [{citation.number}] {citation.title}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {citation.filename}
                                  </p>
                                </div>

                                {citation.url ? (
                                  <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700"
                                  >
                                    📄 PDF 보기
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    PDF 없음
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {chat.role === "assistant" &&
                      !chat.streaming &&
                      (!chat.citations || chat.citations.length === 0) &&
                      chat.referenceSource &&
                      chat.referenceSource !== "RAG 문서 없음" && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <p className="text-sm font-semibold text-emerald-700">
                            📚 참고자료
                          </p>

                          {chat.referenceFiles &&
                          chat.referenceFiles.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {Array.from(
                                new Map(
                                  chat.referenceFiles.map((file) => [
                                    `${file.title}-${file.url ?? ""}`,
                                    file,
                                  ])
                                ).values()
                              ).map((file) => (
                                <div
                                  key={`${file.title}-${file.url ?? "no-url"}`}
                                  className="flex flex-col gap-2 rounded-lg bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <span className="text-sm font-semibold text-slate-700">
                                    {file.title}
                                  </span>

                                  {file.url ? (
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                      📄 PDF 보기
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      PDF 없음
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-slate-700">
                              {chat.referenceSource}
                            </p>
                          )}
                        </div>
                      )}

                    {chat.role === "assistant" &&
                      !chat.streaming &&
                      chat.suggestedQuestions &&
                      chat.suggestedQuestions.length > 0 && (
                        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-bold text-amber-800">
                            💡 이런 질문도 해보세요
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {chat.suggestedQuestions.map(
                              (question) => (
                                <button
                                  type="button"
                                  key={question}
                                  onClick={() => {
                                    setMessage(question);
                                  }}
                                  className="rounded-full border border-amber-300 bg-white px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-amber-500 hover:bg-amber-100"
                                >
                                  {question}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {chat.role === "assistant" &&
                      !chat.streaming &&
                      (chat.modelName ||
                        typeof chat.responseTime === "number") && (
                        <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 md:grid-cols-2">
                          <p>
                            🤖 AI 모델: <b>{chat.modelName ?? "-"}</b>
                          </p>

                          <p>
                            ⏱ 응답시간:{" "}
                            <b>
                              {typeof chat.responseTime === "number"
                                ? `${chat.responseTime.toLocaleString(
                                    "ko-KR"
                                  )} ms`
                                : "-"}
                            </b>
                          </p>

                          <p>
                            🔢 사용 토큰:{" "}
                            <b>
                              {typeof chat.totalTokens === "number"
                                ? chat.totalTokens.toLocaleString(
                                    "ko-KR"
                                  )
                                : "-"}
                            </b>
                          </p>

                          <p>
                            ⚡ 응답 방식:{" "}
                            <b>
                              {chat.cacheHit
                                ? "캐시 응답"
                                : "OpenAI 생성"}
                            </b>
                          </p>
                        </div>
                      )}

                    {chat.role === "assistant" &&
                      !chat.streaming &&
                      chat.chatId && (
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleFeedback(
                                index,
                                chat.chatId as string,
                                "helpful"
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              chat.feedback === "helpful"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-50 text-emerald-700"
                            }`}
                          >
                            👍 도움됨
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleFeedback(
                                index,
                                chat.chatId as string,
                                "bad"
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              chat.feedback === "bad"
                                ? "bg-red-500 text-white"
                                : "bg-slate-50 text-red-500"
                            }`}
                          >
                            👎 부족함
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <AppInput
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="궁금한 내용을 입력하세요."
                disabled={loading}
              />

              {loading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="shrink-0 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
                >
                  ■ 생성 중지
                </button>
              ) : (
                <AppButton onClick={() => void sendMessage()}>전송</AppButton>
              )}
            </div>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}

export default function GuidePage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <LoadingState message="AI 문화해설사를 준비하고 있습니다..." />
        </PageLayout>
      }
    >
      <GuideContent />
    </Suspense>
  );
}