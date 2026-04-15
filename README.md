# Spot Saver

Webapp para guardar sitios de interés (restaurantes, cafés, hoteles) y ubicarlos en un mapa.

## Stack

- **Next.js 15** + **React 19** (App Router)
- **Tailwind CSS v4**
- **Drizzle ORM** + **Neon** (Postgres serverless)
- **Leaflet** + **react-leaflet** (mapas, tiles OpenStreetMap)
- **@ducanh2912/next-pwa** (instalable en móvil)

## Requisitos

- Node.js 18+
- Cuenta en [Neon](https://neon.tech) con un proyecto creado

## Configuración

1. Clona el repo e instala dependencias:

```bash
npm install
```

2. Crea el archivo `.env` en la raíz con tu connection string de Neon:

```bash
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

3. Ejecuta la migración para crear las tablas:

```bash
npm run db:migrate
```

4. Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run db:generate   # Genera migración SQL a partir del schema
npm run db:migrate    # Ejecuta la migración en Neon
npm run db:studio     # UI visual de la base de datos (Drizzle Studio)
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Neon (incluir `?sslmode=require`) |

## Deploy

El proyecto está pensado para desplegarse en Vercel. Solo hay que añadir la variable `DATABASE_URL` en el panel de Vercel antes del primer deploy.
