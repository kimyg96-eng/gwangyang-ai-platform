import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const { message, assetName } = await req.json();
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!message) {
      return NextResponse.json({ error: "message가 필요합니다." }, { status: 400 });
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
          content:
            "당신은 광양 지역문화자산을 설명하는 AI 문화해설사입니다. 업로드된 PDF 문서를 우선 근거로 사용하고, 초·중·고 학생이 이해하기 쉽게 설명하세요.",
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