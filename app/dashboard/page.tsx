import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { getDashboardPathForRole } from "@/lib/auth/session";

export default async function DashboardPage() {
  const { profile } = await requireAuth();
  redirect(getDashboardPathForRole(profile.role));
}
