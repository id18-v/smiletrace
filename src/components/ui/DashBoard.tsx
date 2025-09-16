"use client"
import { cn } from "@/lib/utils";
import { BookUser, Calendar, CalendarCheck, HomeIcon, LucideProps, Settings, User, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
interface IAppPops{
    id: number;
    name: string;
    href: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

}
export const dashboardLinks = [
  {
    id: 0,
    name: "My Appointments",
    href: "/dashboard3/activity",
    icon: BookUser ,
  },
  {
    id: 1,
    name: "Quick Booking",
    href: "/dashboard3/Cal",
    icon: BookUser ,
  },
  {
    id: 2,
    name: "Advanced Booking",
    href: "/dashboard/AdvancedBooking",
    icon: CalendarCheck ,
  },
  {
    id: 3,
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings ,
  },
  
  // Add more links as needed
];
export function DashboardLinks() {
    const pathname = usePathname();
  return (
    <>
     {dashboardLinks.map((link) => (
       <Link className={cn(pathname=== link.href ? 'text-primary bg-primary/10' : "text-muted-foreground hover:text","flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary")} key={link.id} href={link.href}>
         <link.icon className="size-4" />
         {link.name}
       </Link>
     ))}
    </>
  );
}
/*  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity, current: true },
    { name: 'Programări', href: '/dashboard3/Cal', icon: Calendar, current: false },
    { name: 'Pacienți', href: '/patients', icon: Users, current: false },
    { name: 'Tratamente', href: '/treatments', icon: FileText, current: false },
    { name: 'Rapoarte', href: '/reports', icon: TrendingUp, current: false },
    { name: 'Setări', href: '/settings', icon: Settings, current: false },
  ] */ 