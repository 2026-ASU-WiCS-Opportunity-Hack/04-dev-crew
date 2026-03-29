"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="home-link"
      style={{
        display: "block",
        padding: "0.5rem 0.75rem",
        borderRadius: "0.5rem",
        fontSize: "0.9rem",
        color: "var(--foreground)",
        textDecoration: "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(209,15,73,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}
