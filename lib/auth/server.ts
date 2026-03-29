import { cache } from "react";
import { redirect } from "next/navigation";

import { getDashboardPathForRole, isRoleAllowed } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, CoachRecord, ProfileRecord } from "@/lib/types";

type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export type AuthContext = {
  user: AuthenticatedUser;
  profile: ProfileRecord | null;
  coach: CoachRecord | null;
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileData as ProfileRecord | null) ?? null;

  const { data: coachData } = await supabase
    .from("coaches")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  const coach = (coachData as CoachRecord | null) ?? null;

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile,
    coach,
  };
});

type RequireAuthOptions = {
  allowedRoles?: readonly AppRole[];
  requireCoach?: boolean;
  loginPath?: string;
  unauthorizedPath?: string;
};

export async function requireAuth(options: RequireAuthOptions = {}) {
  const {
    allowedRoles,
    requireCoach = false,
    loginPath = "/login",
    unauthorizedPath = "/unauthorized",
  } = options;

  const context = await getAuthContext();

  if (!context?.user) {
    redirect(loginPath);
  }

  if (!context.profile) {
    redirect(`${unauthorizedPath}?reason=no-profile`);
  }

  if (
    allowedRoles &&
    !isRoleAllowed(context.profile.role, allowedRoles)
  ) {
    redirect(getDashboardPathForRole(context.profile.role));
  }

  if (requireCoach && !context.coach) {
    redirect(`${unauthorizedPath}?reason=no-coach-profile`);
  }

  return context as {
    user: AuthenticatedUser;
    profile: ProfileRecord;
    coach: CoachRecord | null;
  };
}

export async function requireCoach() {
  const context = await requireAuth({
    allowedRoles: ["coach"],
    requireCoach: true,
  });

  return {
    ...context,
    coach: context.coach as CoachRecord,
  };
}
