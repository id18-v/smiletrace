import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { auth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function checkUserRole(allowedRoles: UserRole[]) {
  const session = await auth()
  
  if (!session?.user) {
    return false
  }
  
  return allowedRoles.includes(session.user.role as UserRole)
}

export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  
  return session.user
}