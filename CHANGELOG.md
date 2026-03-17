# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-03-17

### ✨ Agregado

#### Dashboard del Administrador
- Tarjetas de resumen de torneos activos (Fútbol Sala, Baloncesto, Voleibol)
- Botón para crear nuevos torneos con diálogo modal
- Lista de inscripciones pendientes por validar
- Sistema de aprobación/rechazo de equipos
- Diálogo de detalles de torneos
- Funcionalidad para agregar/eliminar equipos de torneos

#### Fixtures y Resultados
- Vista de partidos con filtro por torneo
- Generación automática de fixtures en formato round-robin
- Horarios aleatorios entre 13:00 y 17:00
- Separación entre partidos próximos y finalizados
- Diálogo para registrar resultados de partidos
- Tabla de posiciones por torneo con:
  - Partidos jugados (PJ)
  - Ganados (G)
  - Empatados (E)
  - Perdidos (P)
  - Goles a favor (GF)
  - Goles en contra (GC)
  - Diferencia de goles (DG)
  - Puntos totales
- Actualización automática de tabla según resultados
- Indicador visual del equipo líder

#### Inscripción de Equipos
- Formulario por pasos (datos del equipo → jugadores → confirmación)
- Validación de 6-11 jugadores por equipo
- Campos de capitán (nombre, CI, teléfono, email)
- Lista dinámica de jugadores con nombre y CI
- Validación de cédulas de identidad
- Notificaciones toast de éxito/error

#### Sistema de Gestión
- Context API para estado global
- Gestión de torneos (crear, listar, modificar)
- Gestión de equipos (aprobar, rechazar, asignar)
- Gestión de partidos (crear, actualizar resultados)
- Cálculo automático de estadísticas

#### UI/UX
- Diseño responsive para móvil, tablet y desktop
- Colores institucionales de Unimar:
  - Azul universitario (#0A4C95)
  - Verde (#10B981)
  - Naranja (#F97316)
- Componentes de Radix UI accesibles
- Iconos de Lucide React
- Notificaciones con Sonner
- Esquinas redondeadas y espaciado consistente
- Tipografía Sans-serif legible

#### Navegación
- React Router con Data mode
- Rutas principales:
  - `/` - Dashboard del Administrador
  - `/fixtures` - Fixtures y Resultados
  - `/inscripcion` - Inscripción de Equipos
- Sidebar de navegación responsiva
- Página 404 personalizada

#### Configuración del Proyecto
- Vite como bundler y dev server
- TypeScript para tipado estático
- Tailwind CSS 4 para estilos
- PostCSS para procesamiento
- Configuración de VSCode
- Variables de entorno
- Favicon personalizado

#### Documentación
- README.md completo con instrucciones
- DEVELOPMENT.md con guía de desarrollo
- database-schema.md con esquema de BD detallado
- Esquema con 5 entidades principales
- Documentación de relaciones
- Consultas SQL útiles
- Triggers recomendados
- Políticas de seguridad (RLS)

### 📊 Datos de Demostración
- 3 torneos predefinidos (Fútbol Sala, Baloncesto, Voleibol)
- 3 equipos aprobados en Fútbol Sala
- 2 equipos pendientes de aprobación
- 3 partidos con fechas, horarios y algunos resultados
- Tabla de posiciones funcional

### 🛠️ Tecnologías
- React 18.3.1
- TypeScript 5.x
- Vite 6.3.5
- Tailwind CSS 4.1.12
- React Router 7.13.0
- Radix UI (múltiples componentes)
- Material UI 7.3.5
- Lucide React 0.487.0
- Sonner 2.0.3
- React Hook Form 7.55.0

### 🔧 Herramientas de Desarrollo
- ESLint (configuración pendiente)
- Prettier (configuración en VSCode)
- TypeScript strict mode
- Hot Module Replacement (HMR)
- Path aliases con `@/`

---

## [Unreleased] - Próximas Funcionalidades

### 🔮 Por Implementar
- [ ] Integración con Supabase
- [ ] Autenticación de usuarios (admin, capitanes, estudiantes)
- [ ] Dashboard para capitanes de equipo
- [ ] Estadísticas avanzadas por jugador
- [ ] Exportación de datos (PDF, Excel)
- [ ] Notificaciones por email
- [ ] Sistema de brackets para torneos eliminatorios
- [ ] Galería de fotos de partidos
- [ ] Chat/comentarios por partido
- [ ] Historial de torneos pasados
- [ ] Gráficos y visualizaciones de datos
- [ ] Sistema de arbitraje
- [ ] Calendario de disponibilidad de canchas
- [ ] Módulo de sanciones y tarjetas
- [ ] Rankings históricos de equipos

---

### Tipos de Cambios
- **Agregado**: para nuevas funcionalidades
- **Cambiado**: para cambios en funcionalidad existente
- **Obsoleto**: para funcionalidades que serán eliminadas
- **Eliminado**: para funcionalidades eliminadas
- **Corregido**: para corrección de bugs
- **Seguridad**: para vulnerabilidades

[1.0.0]: https://github.com/tu-usuario/sgt-unimar/releases/tag/v1.0.0
