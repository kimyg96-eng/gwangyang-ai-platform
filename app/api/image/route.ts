import { NextResponse } from "next/server";
import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export async function POST(req: Request) {
  try {
    const { theme, prompt, storyId } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "이미지 프롬프트가 필요합니다." },
        { status: 400 }
      );
    }

    const imagePrompt = `
광양 지역문화 학습용 동화 삽화.
주제: ${theme ?? "광양 지역문화"}
장면 설명: ${prompt}

스타일:
- 따뜻한 교육용 동화 삽화
- 초·중·고 학생이 보기 좋은 밝고 안전한 분위기
- 과도하게 사실적이지 않은 일러스트
- 문화자산의 지역성과 자연환경이 느껴지도록 표현
`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      size: "1024x1024",
    });

    const base64 = result.data?.[0]?.b64_json;

    if (!base64) {
      return NextResponse.json(
        { error: "이미지 생성 결과가 비어 있습니다." },
        { status: 500 }
      );
    }

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.png`;

    const filePath = `generated/${fileName}`;
    const buffer = Buffer.from(base64, "base64");

    const { error: uploadError } = await supabase.storage
      .from("image-results")
      .upload(filePath, buffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("image-results")
      .getPublicUrl(filePath);

    return NextResponse.json({
      image_url: data.publicUrl,
      theme: theme ?? null,
      story_id: storyId ?? null,
      prompt: imagePrompt,
      model_name: "gpt-image-1",
    });
  } catch (error) {
    console.error("Image API Error:", error);

    return NextResponse.json(
      {
        error: "이미지 생성에 실패했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}