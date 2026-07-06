"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppTextarea from "@/components/ui/AppTextarea";
import SectionTitle from "@/components/ui/SectionTitle";
import { saveImageResult } from "@/services/imageService";

const themes = ["매화마을", "섬진강", "백운산", "정채봉 문학"];
const styles = ["수채화", "일러스트", "동화책", "애니메이션", "사실적 표현"];

const examples = [
  "봄날의 매화마을과 섬진강을 배경으로 아이들이 산책하는 모습",
  "섬진강을 따라 걷는 소년과 반짝이는 물결",
  "백운산 숲속에서 친구들이 자연을 관찰하는 장면",
  "정채봉 동화 속 따뜻한 마을과 아이들",
];

export default function ImagePage() {
  const [theme, setTheme] = useState(themes[0]);
  const [style, setStyle] = useState(styles[0]);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert("이미지 프롬프트를 입력해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          prompt: `${prompt}\n표현 스타일: ${style}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "이미지 생성에 실패했습니다.");
        return;
      }

      setImageUrl(data.image_url);
      setFinalPrompt(data.prompt);

      await saveImageResult({
        theme,
        prompt: data.prompt,
        image_url: data.image_url,
        model_name: data.model_name ?? "gpt-image-1",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank");
  };

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="AI Image Generation"
          title="AI 이미지 생성"
          description="학습자가 상상한 광양 지역문화 장면을 텍스트로 입력하면, 생성형 AI를 통해 이미지로 시각화하는 창작 학습 공간입니다."
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">이미지 생성 설정</h2>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            주제 선택
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {themes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            프롬프트 입력
          </label>
          <div className="mt-2">
            <AppTextarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 봄날의 매화마을과 섬진강을 배경으로 아이들이 산책하는 모습"
            />
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            표현 스타일
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {styles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <div className="mt-6">
            <AppButton onClick={generateImage} disabled={loading}>
              {loading ? "이미지 생성 중..." : "이미지 생성하기"}
            </AppButton>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="font-bold">프롬프트 예시</p>
            <div className="mt-3 space-y-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  className="block text-left text-sm text-slate-600 hover:text-emerald-600"
                >
                  · {example}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">생성 이미지</h2>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="AI 생성 이미지"
                className="w-full rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                <div className="text-center">
                  <p className="font-bold text-slate-700">이미지 대기 중</p>
                  <p className="mt-2 text-sm text-slate-500">
                    왼쪽에서 프롬프트를 입력한 뒤 이미지를 생성해 주세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          {finalPrompt && (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">
                생성 프롬프트
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                {finalPrompt}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <AppButton
              variant="secondary"
              onClick={generateImage}
              disabled={loading}
            >
              다시 생성
            </AppButton>

            <AppButton
              variant="secondary"
              onClick={downloadImage}
              disabled={!imageUrl}
            >
              다운로드
            </AppButton>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}