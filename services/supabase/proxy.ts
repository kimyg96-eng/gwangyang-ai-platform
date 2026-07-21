import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase 환경변수가 설정되지 않았습니다.");
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  /*
   * 서버에서 getSession() 결과만 신뢰하지 않습니다.
   * getClaims()가 토큰 서명을 검증하고 필요하면 세션을 갱신합니다.
   */
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const isLoginPage =
    request.nextUrl.pathname === "/admin/login";

  const isAdminRoute =
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/");

  const isAuthenticated = Boolean(data?.claims?.sub) && !error;

  if (
    isAdminRoute &&
    !isLoginPage &&
    !isAuthenticated
  ) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isAuthenticated) {
    const adminUrl = request.nextUrl.clone();

    adminUrl.pathname = "/admin";
    adminUrl.search = "";

    return NextResponse.redirect(adminUrl);
  }

  return response;
}