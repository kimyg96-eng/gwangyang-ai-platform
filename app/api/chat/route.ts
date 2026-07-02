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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { data: documents } = await supabase
      .from("cultural_documents")
      .select("*")
      .eq("indexed_status", "indexed")
      .not("vector_store_id", "is", null);

    const relatedDocs = assetName
      ? (documents ?? []).filter((doc) => doc.asset_name === assetName)
      : documents ?? [];

    const vectorStoreIds = Array.from(
      new Set(
        relatedDocs
          .map((doc) => doc.vector_store_id)
          .filter(Boolean)
      )
    );

    const input = [
      {
        role: "system" as const,
        content:
          "당신은 광양 지역문화자산을 설명하는 AI 문화해설사입니다. 초·중·고 학생이 이해하기 쉽게 설명하고, 광양의 매화마을, 섬진강, 백운산, 정채봉 문학과 연결하여 교육적으로 답변하세요. 색인된 문서가 제공되면 문서 내용을 우선 근거로 사용하세요.",
      },
      {
        role: "user" as const,
        content: message,
      },
    ];

    const response =
      vectorStoreIds.length > 0
        ? await openai.responses.create({
            model: "gpt-5-mini",
            input,
            tools: [
              {
                type: "file_search",
                vector_store_ids: vectorStoreIds,
              },
            ],
          })
        : await openai.responses.create({
            model: "gpt-5-mini",
            input,
          });

    return NextResponse.json({
      reply: response.output_text || "응답 내용이 비어 있습니다.",
      reference_source:
        relatedDocs.length > 0
          ? relatedDocs.map((doc) => doc.title).join(", ")
          : "RAG 문서 없음",
      vector_store_id: vectorStoreIds.join(","),
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