import { Suspense } from "react";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

function AdminLoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">
          관리자 로그인 화면을 불러오고 있습니다.
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}