import {redirect} from "next/navigation"
import { auth } from "@/lib/auth"
export default async function requireUser() {
  const session = await auth()
  if (!session?.user) {
    return redirect("/dashboard1");
  }
    return session;
}