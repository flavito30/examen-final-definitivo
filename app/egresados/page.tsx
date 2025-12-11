'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CARRERAS } from '@/lib/validations'

interface Egresado {
  id: string
  nombres: string
  apellidos: string
  dni: string
  email: string
  carrera: string
  anioEgreso: number
  empleos: Array<{
    id: string
    empresa: string
    cargo: string
    actual: boolean
  }>
}

export default function EgresadosPage() {
  const router = useRouter()
  const [egresados, setEgresados] = useState<Egresado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [carreraFilter, setCarreraFilter] = useState('')
  const [anioFilter, setAnioFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchEgresados = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(carreraFilter && { carrera: carreraFilter }),
        ...(anioFilter && { anio: anioFilter }),
      })

      const response = await fetch(`/api/egresados?${params}`)
      const result = await response.json()

      setEgresados(result.data)
      setTotalPages(result.pagination.totalPages)
      setTotal(result.pagination.total)
    } catch (error) {
      console.error('Error al cargar egresados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEgresados()
  }, [page, search, carreraFilter, anioFilter])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i)

  const getEstadoLaboral = (empleos: Egresado['empleos']) => {
    const empleoActual = empleos.find(e => e.actual)
    if (empleoActual) {
      return <span className="text-green-600 font-medium">Empleado</span>
    }
    if (empleos.length > 0) {
      return <span className="text-yellow-600">Desempleado</span>
    }
    return <span className="text-gray-500">Sin información</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Egresados</h1>
            <p className="text-muted-foreground">
              {total} egresado{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => router.push('/egresados/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Egresado
          </Button>
        </div>

        {/* FILTROS */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              <Select
                value={carreraFilter || "all"}
                onValueChange={(value) => {
                  setCarreraFilter(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las carreras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  {CARRERAS.map((carrera) => (
                    <SelectItem key={carrera} value={carrera}>
                      {carrera}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={anioFilter || "all"}
                onValueChange={(value) => {
                  setAnioFilter(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los años" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TABLA */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Egresados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando...
              </div>
            ) : egresados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron egresados
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Nombre Completo</th>
                        <th className="text-left p-4 font-medium">DNI</th>
                        <th className="text-left p-4 font-medium">Carrera</th>
                        <th className="text-left p-4 font-medium">Año Egreso</th>
                        <th className="text-left p-4 font-medium">Estado Laboral</th>
                        <th className="text-left p-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {egresados.map((egresado) => (
                        <tr key={egresado.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            {egresado.apellidos}, {egresado.nombres}
                          </td>
                          <td className="p-4">{egresado.dni}</td>
                          <td className="p-4">{egresado.carrera}</td>
                          <td className="p-4">{egresado.anioEgreso}</td>
                          <td className="p-4">{getEstadoLaboral(egresado.empleos)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/perfil?id=${egresado.id}`)}
                              >
                                Ver
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {Math.min((page - 1) * 10 + 1, total)} - {Math.min(page * 10, total)} de {total} egresados
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center px-4 text-sm">
                      Página {page} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
