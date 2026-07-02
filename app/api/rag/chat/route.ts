import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const { message, assetName } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "message가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: documents, error } = await supabase
      .from("cultural_documents")
      .select("*")
      .eq("indexed_status", "indexed")
      .not("vector_store_id", "is", null);

    if (error) {
      return NextResponse.json(
        { error: "문서 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const relatedDocs = assetName
      ? documents.filter((doc) => doc.asset_name === assetName)
      : documents;

    const vectorStoreIds = Array.from(
      new Set(
        relatedDocs
          .map((doc) => doc.vector_store_id)
          .filter(Boolean)
      )
    );

    if (vectorStoreIds.length === 0) {
      return NextResponse.json(
        { error: "색인된 RAG 문서가 없습니다." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "당신은 광양 지역문화자산을 설명하는 AI 문화해설사입니다. 반드시 업로드된 문서 검색 결과를 우선 근거로 사용하고, 초·중·고 학생이 이해하기 쉽게 설명하세요. 답변 마지막에는 '추가 탐구 질문'을 1개 제시하세요.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: vectorStoreIds,
        },
      ],
    });

    return NextResponse.json({
      reply: response.output_text,
      reference_source: relatedDocs.map((doc) => doc.title).join(", "),
      vector_store_id: vectorStoreIds.join(","),
    });
  } catch (error) {
    console.error("RAG chat error:", error);

    return NextResponse.json(
      { error: "RAG 답변 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}