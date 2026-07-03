"use client";

import { useEffect, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";
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

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  chatId?: string;
  feedback?: "helpful" | "bad";
  referenceSource?: string;
  referenceFiles?: ReferenceFile[];
  modelName?: string;
  responseTime?: number;
};

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "안녕하세요. 저는 광양 지역문화자산을 안내하는 AI 문화해설사입니다. 매화마을, 섬진강, 백운산, 정채봉 문학에 대해 무엇이든 물어보세요.",
};

export default function GuidePage() {
  const [message, setMessage] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    setMessages([initialMessage]);
    setMessage("");
    setSelectedAsset(null);
    setSessionId(null);
  };

  const getSessionId = async () => {
    if (sessionId) return sessionId;

    const session = await createLearningSession();
    setSessionId(session.id);
    return session.id;
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

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    const startTime = Date.now();

    try {
      const currentSessionId = await getSessionId();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          assetName: selectedAsset,
          agentType: "guide",
          history: messages
            .filter((item) => item.role === "user" || item.role === "assistant")
            .map((item) => ({
              role: item.role,
              content: item.content,
            })),
        }),
      });

      const data = await res.json();
      const time = Date.now() - startTime;

      const answerText =
        data.reply ??
        `${data.error ?? "AI 응답 생성에 실패했습니다."}\n${data.detail ?? ""}`;

      const savedChat = await saveChatHistory({
        session_id: currentSessionId,
        agent_type: "AI 문화해설사",
        asset_name: selectedAsset,
        question: userMessage,
        answer: answerText,
        response_time: time,
        model_name: data.model_name ?? "gpt-5-mini",
        user_role: "student",
        reference_source: data.reference_source ?? "RAG 문서 없음",
        tokens_used: null,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answerText,
          chatId: savedChat.id,
          referenceSource: data.reference_source ?? "",
          referenceFiles: data.reference_files ?? [],
          modelName: data.model_name ?? "gpt-5-mini",
          responseTime: time,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">지역문화자산</h2>

          <button
            onClick={startNewChat}
            className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
          >
            새 대화 시작
          </button>

          <div className="mt-6 space-y-3">
            {assets.map((asset) => (
              <button
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
                  key={index}
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

                    <p className="mt-3 whitespace-pre-line leading-7">
                      {chat.content}
                    </p>

                    {chat.role === "assistant" && chat.referenceSource && (
                      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-semibold text-emerald-700">
                          📚 참고 문서
                        </p>

                        <p className="mt-2 text-sm text-slate-700">
                          {chat.referenceSource}
                        </p>

                        {chat.referenceFiles &&
                          chat.referenceFiles.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {chat.referenceFiles.map((file) =>
                                file.url ? (
                                  <a
                                    key={`${file.title}-${file.url}`}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100"
                                  >
                                    PDF 열기: {file.title}
                                  </a>
                                ) : null
                              )}
                            </div>
                          )}

                        <div className="mt-4 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                          <p>
                            🤖 AI 모델 : <b>{chat.modelName}</b>
                          </p>
                          <p>
                            ⏱ 응답시간 : <b>{chat.responseTime} ms</b>
                          </p>
                        </div>

                        {chat.chatId && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() =>
                                handleFeedback(index, chat.chatId!, "helpful")
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                chat.feedback === "helpful"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white text-emerald-700"
                              }`}
                            >
                              👍 도움됨
                            </button>

                            <button
                              onClick={() =>
                                handleFeedback(index, chat.chatId!, "bad")
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                chat.feedback === "bad"
                                  ? "bg-red-500 text-white"
                                  : "bg-white text-red-500"
                              }`}
                            >
                              👎 부족함
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white p-5 text-slate-500 shadow-sm">
                    AI 문화해설사가 답변을 생성하고 있습니다...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="mt-6 flex gap-3">
              <AppInput
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="궁금한 내용을 입력하세요."
              />

              <AppButton onClick={sendMessage} disabled={loading}>
                {loading ? "생성 중..." : "전송"}
              </AppButton>
            </div>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}