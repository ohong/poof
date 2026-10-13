import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { configured } from '@/lib/config';
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({request});
  if (!configured()) return response;
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({name,value}) => request.cookies.set(name,value));
        response = NextResponse.next({request});
        values.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      },
    },
  });
  // Refresh the verified session. Authorization remains at each data boundary.
  await supabase.auth.getClaims();
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.well-known/workflow/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'] };
