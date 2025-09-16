import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  console.log('=== LOGIN API CALLED ===')
  
  try {
    const body = await request.json()
    console.log('Login attempt for:', body.email)

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email și password sunt obligatorii' },
        { status: 400 }
      )
    }

    // Găsește user-ul
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email sau parolă incorectă' },
        { status: 401 }
      )
    }

    // Verifică parola
    if (!user.password) {
      return NextResponse.json(
        { error: 'Email sau parolă incorectă' },
        { status: 401 }
      )
    }
    
    const isValidPassword = await bcrypt.compare(body.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email sau parolă incorectă' },
        { status: 401 }
      )
    }

    // Verifică dacă contul e activ
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Contul este dezactivat' },
        { status: 401 }
      )
    }

    // Creează JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    
    // Setează cookie-ul
    ;(await
          // Setează cookie-ul
          cookies()).set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 zile
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name || '',
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
          newValue: JSON.stringify({ 
            loginAt: new Date().toISOString()
          }),
        }
      })
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Autentificare reușită!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Eroare la autentificare' },
      { status: 500 }
    )
  }
}