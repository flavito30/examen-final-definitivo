'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { egresadoSchema, type EgresadoFormData, CARRERAS } from '@/lib/validations'

export default function NuevoEgresadoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EgresadoFormData>({
    resolver: zodResolver(egresadoSchema),
  })

  const onSubmit = async (data: EgresadoFormData) => {
    setIsLoading(true)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/egresados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar egresado')
      }

      setSuccessMessage('Egresado registrado exitosamente')
      reset()

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/egresados')
      }, 2000)
    } catch (error: any) {
      alert(error.message || 'Error al registrar egresado')
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Registrar Nuevo Egresado</CardTitle>
            <CardDescription>
              Complete los datos del egresado para agregarlo al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* DATOS PERSONALES */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Datos Personales</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">
                      Nombres <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nombres"
                      placeholder="Juan Carlos"
                      {...register('nombres')}
                      disabled={isLoading}
                    />
                    {errors.nombres && (
                      <p className="text-sm text-destructive">{errors.nombres.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos">
                      Apellidos <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apellidos"
                      placeholder="Pérez García"
                      {...register('apellidos')}
                      disabled={isLoading}
                    />
                    {errors.apellidos && (
                      <p className="text-sm text-destructive">{errors.apellidos.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni">
                      DNI <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dni"
                      placeholder="12345678"
                      maxLength={8}
                      {...register('dni')}
                      disabled={isLoading}
                    />
                    {errors.dni && (
                      <p className="text-sm text-destructive">{errors.dni.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan.perez@ejemplo.com"
                      {...register('email')}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      placeholder="987654321"
                      {...register('telefono')}
                      disabled={isLoading}
                    />
                    {errors.telefono && (
                      <p className="text-sm text-destructive">{errors.telefono.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/usuario"
                      {...register('linkedin')}
                      disabled={isLoading}
                    />
                    {errors.linkedin && (
                      <p className="text-sm text-destructive">{errors.linkedin.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* DATOS ACADÉMICOS */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Datos Académicos</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="carrera">
                      Carrera <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue('carrera', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARRERAS.map((carrera) => (
                          <SelectItem key={carrera} value={carrera}>
                            {carrera}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.carrera && (
                      <p className="text-sm text-destructive">{errors.carrera.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anioEgreso">
                      Año de Egreso <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue('anioEgreso', parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un año" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.anioEgreso && (
                      <p className="text-sm text-destructive">{errors.anioEgreso.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
                  {successMessage}
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Registrando...' : 'Registrar Egresado'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
