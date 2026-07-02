"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";
import { saveChatHistory } from "@/services/chatService";

const assets = ["매화마을", "섬진강", "백운산", "광양읍성", "정채봉 문학"];

export default function GuidePage() {
  const [message, setMessage] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [reply, setReply] = useState(
    "안녕하세요. 저는 광양 지역문화자산을 안내하는 AI 문화해설사입니다. 매화마을, 섬진강, 백운산, 정채봉 문학에 대해 무엇이든 물어보세요."
  );
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const responseTime = Date.now() - startTime;
      const answerText =
        data.reply ??
        `${data.error ?? "AI 응답 생성에 실패했습니다."}\n${data.detail ?? ""}`;

      setReply(answerText);

      await saveChatHistory({
        agent_type: "AI 문화해설사",
        asset_name: selectedAsset,
        question: message,
        answer: answerText,
        response_time: responseTime,
        model_name: "gpt-5",
        user_role: "student",
        reference_source: "OpenAI API",
        tokens_used: null,
      });
    } catch (error) {
      const errorText = "서버 연결 중 오류가 발생했습니다.";
      setReply(errorText);

      await saveChatHistory({
        agent_type: "AI 문화해설사",
        asset_name: selectedAsset,
        question: message,
        answer: errorText,
        response_time: Date.now() - startTime,
        model_name: "gpt-5",
        user_role: "student",
        reference_source: "OpenAI API",
        tokens_used: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">지역문화자산</h2>

          <div className="mt-6 space-y-3">
            {assets.map((asset) => (
              <button
                key={asset}
                onClick={() => {
                  setSelectedAsset(asset);
                  setMessage(`${asset}에 대해 설명해 주세요.`);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left font-medium ${
                  selectedAsset === asset
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <SectionTitle
            label="AI Cultural Guide"
            title="AI 문화해설사"
            description="광양 지역문화자산에 대해 자유롭게 질문하면 AI 문화해설사가 역사·문화·생태적 의미를 설명합니다."
          />

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 문화해설사</p>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                {reply}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <AppInput
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="궁금한 내용을 입력하세요."
              />

              <AppButton onClick={sendMessage} disabled={loading}>
                {loading ? "저장 중..." : "전송"}
              </AppButton>
            </div>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}