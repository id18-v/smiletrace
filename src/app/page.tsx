import Image from "next/image";
import {Footer} from "@/components/layout/footer"
import { AuthModal } from "./(auth)/Auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppointmentsPage from "./(dashboard)/appointments/page";
export default async function Home() {
    const session = await auth();
     
  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <Footer />
      
    </div>
    
    </>
  );
}
