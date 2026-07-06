"use client";

import { useMemo, useState } from "react";
import type { StoryResult } from "@/types/storyResult";
import { deleteStoryResult } from "@/services/storyService";

type StoryResultTableProps = {
  stories: StoryResult[];
  loading: boolean;
};

export default function StoryResultTable({
  stories,
  loading,
}: StoryResultTableProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedStory, setSelectedStory] = useState<StoryResult | null>(null);

  const filteredStories = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return stories;

    return stories.filter((story) => {
      return (
        (story.theme ?? "").toLowerCase().includes(q) ||
        (story.story_type ?? "").toLowerCase().includes(q) ||
        (story.target_level ?? "").toLowerCase().includes(q) ||
        (story.character ?? "").toLowerCase().includes(q) ||
        (story.idea ?? "").toLowerCase().includes(q) ||
        (story.story ?? "").toLowerCase().includes(q)
      );
    });
  }, [stories, keyword]);

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteStoryResult(id);
    alert("삭제되었습니다.");
    window.location.reload();
  };

  const copyStory = async () => {
    if (!selectedStory?.story) return;

    await navigator.clipboard.writeText(selectedStory.story);
    alert("스토리가 복사되었습니다.");
  };

  const printStory = () => {
    window.print();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 스토리 관리</h2>
          <p className="mt-2 text-sm text-slate-500">
            총 {stories.length}건 중 {filteredStories.length}건 표시
          </p>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 md:w-96"
          placeholder="주제, 유형, 등장인물, 이야기 내용 검색"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">
          스토리 데이터를 불러오는 중입니다...
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 font-bold">생성일</th>
                <th className="p-4 font-bold">주제</th>
                <th className="p-4 font-bold">유형</th>
                <th className="p-4 font-bold">대상</th>
                <th className="p-4 font-bold">등장인물</th>
                <th className="p-4 font-bold">아이디어</th>
                <th className="p-4 font-bold">스토리</th>
                <th className="p-4 font-bold">참고문서</th>
                <th className="p-4 font-bold">모델</th>
                <th className="p-4 text-center font-bold">관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredStories.map((story) => (
                <tr key={story.id} className="border-t border-slate-200">
                  <td className="p-4">
                    {new Date(story.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">{story.theme ?? "-"}</td>
                  <td className="p-4">{story.story_type ?? "-"}</td>
                  <td className="p-4">{story.target_level ?? "-"}</td>
                  <td className="p-4">{story.character ?? "-"}</td>
                  <td className="p-4">{story.idea ?? "-"}</td>
                  <td className="p-4">
                    <div className="max-h-32 w-80 overflow-y-auto whitespace-pre-line rounded-xl bg-slate-50 p-3 leading-6">
                      {story.story ?? "-"}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-emerald-700">
                    {story.reference_source ?? "-"}
                  </td>
                  <td className="p-4">{story.model_name ?? "-"}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedStory(story)}
                      className="mr-2 rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                    >
                      상세보기
                    </button>

                    <button
                      onClick={() => handleDelete(story.id)}
                      className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStories.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  AI Story Detail
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  {selectedStory.title ?? `${selectedStory.theme} 이야기`}
                </h3>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={copyStory}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                스토리 복사
              </button>

              <button
                onClick={printStory}
                className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
              >
                인쇄 / PDF 저장
              </button>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm md:grid-cols-2">
              <p>
                <span className="font-semibold">주제:</span>{" "}
                {selectedStory.theme ?? "-"}
              </p>
              <p>
                <span className="font-semibold">유형:</span>{" "}
                {selectedStory.story_type ?? "-"}
              </p>
              <p>
                <span className="font-semibold">학습 대상:</span>{" "}
                {selectedStory.target_level ?? "-"}
              </p>
              <p>
                <span className="font-semibold">길이:</span>{" "}
                {selectedStory.story_length ?? "-"}
              </p>
              <p>
                <span className="font-semibold">등장인물:</span>{" "}
                {selectedStory.character ?? "-"}
              </p>
              <p>
                <span className="font-semibold">모델:</span>{" "}
                {selectedStory.model_name ?? "-"}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-slate-500">
                이야기 아이디어
              </p>
              <p className="mt-3 leading-7 text-slate-700">
                {selectedStory.idea ?? "-"}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <p className="text-sm font-semibold text-emerald-700">
                참고 문서
              </p>
              <p className="mt-3 leading-7 text-slate-700">
                {selectedStory.reference_source ?? "-"}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-slate-500">
                생성된 스토리
              </p>
              <div className="mt-4 whitespace-pre-line leading-8 text-slate-800">
                {selectedStory.story ?? "-"}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}