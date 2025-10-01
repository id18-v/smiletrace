import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'  // sau '@/src/lib/db' dacă ai src folder
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Test endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Register API is working' 
  })
}

// Register endpoint complet
export async function POST(request: Request) {
  console.log('=== REGISTER API CALLED ===')
  
  try {
    // 1. Citește body-ul
    let body;
    try {
      body = await request.json()
      console.log('Body received:', body)
    } catch (e) {
      console.error('Failed to parse body:', e)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 2. Verifică câmpurile obligatorii
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Email, password și name sunt obligatorii' },
        { status: 400 }
      )
    }

    // 3. Verifică dacă utilizatorul există deja
    console.log('Checking if user exists...')
    const existingUser = await prisma.user.findUnique({
      where: { 
        email: body.email 
      }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return NextResponse.json(
        { error: 'Un utilizator cu acest email există deja' },
        { status: 400 }
      )
    }

    // 4. Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // 5. Creează utilizatorul în baza de date
    console.log('Creating user in database...')
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phone: body.phone || null,
        role: body.role || 'DENTIST',
        licenseNumber: body.licenseNumber || null,
        specialization: body.specialization || null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('User created successfully:', newUser)

    // 6. Optional: Creează audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          userEmail: newUser.email,
          userName: newUser.name || '',
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: newUser.id,
          newValue: JSON.stringify({ 
            role: newUser.role,
            registeredAt: new Date().toISOString()
          }),
        }
      })
      console.log('Audit log created')
    } catch (auditError) {
      console.error('Failed to create audit log (non-critical):', auditError)
      // Continuăm chiar dacă audit log-ul eșuează
    }
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        role: newUser.role 
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

    // 7. Returnează succes
    return NextResponse.json(
      { 
        success: true,
        message: 'Utilizator înregistrat cu succes!',
        user: newUser
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Verifică tipul de eroare Prisma
    if (error instanceof Error) {
      // P2002 = Unique constraint violation
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'Email-ul este deja folosit' },
          { status: 400 }
        )
      }
      
      // P2003 = Foreign key constraint violation
      if (error.message.includes('P2003')) {
        return NextResponse.json(
          { error: 'Date invalide pentru rol sau alte câmpuri' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Eroare la înregistrare',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Eroare internă server' },
      { status: 500 }
    )
  }
}
