"use client";

import { useParams } from "next/navigation";
import PatientPrintPage from "@/components/patients/print";

export default function PrintPage() {
  const params = useParams();
  const patientId = params.id as string;

  return <PatientPrintPage patientId={patientId} />;
}