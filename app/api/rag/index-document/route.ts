import { NextResponse } from "next/server";
import { toFile } from "openai";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "OPENAI_VECTOR_STORE_ID가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { data: document, error } = await supabase
      .from("cultural_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (error || !document) {
      return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
    }

    if (!document.file_url) {
      return NextResponse.json({ error: "PDF 파일 URL이 없습니다." }, { status: 400 });
    }

    await supabase
      .from("cultural_documents")
      .update({ indexed_status: "indexing" })
      .eq("id", documentId);

    let openaiFileId = document.openai_file_id;

    if (!openaiFileId) {
      const pdfResponse = await fetch(document.file_url);
      const buffer = Buffer.from(await pdfResponse.arrayBuffer());

      const uploadedFile = await openai.files.create({
        file: await toFile(buffer, `${document.title}.pdf`),
        purpose: "assistants",
      });

      openaiFileId = uploadedFile.id;
    }

    await openai.vectorStores.files.create(vectorStoreId, {
      file_id: openaiFileId,
    });

    await supabase
      .from("cultural_documents")
      .update({
        openai_file_id: openaiFileId,
        vector_store_id: vectorStoreId,
        indexed_status: "indexed",
        indexed_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    return NextResponse.json({
      success: true,
      openai_file_id: openaiFileId,
      vector_store_id: vectorStoreId,
    });
  } catch (error) {
    console.error("RAG indexing error:", error);

    return NextResponse.json(
      { error: "RAG 색인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}