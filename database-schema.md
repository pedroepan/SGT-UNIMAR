# Esquema de Base de Datos - SGT-Unimar
## Estructura Actual (Abril 2026)

Este documento refleja la estructura actual de la base de datos confirmada para el proyecto.

## Tablas

### 1) `usuarios`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `created_at` | timestamptz | Fecha de creación |
| `nombre` | varchar | Nombre del usuario |
| `correo` | varchar | Correo del usuario |
| `cedula` | varchar | Documento de identidad |
| `password` | varchar | Password almacenado |
| `rol` | varchar | Rol del usuario |

### 2) `torneos`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `created_at` | timestamptz | Fecha de creación |
| `nombre` | varchar | Nombre del torneo |
| `disciplina` | varchar | Deporte/disciplina |
| `estado` | varchar | Estado del torneo |

### 3) `equipo`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `created_at` | timestamptz | Fecha de creación |
| `nombre` | varchar | Nombre del equipo |
| `id_capitan` | int8 | FK a `jugadores.id` |
| `id_torneo` | int8 | FK a `torneos.id` |

### 4) `jugadores`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `created_at` | timestamptz | Fecha de creación |
| `id_usuario` | int8 | FK a `usuarios.id` |
| `id_equipo` | int8 | FK a `equipo.id` |

### 5) `fixture`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `created_at` | timestamptz | Fecha de creación |
| `id_torneo` | int8 | FK a `torneos.id` |
| `id_visitantes` | int8 | FK a `equipo.id` |
| `fecha_hora` | timestamp | Fecha y hora del partido |
| `id_local` | int8 | FK a `equipo.id` |
| `anotacion_local` | int8 | Marcador local |
| `anotacion_visitante` | int8 | Marcador visitante |

## Relaciones

- `equipo.id_torneo` -> `torneos.id`
- `jugadores.id_equipo` -> `equipo.id`
- `jugadores.id_usuario` -> `usuarios.id`
- `equipo.id_capitan` -> `jugadores.id`
- `fixture.id_torneo` -> `torneos.id`
- `fixture.id_local` -> `equipo.id`
- `fixture.id_visitantes` -> `equipo.id`

## Notas de implementación en frontend

- La UI interna todavía usa modelos de dominio en inglés (`Tournament`, `Match`, etc.) para estado local.
- Para persistencia con Supabase, los scripts y consultas deben usar los nombres reales de tablas y columnas definidos arriba.
