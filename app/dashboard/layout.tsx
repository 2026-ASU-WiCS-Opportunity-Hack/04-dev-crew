import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/lib/types";
import { NavLink } from "@/components/dashboard/NavLink";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const p = profile as ProfileRecord | null;
  const role = p?.role ?? "coach";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "14rem",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--surface-muted)",
          padding: "1.5rem 1rem",
        }}
      >
        <Link href="/" className="site-wordmark" style={{ fontSize: "1.15rem" }}>
          WIAL
        </Link>
        <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>
          {role.replace("_", " ")}
        </p>
        <nav style={{ marginTop: "1.5rem", display: "grid", gap: "0.15rem" }}>
          {(role === "super_admin") && (
            <>
              <NavLink href="/dashboard/admin">Admin Home</NavLink>
              <NavLink href="/dashboard/admin/chapters">Chapters</NavLink>
              <NavLink href="/dashboard/admin/coaches">Coaches</NavLink>
              <NavLink href="/dashboard/chapter/create">Create Chapter</NavLink>
            </>
          )}
          {(role === "chapter_lead" || role === "content_creator") && (
            <>
              <NavLink href="/dashboard/chapter">Chapter Home</NavLink>
              <NavLink href="/dashboard/chapter/coaches">Coaches</NavLink>
              <NavLink href="/dashboard/chapter/events">Events</NavLink>
              <NavLink href="/dashboard/chapter/payments">Payments</NavLink>
              <NavLink href="/dashboard/chapter/enrollments">Enrollments</NavLink>
              <NavLink href="/dashboard/chapter/clients">Clients</NavLink>
              <NavLink href="/dashboard/chapter/testimonials">Testimonials</NavLink>
              <NavLink href="/dashboard/chapter/campaigns">Campaigns</NavLink>
              <NavLink href="/dashboard/chapter/edit">Edit Chapter</NavLink>
            </>
          )}
          {role === "coach" && (
            <>
              <NavLink href="/dashboard/coach">My Dashboard</NavLink>
              <NavLink href="/dashboard/coach/profile">Profile</NavLink>
              <NavLink href="/dashboard/coach/sessions">Sessions</NavLink>
              <NavLink href="/dashboard/coach/credits">CE Credits</NavLink>
            </>
          )}
          {/* Super admin can also access chapter lead views */}
          {role === "super_admin" && (
            <>
              <div className="page-divider" style={{ margin: "0.75rem 0" }} />
              <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Chapter Tools</p>
              <NavLink href="/dashboard/chapter/events">Events</NavLink>
              <NavLink href="/dashboard/chapter/payments">Payments</NavLink>
              <NavLink href="/dashboard/chapter/enrollments">Enrollments</NavLink>
              <NavLink href="/dashboard/chapter/campaigns">Campaigns</NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "1.5rem 2rem" }}>
        {children}
      </main>
    </div>
  );
}
