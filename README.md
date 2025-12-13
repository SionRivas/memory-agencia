# 🌸 Memory Agencia

> Plataforma de gestión de memoriales digitales para crear, organizar y compartir recuerdos de manera elegante.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)

## ✨ Características

- **📷 Galería Masonry** — Visualización elegante de fotos con layout adaptativo tipo Pinterest
- **🔍 Lightbox Interactivo** — Navegación entre imágenes con zoom y gestos táctiles
- **📱 Códigos QR** — Generación automática de QR para compartir memoriales fácilmente
- **🎥 Integración YouTube** — Soporte para videos embebidos en los memoriales
- **🔐 Autenticación** — Sistema de login seguro con NextAuth
- **☁️ Almacenamiento S3** — Subida de imágenes a AWS S3 con URLs firmadas
- **🗄️ Base de Datos** — Gestión de datos con Prisma y LibSQL/SQLite
- **🎨 Animaciones** — Transiciones fluidas con Framer Motion

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 15.5.7 | Framework React con App Router y Turbopack |
| **React** | 19.1.0 | Biblioteca de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos utilitarios |
| **Radix UI** | Latest | Componentes accesibles (Dialog, Dropdown, Avatar) |
| **Framer Motion** | 12.x | Animaciones y transiciones |
| **Masonry Layout** | 4.2.2 | Diseño de galería tipo Pinterest |
| **Lucide React** | 0.556 | Iconografía |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Prisma** | 7.1.0 | ORM para base de datos |
| **LibSQL** | 0.15 | Cliente de base de datos SQLite |
| **NextAuth** | 5.0 beta | Autenticación y sesiones |
| **AWS SDK** | 3.947 | Integración con S3 (uploads) |
| **QRCode** | 1.5.4 | Generación de códigos QR |

## 📂 Estructura del Proyecto

```
memory-agencia/
├── app/
│   ├── admin/          # Panel de administración
│   ├── api/            # API Routes (memorials, upload)
│   ├── recuerdo/       # Página pública de memoriales
│   ├── signin/         # Página de login
│   ├── layout.tsx      # Layout principal con SEO
│   └── globals.css     # Estilos globales
├── components/
│   ├── admin/          # Componentes del dashboard
│   ├── MasonryGallery/ # Galería con lightbox
│   └── ui/             # Componentes base (shadcn/ui)
├── lib/                # Utilidades y configuración
├── prisma/             # Schema y migraciones
└── public/             # Assets estáticos
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- pnpm, npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd memory-agencia

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## ⚙️ Variables de Entorno

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Autenticación (NextAuth)
AUTH_SECRET="tu-secreto-super-seguro"
AUTH_GOOGLE_ID="tu-google-client-id"
AUTH_GOOGLE_SECRET="tu-google-client-secret"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="tu-access-key"
AWS_SECRET_ACCESS_KEY="tu-secret-key"
AWS_S3_BUCKET_NAME="tu-bucket-name"
```

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con Turbopack |
| `npm run build` | Genera build de producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |

## 🗃️ Modelo de Datos

```prisma
model Memorial {
  id             String          @id
  slug           String          @unique
  title          String
  description    String?
  youtubeVideoId String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  gallery        MemorialImage[]
}

model MemorialImage {
  id         String   @id
  url        String
  caption    String?
  memorialId String
  memorial   Memorial @relation(...)
}
```

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para Memory Agencia.

---

<p align="center">
  Desarrollado con 💜 usando Next.js 15 y React 19
</p>
