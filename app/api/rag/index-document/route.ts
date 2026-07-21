import { NextResponse } from "next/server";
import { toFile } from "openai";

import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

type IndexDocumentRequest = {
  documentId?: unknown;
};

function normalizeDocumentId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  let documentId = "";

  try {
    const body = (await req.json()) as IndexDocumentRequest;
    documentId = normalizeDocumentId(body.documentId);
    console.log("RAG 색인 요청:", {
      rawDocumentId: body.documentId,
      normalizedDocumentId: documentId,
    });

    if (!documentId) {
      return NextResponse.json(
        {
          error: "documentId가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    const vectorStoreId =
      process.env.OPENAI_VECTOR_STORE_ID?.trim();

    if (!vectorStoreId) {
      return NextResponse.json(
        {
          error: "OPENAI_VECTOR_STORE_ID가 설정되지 않았습니다.",
        },
        {
          status: 500,
        }
      );
    }

    const { data: document, error: documentError } =
      await supabase
        .from("cultural_documents")
        .select(
          "id, title, file_url, openai_file_id, indexed_status"
        )
        .eq("id", documentId)
        .single();

      console.log("RAG 문서 조회 결과:", {
        documentId,
        document,
        documentError,
      });
    if (documentError) {
  console.error("색인 대상 문서 조회 실패:", documentError);

  return NextResponse.json(
    {
      error: "문서 조회 중 데이터베이스 오류가 발생했습니다.",
      detail: documentError.message,
    },
    {
      status: 500,
    }
  );
}

if (!document) {
  return NextResponse.json(
    {
      error: "문서를 찾을 수 없습니다.",
    },
    {
      status: 404,
    }
  );
}

    if (!document.file_url) {
      return NextResponse.json(
        {
          error: "PDF 파일 URL이 없습니다.",
        },
        {
          status: 400,
        }
      );
    }

    const { error: indexingStatusError } = await supabase
      .from("cultural_documents")
      .update({
        indexed_status: "indexing",
      })
      .eq("id", documentId);

    if (indexingStatusError) {
      throw new Error(
        `색인 상태 변경 실패: ${indexingStatusError.message}`
      );
    }

    let openaiFileId =
      typeof document.openai_file_id === "string"
        ? document.openai_file_id
        : "";

    if (!openaiFileId) {
      const pdfResponse = await fetch(document.file_url);

      if (!pdfResponse.ok) {
        throw new Error(
          `PDF 다운로드 실패: ${pdfResponse.status} ${pdfResponse.statusText}`
        );
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const buffer = Buffer.from(pdfArrayBuffer);

      if (buffer.length === 0) {
        throw new Error("다운로드된 PDF 파일이 비어 있습니다.");
      }

      const safeTitle =
        typeof document.title === "string" &&
        document.title.trim()
          ? document.title.trim()
          : "cultural-document";

      const uploadedFile = await openai.files.create({
        file: await toFile(
          buffer,
          safeTitle.toLowerCase().endsWith(".pdf")
            ? safeTitle
            : `${safeTitle}.pdf`,
          {
            type: "application/pdf",
          }
        ),
        purpose: "assistants",
      });

      openaiFileId = uploadedFile.id;

      const { error: fileIdSaveError } = await supabase
        .from("cultural_documents")
        .update({
          openai_file_id: openaiFileId,
          vector_store_id: vectorStoreId,
        })
        .eq("id", documentId);

      if (fileIdSaveError) {
        throw new Error(
          `OpenAI 파일 정보 저장 실패: ${fileIdSaveError.message}`
        );
      }
    }

    const indexedFile =
      await openai.vectorStores.files.createAndPoll(
        vectorStoreId,
        {
          file_id: openaiFileId,
        }
      );

    if (indexedFile.status !== "completed") {
      throw new Error(
        `Vector Store 색인이 완료되지 않았습니다. 현재 상태: ${indexedFile.status}`
      );
    }

    const { error: indexedStatusError } = await supabase
      .from("cultural_documents")
      .update({
  openai_file_id: openaiFileId,
  vector_store_id: vectorStoreId,
  indexed_status: "indexed",
  indexed_at: new Date().toISOString(),
  indexing_error: null,
})
      .eq("id", documentId);

    if (indexedStatusError) {
      throw new Error(
        `색인 완료 상태 저장 실패: ${indexedStatusError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "문서 색인이 완료되었습니다.",
      document_id: documentId,
      openai_file_id: openaiFileId,
      vector_store_id: vectorStoreId,
      indexed_status: indexedFile.status,
    });
  } catch (error) {
    console.error("RAG indexing error:", error);

    if (documentId) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  const { error: failedStatusError } = await supabase
    .from("cultural_documents")
    .update({
      indexed_status: "failed",
      indexing_error: errorMessage,
    })
    .eq("id", documentId);

  if (failedStatusError) {
    console.error(
      "색인 실패 상태 저장 오류:",
      failedStatusError
    );
  }
}

    return NextResponse.json(
      {
        error: "RAG 색인 중 오류가 발생했습니다.",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}