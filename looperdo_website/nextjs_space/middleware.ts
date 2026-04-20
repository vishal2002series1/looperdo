import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 🐛 DEBUG X-RAY: Print all incoming headers to your Hostinger logs
  console.log('--- INCOMING HEADERS ---');
  request.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  const cfCountry = request.headers.get('cf-ipcountry');
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  const cloudfrontCountry = request.headers.get('cf-ipcountry'); // Sometimes named differently
  const nginxCountry = request.headers.get('x-country-code'); 

  console.log('Detected CF:', cfCountry);
  
  // Try a few common headers just in case Hostinger uses a custom Nginx proxy
  const country = cfCountry || vercelCountry || nginxCountry || cloudfrontCountry || 'US';

  const response = NextResponse.next();

  response.cookies.set('user-country', country, { 
      path: '/',
      httpOnly: false, 
      sameSite: 'lax',
      // Max age helps ensure it doesn't expire mid-session
      maxAge: 60 * 60 * 24 * 7 
  });

  return response;
}

export const config = {
  matcher: [
    '/pricing',
    '/dashboard',
  ],
};