"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import { NavLink } from "@/components/dashboard/NavLink";
import type { AppRole } from "@/lib/types";

export function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role: AppRole;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`dashboard-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="dashboard-shell__sidebar">
        <div className="dashboard-shell__sidebar-top">
          <button
            className="dashboard-shell__toggle"
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((current) => !current)}
          >
            ☰
          </button>

          <div className="dashboard-shell__brand">
            <Link href="/" className="site-wordmark" style={{ fontSize: "1.1rem" }}>
              WIAL
            </Link>
            <p className="dashboard-shell__role">{role.replace("_", " ")}</p>
          </div>
        </div>

        <nav className="dashboard-shell__nav">
          {role === "super_admin" ? (
            <>
              <NavLink href="/dashboard/admin" icon="⌂" collapsed={collapsed}>
                Admin Home
              </NavLink>
              <NavLink
                href="/dashboard/admin/customization"
                icon="◫"
                collapsed={collapsed}
              >
                Website Customization
              </NavLink>
              <NavLink href="/dashboard/admin/chapters" icon="▣" collapsed={collapsed}>
                Chapters
              </NavLink>
              <NavLink href="/dashboard/admin/coaches" icon="◉" collapsed={collapsed}>
                Coaches
              </NavLink>
              <NavLink href="/dashboard/chapter/create" icon="+" collapsed={collapsed}>
                Create Chapter
              </NavLink>

              <div className="dashboard-shell__divider" />

              <NavLink href="/dashboard/chapter/events" icon="◌" collapsed={collapsed}>
                Events
              </NavLink>
              <NavLink href="/dashboard/chapter/payments" icon="$" collapsed={collapsed}>
                Payments
              </NavLink>
              <NavLink
                href="/dashboard/chapter/enrollments"
                icon="≣"
                collapsed={collapsed}
              >
                Enrollments
              </NavLink>
              <NavLink
                href="/dashboard/chapter/campaigns"
                icon="✉"
                collapsed={collapsed}
              >
                Campaigns
              </NavLink>
            </>
          ) : null}

          {(role === "chapter_lead" || role === "content_creator") && (
            <>
              <NavLink href="/dashboard/chapter" icon="⌂" collapsed={collapsed}>
                Chapter Home
              </NavLink>
              <NavLink href="/dashboard/chapter/coaches" icon="◉" collapsed={collapsed}>
                Coaches
              </NavLink>
              <NavLink href="/dashboard/chapter/events" icon="◌" collapsed={collapsed}>
                Events
              </NavLink>
              <NavLink href="/dashboard/chapter/payments" icon="$" collapsed={collapsed}>
                Payments
              </NavLink>
              <NavLink
                href="/dashboard/chapter/enrollments"
                icon="≣"
                collapsed={collapsed}
              >
                Enrollments
              </NavLink>
              <NavLink href="/dashboard/chapter/clients" icon="□" collapsed={collapsed}>
                Clients
              </NavLink>
              <NavLink
                href="/dashboard/chapter/testimonials"
                icon="❝"
                collapsed={collapsed}
              >
                Testimonials
              </NavLink>
              <NavLink
                href="/dashboard/chapter/campaigns"
                icon="✉"
                collapsed={collapsed}
              >
                Campaigns
              </NavLink>
              <NavLink href="/dashboard/chapter/edit" icon="✎" collapsed={collapsed}>
                Edit Chapter
              </NavLink>
            </>
          )}

          {role === "coach" && (
            <>
              <NavLink href="/dashboard/coach" icon="⌂" collapsed={collapsed}>
                My Dashboard
              </NavLink>
              <NavLink href="/dashboard/coach/profile" icon="◍" collapsed={collapsed}>
                Profile
              </NavLink>
              <NavLink href="/dashboard/coach/sessions" icon="◷" collapsed={collapsed}>
                Sessions
              </NavLink>
              <NavLink href="/dashboard/coach/credits" icon="★" collapsed={collapsed}>
                CE Credits
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <main className="dashboard-shell__main">{children}</main>
    </div>
  );
}
