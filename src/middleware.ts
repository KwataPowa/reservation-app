import { auth } from "@/auth"
import { NextResponse } from "next/server"

// @ts-ignore
export default auth((req) => {
    const isLoggedIn = !!req.auth
    // @ts-ignore
    const role = req.auth?.user?.role
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isReservationsRoute = req.nextUrl.pathname.startsWith('/reservations')

    if (isAdminRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/auth/signin', req.url))
        }
        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.url))
        }
    }

    if (isReservationsRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
