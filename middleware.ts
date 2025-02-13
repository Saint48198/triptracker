import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWTPayload } from '@/types/AuthTypes';

async function verifyToken(token: string, req: NextRequest) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const verifyTokenUrl = `${baseUrl}/api/auth/verify-token`;

    const response = await fetch(verifyTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

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

      // Check if the token exists in the database
      const tokenExists = await verifyToken(token, req);

      if (!tokenExists || tokenExists.count === 0) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Attach user information to the request
      (req as any).user = { id: payload.id, roles: payload.roles };

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
