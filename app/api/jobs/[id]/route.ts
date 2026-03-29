import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface Params { params: { id: string } }

// GET /api/jobs/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_listings')
      .select('*, chapter:chapters(id, name, country)')
      .eq('id', params.id)
      .single();

    if (error || !data) return NextResponse.json({ ok: false, error: 'Job not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/jobs/[id] — update listing
export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_listings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/jobs/[id] — soft delete (deactivate)
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from('job_listings')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
