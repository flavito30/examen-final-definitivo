'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Briefcase, Calendar } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { empleoSchema, type EmpleoFormData, SECTORES } from '@/lib/validations'
import { formatDate } from '@/lib/utils'

interface Egresado {
  id: string
  nombres: string
  apellidos: string
  dni: string
  email: string
  telefono?: string
  linkedin?: string
  carrera: string
  anioEgreso: number
  empleos: Array<{
    id: string
    empresa: string
    cargo: string
    sector: string
    fechaInicio: string
    fechaFin?: string | null
    actual: boolean
  }>
}

export default function PerfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // Usar ID de URL (para admin viendo perfil) o ID de sesión (para egresado viendo su propio perfil)
  const egresadoIdFromUrl = searchParams.get('id')
  const egresadoIdFromSession = session?.user?.egresadoId
  const egresadoId = egresadoIdFromUrl || egresadoIdFromSession

  const isOwnProfile = !egresadoIdFromUrl || egresadoIdFromUrl === egresadoIdFromSession
  const isAdmin = session?.user?.rol === 'ADMIN'

  const [egresado, setEgresado] = useState<Egresado | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [trabajaActualmente, setTrabajaActualmente] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmpleoFormData>({
    resolver: zodResolver(empleoSchema),
    defaultValues: {
      actual: true,
    },
  })

  useEffect(() => {
    if (status === 'loading') return
    if (egresadoId) {
      fetchEgresado()
    } else {
      setIsLoading(false)
    }
  }, [egresadoId, status])

  const fetchEgresado = async () => {
    try {
      const response = await fetch(`/api/egresados/${egresadoId}`)
      const data = await response.json()
      setEgresado(data)
    } catch (error) {
      console.error('Error al cargar egresado:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: EmpleoFormData) => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/empleos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          egresadoId,
          actual: trabajaActualmente,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar empleo')
      }

      alert('Información laboral actualizada')
      reset()
      fetchEgresado() // Recargar datos
    } catch (error: any) {
      alert(error.message || 'Error al actualizar información laboral')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          Cargando...
        </div>
      </div>
    )
  }

  if (!egresado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
          <p className="text-muted-foreground">
            {!egresadoId
              ? 'No se encontró información de egresado asociada a tu cuenta.'
              : 'Egresado no encontrado'}
          </p>
          {/* Debug info */}
          <p className="text-xs text-gray-400">
            Session egresadoId: {egresadoIdFromSession || 'null'} | URL id: {egresadoIdFromUrl || 'null'}
          </p>
          {isAdmin && (
            <Button onClick={() => router.push('/egresados')}>
              Volver a lista de egresados
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Debug: mostrar info de sesión */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
          Rol: {session?.user?.rol} | EgresadoId: {egresadoIdFromSession || 'null'} | isOwnProfile: {String(isOwnProfile)} | isAdmin: {String(isAdmin)}
        </div>

        {/* Solo mostrar botón volver si es admin viendo perfil de otro */}
        {isAdmin && egresadoIdFromUrl && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* INFORMACIÓN PERSONAL */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                <p className="text-lg font-semibold">
                  {egresado.nombres} {egresado.apellidos}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">DNI</p>
                <p>{egresado.dni}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{egresado.email}</p>
              </div>
              {egresado.telefono && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p>{egresado.telefono}</p>
                </div>
              )}
              {egresado.linkedin && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                  <a
                    href={egresado.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver perfil
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carrera</p>
                <p>{egresado.carrera}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Año de Egreso</p>
                <p>{egresado.anioEgreso}</p>
              </div>
            </CardContent>
          </Card>

          {/* INFORMACIÓN LABORAL */}
          <div className="md:col-span-2 space-y-6">
            {/* FORMULARIO - Solo visible para el egresado editando su propio perfil */}
            {(isOwnProfile && !isAdmin) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Actualizar Información Laboral
                </CardTitle>
                <CardDescription>
                  Registra tu empleo actual o pasado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="empresa">
                        Empresa <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="empresa"
                        placeholder="Tech Solutions SAC"
                        {...register('empresa')}
                        disabled={isSaving}
                      />
                      {errors.empresa && (
                        <p className="text-sm text-destructive">{errors.empresa.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">
                        Cargo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cargo"
                        placeholder="Desarrollador Full Stack"
                        {...register('cargo')}
                        disabled={isSaving}
                      />
                      {errors.cargo && (
                        <p className="text-sm text-destructive">{errors.cargo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector">
                        Sector <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) => setValue('sector', value)}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTORES.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sector && (
                        <p className="text-sm text-destructive">{errors.sector.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio">
                        Fecha de Inicio <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        {...register('fechaInicio')}
                        disabled={isSaving}
                      />
                      {errors.fechaInicio && (
                        <p className="text-sm text-destructive">{errors.fechaInicio.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salario">Salario (S/) - Opcional</Label>
                      <Input
                        id="salario"
                        type="number"
                        placeholder="3500"
                        {...register('salario')}
                        disabled={isSaving}
                      />
                      {errors.salario && (
                        <p className="text-sm text-destructive">{errors.salario.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="actual"
                          checked={trabajaActualmente}
                          onChange={(e) => setTrabajaActualmente(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="actual" className="cursor-pointer">
                          Actualmente trabajo aquí
                        </Label>
                      </div>
                    </div>

                    {!trabajaActualmente && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="fechaFin">Fecha de Fin</Label>
                        <Input
                          id="fechaFin"
                          type="date"
                          {...register('fechaFin')}
                          disabled={isSaving}
                        />
                        {errors.fechaFin && (
                          <p className="text-sm text-destructive">{errors.fechaFin.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            )}

            {/* HISTORIAL LABORAL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historial Laboral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {egresado.empleos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay historial laboral registrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {egresado.empleos.map((empleo) => (
                      <div
                        key={empleo.id}
                        className="border-l-4 border-primary pl-4 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{empleo.empresa}</h4>
                            <p className="text-sm text-muted-foreground">{empleo.cargo}</p>
                            <p className="text-sm text-muted-foreground">
                              Sector: {empleo.sector}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(empleo.fechaInicio)} -{' '}
                              {empleo.actual ? (
                                <span className="text-green-600 font-medium">Actualidad</span>
                              ) : empleo.fechaFin ? (
                                formatDate(empleo.fechaFin)
                              ) : (
                                'No especificado'
                              )}
                            </p>
                          </div>
                          {empleo.actual && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Actual
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
