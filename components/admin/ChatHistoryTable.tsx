"use client";

import { useMemo, useState } from "react";
import type { ChatHistory } from "@/types/chatHistory";

type ChatHistoryTableProps = {
  chats: ChatHistory[];
  loading: boolean;
};

export default function ChatHistoryTable({
  chats,
  loading,
}: ChatHistoryTableProps) {
  const [keyword, setKeyword] = useState("");

  const filteredChats = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return chats;

    return chats.filter((chat) => {
      return (
        chat.question.toLowerCase().includes(q) ||
        (chat.answer ?? "").toLowerCase().includes(q) ||
        (chat.asset_name ?? "").toLowerCase().includes(q) ||
        chat.agent_type.toLowerCase().includes(q) ||
        (chat.model_name ?? "").toLowerCase().includes(q) ||
        (chat.reference_source ?? "").toLowerCase().includes(q)
      );
    });
  }, [chats, keyword]);

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 학습기록</h2>
          <p className="mt-2 text-sm text-slate-500">
            총 {chats.length}건 중 {filteredChats.length}건 표시
          </p>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 md:w-96"
          placeholder="질문, 응답, 문화자산명, 출처 검색"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">학습기록을 불러오는 중입니다...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1300px] border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-bold">일시</th>
                <th className="p-4 font-bold">AI 유형</th>
                <th className="p-4 font-bold">문화자산</th>
                <th className="p-4 font-bold">질문</th>
                <th className="p-4 font-bold">응답</th>
                <th className="p-4 font-bold">RAG 출처</th>
                <th className="p-4 font-bold">응답시간</th>
                <th className="p-4 font-bold">모델</th>
              </tr>
            </thead>

            <tbody>
              {filteredChats.map((chat) => (
                <tr key={chat.id} className="border-t border-slate-200">
                  <td className="p-4">
                    {new Date(chat.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">{chat.agent_type}</td>
                  <td className="p-4">{chat.asset_name ?? "-"}</td>
                  <td className="p-4">{chat.question}</td>
                  <td className="p-4">{chat.answer}</td>
                  <td className="p-4 font-semibold text-emerald-700">
                    {chat.reference_source ?? "-"}
                  </td>
                  <td className="p-4">
                    {chat.response_time ? `${chat.response_time}ms` : "-"}
                  </td>
                  <td className="p-4">{chat.model_name ?? "-"}</td>
                </tr>
              ))}

              {filteredChats.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
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