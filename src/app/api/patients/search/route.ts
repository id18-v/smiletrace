// src/app/api/patients/search/route.ts
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

    // Parse filters
    const filters = {
      query: searchParams.get("query") || undefined,
      gender: searchParams.get("gender") as Gender | undefined,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      insuranceProvider: searchParams.get("insuranceProvider") || undefined,
      isActive: searchParams.get("isActive") === "true" ? true : 
                searchParams.get("isActive") === "false" ? false : undefined,
      minAge: searchParams.get("minAge") ? parseInt(searchParams.get("minAge")!) : undefined,
      maxAge: searchParams.get("maxAge") ? parseInt(searchParams.get("maxAge")!) : undefined,
      hasAllergies: searchParams.get("hasAllergies") === "true",
      hasMedications: searchParams.get("hasMedications") === "true",
    };

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const result = await PatientService.searchPatients(filters, page, pageSize);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error searching patients:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la căutarea pacienților" },
      { status: 500 }
    );
  }
}