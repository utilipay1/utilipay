import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Notice this is a plain object, not NextAuth()
export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isApiRoute = nextUrl.pathname.startsWith('/api')
      const isLogin = nextUrl.pathname === '/login'
      const isAuthApi = nextUrl.pathname.startsWith('/api/auth')

      if (isAuthApi) return true
      if (isLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
        return true
      }

      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
