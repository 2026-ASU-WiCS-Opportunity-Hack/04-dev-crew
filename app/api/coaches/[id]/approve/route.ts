import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { approved } = await request.json() as { approved: boolean };
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from('coaches')
      .update({ is_approved: approved })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to update approval status.' }, { status: 500 });
  }
}
