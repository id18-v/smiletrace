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
  LucideProps
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
    id: 1,
    name: "Booking Calendar",
    href: "/dashboard3/Cal",
    icon: BookUser,
  }, 
 
  {
    id: 3,
    name: "User Management",
    href: "/dashboard3/User_Management",
    icon: User2,
    subItems: [
      {
        id: 31,
        name: "Teeth Chart",
        href: "/dashboard3/User_Management/teeth-chart",
        icon: Calendar,
      },
      {
        id: 32,
        name: "UserPage",
        href: "/dashboard3/settings/UserPage",
        icon: User2 ,
      },
       
      
    
      
    ],
  },
  {
    id: 4,
    name: "Settings",
    href: "/dashboard3/settings",
    icon: Settings,
    subItems: [
      {
        id: 41,
        name: "ClinicSettings",
        href: "/dashboard3/settings/ClinicSettings",
        icon: User2,
      },
     
      {
        id: 44,
        name: "Email",
        href: "/dashboard3/settings/Email",
        icon: Bell,
      },
      
      {
        id: 43,
        name: "Utility",
        href: "/dashboard3/settings/utilities",
        icon: Palette,
      },
      
    ],
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
              className={`w-full flex items-center justify-between px-3 py-2 mb-1 rounded-lg transition ${
                isParentActive(link)
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
              className={`w-full flex items-center px-3 py-2 mb-1 rounded-lg transition ${
                isActive(link.href)
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.name}
            </button>
          )}

          {/* Dropdown Items */}
          {link.subItems && openDropdowns.includes(link.id) && (
            <div className="ml-8 mb-2 space-y-1">
              {link.subItems.map((subItem) => (
                <button
                  key={subItem.id}
                  onClick={() => router.push(subItem.href)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition text-sm ${
                    isActive(subItem.href)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <subItem.icon className="w-4 h-4 mr-3" />
                  {subItem.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}