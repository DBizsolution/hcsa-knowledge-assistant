import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (auth handled inside handlers)
     * - _next/static, _next/image (assets)
     * - favicon and files with an extension (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
}
