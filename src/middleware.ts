import { auth } from "@/auth"
import { NextResponse } from "next/server"

// @ts-ignore
export default auth((req) => {
    const isLoggedIn = !!req.auth
    const role = req.auth?.user?.role
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isPublicRoute = req.nextUrl.pathname === '/auth/signin'

    // Force login for everything except auth routes
    if (!isLoggedIn && !isAuthRoute) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    if (isAdminRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/auth/signin', req.url))
        }
        // @ts-ignore
        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.url))
        }
    }

    // Redirect to home if already logged in and visiting signin
    if (isLoggedIn && isPublicRoute) {
        return NextResponse.redirect(new URL('/', req.url))
    }
})

export const config = {
    // Exclude api, static files, images, favicon
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
