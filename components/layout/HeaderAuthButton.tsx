"use client";

import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";

export function HeaderAuthButton({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  if (isAuthenticated) {
    return <LogoutButton className="site-header__cta" label="Logout" />;
  }

  return (
    <Link className="site-header__cta" href="/login">
      Login
    </Link>
  );
}
