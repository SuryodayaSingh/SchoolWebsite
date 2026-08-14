import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {

    const token = await getToken({ req: request });
    const url = request.nextUrl;

    if (token &&
        (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/verify') ||
            url.pathname === '/'
        )
    ) {
        // return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (url.pathname.startsWith('/admin')) {
        console.log("DEBUG - path:", url.pathname);
        console.log("DEBUG - token role:", token?.role);
        if (!token) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }
        if (token.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*',
        '/admin/:path*'
    ]
}