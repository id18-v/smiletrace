'use client'

import { X, Activity, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { LucideIcon } from 'lucide-react'
import { DashboardLinks } from '../ui/DashBoard'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  navigation: { name: string; href: string; icon: LucideIcon; current: boolean }[]
  handleLogout: () => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, navigation, handleLogout }: SidebarProps) {
  const router = useRouter()
    
  return (
    <>
      {/* Overlay pentru mobil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar propriu-zis */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#020f18] shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-xl font-semibold dark:text-white">SmileTrace</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <nav className="mt-6 px-3">
  <DashboardLinks />
</nav>
          

        </nav>

        <div className="absolute bottom-0 w-full p-4 ">
          <button
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-4 text-muted-foreground"
          >
            
            Deconectare
          </button>
        </div>
      </div>
    </>
  )
}
