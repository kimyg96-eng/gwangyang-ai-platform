import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/services/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    /*
     * 정적 파일과 이미지 최적화 경로를 제외한 요청에 적용합니다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};