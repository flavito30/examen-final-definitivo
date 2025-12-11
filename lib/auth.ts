import type { NextAuthConfig, User, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
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
          egresado: user.egresado
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | null }): Promise<JWT> {
      if (user) {
        token.rol = user.rol
        token.egresadoId = user.egresado?.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.rol = token.rol as string
        session.user.egresadoId = token.egresadoId as string
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
  secret: process.env.NEXTAUTH_SECRET,
}
