import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireAuth } from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = await requireAuth();

  return <DashboardShell role={profile.role}>{children}</DashboardShell>;
}
