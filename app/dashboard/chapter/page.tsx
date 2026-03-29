import { ChapterDashboard } from "@/components/dashboard/ChapterDashboard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireChapterDashboardAccess } from "@/lib/chapter-access";
import { notFound } from "next/navigation";
import type {
  CampaignRecord,
  CoachRecord,
  EventRecord,
  PaymentRecord,
} from "@/lib/types";

export default async function ChapterDashboardPage() {
  const { chapter } = await requireChapterDashboardAccess();
  if (!chapter) {
    notFound();
  }

  const supabase = createSupabaseAdminClient();
  const [coachesRes, paymentsRes, eventsRes, campaignsRes, enrollmentsRes] =
    await Promise.all([
      supabase
        .from("coaches")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("full_name"),
      supabase
        .from("payments")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("events")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("event_date", { ascending: true })
        .limit(8),
      supabase
        .from("campaigns")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("enrollments")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <ChapterDashboard
      chapter={chapter}
      coaches={(coachesRes.data as CoachRecord[]) ?? []}
      payments={(paymentsRes.data as PaymentRecord[]) ?? []}
      events={(eventsRes.data as EventRecord[]) ?? []}
      campaigns={(campaignsRes.data as CampaignRecord[]) ?? []}
      enrollments={
        (enrollmentsRes.data as Array<{
          id: string;
          company_name: string;
          company_code: string;
          total_licenses: number;
          used_licenses: number;
          created_at: string;
        }>) ?? []
      }
    />
  );
}
