import { ChapterAccessDebug } from "@/components/debug/ChapterAccessDebug";
import { ChapterDashboardProvider } from "@/components/providers/ChapterDashboardProvider";
import {
  getChapterAccessDebugInfo,
  requireChapterDashboardAccess,
} from "@/lib/chapter-access";

export default async function ChapterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireChapterDashboardAccess();

  return (
    <>
      <ChapterAccessDebug
        info={getChapterAccessDebugInfo(access)}
      />
      <ChapterDashboardProvider
        value={{
          chapterId: access.chapter?.id ?? null,
          chapterSlug: access.chapter?.slug ?? null,
          chapterName: access.chapter?.name ?? null,
          isSuperAdmin: access.isSuperAdmin,
          orgRole: access.profile?.role ?? null,
        }}
      >
        {children}
      </ChapterDashboardProvider>
    </>
  );
}
