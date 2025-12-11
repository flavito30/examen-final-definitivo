import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalEgresados, empleados, encuestas, eventos] = await Promise.all([
      prisma.egresado.count(),
      prisma.egresado.count({
        where: {
          empleos: {
            some: {
              actual: true
            }
          }
        }
      }),
      prisma.encuesta.count({
        where: { activa: true }
      }),
      prisma.evento.count({
        where: {
          fecha: {
            gte: new Date()
          }
        }
      })
    ])

    return NextResponse.json({
      totalEgresados,
      empleados,
      encuestas,
      eventos
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json({
      totalEgresados: 0,
      empleados: 0,
      encuestas: 0,
      eventos: 0
    })
  }
}
