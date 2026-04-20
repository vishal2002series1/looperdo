import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract the country code from Cloudflare (Hostinger) or Vercel's edge headers.
  // Cloudflare uses 'cf-ipcountry'. Vercel uses 'x-vercel-ip-country'.
  // If running locally on your machine, these headers are missing, so we default to 'US'.
  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || 'US';

  const response = NextResponse.next();

  // Set a cookie with the user's country code so our client components can read it instantly
  response.cookies.set('user-country', country, { 
      path: '/',
      httpOnly: false, // Allows client-side JS to read it
      sameSite: 'lax'
  });

  return response;
}

// We only need to run this middleware on pages where pricing matters
export const config = {
  matcher: [
    '/pricing',
    '/dashboard',
  ],
};