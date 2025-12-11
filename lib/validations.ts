import { z } from 'zod'

// Schema de validación para registro de egresado
export const egresadoSchema = z.object({
  nombres: z.string().min(2, 'Mínimo 2 caracteres'),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
  dni: z.string()
    .length(8, 'DNI debe tener 8 dígitos')
    .regex(/^\d+$/, 'Solo números'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  linkedin: z.string().url('URL inválida').optional().or(z.literal('')),
  carrera: z.string().min(1, 'Seleccione una carrera'),
  anioEgreso: z.coerce.number()
    .min(2000, 'Año mínimo 2000')
    .max(new Date().getFullYear(), 'Año no puede ser futuro'),
})

export type EgresadoFormData = z.infer<typeof egresadoSchema>

// Schema de validación para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema de validación para empleo
export const empleoSchema = z.object({
  empresa: z.string().min(2, 'Mínimo 2 caracteres'),
  cargo: z.string().min(2, 'Mínimo 2 caracteres'),
  sector: z.string().min(1, 'Seleccione un sector'),
  fechaInicio: z.string().min(1, 'Fecha requerida'),
  fechaFin: z.string().optional(),
  salario: z.coerce.number().optional(),
  actual: z.boolean().default(false),
})

export type EmpleoFormData = z.infer<typeof empleoSchema>

// Carreras disponibles
export const CARRERAS = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Mecánica',
  'Ingeniería Electrónica',
  'Ingeniería Ambiental',
  'Gestión Empresarial',
] as const

// Sectores laborales
export const SECTORES = [
  'Tecnología',
  'Financiero',
  'Educación',
  'Salud',
  'Manufactura',
  'Servicios',
  'Gobierno',
  'Otros',
] as const
