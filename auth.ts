import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./lib/prisma"

export const config = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña requeridos")
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: { egresado: true }
        })

        if (!user) {
          throw new Error("Email o contraseña incorrectos")
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          throw new Error("Email o contraseña incorrectos")
        }

        return {
          id: user.id,
          email: user.email,
          rol: user.rol,
          mustChangePassword: user.mustChangePassword,
          egresado: user.egresado
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol
        token.egresadoId = user.egresado?.id
        token.mustChangePassword = user.mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.rol = token.rol as string
        session.user.egresadoId = token.egresadoId as string
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
