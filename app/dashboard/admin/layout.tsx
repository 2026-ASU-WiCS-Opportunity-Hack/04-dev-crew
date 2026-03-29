import { requireAuth } from "@/lib/auth/server";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ allowedRoles: ["super_admin"] });
  return children;
}
