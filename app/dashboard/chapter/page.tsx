import { ChapterDashboard } from "@/components/dashboard/ChapterDashboard";
import { requireChapterDashboardAccess } from "@/lib/chapter-access";
import { notFound } from "next/navigation";

export default async function ChapterDashboardPage() {
  const { chapter } = await requireChapterDashboardAccess();
  if (!chapter) {
    notFound();
  }

  return <ChapterDashboard chapterId={chapter.id} />;
}
