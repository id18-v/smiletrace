"use client"
import { 
  BookUser, 
  Calendar, 
  CalendarCheck, 
  Settings, 
  User2,
  ChevronDown,
  ChevronRight,
  Shield,
  Bell,
  Palette,
  Key,
  LucideProps,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";

interface ISubItem {
  id: number;
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

interface IAppPops {
  id: number;
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  subItems?: ISubItem[];
}

export const dashboardLinks: IAppPops[] = [
  {
    id: 0,
    name: "Appointments",
    href: "/dashboard3/booking",
    icon: BookUser,
  },
  
   {
    id: 2,
    name: "View Patient",
    href: "/dashboard3/patients",
    icon: User2,
  },  
     
  {
    id: 3,
    name: "Create Patient",
    href: "/dashboard3/patients/new",
    icon: UserPlus,
  },

    
];

export function DashboardLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([]);

  const toggleDropdown = (linkId: number) => {
    setOpenDropdowns(prev => 
      prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  const isActive = (href: string) => pathname === href;
  
  const isParentActive = (link: IAppPops) => {
    return pathname === link.href || 
           (link.subItems && link.subItems.some(sub => pathname === sub.href));
  };

  return (
    <>
      {dashboardLinks.map((link) => (
        <div key={link.id}>
          {/* Main Link */}
          {link.subItems ? (
            <button
              onClick={() => toggleDropdown(link.id)}
              className={`w-full flex items-center justify-between px-3 py-3 mb-1 rounded-lg transition ${
                isParentActive(link)
                ? 'bg-blue-50 dark:bg-[#00816c] text-white text-sm dark:text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-sm dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
              </div>
              {openDropdowns.includes(link.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center px-3 py-3 mb-1 rounded-lg transition ${
                isActive(link.href)
                  ? 'bg-blue-500 dark:bg-[#00816c] text-white text-sm dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:[#00816c] text-sm dark:hover:bg-gray-700'
              }`}
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.name}
            </button>
          )}

         
       
        </div>
      ))}
    </>
  );
}