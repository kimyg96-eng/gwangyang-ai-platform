"use client";

import { useEffect, useRef, useState } from "react";
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

const topics = ["작가의 생애", "주요 작품", "오세암", "자연과 인간", "나눔과 배려"];

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
    "안녕하세요. 저는 정채봉 작가의 삶과 작품세계를 안내하는 AI 아바타입니다. 작품에 담긴 사랑, 나눔, 자연의 의미에 대해 함께 이야기해 봅시다.",
};

export default function AvatarPage() {
  const [message, setMessage] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    setMessages([initialMessage]);
    setMessage("");
    setSelectedTopic(null);
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
          assetName: "정채봉 문학",
          agentType: "avatar",
          history: messages.map((item) => ({
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
        agent_type: "AI 정채봉 아바타",
        asset_name: "정채봉 문학",
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
          <h2 className="text-xl font-bold">대화 주제</h2>

          <button
            onClick={startNewChat}
            className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
          >
            새 대화 시작
          </button>

          <div className="mt-6 space-y-3">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setMessage(`${topic}에 대해 설명해 주세요.`);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left font-medium ${
                  selectedTopic === topic
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <SectionTitle
            label="AI Jeong Chae-bong Avatar"
            title="AI 정채봉 아바타"
            description="정채봉 작가의 생애와 작품세계, 문학적 가치관을 RAG 기반 AI 아바타와의 대화를 통해 이해하는 학습 공간입니다."
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
                      {chat.role === "user" ? "학습자" : "AI 정채봉 아바타"}
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
                    {loading && (
                      <div className="flex justify-start">
                        <LoadingState message="AI 정채봉 아바타가 답변을 생성하고 있습니다..." />
                      </div>
                    )}
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
                placeholder="정채봉 작가에게 질문해 보세요."
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