// app/dashboard3/dashboard-client.tsx - CLEAN VERSION
'use client'

import { signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { dashboardLinks } from '@/components/ui/DashBoard'
import Sidebar from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

interface DashboardContentProps {
  user: {
    id: string
    email: string
    name?: string | null
    role: string
  }
  children: React.ReactNode
}

export default function DashboardContent({ user, children }: DashboardContentProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const pathname = usePathname()
  const navWithCurrent = dashboardLinks.map((item) => ({
    ...item,
    current: pathname === item.href,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigation={navWithCurrent}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header - DOAR UNUL! */}
        <Header
          mounted={mounted}
          setTheme={setTheme}
          theme={theme || 'light'}
          setSidebarOpen={setSidebarOpen}
          user={user}
          navigation={navWithCurrent}
          handleLogout={handleLogout} name={user?.name || 'Utilizator'}        />

        {/* Main Content */}
        <main className="p-6">
          {/* Debug - să vedem ce se întâmplă */}
          
          
          {/* Conținutul real - fără wrapper care blochează */}
          {children}
        </main>
      </div>
    </div>
  )
}