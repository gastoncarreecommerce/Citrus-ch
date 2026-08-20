# Propuestas Comerciales — Carrefour Marketplace

Plataforma self-service para que sellers armen y envíen propuestas comerciales
(descuentos, cuotas, envío gratis) para competir por espacios destacados en
Site, App y Mailing.

## Estado del MVP

Este es el **bloque 1 y 2** del plan de implementación:

1. ✅ Setup base: Next.js 14 (App Router) + TypeScript + Tailwind + componentes
   estilo shadcn/ui + Prisma con el schema completo de negocio.
2. ✅ Auth: NextAuth (Auth.js) v5 con provider de Credentials (email/password),
   sesiones JWT, middleware de protección de rutas por rol (`SELLER` / `ADMIN`),
   y seed de un usuario admin + un seller de prueba.

Pendiente para los próximos bloques (ver `Plataforma de Propuestas
Comerciales para Sellers` en el prompt original): CRUD de espacios desde el
panel admin, integración con VTEX (`lib/vtex.ts`), armado de propuestas,
ranking y cierre automático por cron, y stub de SFMC.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + componentes propios estilo shadcn/ui (`components/ui`)
- Prisma ORM + PostgreSQL (Neon / Vercel Postgres en producción)
- NextAuth.js (Auth.js) v5, Credentials provider, sesiones JWT
- Zod para validación

## Setup local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar variables de entorno y completar `DATABASE_URL` (Postgres local o
   Neon):

   ```bash
   cp .env.example .env
   ```

3. Sincronizar el schema con la base (o `db:migrate` si preferís migraciones
   versionadas):

   ```bash
   npm run db:push
   ```

4. Cargar usuarios de prueba:

   ```bash
   npm run db:seed
   ```

   Esto crea:
   - Admin: `admin@carrefour.com.ar` / `Admin123!`
   - Seller: `seller@demo.com` / `Seller123!`

5. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   - `SELLER` → redirige a `/dashboard`
   - `ADMIN` → redirige a `/admin/espacios`

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:push` — sincroniza el schema de Prisma sin migraciones
- `npm run db:migrate` — genera y aplica una migración (dev)
- `npm run db:seed` — carga el admin y seller de prueba
- `npm run db:studio` — abre Prisma Studio

## Estructura relevante

```
lib/auth.config.ts   -> config de NextAuth compatible con Edge (usada por middleware.ts)
lib/auth.ts          -> config completa de NextAuth con el Credentials provider (Node runtime)
lib/prisma.ts         -> cliente Prisma singleton
middleware.ts          -> protección de rutas /dashboard, /espacios, /mis-propuestas, /admin por rol
prisma/schema.prisma   -> modelo de datos (Seller, User, Espacio, Propuesta, PropuestaItem)
prisma/seed.ts          -> seed de admin + seller de prueba
app/(auth)/login        -> pantalla de login (Server Action + Credentials)
app/(seller)/dashboard  -> placeholder del dashboard de espacios (bloque siguiente)
app/(admin)/admin/espacios -> placeholder del CRUD de espacios (bloque siguiente)
```

## Deploy en Vercel

1. Crear una base en [Neon](https://neon.tech) (free tier) y copiar la
   `DATABASE_URL`.
2. Configurar en Vercel las variables de `.env.example` (`DATABASE_URL`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, credenciales VTEX/SFMC cuando estén
   disponibles, `CRON_SECRET`).
3. Correr `npx prisma db push` (o `migrate deploy`) contra la base de Neon
   antes del primer deploy.
