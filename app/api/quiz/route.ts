import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const {
      theme,
      targetLevel,
      quizType,
      sourceStoryId,
      storyText,
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
당신은 광양 지역문화자산 학습용 퀴즈를 만드는 AI 교사입니다.

규칙:
1. 업로드된 PDF 문서와 제공된 스토리를 참고합니다.
2. ${targetLevel} 수준에 맞게 문제를 만듭니다.
3. 문제 유형은 "${quizType}"입니다.
4. 반드시 JSON 형식으로만 응답합니다.
5. 문제는 5개 생성합니다.

JSON 형식:
[
  {
    "question": "문제 내용",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "answer": "정답",
    "explanation": "해설"
  }
]
          `,
        },
        {
          role: "user",
          content: `
주제: ${theme}

참고 스토리:
${storyText ?? "제공된 스토리 없음"}
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

    const text = response.output_text || "[]";

    let quizzes;

    try {
      quizzes = JSON.parse(text);
    } catch {
      quizzes = [];
    }

    return NextResponse.json({
      quizzes,
      raw: text,
      theme,
      target_level: targetLevel,
      quiz_type: quizType,
      source_story_id: sourceStoryId ?? null,
      reference_source:
        relatedDocs && relatedDocs.length > 0
          ? relatedDocs.map((doc) => doc.title).join(", ")
          : "RAG 문서 없음",
      model_name: "gpt-5-mini",
    });
  } catch (error) {
    console.error("Quiz API Error:", error);

    return NextResponse.json(
      {
        error: "퀴즈 생성에 실패했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}