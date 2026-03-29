import type { AppRole } from "@/lib/types";

export const APP_SESSION_COOKIE_NAME = "wial_app_session";

const DEFAULT_INACTIVITY_TIMEOUT_MINUTES = 30;
const rawTimeoutMinutes = Number.parseInt(
  process.env.APP_SESSION_INACTIVITY_TIMEOUT_MINUTES ?? "",
  10,
);

export const APP_SESSION_INACTIVITY_TIMEOUT_MINUTES =
  Number.isFinite(rawTimeoutMinutes) && rawTimeoutMinutes > 0
    ? rawTimeoutMinutes
    : DEFAULT_INACTIVITY_TIMEOUT_MINUTES;

export const APP_SESSION_INACTIVITY_TIMEOUT_MS =
  APP_SESSION_INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

export const APP_SESSION_ACTIVITY_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

export function getDashboardPathForRole(role: AppRole) {
  switch (role) {
    case "super_admin":
      return "/dashboard/admin";
    case "chapter_lead":
    case "content_creator":
      return "/dashboard/chapter";
    case "coach":
    default:
      return "/dashboard/coach";
  }
}

export function isRoleAllowed(
  role: AppRole,
  allowedRoles: readonly AppRole[],
) {
  return allowedRoles.includes(role);
}

export function getRequiredRolesForPath(pathname: string): AppRole[] | null {
  if (pathname.startsWith("/dashboard/admin")) {
    return ["super_admin"];
  }

  if (pathname.startsWith("/dashboard/chapter")) {
    return ["super_admin", "chapter_lead", "content_creator"];
  }

  if (pathname.startsWith("/dashboard/coach")) {
    return ["coach"];
  }

  if (
    pathname.startsWith("/api/sessions") ||
    pathname.startsWith("/api/credits") ||
    pathname.match(/^\/api\/events\/[^/]+\/rsvp$/) ||
    pathname.match(/^\/api\/jobs\/[^/]+\/apply$/)
  ) {
    return ["coach"];
  }

  return null;
}

export function buildLoginRedirectPath(nextPath: string, reason?: string) {
  const search = new URLSearchParams();

  if (nextPath && nextPath !== "/login") {
    search.set("next", nextPath);
  }

  if (reason) {
    search.set("reason", reason);
  }

  const query = search.toString();
  return query ? `/login?${query}` : "/login";
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
