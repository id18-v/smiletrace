// app/dashboard3/layout.tsx - ACEASTA ESTE VERSIUNEA CORECTĂ
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardContent from './dashboard-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  console.log('Layout - Session user:', session.user)
  console.log('Layout - User name:', session.user.name)

  return (
    <DashboardContent user={session.user}>
      {children}
    </DashboardContent>
  )
}