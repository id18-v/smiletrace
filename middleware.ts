import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Definește rutele protejate
  const protectedPaths = [
    '/dashboard3',
    //'/patients',
    //'/appointments', 
    //'/treatments',
    //'/profile',
    //'/settings'
  ]
  
  // Verifică dacă ruta curentă e protejată
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    // Caută token-ul în cookies (adaptează numele la al tău)
    const token = request.cookies.get('token')?.value || 
                  request.cookies.get('auth-token')?.value ||
                  request.cookies.get('authToken')?.value

    // Dacă nu există token, redirect la login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      // Opțional: adaugă redirect_to pentru a reveni la pagina dorită după login
      loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configurează rutele pe care să ruleze middleware-ul
export const config = {
  matcher: [
    '/dashboard3/:path*',
   // '/patients/:path*',
   // '/appointments/:path*', 
   // '/treatments/:path*',
   // '/profile/:path*',
   // '/settings/:path*'
  ]
}