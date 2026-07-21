"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/services/supabase";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const authorizationError =
    searchParams.get("error") === "unauthorized";

  useEffect(() => {
    let active = true;

    async function checkExistingSession() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (error) {
        console.error("로그인 세션 확인 실패:", error);
      }

      if (user) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      setCheckingSession(false);
    }

    void checkExistingSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setErrorMessage(
        "이메일과 비밀번호를 입력해 주세요."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        throw new Error(
          "이메일 또는 비밀번호가 올바르지 않습니다."
        );
      }

      const {
        data: adminRecord,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !adminRecord) {
        await supabase.auth.signOut();

        throw new Error(
          "관리자 권한이 등록되지 않은 계정입니다."
        );
      }

      const requestedPath =
        searchParams.get("redirectTo") ?? "/admin";

      const redirectPath =
        requestedPath === "/admin" ||
        requestedPath.startsWith("/admin/")
          ? requestedPath
          : "/admin";

      router.replace(redirectPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-sm">
          <p className="font-semibold text-slate-600">
            로그인 상태를 확인하고 있습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Admin Login
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            관리자 로그인
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            광양 AI 문화학습 플랫폼의 콘텐츠와
            AI 생성 결과를 관리합니다.
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleLogin}
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              이메일
            </label>

            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              비밀번호
            </label>

            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="비밀번호 입력"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </div>

          {(errorMessage || authorizationError) && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              {errorMessage ||
                "관리자 권한이 없는 계정입니다."}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading
              ? "로그인 중..."
              : "관리자 로그인"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
          >
            사용자 화면으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}