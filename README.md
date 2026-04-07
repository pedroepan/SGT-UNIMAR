# 🏆 SGT-Unimar - Sistema de Gestión de Torneos Deportivos

Sistema web responsive y moderno para la gestión de torneos deportivos en la Universidad de Margarita (Unimar).

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.12-38B2AC.svg)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#-base-de-datos)
- [Scripts Disponibles](#-scripts-disponibles)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)

## ✨ Características

### 🎯 Dashboard del Administrador
- Vista general de torneos activos (Fútbol Sala, Baloncesto, Voleibol)
- Creación de nuevos torneos
- Gestión de inscripciones pendientes
- Aprobación/rechazo de solicitudes de equipos
- Agregar/eliminar equipos de torneos

### 📅 Fixtures y Resultados
- Generación automática de fixtures en formato round-robin
- Lista cronológica de partidos con fechas y horarios
- Registro de resultados de partidos
- Tabla de posiciones automática por torneo
- Filtrado por torneo específico

### 📝 Inscripción de Equipos
- Formulario por pasos para capitanes
- Registro de equipo con nombre y datos del capitán
- Lista de jugadores (6-11 jugadores requeridos)
- Validación de cédulas de identidad
- Notificaciones de éxito/error

### 📊 Tabla de Posiciones
- Actualización automática basada en resultados
- Estadísticas completas: PJ, G, E, P, GF, GC, DG, Pts
- Ordenamiento por puntos, diferencia de goles y goles a favor
- Indicador visual del líder

## 🛠 Tecnologías

### Frontend
- **React 18.3.1** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router 7** - Enrutamiento con Data mode
- **Tailwind CSS 4** - Estilos utility-first

### UI Components
- **Radix UI** - Componentes accesibles sin estilos
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast
- **Material UI** - Componentes adicionales

### Gestión de Estado
- **React Context API** - Estado global de torneos

### Styling
- **Tailwind CSS** - Framework CSS
- **CSS Custom Properties** - Variables de color institucionales
  - Azul Unimar: `#0A4C95`
  - Verde: `#10B981`
  - Naranja: `#F97316`

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recomendado) o npm/yarn

### Instalación de pnpm

```bash
# Usando npm
npm install -g pnpm

# O usando Homebrew (macOS)
brew install pnpm

# O usando Chocolatey (Windows)
choco install pnpm
```

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sgt-unimar.git
cd sgt-unimar
```

### 2. Instalar dependencias

```bash
# Con pnpm (recomendado)
pnpm install

# O con npm
npm install

# O con yarn
yarn install
```

### 3. Configurar variables de entorno (opcional)

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones si es necesario.

## 💻 Uso

### Modo Desarrollo

Inicia el servidor de desarrollo con hot-reload:

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173)

### Build de Producción

Genera los archivos optimizados para producción:

```bash
pnpm build
```

Los archivos generados estarán en la carpeta `dist/`

### Vista Previa del Build

Prueba el build de producción localmente:

```bash
pnpm preview
```

## 📁 Estructura del Proyecto

```
sgt-unimar/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes React
│   │   │   ├── ui/             # Componentes UI base (Radix)
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── fixture.tsx
│   │   │   ├── team-registration.tsx
│   │   │   ├── tournament-details-dialog.tsx
│   │   │   ├── create-tournament-dialog.tsx
│   │   │   ├── match-result-dialog.tsx
│   │   │   └── layout.tsx
│   │   ├── context/
│   │   │   └── tournament-context.tsx    # Estado global
│   │   ├── App.tsx              # Componente principal
│   │   └── routes.ts            # Configuración de rutas
│   ├── styles/
│   │   ├── index.css            # Estilos globales
│   │   ├── tailwind.css         # Configuración Tailwind
│   │   ├── theme.css            # Tokens y variables
│   │   └── fonts.css            # Fuentes
│   └── main.tsx                 # Punto de entrada
├── public/                      # Archivos estáticos
├── database-schema.md           # Documentación de BD
├── .env.example                 # Variables de entorno ejemplo
├── .gitignore                   # Archivos ignorados por Git
├── index.html                   # HTML principal
├── package.json                 # Dependencias y scripts
├── vite.config.ts               # Configuración de Vite
├── postcss.config.mjs           # Configuración PostCSS
└── README.md                    # Este archivo
```

## 🗄️ Base de Datos

El proyecto incluye documentación completa del esquema de base de datos en [`database-schema.md`](./database-schema.md).

### Entidades Principales

- **usuarios** - Usuarios del sistema (estudiantes/capitanes/admin)
- **torneos** - Torneos deportivos
- **equipo** - Equipos participantes en torneos
- **jugadores** - Relación entre usuarios y equipos
- **fixture** - Partidos/fixtures y resultados

### Implementación con Supabase (Opcional)

Para conectar con Supabase:

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta las migraciones SQL desde `database-schema.md`
3. Configura las variables de entorno:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. Instala el cliente de Supabase:

```bash
pnpm add @supabase/supabase-js
```

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Crea build de producción |
| `pnpm preview` | Previsualiza el build |
| `pnpm lint` | Ejecuta linter (por configurar) |

## 🚢 Despliegue

### Vercel (Recomendado)

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Despliega:
```bash
vercel
```

### Netlify

1. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`

2. Archivo `netlify.toml`:
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Otras plataformas

El proyecto es compatible con cualquier servicio que soporte aplicaciones Vite:
- GitHub Pages
- Firebase Hosting
- AWS Amplify
- Railway
- Render

## 🎨 Personalización

### Colores Institucionales

Los colores se definen en `/src/styles/theme.css`:

```css
:root {
  --primary: #0A4C95;      /* Azul Unimar */
  --secondary: #10B981;    /* Verde */
  --accent: #F97316;       /* Naranja */
}
```

### Agregar Nuevos Deportes

Edita el diálogo de creación de torneos en:
`/src/app/components/create-tournament-dialog.tsx`

## 🤝 Contribuir

Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Funcionalidades Implementadas

- ✅ Dashboard administrativo completo
- ✅ Gestión de torneos (crear, ver, gestionar equipos)
- ✅ Sistema de inscripción de equipos
- ✅ Aprobación/rechazo de solicitudes
- ✅ Generación automática de fixtures
- ✅ Registro de resultados
- ✅ Tabla de posiciones automática
- ✅ Sistema de notificaciones
- ✅ Diseño responsive
- ✅ Validaciones completas
- ✅ Colores institucionales Unimar

## 🔮 Funcionalidades Futuras

- 🔄 Integración con Supabase
- 🔄 Autenticación de usuarios
- 🔄 Dashboard para capitanes de equipo
- 🔄 Estadísticas avanzadas por jugador
- 🔄 Exportación de datos (PDF, Excel)
- 🔄 Notificaciones por email
- 🔄 Sistema de brackets para torneos eliminatorios
- 🔄 Galería de fotos de partidos
- 🔄 Chat/comentarios por partido

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- **Universidad de Margarita** - *Proyecto inicial*

## 🙏 Agradecimientos

- Universidad de Margarita por el apoyo al proyecto
- Comunidad de React y Tailwind CSS
- Radix UI por los componentes accesibles

---

**Desarrollado con ❤️ para la Universidad de Margarita**

📧 Contacto: [soporte@unimar.edu.ve](mailto:soporte@unimar.edu.ve)
🌐 Web: [https://unimar.edu.ve](https://unimar.edu.ve)
