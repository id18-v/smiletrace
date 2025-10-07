// src/app/api/patients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PatientService } from "@/services/patient.service";
import { Gender } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const result = await PatientService.searchPatients({}, page, pageSize);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea pacienților" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Date invalide în request" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "phone", "dateOfBirth", "gender"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Câmpul ${field} este obligatoriu` },
          { status: 400 }
        );
      }
    }

    // Validate gender
    if (!["MALE", "FEMALE", "OTHER"].includes(body.gender)) {
      return NextResponse.json(
        { error: "Gen invalid" },
        { status: 400 }
      );
    }

    // Create patient data object
    const patientData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || undefined,
      phone: body.phone,
      dateOfBirth: new Date(body.dateOfBirth),
      gender: body.gender as Gender,
      address: body.address || undefined,
      city: body.city || undefined,
      state: body.state || undefined,
      zipCode: body.zipCode || undefined,
      country: body.country || "USA",
      bloodType: body.bloodType || undefined,
      allergies: body.allergies || [],
      medications: body.medications || [],
      medicalHistory: body.medicalHistory || undefined,
      insuranceProvider: body.insuranceProvider || undefined,
      insurancePolicyNumber: body.insurancePolicyNumber || undefined,
      insuranceGroupNumber: body.insuranceGroupNumber || undefined,
      emergencyContactName: body.emergencyContactName || undefined,
      emergencyContactPhone: body.emergencyContactPhone || undefined,
      emergencyContactRelation: body.emergencyContactRelation || undefined,
      notes: body.notes || undefined,
      createdById: session.user.id,
    };

    const patient = await PatientService.createPatient(patientData);

    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea pacientului" },
      { status: 500 }
    );
  }
}