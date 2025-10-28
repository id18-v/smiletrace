
// src/app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Gender } from "@prisma/client";

// ✅ UPDATED FOR NEXT.JS 15: params is now a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id }, // ✅ Use destructured id
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            treatments: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Pacientul nu a fost găsit" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea pacientului" },
      { status: 500 }
    );
  }
}

// ✅ UPDATED FOR NEXT.JS 15: params is now a Promise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get old patient data for audit log
    const oldPatient = await prisma.patient.findUnique({
      where: { id }, // ✅ Use destructured id
    });

    if (!oldPatient) {
      return NextResponse.json(
        { error: "Pacientul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    const allowedFields = [
      "firstName", "lastName", "email", "phone", "dateOfBirth",
      "gender", "address", "city", "state", "zipCode", "country",
      "bloodType", "allergies", "medications", "medicalHistory",
      "insuranceProvider", "insurancePolicyNumber", "insuranceGroupNumber",
      "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation",
      "notes", "isActive"
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "dateOfBirth") {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedPatient = await prisma.patient.update({
      where: { id }, // ✅ Use destructured id
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PATIENT_UPDATED",
        entityType: "Patient",
        entityId: id, // ✅ Use destructured id
        oldData: oldPatient as any,
        newData: updatedPatient as any,
      },
    });

    return NextResponse.json(updatedPatient);
  } catch (error: any) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea pacientului" },
      { status: 500 }
    );
  }
}

// ✅ UPDATED FOR NEXT.JS 15: params is now a Promise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UPDATED: await params to get the actual values
    const { id } = await params;
    
    const session = await auth();

    // Permite oricărui utilizator autentificat să șteargă
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id }, // ✅ Use destructured id
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Pacientul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Soft delete - just mark as inactive
    await prisma.patient.update({
      where: { id }, // ✅ Use destructured id
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PATIENT_DELETED",
        entityType: "Patient",
        entityId: id, // ✅ Use destructured id
        oldData: patient as any,
      },
    });

    return NextResponse.json({ message: "Pacient șters cu succes" });
  } catch (error: any) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la ștergerea pacientului" },
      { status: 500 }
    );
  }
}