import { NextResponse } from "next/server";
import { toFile } from "openai";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: document, error: documentError } = await supabase
      .from("cultural_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "문서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!document.file_url) {
      return NextResponse.json(
        { error: "PDF 파일 URL이 없습니다." },
        { status: 400 }
      );
    }

    await supabase
      .from("cultural_documents")
      .update({ indexed_status: "indexing" })
      .eq("id", documentId);

    const pdfResponse = await fetch(document.file_url);

    if (!pdfResponse.ok) {
      throw new Error("PDF 파일을 다운로드할 수 없습니다.");
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedFile = await openai.files.create({
      file: await toFile(buffer, `${document.title}.pdf`),
      purpose: "assistants",
    });

    const vectorStore = await openai.vectorStores.create({
      name: `gwangyang-${document.asset_name ?? "document"}-${Date.now()}`,
    });

    await openai.vectorStores.files.create(vectorStore.id, {
      file_id: uploadedFile.id,
    });

    await supabase
      .from("cultural_documents")
      .update({
        openai_file_id: uploadedFile.id,
        vector_store_id: vectorStore.id,
        indexed_status: "indexed",
        indexed_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    return NextResponse.json({
      success: true,
      openai_file_id: uploadedFile.id,
      vector_store_id: vectorStore.id,
    });
  } catch (error) {
    console.error("RAG indexing error:", error);

    return NextResponse.json(
      { error: "RAG 색인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}