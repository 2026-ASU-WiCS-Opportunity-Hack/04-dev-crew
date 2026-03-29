import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

// GET /api/jobs — all active listings
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_listings')
      .select('*, chapter:chapters(id, name, country)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Failed to fetch jobs.' }, { status: 500 });
  }
}

// POST /api/jobs — create a listing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapter_id, organization, title, description, engagement_type, location, is_remote, compensation, requirements, apply_deadline } = body;

    if (!organization || !title || !description || !engagement_type) {
      return NextResponse.json({ ok: false, error: 'organization, title, description, and engagement_type are required.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_listings')
      .insert({ chapter_id: chapter_id || null, organization, title, description, engagement_type, location: location || null, is_remote: !!is_remote, compensation: compensation || null, requirements: requirements || null, apply_deadline: apply_deadline || null })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Failed to create job.' }, { status: 500 });
  }
}
