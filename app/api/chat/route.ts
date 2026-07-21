import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant";

type ChatInput = {
  role: ChatRole;
  content: string;
};

type GuideRequestBody = {
  message?: unknown;
  assetName?: unknown;
  agentType?: unknown;
  history?: unknown;
};

type CulturalDocumentReference = {
  title: string;
  file_url: string | null;
};

type FileCitation = {
  fileId: string;
  filename: string;
  index: number;
};

type CitationResponse = {
  number: number;
  file_id: string;
  title: string;
  filename: string;
  url: string | null;
};

type ReferenceFileResponse = {
  title: string;
  url: string | null;
};

type CachedAnswer = {
  cache_key: string;
  reply: string;
  reference_source: string;
  reference_files: ReferenceFileResponse[];
  citations: CitationResponse[];
  model_name: string;
  hit_count: number;
};

const MAX_MESSAGE_LENGTH = 3000;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_CONTENT_LENGTH = 2000;
const CACHE_TTL_DAYS = 7;
const CACHE_VERSION = "guide-cache-v1";
const CACHE_STREAM_CHUNK_SIZE = 28;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const cacheSupabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      )
    : null;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeHistory(value: unknown): ChatInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => {
      return typeof item === "object" && item !== null;
    })
    .map((item) => {
      const role =
        item.role === "assistant" || item.role === "user"
          ? item.role
          : null;

      const content = normalizeText(item.content);

      if (!role || !content) {
        return null;
      }

      return {
        role,
        content: content.slice(0, MAX_HISTORY_CONTENT_LENGTH),
      };
    })
    .filter((item): item is ChatInput => item !== null)
    .slice(-MAX_HISTORY_ITEMS);
}

/**
 * OpenAI Responses API의 output 안에서
 * File Search가 실제로 사용한 file_citation 정보를 추출합니다.
 */
function extractFileCitations(response: unknown): FileCitation[] {
  if (
    typeof response !== "object" ||
    response === null ||
    !("output" in response) ||
    !Array.isArray(response.output)
  ) {
    return [];
  }

  const citations: FileCitation[] = [];

  for (const outputItem of response.output) {
    if (
      typeof outputItem !== "object" ||
      outputItem === null ||
      !("type" in outputItem) ||
      outputItem.type !== "message" ||
      !("content" in outputItem) ||
      !Array.isArray(outputItem.content)
    ) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (
        typeof contentItem !== "object" ||
        contentItem === null ||
        !("type" in contentItem) ||
        contentItem.type !== "output_text" ||
        !("annotations" in contentItem) ||
        !Array.isArray(contentItem.annotations)
      ) {
        continue;
      }

      for (const annotation of contentItem.annotations) {
        if (
          typeof annotation !== "object" ||
          annotation === null ||
          !("type" in annotation) ||
          annotation.type !== "file_citation"
        ) {
          continue;
        }

        const fileId =
          "file_id" in annotation &&
          typeof annotation.file_id === "string"
            ? annotation.file_id
            : "";

        const filename =
          "filename" in annotation &&
          typeof annotation.filename === "string"
            ? annotation.filename
            : "";

        const index =
          "index" in annotation &&
          typeof annotation.index === "number"
            ? annotation.index
            : 0;

        if (!fileId) {
          continue;
        }

        citations.push({
          fileId,
          filename,
          index,
        });
      }
    }
  }

  /*
   * 동일한 파일이 답변에서 여러 번 인용된 경우
   * 파일별로 한 번만 반환합니다.
   */
  return Array.from(
    new Map(
      citations.map((citation) => [
        citation.fileId,
        citation,
      ])
    ).values()
  );
}

function createGuideSystemPrompt(assetName: string): string {
  const selectedAsset =
    assetName || "특정 문화자산이 지정되지 않음";

  return `
당신은 광양 지역문화자산을 설명하는 전문 AI 문화해설사입니다.

현재 선택된 문화자산:
${selectedAsset}

[최우선 원칙]

1. OpenAI File Search로 검색된 PDF 문서 내용을 가장 우선적인 근거로 사용하세요.
2. 검색된 문서에서 확인되지 않는 사실을 추측하거나 만들어내지 마세요.
3. 근거가 부족하면 반드시 다음과 같이 명확히 표현하세요.
   - "업로드된 문서에서는 해당 내용을 확인하기 어렵습니다."
   - "현재 제공된 자료만으로는 정확하게 판단하기 어렵습니다."
4. 사용자의 질문이 이전 대화와 연결되어 있으면 최근 대화 맥락을 자연스럽게 이어서 답변하세요.
5. "그곳", "그 인물", "그 작품"과 같은 표현은 이전 대화에서 가리키는 대상을 파악해 답변하세요.
6. 답변에 실제로 사용하지 않은 문서명이나 출처를 임의로 만들지 마세요.
7. 정치적·상업적 홍보보다 교육적이고 객관적인 설명을 우선하세요.

[답변 작성 기준]

- 사용자의 질문에 먼저 직접 답변하세요.
- 핵심 내용을 앞부분에 배치하세요.
- 역사적 사실, 문화적 가치, 관광 정보가 섞이면 항목을 구분하세요.
- 어려운 전문용어는 쉬운 말로 풀어서 설명하세요.
- 초등학생이나 일반 관광객도 이해할 수 있는 자연스러운 한국어를 사용하세요.
- 지나치게 길게 답하지 말고, 일반적인 질문에는 약 500~900자 내외로 답하세요.
- 사용자가 자세한 설명을 요청하면 충분히 확장해서 답하세요.
- 날짜, 인물, 지명, 작품명은 검색 문서에서 확인된 경우에만 구체적으로 제시하세요.
- 문서 내용과 일반 지식이 충돌할 가능성이 있으면 문서 기준임을 밝히세요.

[권장 답변 형식]

### 핵심 설명
사용자의 질문에 대한 직접적인 답변

### 지역문화적 가치
광양 지역에서 갖는 역사적·문화적·교육적 의미

### 학습 포인트
기억하면 좋은 핵심 내용 2~4개

### 함께 살펴볼 질문
현재 답변과 연결되는 후속 질문 3개

[형식 예외]

- 단순 확인 질문에는 위 형식을 억지로 모두 사용하지 말고 간단히 답하세요.
- 사용자가 목록, 요약, 어린이용 설명 등 특정 형식을 요청하면 그 요청을 우선하세요.
- 후속 질문은 답변할 수 있는 범위 안에서만 제안하세요.
`.trim();
}

function createAvatarSystemPrompt(): string {
  return `
당신은 광양 출신 작가 정채봉의 생애와 작품세계를 교육적으로 설명하는 AI 문학 아바타입니다.

중요:
당신이 실제 정채봉 작가 본인인 것처럼 주장하지 마세요.
항상 정채봉 작가의 자료를 설명하는 AI임을 유지하세요.

[최우선 원칙]

1. OpenAI File Search로 검색된 PDF 문서 내용을 가장 우선적인 근거로 사용하세요.
2. 작품명, 발표 시기, 생애 사건, 인물 관계는 문서에서 확인된 내용만 구체적으로 설명하세요.
3. 문서에서 확인되지 않는 내용은 추측하지 마세요.
4. 근거가 부족하면 다음과 같이 명확하게 표현하세요.
   - "업로드된 문서에서는 해당 내용을 확인하기 어렵습니다."
   - "현재 제공된 자료만으로는 정확한 설명이 어렵습니다."
5. 이전 대화에서 다룬 작품이나 생애 내용을 기억하여 자연스럽게 연결하세요.
6. 실제로 사용하지 않은 작품명이나 출처를 만들어내지 마세요.

[답변 작성 기준]

- 질문에 대한 핵심 답변을 먼저 제시하세요.
- 작가의 생애와 작품 내용을 혼동하지 않도록 구분하세요.
- 작품 해석은 하나의 확정된 정답처럼 단정하지 말고 근거를 설명하세요.
- 어린이와 일반 학습자도 이해할 수 있는 쉬운 한국어를 사용하세요.
- 일반적인 답변은 약 500~900자 내외로 작성하세요.
- 사용자가 상세 분석을 요구하면 작품의 주제, 상징, 문학적 의미를 확장해서 설명하세요.

[권장 답변 형식]

### 작품 또는 생애 설명
질문에 대한 직접적인 답변

### 문학적 의미
작품세계와 광양 지역문화의 관련성

### 학습 포인트
기억하면 좋은 핵심 내용 2~4개

### 함께 살펴볼 질문
현재 내용과 관련된 후속 질문 3개

[형식 예외]

- 짧은 확인 질문에는 필요한 내용만 간결하게 답하세요.
- 사용자가 요약, 비교, 어린이용 설명 등 별도 형식을 요청하면 해당 요청을 우선하세요.
`.trim();
}

/**
 * 선택된 문화자산에 연결된 색인 완료 문서를 조회합니다.
 *
 * 실제 OpenAI citation이 없을 경우 참고자료의 대체값으로 사용합니다.
 */
async function getRelatedDocuments(
  assetName: string
): Promise<CulturalDocumentReference[]> {
  let query = supabase
    .from("cultural_documents")
    .select("title, file_url")
    .eq("indexed_status", "indexed");

  if (assetName) {
    query = query.ilike(
      "asset_name",
      `%${assetName}%`
    );
  }

  const { data, error } = await query.order(
    "uploaded_at",
    {
      ascending: false,
    }
  );

  if (error) {
    console.error("관련 문서 조회 실패:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      assetName,
    });

    return [];
  }

  return (data ?? []).map((document) => ({
    title: document.title,
    file_url: document.file_url,
  }));
}

/**
 * OpenAI가 실제로 인용한 파일 ID를
 * cultural_documents 테이블의 PDF 정보와 연결합니다.
 */
async function getCitationDocuments(
  fileCitations: FileCitation[]
): Promise<CitationResponse[]> {
  if (fileCitations.length === 0) {
    return [];
  }

  const fileIds = fileCitations.map(
    (citation) => citation.fileId
  );

  const { data, error } = await supabase
    .from("cultural_documents")
    .select(
      "title, file_url, openai_file_id"
    )
    .in("openai_file_id", fileIds);

  if (error) {
    console.error("인용 문서 조회 실패:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fileIds,
    });

    return [];
  }

  const documentMap = new Map<
    string,
    {
      title: string;
      file_url: string | null;
      openai_file_id: string;
    }
  >();

  for (const document of data ?? []) {
    if (
      typeof document.openai_file_id !== "string"
    ) {
      continue;
    }

    documentMap.set(
      document.openai_file_id,
      {
        title: document.title,
        file_url: document.file_url,
        openai_file_id:
          document.openai_file_id,
      }
    );
  }

  return fileCitations.map((citation, index) => {
    const document = documentMap.get(
      citation.fileId
    );

    return {
      number: index + 1,
      file_id: citation.fileId,
      title:
        document?.title ||
        citation.filename ||
        "출처 문서",
      filename:
        citation.filename ||
        document?.title ||
        "출처 문서",
      url: document?.file_url ?? null,
    };
  });
}


function normalizeQuestionForCache(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ko-KR");
}

function createCacheKey(params: {
  message: string;
  assetName: string;
  agentType: string;
  vectorStoreId?: string;
}): string {
  const normalizedPayload = [
    CACHE_VERSION,
    params.agentType === "avatar" ? "avatar" : "guide",
    params.assetName || "none",
    params.vectorStoreId || "none",
    normalizeQuestionForCache(params.message),
  ].join("|");

  return createHash("sha256")
    .update(normalizedPayload)
    .digest("hex");
}

function isReferenceFileArray(
  value: unknown
): value is ReferenceFileResponse[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "title" in item &&
        typeof item.title === "string" &&
        (!("url" in item) ||
          item.url === null ||
          typeof item.url === "string")
    )
  );
}

function isCitationArray(
  value: unknown
): value is CitationResponse[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "number" in item &&
        typeof item.number === "number" &&
        "file_id" in item &&
        typeof item.file_id === "string" &&
        "title" in item &&
        typeof item.title === "string" &&
        "filename" in item &&
        typeof item.filename === "string" &&
        "url" in item &&
        (item.url === null ||
          typeof item.url === "string")
    )
  );
}

async function getCachedAnswer(
  cacheKey: string
): Promise<CachedAnswer | null> {
  if (!cacheSupabase) {
    return null;
  }

  const result = await cacheSupabase
    .from("ai_answer_cache")
    .select(
      [
        "cache_key",
        "reply",
        "reference_source",
        "reference_files",
        "citations",
        "model_name",
        "hit_count",
      ].join(",")
    )
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (result.error) {
    console.error(
      "AI 답변 캐시 조회 실패:",
      result.error
    );
    return null;
  }

  type CachedAnswerRow = {
    cache_key: string;
    reply: string;
    reference_source: string;
    reference_files: unknown;
    citations: unknown;
    model_name: string;
    hit_count: number | null;
  };

  const data = result.data as unknown as
    | CachedAnswerRow
    | null;

  if (!data) {
    return null;
  }

  return {
    cache_key: data.cache_key,
    reply: data.reply,
    reference_source: data.reference_source,
    reference_files: isReferenceFileArray(
      data.reference_files
    )
      ? data.reference_files
      : [],
    citations: isCitationArray(data.citations)
      ? data.citations
      : [],
    model_name: data.model_name,
    hit_count:
      typeof data.hit_count === "number"
        ? data.hit_count
        : 0,
  };
}

async function increaseCacheHit(
  cacheKey: string,
  currentHitCount: number
): Promise<void> {
  if (!cacheSupabase) return;

  const { error } = await cacheSupabase
    .from("ai_answer_cache")
    .update({
      hit_count: currentHitCount + 1,
      last_hit_at: new Date().toISOString(),
    })
    .eq("cache_key", cacheKey);

  if (error) {
    console.error("AI 답변 캐시 사용 횟수 갱신 실패:", error);
  }
}

async function saveCachedAnswer(params: {
  cacheKey: string;
  normalizedQuestion: string;
  originalQuestion: string;
  assetName: string;
  agentType: string;
  reply: string;
  referenceSource: string;
  referenceFiles: ReferenceFileResponse[];
  citations: CitationResponse[];
  modelName: string;
}): Promise<void> {
  if (!cacheSupabase) return;

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + CACHE_TTL_DAYS
  );

  const { error } = await cacheSupabase
    .from("ai_answer_cache")
    .upsert(
      {
        cache_key: params.cacheKey,
        cache_version: CACHE_VERSION,
        normalized_question:
          params.normalizedQuestion,
        original_question:
          params.originalQuestion,
        asset_name: params.assetName || null,
        agent_type:
          params.agentType === "avatar"
            ? "avatar"
            : "guide",
        reply: params.reply,
        reference_source:
          params.referenceSource,
        reference_files:
          params.referenceFiles,
        citations: params.citations,
        model_name: params.modelName,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "cache_key",
      }
    );

  if (error) {
    console.error("AI 답변 캐시 저장 실패:", error);
  }
}

async function streamCachedAnswer(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  cachedAnswer: CachedAnswer,
  metadata: {
    assetName: string;
    agentType: string;
    vectorStoreId?: string;
  }
): Promise<void> {
  streamJson(controller, encoder, {
    type: "status",
    message: "저장된 답변을 불러왔습니다.",
  });

  for (
    let index = 0;
    index < cachedAnswer.reply.length;
    index += CACHE_STREAM_CHUNK_SIZE
  ) {
    if (index > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, 8)
      );
    }

    streamJson(controller, encoder, {
      type: "delta",
      delta: cachedAnswer.reply.slice(
        index,
        index + CACHE_STREAM_CHUNK_SIZE
      ),
    });
  }

  streamJson(controller, encoder, {
    type: "complete",
    reply: cachedAnswer.reply,
    reference_source:
      cachedAnswer.reference_source,
    reference_files:
      cachedAnswer.reference_files,
    citations: cachedAnswer.citations,
    rag_enabled: Boolean(
      metadata.vectorStoreId
    ),
    history_count: 0,
    selected_asset:
      metadata.assetName || null,
    agent_type:
      metadata.agentType === "avatar"
        ? "avatar"
        : "guide",
    vector_store_id:
      metadata.vectorStoreId ?? null,
    model_name: cachedAnswer.model_name,
    cache_hit: true,
    token_usage: {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
    },
  });
}


type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

function extractTokenUsage(
  completedResponse: unknown
): TokenUsage {
  if (
    typeof completedResponse !== "object" ||
    completedResponse === null ||
    !("usage" in completedResponse)
  ) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };
  }

  const usage = completedResponse.usage;

  if (
    typeof usage !== "object" ||
    usage === null
  ) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };
  }

  const inputTokens =
    "input_tokens" in usage &&
    typeof usage.input_tokens === "number"
      ? usage.input_tokens
      : 0;

  const outputTokens =
    "output_tokens" in usage &&
    typeof usage.output_tokens === "number"
      ? usage.output_tokens
      : 0;

  const totalTokens =
    "total_tokens" in usage &&
    typeof usage.total_tokens === "number"
      ? usage.total_tokens
      : inputTokens + outputTokens;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function streamJson(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  payload: unknown
) {
  controller.enqueue(
    encoder.encode(`${JSON.stringify(payload)}\n`)
  );
}

export async function POST(request: Request) {
  let body: GuideRequestBody;

  try {
    body = (await request.json()) as GuideRequestBody;
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON 형식이 아닙니다." },
      { status: 400 }
    );
  }

  const message = normalizeText(body.message);
  const assetName = normalizeText(body.assetName);
  const agentType = normalizeText(body.agentType);
  const recentHistory = sanitizeHistory(body.history);

  if (!message) {
    return NextResponse.json(
      { error: "message가 필요합니다." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `질문은 ${MAX_MESSAGE_LENGTH.toLocaleString(
          "ko-KR"
        )}자 이내로 입력해 주세요.`,
      },
      { status: 400 }
    );
  }

  const vectorStoreId =
    process.env.OPENAI_VECTOR_STORE_ID?.trim();

  /*
   * 이전 대화가 없는 독립 질문만 캐시합니다.
   * 대화 맥락이 있는 질문은 같은 문장이라도 의미가 달라질 수 있습니다.
   */
  /*
   * 첫 질문인지 여부는 이전 사용자 메시지 존재 여부로 판단합니다.
   * 화면의 초기 AI 인사말은 history에 포함될 수 있으므로
   * recentHistory.length === 0 조건을 사용하면 캐시가 항상 비활성화됩니다.
   */
  const hasPriorUserMessage = recentHistory.some(
    (item) => item.role === "user"
  );

  const cacheEnabled =
    !hasPriorUserMessage &&
    Boolean(cacheSupabase);

  const cacheKey = cacheEnabled
    ? createCacheKey({
        message,
        assetName,
        agentType,
        vectorStoreId,
      })
    : null;

  const systemPrompt =
    agentType === "avatar"
      ? createAvatarSystemPrompt()
      : createGuideSystemPrompt(assetName);

  const encoder = new TextEncoder();

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (cacheKey) {
          const cachedAnswer =
            await getCachedAnswer(cacheKey);

          if (cachedAnswer) {
            await streamCachedAnswer(
              controller,
              encoder,
              cachedAnswer,
              {
                assetName,
                agentType,
                vectorStoreId,
              }
            );

            await increaseCacheHit(
              cacheKey,
              cachedAnswer.hit_count
            );

            controller.close();
            return;
          }
        }

        streamJson(controller, encoder, {
          type: "status",
          message: vectorStoreId
            ? "관련 문서를 검색하고 있습니다..."
            : "답변을 준비하고 있습니다...",
        });

        const relatedDocumentsPromise =
          getRelatedDocuments(assetName);

        const openaiStream =
          await openai.responses.create(
            {
              model: "gpt-5-mini",
              input: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...recentHistory,
                {
                  role: "user",
                  content: message,
                },
              ],
              ...(vectorStoreId
                ? {
                    tools: [
                      {
                        type: "file_search" as const,
                        vector_store_ids: [
                          vectorStoreId,
                        ],
                      },
                    ],
                  }
                : {}),
              stream: true,
            },
            {
              signal: request.signal,
            }
          );

        streamJson(controller, encoder, {
          type: "status",
          message: "답변을 생성하고 있습니다...",
        });

        let completedResponse: unknown = null;
        let accumulatedText = "";

        for await (const event of openaiStream) {
          if (
            event.type === "response.output_text.delta"
          ) {
            accumulatedText += event.delta;

            streamJson(controller, encoder, {
              type: "delta",
              delta: event.delta,
            });
          }

          if (event.type === "response.completed") {
            completedResponse = event.response;
          }

          if (event.type === "error") {
            throw new Error(
              "OpenAI 스트리밍 처리 중 오류가 발생했습니다."
            );
          }
        }

        const relatedDocuments =
          await relatedDocumentsPromise;

        const fileCitations =
          extractFileCitations(completedResponse);

        const citations =
          await getCitationDocuments(fileCitations);

        const referenceSource =
          citations.length > 0
            ? citations
                .map((citation) => citation.title)
                .join(", ")
            : relatedDocuments.length > 0
              ? relatedDocuments
                  .map((document) => document.title)
                  .join(", ")
              : "RAG 문서 없음";

        const referenceFiles =
          citations.length > 0
            ? citations.map((citation) => ({
                title: citation.title,
                url: citation.url,
              }))
            : relatedDocuments.map((document) => ({
                title: document.title,
                url: document.file_url,
              }));

        console.log(
          "OpenAI File Search 스트리밍 인용:",
          {
            selectedAsset: assetName || null,
            fileCitations,
            citations,
          }
        );

        const reply =
          accumulatedText.trim() ||
          "응답 내용이 비어 있습니다.";

        const tokenUsage =
          extractTokenUsage(completedResponse);

        streamJson(controller, encoder, {
          type: "complete",
          reply,
          reference_source: referenceSource,
          reference_files: referenceFiles,
          citations,
          rag_enabled: Boolean(vectorStoreId),
          history_count: recentHistory.length,
          selected_asset: assetName || null,
          agent_type:
            agentType === "avatar"
              ? "avatar"
              : "guide",
          vector_store_id: vectorStoreId ?? null,
          model_name: "gpt-5-mini",
          cache_hit: false,
          token_usage: {
            input_tokens: tokenUsage.inputTokens,
            output_tokens: tokenUsage.outputTokens,
            total_tokens: tokenUsage.totalTokens,
          },
        });

        if (cacheKey) {
          await saveCachedAnswer({
            cacheKey,
            normalizedQuestion:
              normalizeQuestionForCache(message),
            originalQuestion: message,
            assetName,
            agentType,
            reply,
            referenceSource,
            referenceFiles,
            citations,
            modelName: "gpt-5-mini",
          });
        }

        controller.close();
      } catch (error) {
        if (request.signal.aborted) {
          controller.close();
          return;
        }

        console.error(
          "OpenAI Streaming API Error:",
          error
        );

        streamJson(controller, encoder, {
          type: "error",
          error: "AI 응답 생성에 실패했습니다.",
          detail:
            error instanceof Error
              ? error.message
              : String(error),
        });

        controller.close();
      }
    },
    cancel() {
      console.log(
        "클라이언트가 AI 응답 생성을 중단했습니다."
      );
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type":
        "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}