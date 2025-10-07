// src/app/api/patients/[id]/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PatientService } from "@/services/patient.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    const summary = await PatientService.getPatientSummary(params.id);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Error fetching patient summary:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea sumărului pacientului" },
      { status: 500 }
    );
  }
}