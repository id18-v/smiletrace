import Link from "next/link";
import Image from "next/image";
import { DashboardLinks } from "@/components/ui/DashBoard";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/Theme.Toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { auth, signOut } from "@/lib/auth";
import { Dropdown } from "react-day-picker";
import requireUser from "@/hooks/session";

export default async function DashboardLayout({children}: {
  children: React.ReactNode;
}){
  const session = await requireUser()
  return (
         <>
        <div className="min-h-screen w-full grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden md:block border-r bg-muted/40">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center">
                  <Image src="/images/SmileTrace.png" alt="Logo" className="size-20"  width={80} height={80} />
                  <p className="text-xl font-bold">Smile<span className="text-primary">Trace</span></p>
                </Link>
              </div>
              {/* Add more sidebar content here */}
              <div className="flex-1">
                <nav className="grid items-start px-2 lg:px-4"> 
                  <DashboardLinks />
                  </nav>
                  </div> 
            </div>

          </div>
          <div className="flex flex-col">
              <header className="flex h-14 items-center gap-4 border-b px-4 bg-muted/40 px-4 lg:h-[60px] lg:px-6">
               <Sheet>
                 <SheetTrigger asChild>
                   <Button className="md:hidden shrink-0 bg-primary" size="icon" variant="outline">
                     <Menu className="size-5" />
                   </Button>
                 </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                             <nav className="grid gap-2 mt-2">
                  <DashboardLinks />
                             </nav>
                            <SheetHeader className="mt-auto">
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </SheetDescription>
    </SheetHeader>

                  </SheetContent >

               </Sheet>
               <div className="ml-auto flex items-center gap-x-4">
                   <ThemeToggle />
                   <DropdownMenu >
                     <DropdownMenuTrigger asChild>
                       <Button variant="secondary" size="icon" className="rounded-full">
                         <img src={session?.user?.image as string} alt="User Avatar"  width={20} height={20} className="w-full h-full rounded-full"/>
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" >
                      <DropdownMenuLabel >Profile</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
                       <DropdownMenuItem asChild><form className="w-full" action={async() => {
                         "use server"
                         await signOut()
                       }}> <button className="w-full text-left">Log out</button></form></DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
               </div>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
          </div>
        </div>
     </>
  )

}