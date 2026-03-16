import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const currentUser = request.cookies.get('currentUser')
    const isLoginPage = request.nextUrl.pathname.startsWith('/login')

    if (!currentUser && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (currentUser && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
