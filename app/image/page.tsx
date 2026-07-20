"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppTextarea from "@/components/ui/AppTextarea";
import LoadingState from "@/components/ui/LoadingState";
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

type ImageApiResponse = {
  image_url?: string;
  prompt?: string;
  model_name?: string;
  error?: string;
  detail?: string;
};

type ImageWorkspaceProps = {
  initialTheme: string;
};

function ImageWorkspace({ initialTheme }: ImageWorkspaceProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [style, setStyle] = useState(styles[0]);
  const [prompt, setPrompt] = useState(() =>
    initialTheme
      ? `${initialTheme}을 배경으로 학생들이 지역문화를 배우는 따뜻한 교육용 삽화`
      : ""
  );
  const [imageUrl, setImageUrl] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleThemeChange = (nextTheme: string) => {
    setTheme(nextTheme);
    setPrompt(
      `${nextTheme}을 배경으로 학생들이 지역문화를 배우는 따뜻한 교육용 삽화`
    );
    setImageUrl("");
    setFinalPrompt("");
    setErrorMessage("");
  };

  const generateImage = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      alert("이미지 프롬프트를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          prompt: `${trimmedPrompt}\n표현 스타일: ${style}`,
        }),
      });

      const data = (await res.json()) as ImageApiResponse;

      if (!res.ok || !data.image_url || !data.prompt) {
        throw new Error(
          [data.error ?? "이미지 생성에 실패했습니다.", data.detail]
            .filter(Boolean)
            .join("\n")
        );
      }

      setImageUrl(data.image_url);
      setFinalPrompt(data.prompt);

      await saveImageResult({
        theme,
        prompt: data.prompt,
        image_url: data.image_url,
        model_name: data.model_name ?? "gpt-image-1",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "이미지 생성 중 알 수 없는 오류가 발생했습니다.";

      console.error("Failed to generate image:", error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const openImage = () => {
    if (!imageUrl) return;

    window.open(imageUrl, "_blank", "noopener,noreferrer");
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
            onChange={(event) => handleThemeChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {themes.includes(theme) ? null : <option value={theme}>{theme}</option>}
            {themes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            프롬프트 입력
          </label>
          <div className="mt-2">
            <AppTextarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="예: 봄날의 매화마을과 섬진강을 배경으로 아이들이 산책하는 모습"
            />
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            표현 스타일
          </label>
          <select
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {styles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="mt-6">
            <AppButton onClick={() => void generateImage()} disabled={loading}>
              {loading ? "이미지 생성 중..." : "이미지 생성하기"}
            </AppButton>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="font-bold">프롬프트 예시</p>
            <div className="mt-3 space-y-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
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
            {loading ? (
              <div className="flex h-[520px] items-center justify-center rounded-2xl bg-white">
                <LoadingState message="AI가 이미지를 생성하고 있습니다..." />
              </div>
            ) : imageUrl ? (
              // 생성 이미지 URL은 외부 공급자와 Supabase Storage 등 동적 호스트를 사용할 수 있어 일반 img를 사용합니다.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${theme} AI 생성 이미지`}
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

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

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
              onClick={() => void generateImage()}
              disabled={loading || !prompt.trim()}
            >
              다시 생성
            </AppButton>

            <AppButton
              variant="secondary"
              onClick={openImage}
              disabled={!imageUrl}
            >
              새 창에서 열기
            </AppButton>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}

function ImagePageContent() {
  const searchParams = useSearchParams();
  const initialTheme = searchParams.get("theme")?.trim() || themes[0];

  return <ImageWorkspace key={initialTheme} initialTheme={initialTheme} />;
}

export default function ImagePage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <LoadingState message="이미지 생성 화면을 불러오고 있습니다..." />
          </div>
        </PageLayout>
      }
    >
      <ImagePageContent />
    </Suspense>
  );
}