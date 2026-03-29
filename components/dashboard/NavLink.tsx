"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function NavLink({
  href,
  children,
  icon,
  collapsed = false,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`dashboard-nav-link ${collapsed ? "is-collapsed" : ""}`}
      title={typeof children === "string" ? children : undefined}
    >
      <span className="dashboard-nav-link__icon" aria-hidden="true">
        {icon ?? "•"}
      </span>
      <span className="dashboard-nav-link__label">{children}</span>
    </Link>
  );
}
