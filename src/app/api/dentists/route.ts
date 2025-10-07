// src/app/api/dentists/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all active dentists
    const dentists = await prisma.user.findMany({
      where: {
        role: { in: ['DENTIST', 'ADMIN'] },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        phone: true,
        licenseNumber: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: dentists,
      count: dentists.length
    })

  } catch (error) {
    console.error('Error fetching dentists:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dentists',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Create a new dentist (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const dentist = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: 'DENTIST',
        specialization: body.specialization || 'General Dentistry',
        phone: body.phone,
        licenseNumber: body.licenseNumber,
        isActive: true,
        password: null // OAuth users don't need password
      }
    })

    return NextResponse.json({
      success: true,
      data: dentist
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating dentist:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create dentist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}