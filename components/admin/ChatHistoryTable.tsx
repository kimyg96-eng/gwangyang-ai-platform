"use client";

import type { ChatHistory } from "@/types/chatHistory";

type ChatHistoryTableProps = {
  chats: ChatHistory[];
  loading: boolean;
};

export default function ChatHistoryTable({
  chats,
  loading,
}: ChatHistoryTableProps) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">AI 학습기록</h2>
      <p className="mt-2 text-sm text-slate-500">
        학습자의 질문, AI 응답, 응답시간, 사용 모델을 확인합니다.
      </p>

      {loading ? (
        <p className="mt-6 text-slate-500">학습기록을 불러오는 중입니다...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-bold">일시</th>
                <th className="p-4 font-bold">AI 유형</th>
                <th className="p-4 font-bold">문화자산</th>
                <th className="p-4 font-bold">질문</th>
                <th className="p-4 font-bold">응답</th>
                <th className="p-4 font-bold">응답시간</th>
                <th className="p-4 font-bold">모델</th>
              </tr>
            </thead>

            <tbody>
              {chats.map((chat) => (
                <tr key={chat.id} className="border-t border-slate-200">
                  <td className="p-4">
                    {new Date(chat.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">{chat.agent_type}</td>
                  <td className="p-4">{chat.asset_name ?? "-"}</td>
                  <td className="p-4">{chat.question}</td>
                  <td className="p-4">{chat.answer}</td>
                  <td className="p-4">
                    {chat.response_time ? `${chat.response_time}ms` : "-"}
                  </td>
                  <td className="p-4">{chat.model_name ?? "-"}</td>
                </tr>
              ))}

              {chats.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    저장된 학습기록이 없습니다.
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