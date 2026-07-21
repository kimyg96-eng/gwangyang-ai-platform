import { redirect } from "next/navigation";

import AdminDashboard from "@/components/admin/AdminDashboard";
import { createServerSupabaseClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (claimsError || !userId) {
    redirect("/admin/login");
  }

  const {
    data: adminUser,
    error: adminError,
  } = await supabase
    .from("admin_users")
    .select("user_id, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !adminUser) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return <AdminDashboard />;
}