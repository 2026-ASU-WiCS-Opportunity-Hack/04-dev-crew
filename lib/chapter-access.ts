import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, ChapterRecord, ProfileRecord } from "@/lib/types";

const DEFAULT_UNAUTHORIZED_PATH = "/unauthorized";

export type ChapterAccessDebugInfo = {
  email: string | null;
  chapterId: string | null;
  chapterName: string | null;
  chapterSlug: string | null;
  role: AppRole | null;
};

type AccessContext = {
  user: { id: string; email?: string | null };
  profile: ProfileRecord | null;
  chapter: ChapterRecord | null;
};

export type RequireChapterAccessOptions = {
  allowedRoles?: readonly AppRole[];
  loginPath?: string;
  onMismatch?: "notFound" | "redirect";
  redirectToOwnChapterBasePath?: string;
  unauthorizedPath?: string;
};

export type RequireChapterDashboardAccessOptions = {
  allowedRoles?: readonly AppRole[];
  loginPath?: string;
  unauthorizedPath?: string;
};

export async function getOptionalChapterAccessContext(): Promise<AccessContext | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[chapter-access] No authenticated user found");
    return null;
  }

  console.log("[chapter-access] Authenticated user:", { id: user.id, email: user.email });

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[chapter-access] Error fetching profile:", profileError);
  }

  const profile = (profileData as ProfileRecord | null) ?? null;

  console.log("[chapter-access] Profile:", {
    found: !!profile,
    role: profile?.role ?? null,
    chapter_id: profile?.chapter_id ?? null,
  });

  let chapter: ChapterRecord | null = null;
  if (profile?.chapter_id) {
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", profile.chapter_id)
      .maybeSingle();

    if (chapterError) {
      console.error("[chapter-access] Error fetching chapter:", chapterError);
    }

    chapter = (chapterData as ChapterRecord | null) ?? null;
    console.log("[chapter-access] Chapter:", {
      found: !!chapter,
      id: chapter?.id ?? null,
      name: chapter?.name ?? null,
      slug: chapter?.slug ?? null,
    });
  } else {
    console.log("[chapter-access] No chapter_id on profile — chapter lookup skipped");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    chapter,
  };
}

export function getChapterAccessDebugInfo(
  context: AccessContext | null,
): ChapterAccessDebugInfo {
  return {
    email: context?.profile?.email ?? context?.user.email ?? null,
    chapterId: context?.chapter?.id ?? context?.profile?.chapter_id ?? null,
    chapterName: context?.chapter?.name ?? null,
    chapterSlug: context?.chapter?.slug ?? null,
    role: context?.profile?.role ?? null,
  };
}

export function redirectToOwnChapter(
  chapterSlug: string,
  basePath = "/",
): never {
  const normalizedBasePath =
    basePath === "/" ? "" : basePath.replace(/\/$/, "");

  redirect(`${normalizedBasePath}/${chapterSlug}`);
}

export function redirectToUnauthorized(
  reason = "no-chapter",
  unauthorizedPath = DEFAULT_UNAUTHORIZED_PATH,
): never {
  const separator = unauthorizedPath.includes("?") ? "&" : "?";
  redirect(`${unauthorizedPath}${separator}reason=${encodeURIComponent(reason)}`);
}

export async function requireChapterAccess(
  chapterSlug: string,
  options: RequireChapterAccessOptions = {},
) {
  const {
    allowedRoles = ["chapter_lead"],
    loginPath = "/login",
    onMismatch = "redirect",
    redirectToOwnChapterBasePath = "/",
    unauthorizedPath = DEFAULT_UNAUTHORIZED_PATH,
  } = options;

  const context = await getOptionalChapterAccessContext();

  if (!context?.user) {
    redirect(loginPath);
  }

  if (!context.profile) {
    redirectToUnauthorized("no-profile", unauthorizedPath);
  }

  if (!allowedRoles.includes(context.profile.role)) {
    notFound();
  }

  if (!context.chapter) {
    redirectToUnauthorized("no-chapter", unauthorizedPath);
  }

  if (context.chapter.slug !== chapterSlug) {
    if (onMismatch === "redirect") {
      redirectToOwnChapter(context.chapter.slug, redirectToOwnChapterBasePath);
    }

    notFound();
  }

  return context;
}

export async function requireChapterDashboardAccess(
  options: RequireChapterDashboardAccessOptions = {},
) {
  const {
    allowedRoles = ["chapter_lead", "content_creator"],
    loginPath = "/login",
    unauthorizedPath = DEFAULT_UNAUTHORIZED_PATH,
  } = options;

  const context = await getOptionalChapterAccessContext();

  if (!context?.user) {
    console.log("[chapter-access] requireChapterDashboardAccess: no user → redirect to login");
    redirect(loginPath);
  }

  if (!context.profile) {
    console.log("[chapter-access] requireChapterDashboardAccess: no profile → unauthorized(no-profile)");
    redirectToUnauthorized("no-profile", unauthorizedPath);
  }

  const isSuperAdmin = context.profile.role === "super_admin";

  if (!isSuperAdmin && !allowedRoles.includes(context.profile.role)) {
    console.log("[chapter-access] requireChapterDashboardAccess: role not allowed →", {
      role: context.profile.role,
      allowedRoles,
      isSuperAdmin,
    });
    notFound();
  }

  if (!context.chapter && !isSuperAdmin) {
    console.log("[chapter-access] requireChapterDashboardAccess: no chapter → unauthorized(no-chapter). Fix: assign a chapter_id to this user's profile in Supabase.", {
      userId: context.user.id,
      email: context.user.email,
      role: context.profile.role,
      chapter_id: context.profile.chapter_id ?? null,
    });
    redirectToUnauthorized("no-chapter", unauthorizedPath);
  }

  console.log("[chapter-access] requireChapterDashboardAccess: access granted →", {
    userId: context.user.id,
    role: context.profile.role,
    chapterId: context.chapter?.id ?? null,
    chapterSlug: context.chapter?.slug ?? null,
    isSuperAdmin,
  });

  return {
    ...context,
    isSuperAdmin,
  };
}
