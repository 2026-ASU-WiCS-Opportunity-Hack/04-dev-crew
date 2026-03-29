import { NextResponse, type NextRequest } from "next/server";

import {
  APP_SESSION_ACTIVITY_UPDATE_INTERVAL_MS,
  APP_SESSION_COOKIE_NAME,
  APP_SESSION_INACTIVITY_TIMEOUT_MS,
  buildLoginRedirectPath,
  getDashboardPathForRole,
  getRequiredRolesForPath,
  hashSessionToken,
  isRoleAllowed,
} from "./lib/auth/session";
import { updateSession } from "./lib/supabase/middleware";
import type { AppRole } from "./lib/types";

function applyCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

function buildRedirect(request: NextRequest, response: NextResponse, path: string) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  applyCookies(response, redirectResponse);
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiredRoles = getRequiredRolesForPath(pathname);
  const isLoginPage = pathname === "/login";

  const { response, supabase, user } = await updateSession(request);

  if (!requiredRoles && !isLoginPage) {
    return response;
  }

  if (!user) {
    if (!requiredRoles) {
      return response;
    }

    const nextPath = `${pathname}${request.nextUrl.search}`;
    return buildRedirect(
      request,
      response,
      buildLoginRedirectPath(nextPath, "auth_required"),
    );
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profileData?.role as AppRole | undefined;

  if (!role) {
    if (!requiredRoles) {
      return response;
    }

    return buildRedirect(request, response, "/unauthorized?reason=no-profile");
  }

  const appSessionToken = request.cookies.get(APP_SESSION_COOKIE_NAME)?.value;

  if (!appSessionToken) {
    if (isLoginPage) {
      return response;
    }

    const nextPath = `${pathname}${request.nextUrl.search}`;
    return buildRedirect(
      request,
      response,
      buildLoginRedirectPath(nextPath, "session_required"),
    );
  }

  const sessionTokenHash = await hashSessionToken(appSessionToken);
  const { data: session } = await supabase
    .from("app_user_sessions")
    .select("id, user_id, last_active_at, revoked_at")
    .eq("user_id", user.id)
    .eq("session_token_hash", sessionTokenHash)
    .maybeSingle();

  const sessionLastActiveAt = session?.last_active_at
    ? new Date(session.last_active_at).getTime()
    : null;
  const isSessionExpired =
    !session ||
    !!session.revoked_at ||
    sessionLastActiveAt === null ||
    Date.now() - sessionLastActiveAt > APP_SESSION_INACTIVITY_TIMEOUT_MS;

  if (isSessionExpired) {
    response.cookies.set({
      name: APP_SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    if (isLoginPage) {
      return response;
    }

    const nextPath = `${pathname}${request.nextUrl.search}`;
    return buildRedirect(
      request,
      response,
      buildLoginRedirectPath(nextPath, "session_expired"),
    );
  }

  if (
    sessionLastActiveAt !== null &&
    Date.now() - sessionLastActiveAt > APP_SESSION_ACTIVITY_UPDATE_INTERVAL_MS
  ) {
    await supabase
      .from("app_user_sessions")
      .update({
        last_active_at: new Date().toISOString(),
      })
      .eq("id", session.id);
  }

  if (isLoginPage) {
    return buildRedirect(request, response, getDashboardPathForRole(role));
  }

  if (requiredRoles && !isRoleAllowed(role, requiredRoles)) {
    return buildRedirect(request, response, getDashboardPathForRole(role));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/api/sessions/:path*",
    "/api/credits/:path*",
    "/api/events/:path*/rsvp",
    "/api/jobs/:path*/apply",
  ],
};
