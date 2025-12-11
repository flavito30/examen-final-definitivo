import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener egresado por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const egresado = await prisma.egresado.findUnique({
      where: { id: params.id },
      include: {
        empleos: {
          orderBy: { fechaInicio: 'desc' },
        },
      },
    })

    if (!egresado) {
      return NextResponse.json(
        { error: 'Egresado no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(egresado)
  } catch (error) {
    console.error('Error al obtener egresado:', error)
    return NextResponse.json(
      { error: 'Error al obtener egresado' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar egresado
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const egresado = await prisma.egresado.update({
      where: { id: params.id },
      data: {
        nombres: body.nombres,
        apellidos: body.apellidos,
        telefono: body.telefono,
        linkedin: body.linkedin,
      },
    })

    return NextResponse.json(egresado)
  } catch (error) {
    console.error('Error al actualizar egresado:', error)
    return NextResponse.json(
      { error: 'Error al actualizar egresado' },
      { status: 500 }
    )
  }
}
