"use client";

import { useMemo, useState } from "react";
import type { CulturalDocument } from "@/types/culturalDocument";
import { deleteCulturalDocument } from "@/services/documentService";

type DocumentTableProps = {
  documents: CulturalDocument[];
  loading: boolean;
};

function getStatusLabel(status: string | null) {
  switch (status) {
    case "indexed":
      return "색인 완료";
    case "indexing":
      return "색인 중";
    case "failed":
      return "실패";
    default:
      return "대기";
  }
}

function getStatusClass(status: string | null) {
  switch (status) {
    case "indexed":
      return "bg-emerald-100 text-emerald-700";
    case "indexing":
      return "bg-blue-100 text-blue-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function DocumentTable({
  documents,
  loading,
}: DocumentTableProps) {
  const [keyword, setKeyword] = useState("");
  const [indexingId, setIndexingId] = useState<string | null>(null);

  const filteredDocuments = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return documents;

    return documents.filter((doc) => {
      return (
        (doc.asset_name ?? "").toLowerCase().includes(q) ||
        doc.title.toLowerCase().includes(q) ||
        (doc.content ?? "").toLowerCase().includes(q)
      );
    });
  }, [documents, keyword]);

  const handleIndex = async (id: string) => {
    setIndexingId(id);

    try {
      const res = await fetch("/api/rag/index-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "RAG 색인 중 오류가 발생했습니다.");
        return;
      }

      alert("RAG 색인이 완료되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("RAG 색인 요청 중 오류가 발생했습니다.");
    } finally {
      setIndexingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteCulturalDocument(id);
    alert("삭제되었습니다.");
    window.location.reload();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">등록된 PDF 문서 목록</h2>
          <p className="mt-2 text-sm text-slate-500">
            총 {documents.length}건 중 {filteredDocuments.length}건 표시
          </p>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 md:w-96"
          placeholder="문화자산명, 문서 제목, 설명 검색"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">
          문서 데이터를 불러오는 중입니다...
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-bold">문화자산</th>
                <th className="p-4 font-bold">문서 제목</th>
                <th className="p-4 font-bold">파일 크기</th>
                <th className="p-4 font-bold">색인 상태</th>
                <th className="p-4 font-bold">업로드 일시</th>
                <th className="p-4 font-bold">파일</th>
                <th className="p-4 text-center font-bold">관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((doc) => {
                const isIndexing = indexingId === doc.id;

                return (
                  <tr key={doc.id} className="border-t border-slate-200">
                    <td className="p-4">{doc.asset_name}</td>
                    <td className="p-4 font-semibold">{doc.title}</td>
                    <td className="p-4">
                      {doc.file_size
                        ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`
                        : "-"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          isIndexing ? "indexing" : doc.indexed_status ?? "pending"
                        )}`}
                      >
                       {isIndexing
  ? "색인 중"
  : doc.indexed_status ?? "pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      {doc.uploaded_at
                        ? new Date(doc.uploaded_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-emerald-600"
                        >
                          PDF 보기
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleIndex(doc.id)}
                        disabled={isIndexing}
                        className="mr-2 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:bg-slate-400"
                      >
                        {isIndexing ? "색인 중..." : "RAG 색인"}
                      </button>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}