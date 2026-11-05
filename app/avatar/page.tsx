"use client";

import { useRef, useState } from "react";

import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";
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
    "안녕하세요. 저는 정채봉 작가의 삶과 작품세계를 안내하는 AI 아바타입니다. 작품에 담긴 사랑, 나눔, 자연의 의미에 대해 함께 이야기해 봅시다.",
};

export default function AvatarPage() {
  const [message, setMessage] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  const sessionPromiseRef = useRef<Promise<string | null> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startNewChat = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setMessages([initialMessage]);
    setMessage("");
    setSelectedTopic(null);
    setSessionId(null);
    setLoading(false);
    sessionPromiseRef.current = null;
  };

  const getSessionId = async (): Promise<string | null> => {
    if (sessionId) return sessionId;
    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = createLearningSession()
        .then((session) => {
          setSessionId(session.id);
          return session.id as string;
        })
        .catch((error: unknown) => {
          console.error("[Avatar] 학습 세션 생성 실패 (대화는 계속 진행):", error);
          return null;
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
