import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    rol: string
    mustChangePassword: boolean
    egresado?: {
      id: string
    } | null
  }

  interface Session {
    user: {
      id: string
      email: string
      rol: string
      egresadoId?: string
      mustChangePassword: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol: string
    egresadoId?: string
    mustChangePassword: boolean
  }
}
