import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { empleoSchema } from '@/lib/validations'

// POST - Crear nuevo empleo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validatedData = empleoSchema.parse(body)

    // Si es empleo actual, desmarcar otros empleos actuales del mismo egresado
    if (validatedData.actual) {
      await prisma.empleo.updateMany({
        where: {
          egresadoId: body.egresadoId,
          actual: true,
        },
        data: { actual: false },
      })
    }

    const empleo = await prisma.empleo.create({
      data: {
        empresa: validatedData.empresa,
        cargo: validatedData.cargo,
        sector: validatedData.sector,
        fechaInicio: new Date(validatedData.fechaInicio),
        fechaFin: validatedData.fechaFin ? new Date(validatedData.fechaFin) : null,
        salario: validatedData.salario,
        actual: validatedData.actual,
        egresadoId: body.egresadoId,
      },
    })

    return NextResponse.json(empleo, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear empleo:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear empleo' },
      { status: 500 }
    )
  }
}
