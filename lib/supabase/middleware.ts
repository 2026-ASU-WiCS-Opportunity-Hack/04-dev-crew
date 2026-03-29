import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });
  const env = getSupabaseEnv();

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}
