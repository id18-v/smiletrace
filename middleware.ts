import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const protectedPaths = [
    '/dashboard3',
    // '/patients',
    // '/appointments', 
    // '/treatments',
    // '/profile',
    // '/settings'
  ]

  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !req.auth) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('redirect_to', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard3/:path*',
    // Decomentează când adaugi:
    // '/patients/:path*',
    // '/appointments/:path*',
    // '/treatments/:path*',
    // '/profile/:path*',
    // '/settings/:path*'
  ]
}