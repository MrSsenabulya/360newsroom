import { updateSession } from '@campus360/auth/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/.*|api/health|api/jobs).*)'],
};
