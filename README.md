# Propuestas Comerciales — Carrefour Marketplace

Plataforma self-service para que sellers armen y envíen propuestas comerciales
(descuentos, cuotas, envío gratis) para competir por espacios destacados en
Site, App y Mailing.

## Estado del MVP

Bloques 1 a 7 del plan de implementación implementados:

1. ✅ Setup base: Next.js 14 (App Router) + TypeScript + Tailwind + componentes
   estilo shadcn/ui + Prisma con el schema completo de negocio.
2. ✅ Auth: NextAuth (Auth.js) v5 con Credentials, sesiones JWT, middleware de
   protección de rutas por rol (`SELLER` / `ADMIN`).
3. ✅ CRUD de espacios comerciales desde el panel admin (con toggle
   "bonificado", estados, criterio de ranking).
4. ✅ Integración VTEX (`lib/vtex.ts`): trae el surtido + stock del seller
   logueado desde la Search API legacy de VTEX (`fq=sellerId:...`). Si no hay
   credenciales VTEX configuradas, sirve un catálogo de demo con datos reales
   (ver "Catálogo de demo" abajo) para poder probar el flujo sin esperar el
   alta VTEX.
5. ✅ Armado de propuesta (`/espacios/[id]`): tabla editable contra el surtido
   real, validaciones de precio/stock/descuento mínimo, guardar borrador /
   enviar / mejorar oferta.
6. ✅ `/mis-propuestas` del seller y ranking de propuestas en el panel admin
   (`/admin/espacios/[id]`), con aprobación/rechazo manual.
7. ✅ Cron de cierre (`/api/cron/cerrar-espacios`, protegido por
   `CRON_SECRET`, programado en `vercel.json`): cierra espacios vencidos,
   rankea por `lib/ranking.ts` y marca ganadora(s)/rechazadas.

Pendiente (fase 2, según el brief original): integración real con SFMC
(`lib/sfmc.ts` ya tiene los stubs cableados en los puntos donde deberían
dispararse las notificaciones), puja en tiempo real con cierre por reloj, y
`SCORE_COMPUESTO` como criterio de ranking real (hoy devuelve lo mismo que
`DESCUENTO`, con un TODO explícito).

### Decisiones tomadas sin confirmación de negocio (revisar)

Estas preguntas quedaron abiertas en el brief original; para no bloquear el
MVP se tomó una decisión razonable en cada caso — quedan para validar:

- **Alcance por categoría**: un espacio no restringe a una categoría
  específica; el seller puede incluir cualquier SKU de su surtido activo.
- **Versionado de propuestas**: al "mejorar" una propuesta ya enviada, se
  actualiza la misma fila `Propuesta` (se reemplazan sus `PropuestaItem` y se
  incrementa `version`) en vez de crear una fila nueva con
  `reemplazadaPorId` — tal como preveía el comentario en el schema.
- **Nadie cumple el descuento mínimo**: el espacio se cierra igual, sin
  `GANADORA` (las propuestas por debajo del mínimo simplemente no entran al
  ranking). No hay reapertura automática.
- **Exportación de la propuesta ganadora** (VTEX/Dynamic Yield/SFMC): no
  implementada; queda para otra automatización.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + componentes propios estilo shadcn/ui (`components/ui`)
- Prisma ORM + PostgreSQL (Neon / Vercel Postgres en producción)
- NextAuth.js (Auth.js) v5, Credentials provider, sesiones JWT
- Zod para validación
- Vercel Cron Jobs para el cierre automático de espacios

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
   - Seller: `seller@demo.com` / `Seller123!` (con `sellerIdVtex =
     "seller-demo-001"`, que matchea con el catálogo de demo)

5. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   - `SELLER` → redirige a `/dashboard`
   - `ADMIN` → redirige a `/admin/espacios`

## Catálogo de demo (sin credenciales VTEX)

`lib/vtex-demo-data/seller-demo-001.json` trae un recorte (20 SKUs) de un
catálogo real de un seller 3P de Carrefour AR, en el mismo formato que
devolvería VTEX. Mientras `VTEX_ACCOUNT_NAME` / `VTEX_APP_KEY` /
`VTEX_APP_TOKEN` no estén seteados en el entorno, `lib/vtex.ts` sirve este
archivo para cualquier seller cuyo `sellerIdVtex` sea `seller-demo-001` (el
seller de seed). Apenas se configuren las credenciales reales, `getSellerSurtido()`
pasa a pegarle en vivo a la Search API de VTEX sin tocar el resto del código.

## Cambios de schema sin acceso a terminal local

Si el schema de Prisma cambia y no tenés forma de correr `npm run db:push`
contra tu base (por ejemplo, trabajando 100% desde GitHub/Vercel web), en
`prisma/migrations-manual/` vas a encontrar los `ALTER TABLE`/`CREATE TABLE`
correspondientes a cada cambio, listos para pegar en el **SQL Editor** de
Neon (console.neon.tech). `prisma/setup-manual.sql` tiene el schema completo
+ seed inicial, para una base nueva desde cero.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:push` — sincroniza el schema de Prisma sin migraciones
- `npm run db:migrate` — genera y aplica una migración (dev)
- `npm run db:seed` — carga el admin y seller de prueba
- `npm run db:studio` — abre Prisma Studio

## Estructura relevante

```
lib/auth.config.ts        -> config de NextAuth compatible con Edge (usada por middleware.ts)
lib/auth.ts                -> config completa de NextAuth con el Credentials provider (Node runtime)
lib/prisma.ts               -> cliente Prisma singleton
lib/vtex.ts                  -> cliente VTEX (surtido en vivo + fallback a demo)
lib/vtex-demo-data/           -> catálogo de demo (datos reales recortados)
lib/ranking.ts                -> cálculo de descuento promedio y ranking por criterio
lib/sfmc.ts                    -> stubs de triggers SFMC (fase 2)
middleware.ts                   -> protección de rutas /dashboard, /espacios, /mis-propuestas, /admin por rol
prisma/schema.prisma             -> modelo de datos (Seller, User, Espacio, Propuesta, PropuestaItem)
prisma/seed.ts                    -> seed de admin + seller de prueba
app/(auth)/login                   -> pantalla de login (Server Action + Credentials)
app/(seller)/dashboard              -> espacios ABIERTO disponibles para el seller
app/(seller)/espacios/[id]           -> armado de propuesta contra el surtido real
app/(seller)/mis-propuestas            -> historial de propuestas del seller
app/(admin)/admin/espacios              -> CRUD de espacios
app/(admin)/admin/espacios/[id]          -> edición + ranking/aprobación manual de propuestas
app/api/vtex/surtido                      -> GET surtido del seller logueado
app/api/cron/cerrar-espacios               -> job de cierre + ranking (protegido con CRON_SECRET)
```

## Deploy en Vercel

1. Crear una base en [Neon](https://neon.tech) (free tier) y copiar la
   `DATABASE_URL`.
2. Configurar en Vercel las variables de `.env.example` (`DATABASE_URL`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, credenciales VTEX/SFMC cuando estén
   disponibles, `CRON_SECRET`).
3. Correr `npx prisma db push` (o `migrate deploy`) contra la base de Neon
   antes del primer deploy.
4. El cron de cierre (`vercel.json`) corre una vez por día (06:00 UTC) contra
   `/api/cron/cerrar-espacios`; Vercel agrega automáticamente el header
   `Authorization: Bearer $CRON_SECRET` si esa env var está seteada. Está en
   una vez al día porque el plan **Hobby** de Vercel no permite cron jobs con
   más frecuencia que esa (un `schedule` más seguido hace que Vercel
   **rechace el deploy entero**, no solo el cron -- así se rompió el
   auto-deploy en este proyecto). Si se pasa a plan **Pro**, se puede achicar
   el intervalo (por ejemplo cada hora) editando `vercel.json`. Mientras
   tanto, el endpoint también se puede disparar a mano con
   `curl -H "Authorization: Bearer $CRON_SECRET" https://<tu-deploy>/api/cron/cerrar-espacios`.
