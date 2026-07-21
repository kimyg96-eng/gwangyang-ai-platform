import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CacheRow = {
  original_question: string;
  asset_name: string | null;
  agent_type: string;
  hit_count: number | null;
  expires_at: string;
  created_at: string;
  last_hit_at: string | null;
};

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (claimsError || !userId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { data: adminUser, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (adminError || !adminUser) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Supabase 서버 환경변수가 설정되지 않았습니다.",
      },
      { status: 500 }
    );
  }

  const adminSupabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data, error } = await adminSupabase
    .from("ai_answer_cache")
    .select(
      [
        "original_question",
        "asset_name",
        "agent_type",
        "hit_count",
        "expires_at",
        "created_at",
        "last_hit_at",
      ].join(",")
    )
    .order("hit_count", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("AI 캐시 통계 조회 실패:", error);

    return NextResponse.json(
      {
        error: "AI 캐시 통계를 불러오지 못했습니다.",
        detail: error.message,
      },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as unknown as CacheRow[];
  const now = Date.now();

  const activeRows = rows.filter(
    (row) =>
      new Date(row.expires_at).getTime() > now
  );

  const expiredRows = rows.filter(
    (row) =>
      new Date(row.expires_at).getTime() <= now
  );

  const totalHits = rows.reduce(
    (sum, row) => sum + (row.hit_count ?? 0),
    0
  );

  const reusedCacheCount = rows.filter(
    (row) => (row.hit_count ?? 0) > 0
  ).length;

  const topQuestions = [...rows]
    .sort(
      (a, b) =>
        (b.hit_count ?? 0) - (a.hit_count ?? 0)
    )
    .slice(0, 5)
    .map((row) => ({
      question: row.original_question,
      assetName: row.asset_name,
      agentType: row.agent_type,
      hitCount: row.hit_count ?? 0,
      lastHitAt: row.last_hit_at,
    }));

  return NextResponse.json({
    totalEntries: rows.length,
    activeEntries: activeRows.length,
    expiredEntries: expiredRows.length,
    totalHits,
    reusedCacheCount,
    topQuestions,
    generatedAt: new Date().toISOString(),
  });
}