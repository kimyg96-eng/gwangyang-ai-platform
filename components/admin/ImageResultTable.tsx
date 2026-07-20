"use client";

import { useMemo, useState } from "react";
import type { ImageResult } from "@/types/imageResult";
import { deleteImageResult } from "@/services/imageService";
import Image from "next/image";

type ImageResultTableProps = {
  images: ImageResult[];
  loading: boolean;
};

export default function ImageResultTable({
  images,
  loading,
}: ImageResultTableProps) {
  const [keyword, setKeyword] = useState("");

  const filteredImages = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return images;

    return images.filter((image) => {
      return (
        (image.theme ?? "").toLowerCase().includes(q) ||
        (image.prompt ?? "").toLowerCase().includes(q) ||
        (image.model_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [images, keyword]);

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteImageResult(id);
    alert("삭제되었습니다.");
    window.location.reload();
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 이미지 관리</h2>
          <p className="mt-2 text-sm text-slate-500">
            총 {images.length}건 중 {filteredImages.length}건 표시
          </p>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 md:w-96"
          placeholder="주제, 프롬프트, 모델 검색"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">
          이미지 데이터를 불러오는 중입니다...
        </p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {image.image_url ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={image.image_url}
                    alt={image.theme ?? "AI 생성 이미지"}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-500">
                  이미지 없음
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">{image.theme ?? "주제 없음"}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {image.prompt ?? "-"}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  모델: {image.model_name ?? "-"}
                </p>

                <div className="mt-5 flex gap-2">
                  {image.image_url && (
                    <a
                      href={image.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      이미지 보기
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(image.id)}
                    className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredImages.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              등록된 이미지가 없습니다.
            </div>
          )}
        </div>
      )}
    </section>
  );
}