"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppTextarea from "@/components/ui/AppTextarea";
import SectionTitle from "@/components/ui/SectionTitle";
import { saveStoryResult } from "@/services/storyService";

const themes = ["매화마을", "섬진강", "백운산", "정채봉 문학"];
const types = ["동화", "모험 이야기", "환경 이야기", "우정 이야기"];
const levels = ["초등학생", "중학생", "고등학생"];
const lengths = ["짧게 (약 500자)", "보통 (약 1000자)", "길게 (약 2000자)"];

export default function StoryPage() {
  const [theme, setTheme] = useState(themes[0]);
  const [storyType, setStoryType] = useState(types[0]);
  const [targetLevel, setTargetLevel] = useState(levels[0]);
  const [storyLength, setStoryLength] = useState(lengths[1]);
  const [character, setCharacter] = useState("");
  const [idea, setIdea] = useState("");
  const [story, setStory] = useState("");
  const [referenceSource, setReferenceSource] = useState("");
  const [loading, setLoading] = useState(false);

  const generateStory = async () => {
    if (!character.trim() || !idea.trim()) {
      alert("등장인물과 이야기 아이디어를 입력해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          storyType,
          targetLevel,
          storyLength,
          character,
          idea,
        }),
      });

      const data = await res.json();

      setStory(
        data.story ??
          `${data.error ?? "스토리 생성에 실패했습니다."}\n${data.detail ?? ""}`
      );
      setReferenceSource(data.reference_source ?? "");
        await saveStoryResult({
          theme,
          story_type: storyType,
          target_level: targetLevel,
          story_length: storyLength,
          character,
          idea,
          story:
            data.story ??
            `${data.error ?? "스토리 생성에 실패했습니다."}\n${data.detail ?? ""}`,
          reference_source: data.reference_source ?? "",
          model_name: data.model_name ?? "gpt-5-mini",
        });
        console.log("스토리 저장 완료");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <SectionTitle
          label="AI Story Generation"
          title="AI 스토리 생성"
          description="광양 지역문화자산과 정채봉 문학 콘텐츠를 소재로 RAG 기반 교육용 이야기를 생성합니다."
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">스토리 설정</h2>

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
            이야기 유형
          </label>
          <select
            value={storyType}
            onChange={(e) => setStoryType(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            학습 대상
          </label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {levels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            이야기 길이
          </label>
          <select
            value={storyLength}
            onChange={(e) => setStoryLength(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {lengths.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            등장인물
          </label>
          <div className="mt-2">
            <AppInput
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="예: 섬진강을 좋아하는 소년 민우"
            />
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            이야기 아이디어
          </label>
          <div className="mt-2">
            <AppTextarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="예: 민우가 섬진강에서 신비한 물고기를 만나 자연을 지키는 방법을 배우는 이야기"
            />
          </div>

          <div className="mt-6">
            <AppButton onClick={generateStory} disabled={loading}>
              {loading ? "스토리 생성 중..." : "스토리 생성하기"}
            </AppButton>
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">생성된 이야기</h2>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            {story ? (
              <>
                <p className="text-sm font-semibold text-emerald-600">
                  주제: {theme} / 유형: {storyType}
                </p>

                <div className="mt-5 whitespace-pre-line leading-8 text-slate-700">
                  {story}
                </div>

                {referenceSource && (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      📚 참고 문서
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {referenceSource}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="leading-7 text-slate-500">
                왼쪽에서 주제, 이야기 유형, 학습 대상, 등장인물과 아이디어를
                입력한 뒤 스토리 생성하기를 눌러주세요.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AppButton
              variant="secondary"
              onClick={generateStory}
              disabled={loading}
            >
              다시 생성
            </AppButton>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}