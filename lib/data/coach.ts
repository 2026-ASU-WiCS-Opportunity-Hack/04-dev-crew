import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CoachRecord } from '@/lib/types';

/**
 * Cached coach fetch — React's `cache()` deduplicates calls within a single
 * server render pass (layout + page share one DB round-trip).
 */
export const getCoach = cache(async (id: string): Promise<CoachRecord | null> => {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', id)
    .single<CoachRecord>();
  return data ?? null;
});
