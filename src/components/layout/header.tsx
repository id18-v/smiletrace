// components/layout/header.tsx
import { Menu, Sun, Moon, Bell, Settings, LogOut } from 'lucide-react'

interface HeaderProps {
  mounted: boolean
  setTheme: (theme: string) => void
  theme: string
  setSidebarOpen: (open: boolean) => void
  user?: {
    id?: string
    email?: string
    name?: string | null
    role?: string
  } | null
  navigation: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    current: boolean
  }>
  name: string
  handleLogout: () => void
}

export function Header({ 
  mounted,
    
  setTheme, 
  theme, 
  setSidebarOpen, 
  user, 
  navigation, 
  name,
  handleLogout 
}: HeaderProps) {
      
  
    const userName = name 
  const userRole = user?.role || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg border-b dark:border-gray-700 h-16 flex-shrink-0">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page title - va fi hidden pe mobile */}
        <div className="hidden lg:block">
          
        </div>

        {/* Right side - User menu + theme toggle */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userInitials}
            </div>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}