"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import SectionTitle from "@/components/ui/SectionTitle";
import { saveChatHistory } from "@/services/chatService";

const assets = ["매화마을", "섬진강", "백운산", "광양읍성", "정채봉 문학"];

type ReferenceFile = {
  title: string;
  url: string | null;
};

export default function GuidePage() {
  const [message, setMessage] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [reply, setReply] = useState(
    "안녕하세요. 저는 광양 지역문화자산을 안내하는 AI 문화해설사입니다. 매화마을, 섬진강, 백운산, 정채봉 문학에 대해 무엇이든 물어보세요."
  );

  const [referenceSource, setReferenceSource] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [modelName, setModelName] = useState("");
  const [responseTime, setResponseTime] = useState<number | null>(null);
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
        body: JSON.stringify({
          message,
          assetName: selectedAsset,
        }),
      });

      const data = await res.json();
      const time = Date.now() - startTime;

      const answerText =
        data.reply ??
        `${data.error ?? "AI 응답 생성에 실패했습니다."}\n${data.detail ?? ""}`;

      setReply(answerText);
      setResponseTime(time);
      setReferenceSource(data.reference_source ?? "");
      setReferenceFiles(data.reference_files ?? []);
      setModelName(data.model_name ?? "gpt-5-mini");

      await saveChatHistory({
        agent_type: "AI 문화해설사",
        asset_name: selectedAsset,
        question: message,
        answer: answerText,
        response_time: time,
        model_name: data.model_name ?? "gpt-5-mini",
        user_role: "student",
        reference_source: data.reference_source ?? "RAG 문서 없음",
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
            description="광양 지역문화자산에 대해 질문하면 업로드된 PDF 문서를 기반으로 답변합니다."
          />

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-700">AI 문화해설사</p>

              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                {reply}
              </p>

              {referenceSource && (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">
                    📚 참고 문서
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {referenceSource}
                  </p>

                  {referenceFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {referenceFiles.map((file) =>
                        file.url ? (
                          <a
                            key={`${file.title}-${file.url}`}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100"
                          >
                            PDF 열기: {file.title}
                          </a>
                        ) : null
                      )}
                    </div>
                  )}

                  <div className="mt-4 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                    <p>
                      🤖 AI 모델 : <b>{modelName}</b>
                    </p>
                    <p>
                      ⏱ 응답시간 : <b>{responseTime} ms</b>
                    </p>
                  </div>
                </div>
              )}
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
                {loading ? "답변 생성 중..." : "전송"}
              </AppButton>
            </div>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}