import { ContentCreatorDashboard } from "@/components/dashboard/ContentCreatorDashboard";
import { ChapterDashboard } from "@/components/dashboard/ChapterDashboard";
import { requireChapterDashboardAccess } from "@/lib/chapter-access";
import { notFound } from "next/navigation";

export default async function ChapterDashboardPage() {
  const { chapter, profile } = await requireChapterDashboardAccess();
  if (!chapter) {
    notFound();
  }

  if (profile?.role === "content_creator") {
    return <ContentCreatorDashboard chapterId={chapter.id} />;
  }

  return <ChapterDashboard chapterId={chapter.id} />;
}
