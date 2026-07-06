import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const {
      theme,
      storyType,
      targetLevel,
      storyLength,
      character,
      idea,
    } = await req.json();

    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    let query = supabase
      .from("cultural_documents")
      .select("*")
      .eq("indexed_status", "indexed");

    if (theme) {
      query = query.eq("asset_name", theme);
    }

    const { data: relatedDocs } = await query;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
당신은 광양 지역문화자산을 활용해 교육용 창작 이야기를 만드는 AI 스토리 작가입니다.

작성 규칙:
1. 업로드된 PDF 문서 내용을 우선 참고합니다.
2. 광양 지역문화자산의 의미가 자연스럽게 드러나야 합니다.
3. ${targetLevel}이 이해하기 쉬운 문장으로 작성합니다.
4. 이야기 유형은 "${storyType}"입니다.
5. 이야기 길이는 "${storyLength}" 기준으로 작성합니다.
6. 마지막에는 [학습 메시지]를 포함합니다.

출력 형식:
[제목]

[이야기]

[학습 메시지]
          `,
        },
        {
          role: "user",
          content: `
주제: ${theme}
등장인물: ${character}
아이디어: ${idea}
          `,
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
      story: response.output_text || "스토리 생성 결과가 비어 있습니다.",
      reference_source:
        relatedDocs && relatedDocs.length > 0
          ? relatedDocs.map((doc) => doc.title).join(", ")
          : "RAG 문서 없음",
      model_name: "gpt-5-mini",
    });
  } catch (error) {
    console.error("Story API Error:", error);

    return NextResponse.json(
      {
        error: "스토리 생성에 실패했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}