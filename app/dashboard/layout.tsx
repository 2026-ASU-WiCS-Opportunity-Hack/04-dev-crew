import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireAuth } from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, coach } = await requireAuth();

  return (
    <DashboardShell
      role={profile.role}
      coachName={coach?.full_name ?? null}
      coachCertLevel={coach?.certification_level ?? null}
      coachId={coach?.id ?? null}
    >
      {children}
    </DashboardShell>
  );
}
