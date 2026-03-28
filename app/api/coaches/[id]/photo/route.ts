import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `coach-photos/${params.id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createSupabaseAdminClient();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 400 });
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const photoUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('coaches')
      .update({ photo_url: photoUrl })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: { photo_url: photoUrl } });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Photo upload failed.' }, { status: 500 });
  }
}
