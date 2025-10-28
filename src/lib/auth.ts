// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import prisma from "./db"
import bcrypt from "bcryptjs"
import { Prisma, PrismaClient, UserRole } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "DENTIST" as UserRole, // Rol default pentru Google
        }
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email și parola sunt obligatorii")
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email as string 
          }
        })

        if (!user || !user.password) {
          throw new Error("Email sau parolă incorectă")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Email sau parolă incorectă")
        }

        if (!user.isActive) {
          throw new Error("Contul a fost dezactivat")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "DENTIST"
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      // Log audit pentru login
      if (user?.email) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            userName: user.name || "",
            action: "USER_LOGIN",
            entityType: "User",
            entityId: user.id,
          }
        })
      }
    },
  },
})

