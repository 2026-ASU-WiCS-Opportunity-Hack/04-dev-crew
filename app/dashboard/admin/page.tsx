import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>Global Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
}
