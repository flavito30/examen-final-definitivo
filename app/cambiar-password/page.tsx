'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1, 'Contraseña actual requerida'),
  passwordNueva: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmarPassword: z.string(),
}).refine((data) => data.passwordNueva === data.confirmarPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
})

type CambiarPasswordFormData = z.infer<typeof cambiarPasswordSchema>

export default function CambiarPasswordPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CambiarPasswordFormData>({
    resolver: zodResolver(cambiarPasswordSchema),
  })

  const onSubmit = async (data: CambiarPasswordFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al cambiar contraseña')
      }

      // Actualizar sesión para reflejar que ya no necesita cambiar contraseña
      await update({ mustChangePassword: false })

      // Redirigir según el rol
      if (session?.user?.rol === 'ADMIN') {
        router.push('/dashboard')
      } else {
        router.push('/perfil')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'actual' | 'nueva' | 'confirmar') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Cambio de Contraseña Requerido</CardTitle>
          <CardDescription>
            Por seguridad, debes cambiar tu contraseña antes de continuar.
            Tu contraseña actual es tu DNI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Contraseña Actual */}
            <div className="space-y-2">
              <Label htmlFor="passwordActual">
                Contraseña Actual (tu DNI)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passwordActual"
                  type={showPasswords.actual ? 'text' : 'password'}
                  placeholder="Ingresa tu DNI"
                  className="pl-10 pr-10"
                  {...register('passwordActual')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('actual')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.actual ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.passwordActual && (
                <p className="text-sm text-destructive">{errors.passwordActual.message}</p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="passwordNueva">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passwordNueva"
                  type={showPasswords.nueva ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10 pr-10"
                  {...register('passwordNueva')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('nueva')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.nueva ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.passwordNueva && (
                <p className="text-sm text-destructive">{errors.passwordNueva.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmarPassword">
                Confirmar Nueva Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmarPassword"
                  type={showPasswords.confirmar ? 'text' : 'password'}
                  placeholder="Repite la nueva contraseña"
                  className="pl-10 pr-10"
                  {...register('confirmarPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmar')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirmar ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmarPassword && (
                <p className="text-sm text-destructive">{errors.confirmarPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
