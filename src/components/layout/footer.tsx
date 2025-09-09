import Link from "next/link"
import Image from "next/image"
import { AuthModal } from "@/app/(auth)/Auth";

export function Footer() {
  return (
      <div className="flex py-5 items-center justify-between ">
             <Link href="/" className="flex items-center gab-2">
               <Image src="/images/SmileTrace.png" alt="Home" width={400} height={400} className="size-50" />
               <h4 className="text-3xl font-semibold">Smile <span className="text-blue-500">Trace</span></h4>
             </Link>
                  <AuthModal />
             
      </div>
  );
}
