import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWTPayload } from '@/types/AuthTypes';

export async function middleware(req: NextRequest) {
  const adminPaths = ['/admin']; // Define all admin paths
  const token = req.cookies.get('auth_token')?.value;

  console.log('Middleware is executing...');

  // Check if the request path is in the admin paths
  if (adminPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      if (!process.env.JWT_SECRET) {
        return NextResponse.error();
      }
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET); // Ensure to set JWT_SECRET in env
      const { payload } = (await jwtVerify(token, secret)) as {
        payload: JWTPayload;
      };

      // Check if the user has the "admin" role
      if (!payload.roles.includes('admin')) {
        return NextResponse.redirect(new URL('/403', req.url)); // Redirect to forbidden page
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('JWT verification error:', err.message);
      } else {
        console.error('JWT verification error:');
      }

      // Token verification failed
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next(); // Continue to the requested route
}
