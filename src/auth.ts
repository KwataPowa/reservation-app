import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

export const config = {
    providers: [], // We are using manual CAS flow
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    // Explicitly define cookie names to ensure consistency with manual CAS callback
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // If we need to update the token
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                // @ts-ignore
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
