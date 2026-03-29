"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export function LogoutButton({
  className,
  label = "Log Out",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      startTransition(() => {
        router.push("/login");
        router.refresh();
      });
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className}
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      {loading ? "Signing out..." : label}
    </button>
  );
}
