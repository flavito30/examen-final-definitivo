import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { egresadoSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

// GET - Listar egresados con paginación y filtros
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const carrera = searchParams.get('carrera') || ''
    const anio = searchParams.get('anio') || ''

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      // SQLite: LIKE es case-insensitive por defecto
      where.OR = [
        { nombres: { contains: search } },
        { apellidos: { contains: search } },
        { dni: { contains: search } },
      ]
    }

    if (carrera) {
      where.carrera = carrera
    }

    if (anio) {
      where.anioEgreso = parseInt(anio)
    }

    // Ejecutar queries
    const [egresados, total] = await Promise.all([
      prisma.egresado.findMany({
        where,
        include: {
          empleos: {
            where: { actual: true },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.egresado.count({ where }),
    ])

    return NextResponse.json({
      data: egresados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al listar egresados:', error)
    return NextResponse.json(
      { error: 'Error al listar egresados' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo egresado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validatedData = egresadoSchema.parse(body)

    // Verificar DNI duplicado
    const existingDni = await prisma.egresado.findUnique({
      where: { dni: validatedData.dni },
    })

    if (existingDni) {
      return NextResponse.json(
        { error: 'El DNI ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar email duplicado
    const existingEmail = await prisma.egresado.findUnique({
      where: { email: validatedData.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear usuario y egresado en una transacción
    // Password inicial = DNI del egresado (debe cambiarlo en primer login)
    const hashedPassword = await bcrypt.hash(validatedData.dni, 10)

    const egresado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          rol: 'EGRESADO',
          mustChangePassword: true, // Forzar cambio en primer login
        },
      })

      return await tx.egresado.create({
        data: {
          nombres: validatedData.nombres,
          apellidos: validatedData.apellidos,
          dni: validatedData.dni,
          email: validatedData.email,
          telefono: validatedData.telefono,
          linkedin: validatedData.linkedin,
          carrera: validatedData.carrera,
          anioEgreso: validatedData.anioEgreso,
          usuarioId: usuario.id,
        },
      })
    })

    return NextResponse.json(egresado, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear egresado:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear egresado' },
      { status: 500 }
    )
  }
}
