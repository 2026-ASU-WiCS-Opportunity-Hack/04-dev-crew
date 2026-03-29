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
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileData as ProfileRecord | null) ?? null;

  let chapter: ChapterRecord | null = null;
  if (profile?.chapter_id) {
    const { data: chapterData } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", profile.chapter_id)
      .maybeSingle();

    chapter = (chapterData as ChapterRecord | null) ?? null;
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
    redirect(loginPath);
  }

  if (!context.profile) {
    redirectToUnauthorized("no-profile", unauthorizedPath);
  }

  const isSuperAdmin = context.profile.role === "super_admin";

  if (!isSuperAdmin && !allowedRoles.includes(context.profile.role)) {
    notFound();
  }

  if (!context.chapter) {
    redirectToUnauthorized("no-chapter", unauthorizedPath);
  }

  return {
    ...context,
    isSuperAdmin,
  };
}
