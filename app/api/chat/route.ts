import { NextResponse } from "next/server";
import { openai } from "@/services/openai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content:
            "당신은 광양 지역문화자산을 설명하는 AI 문화해설사입니다. 초·중·고 학생이 이해하기 쉽게 설명하고, 광양의 매화마을, 섬진강, 백운산, 정채봉 문학과 연결하여 교육적으로 답변하세요.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      reply: response.output_text || "응답 내용이 비어 있습니다.",
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);

    return NextResponse.json(
      {
        error: "AI 응답 생성에 실패했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}