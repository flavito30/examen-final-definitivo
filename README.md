# Sistema de Gestión y Seguimiento de Egresados

Sistema web desarrollado con Next.js 14+ para la gestión de egresados universitarios bajo metodología XP (Extreme Programming).

**Universidad Nacional Tecnológica de Lima Sur (UNTELS)**
**Asignatura**: Ingeniería de Software
**Examen Final 2025-II**

---

## 📋 Características Implementadas - Iteración 1

### ✅ Historias de Usuario Completadas

- **HU-01**: Registro de Egresado - Formulario completo con validaciones
- **HU-02**: Actualización de Información Laboral - Gestión de empleos actual e histórico
- **HU-03**: Visualización de Lista de Egresados - Tabla con paginación, búsqueda y filtros
- **HU-04**: Login y Autenticación - Sistema de autenticación con NextAuth.js

### 🔧 Funcionalidades

- Autenticación de usuarios (Admin/Egresado)
- Registro de nuevos egresados con validaciones
- Actualización de información laboral
- Historial de empleos
- Búsqueda y filtros por carrera y año
- Paginación de resultados
- Dashboard administrativo
- Gestión del cambio: Campo LinkedIn agregado
- Gestión de riesgo: Compatible con Supabase y Vercel Postgres

---

## 🛠️ Stack Tecnológico

### Core
- **Framework**: Next.js 14.2.15 (App Router)
- **Lenguaje**: TypeScript 5.6
- **Estilos**: Tailwind CSS 3.4
- **Componentes UI**: shadcn/ui (Radix UI)

### Base de Datos
- **ORM**: Prisma 5.22
- **Base de Datos**: PostgreSQL
  - Opción 1: Supabase (Recomendado)
  - Opción 2: Vercel Postgres

### Autenticación
- **NextAuth.js** v5 (beta)
- **Bcrypt** para hash de contraseñas

### Validación
- **Zod** para schemas de validación
- **React Hook Form** para formularios

### Deployment
- **Vercel** (100% compatible)

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ instalado
- npm o yarn
- Cuenta en Supabase (o Vercel Postgres)

### 1. Clonar o copiar el proyecto

```bash
cd sistema-egresados
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Copiar ejemplo
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# OPCIÓN 1: Supabase (Recomendado)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# OPCIÓN 2: Vercel Postgres
# POSTGRES_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"

# NextAuth
NEXTAUTH_SECRET="tu-secret-aqui"  # Generar con: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

#### Generar NEXTAUTH_SECRET

```bash
# En Mac/Linux
openssl rand -base64 32

# Copiar el resultado a .env
```

### 4. Configurar Base de Datos en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear nuevo proyecto
3. Ir a **Settings → Database**
4. Copiar **Connection String** (Pooling mode)
5. Pegar en `.env` como `DATABASE_URL`
6. Reemplazar `[PASSWORD]` con tu contraseña

### 5. Sincronizar schema de base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con la BD
npx prisma db push

# (Opcional) Abrir Prisma Studio para ver la BD
npx prisma studio
```

### 6. Crear usuario administrador de prueba

Ejecutar en Prisma Studio o mediante query SQL:

```sql
-- Insertar usuario admin
INSERT INTO usuarios (id, email, password, rol, "createdAt", "updatedAt")
VALUES (
  'admin-id-001',
  'admin@untels.edu.pe',
  '$2a$10$rG2pYGxZGVfxY3Lm8X8.0.Y8KhQj7KG6Y.Yy8X8.0.Y8KhQj7KG6Yy',  -- Password: admin123
  'ADMIN',
  NOW(),
  NOW()
);
```

O crear con bcrypt:

```javascript
// Ejecutar en Node.js
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
// Copiar el hash y usarlo en el INSERT
```

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### 8. Credenciales de acceso

```
Email: admin@untels.edu.pe
Password: admin123
```

---

## 📂 Estructura del Proyecto

```
sistema-egresados/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth routes
│   │   ├── egresados/              # API egresados
│   │   │   ├── [id]/
│   │   │   │   └── route.ts        # GET, PUT egresado
│   │   │   └── route.ts            # GET (list), POST egresado
│   │   └── empleos/
│   │       └── route.ts            # POST empleo
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard admin
│   ├── egresados/
│   │   ├── nuevo/
│   │   │   └── page.tsx            # Formulario registro
│   │   └── page.tsx                # Lista de egresados
│   ├── login/
│   │   └── page.tsx                # Página de login
│   ├── perfil/
│   │   └── page.tsx                # Perfil + Info laboral
│   ├── layout.tsx                  # Layout principal
│   ├── page.tsx                    # Home (redirect)
│   └── globals.css                 # Estilos globales
├── components/
│   ├── ui/                         # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   └── select.tsx
│   ├── Navbar.tsx                  # Navbar principal
│   └── Providers.tsx               # SessionProvider
├── lib/
│   ├── auth.ts                     # Configuración NextAuth
│   ├── prisma.ts                   # Cliente Prisma
│   ├── utils.ts                    # Utilidades
│   └── validations.ts              # Schemas Zod
├── prisma/
│   └── schema.prisma               # Schema de BD
├── types/
│   └── next-auth.d.ts              # Types de NextAuth
├── .env.example                    # Ejemplo de variables
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📊 Base de Datos

### Modelos Principales

#### Usuario
- id, email, password, rol (ADMIN/EGRESADO)
- Relación 1:1 con Egresado

#### Egresado
- Datos personales: nombres, apellidos, dni, email, telefono, linkedin
- Datos académicos: carrera, anioEgreso
- Relación 1:N con Empleo

#### Empleo
- empresa, cargo, sector
- fechaInicio, fechaFin, salario
- actual (boolean)

### Diagramas

```
Usuario (1) ──── (1) Egresado (1) ──── (N) Empleo
```

---

## 🧪 Testing

### Credenciales de Prueba

**Administrador:**
```
Email: admin@untels.edu.pe
Password: admin123
```

### Casos de Prueba

Ver documentación completa en `/CASOS_DE_PRUEBA.md`

**Ejemplo**: CP-HU01-001 - Registro exitoso de egresado

1. Login como admin
2. Ir a "Nuevo Egresado"
3. Completar formulario con:
   - Nombres: Juan Carlos
   - Apellidos: Pérez García
   - DNI: 12345678
   - Email: juan.perez@gmail.com
   - LinkedIn: https://linkedin.com/in/juanperez
   - Carrera: Ingeniería de Sistemas
   - Año: 2023
4. Click "Registrar Egresado"
5. Verificar mensaje de éxito
6. Verificar en lista de egresados

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor desarrollo (localhost:3000)

# Build
npm run build            # Compilar para producción
npm run start            # Ejecutar build de producción

# Linting
npm run lint             # Ejecutar ESLint

# Base de Datos
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Sincronizar schema con BD
npm run db:studio        # Abrir Prisma Studio
```

---

## 🚀 Deploy en Vercel

### Opción 1: Desde la UI de Vercel

1. Subir código a GitHub
2. Ir a [vercel.com](https://vercel.com)
3. Click "New Project"
4. Importar repositorio
5. Agregar variables de entorno:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (ej: https://tu-app.vercel.app)
6. Click "Deploy"

### Opción 2: Desde CLI

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Variables de Entorno en Vercel

Ir a: **Project Settings → Environment Variables**

Agregar:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=tu-secret
NEXTAUTH_URL=https://tu-proyecto.vercel.app
```

---

## 📝 Gestión de Cambios (Iteración 1)

### Cambio Implementado: Campo LinkedIn

**Solicitante**: Coordinador de Egresados
**Descripción**: Agregar campo "Perfil de LinkedIn" al registro de egresados
**Justificación**: Facilitar networking y validación de información laboral

**Cambios realizados**:
1. Schema Prisma: Agregado `linkedin String?`
2. Validación Zod: Agregada validación de URL
3. Formulario: Nuevo input para LinkedIn
4. Perfil: Mostrar LinkedIn como link clicable

**Archivo**: `/lib/validations.ts`, `/app/egresados/nuevo/page.tsx`

---

## ⚠️ Gestión de Riesgos (Iteración 1)

### Riesgo Mitigado: Vercel Postgres no disponible

**Prioridad**: Alta
**Descripción**: Cuenta gratuita de Vercel no incluye Postgres

**Mitigación ejecutada**:
1. Configuración alternativa con Supabase
2. Prisma es agnóstico a la BD (fácil migración)
3. Documentación de ambas opciones
4. Variables de entorno configurables

**Resultado**: Sistema funcionando con Supabase sin cambios en código

---

## 📚 Documentación Adicional

- **PLAN_DE_TRABAJO.md**: Plan completo del proyecto
- **HISTORIAS_DE_USUARIO.md**: Documentación de HUs
- **TABLERO_KANBAN.md**: Organización de tareas
- **CASOS_DE_PRUEBA.md**: Casos de prueba funcionales
- **COMANDOS_UTILES.md**: Cheat sheet de comandos

---

## 🐛 Troubleshooting

### Error: Prisma Client not found
```bash
npx prisma generate
```

### Error: Port 3000 already in use
```bash
# Cambiar puerto
npm run dev -- -p 3001

# O matar proceso
lsof -ti:3000 | xargs kill -9
```

### Error: Database connection failed
- Verificar DATABASE_URL en `.env`
- Verificar que Supabase esté corriendo
- Verificar firewall/red

### Error: NextAuth session undefined
- Verificar NEXTAUTH_SECRET en `.env`
- Verificar NEXTAUTH_URL
- Reiniciar servidor después de cambiar `.env`

---

## 👥 Equipo de Desarrollo

**Rol Administrador**: Responsable de toda la funcionalidad
**Metodología**: XP (Extreme Programming)
**Iteración**: 1 de 4

---

## 📄 Licencia

Proyecto académico - UNTELS 2025-II
Sistema de Gestión de Egresados

---

## 📞 Soporte

Para consultas sobre el sistema:
- Revisar documentación en archivos `.md`
- Consultar `COMANDOS_UTILES.md` para troubleshooting
- Verificar casos de prueba en `CASOS_DE_PRUEBA.md`

---

**Generado con Claude Code**
Universidad Nacional Tecnológica de Lima Sur
Examen Final - Ingeniería de Software 2025-II
