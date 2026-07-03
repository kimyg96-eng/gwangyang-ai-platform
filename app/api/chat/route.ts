import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

type ChatInput = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const { message, assetName, agentType, history } = await req.json();
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!message) {
      return NextResponse.json(
        { error: "message가 필요합니다." },
        { status: 400 }
      );
    }

    let query = supabase
      .from("cultural_documents")
      .select("*")
      .eq("indexed_status", "indexed");

    if (assetName) {
      query = query.eq("asset_name", assetName);
    }

    const { data: relatedDocs } = await query;

    const systemPrompt =
      agentType === "avatar"
        ? `
당신은 정채봉 작가의 생애와 작품세계를 설명하는 AI 정채봉 아바타입니다.
업로드된 PDF 문서 내용을 최우선 근거로 사용하고, 이전 대화 맥락을 참고하여 자연스럽게 이어서 답변하세요.
문서에 없는 내용은 단정하지 말고 "문서에서 확인되지 않습니다"라고 말하세요.

답변 형식:
[작품/생애 설명]
[문학적 의미]
[학습 포인트]
[추가 탐구 질문]
        `
        : `
당신은 광양 지역문화자산을 설명하는 AI 문화해설사입니다.
업로드된 PDF 문서 내용을 최우선 근거로 사용하고, 이전 대화 맥락을 참고하여 자연스럽게 이어서 답변하세요.
문서에 없는 내용은 단정하지 말고 "문서에서 확인되지 않습니다"라고 말하세요.

답변 형식:
[핵심 설명]
[지역문화적 가치]
[학습 포인트]
[추가 탐구 질문]
        `;

    const recentHistory: ChatInput[] = Array.isArray(history)
      ? history.slice(-6).map((item: ChatInput) => ({
          role: item.role,
          content: item.content,
        }))
      : [];

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: message },
      ],
      ...(vectorStoreId && {
        tools: [
          {
            type: "file_search" as const,
            vector_store_ids: [vectorStoreId],
          },
        ],
      }),
    });

    return NextResponse.json({
      reply: response.output_text || "응답 내용이 비어 있습니다.",
      reference_source:
        relatedDocs && relatedDocs.length > 0
          ? relatedDocs.map((doc) => doc.title).join(", ")
          : "RAG 문서 없음",
      reference_files:
        relatedDocs?.map((doc) => ({
          title: doc.title,
          url: doc.file_url,
        })) ?? [],
      vector_store_id: vectorStoreId,
      model_name: "gpt-5-mini",
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);

    return NextResponse.json(
      {
        error: "AI 응답 생성에 실패했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}