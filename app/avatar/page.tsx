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
