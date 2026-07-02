import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const { message, assetName } = await req.json();
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

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
당신은 광양 지역문화자산을 설명하는 AI 문화해설사입니다.

답변 규칙:
1. 업로드된 PDF 문서 내용을 최우선 근거로 사용합니다.
2. 문서에 없는 내용은 단정하지 말고 "문서에서 확인되지 않습니다"라고 말합니다.
3. 초·중·고 학생이 이해하기 쉽게 설명합니다.
4. 답변은 다음 형식으로 작성합니다.

[핵심 설명]
문화자산의 의미를 쉽게 설명합니다.

[지역문화적 가치]
광양 지역과 어떤 관련이 있는지 설명합니다.

[학습 포인트]
학생이 배울 수 있는 내용을 2~3개 제시합니다.

[추가 탐구 질문]
학생이 더 생각해 볼 질문 1개를 제시합니다.
          `,
        },
        {
          role: "user",
          content: message,
        },
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