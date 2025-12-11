import { auth } from "./auth"
import { NextResponse } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/api/auth"]

// Rutas protegidas que requieren autenticación
const protectedRoutes = ["/dashboard", "/egresados", "/perfil"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )
  const isChangePasswordRoute = nextUrl.pathname === "/cambiar-password"
  const isApiRoute = nextUrl.pathname.startsWith("/api")

  // Permitir rutas de API (excepto las protegidas que se manejan en el endpoint)
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Si no está autenticado y trata de acceder a ruta protegida
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Si está autenticado y va a login, redirigir según rol
  if (isLoggedIn && nextUrl.pathname === "/login") {
    if (user?.mustChangePassword) {
      return NextResponse.redirect(new URL("/cambiar-password", nextUrl))
    }
    const redirectTo = user?.rol === "ADMIN" ? "/dashboard" : "/perfil"
    return NextResponse.redirect(new URL(redirectTo, nextUrl))
  }

  // Si está autenticado y necesita cambiar contraseña
  if (isLoggedIn && user?.mustChangePassword) {
    // Permitir acceso a la página de cambio de contraseña
    if (isChangePasswordRoute) {
      return NextResponse.next()
    }
    // Redirigir cualquier otra ruta protegida a cambio de contraseña
    if (isProtectedRoute || nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/cambiar-password", nextUrl))
    }
  }

  // Si está en cambiar-password pero ya no necesita cambiar
  if (isLoggedIn && isChangePasswordRoute && !user?.mustChangePassword) {
    const redirectTo = user?.rol === "ADMIN" ? "/dashboard" : "/perfil"
    return NextResponse.redirect(new URL(redirectTo, nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Incluir todas las rutas excepto archivos estáticos
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
