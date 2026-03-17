# Esquema de Base de Datos - SGT-Unimar
## Sistema de Gestión de Torneos Deportivos

---

## Entidades Principales

### 1. **tournaments** (Torneos)
Almacena información sobre los torneos deportivos organizados.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único del torneo | PRIMARY KEY |
| `name` | VARCHAR(200) | Nombre del torneo | NOT NULL |
| `sport` | VARCHAR(100) | Deporte del torneo | NOT NULL |
| `start_date` | DATE | Fecha de inicio del torneo | NOT NULL |
| `status` | VARCHAR(20) | Estado del torneo | NOT NULL, CHECK (active, completed, upcoming) |
| `created_at` | TIMESTAMP | Fecha de creación del registro | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Fecha de última actualización | DEFAULT NOW() |

**Índices:**
- `idx_tournaments_status` en `status`
- `idx_tournaments_sport` en `sport`

---

### 2. **team_registrations** (Registros de Equipos)
Almacena las solicitudes de inscripción de equipos.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único del equipo | PRIMARY KEY |
| `team_name` | VARCHAR(200) | Nombre del equipo | NOT NULL, UNIQUE |
| `sport` | VARCHAR(100) | Deporte del equipo | NOT NULL |
| `captain_name` | VARCHAR(200) | Nombre del capitán | NOT NULL |
| `captain_ci` | VARCHAR(20) | Cédula del capitán | NOT NULL, UNIQUE |
| `captain_phone` | VARCHAR(20) | Teléfono del capitán | NOT NULL |
| `captain_email` | VARCHAR(200) | Email del capitán | NOT NULL |
| `submitted_date` | DATE | Fecha de solicitud | NOT NULL, DEFAULT CURRENT_DATE |
| `status` | VARCHAR(20) | Estado de la solicitud | NOT NULL, CHECK (pending, approved, rejected), DEFAULT 'pending' |
| `created_at` | TIMESTAMP | Fecha de creación del registro | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Fecha de última actualización | DEFAULT NOW() |

**Índices:**
- `idx_team_registrations_status` en `status`
- `idx_team_registrations_sport` en `sport`
- `idx_team_registrations_captain_ci` en `captain_ci`

---

### 3. **players** (Jugadores)
Almacena la información de los jugadores de cada equipo.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único del jugador | PRIMARY KEY |
| `team_id` | UUID | ID del equipo al que pertenece | NOT NULL, FOREIGN KEY → team_registrations(id) |
| `name` | VARCHAR(200) | Nombre del jugador | NOT NULL |
| `ci` | VARCHAR(20) | Cédula del jugador | NOT NULL |
| `created_at` | TIMESTAMP | Fecha de creación del registro | DEFAULT NOW() |

**Índices:**
- `idx_players_team_id` en `team_id`
- `idx_players_ci` en `ci`

**Restricciones:**
- UNIQUE (`team_id`, `ci`) - Un jugador no puede estar duplicado en el mismo equipo
- CHECK: Validar que cada equipo tenga entre 6 y 11 jugadores (implementar vía trigger o lógica de aplicación)

---

### 4. **tournament_teams** (Equipos en Torneos)
Tabla de relación many-to-many entre torneos y equipos aprobados.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único de la relación | PRIMARY KEY |
| `tournament_id` | UUID | ID del torneo | NOT NULL, FOREIGN KEY → tournaments(id) |
| `team_id` | UUID | ID del equipo | NOT NULL, FOREIGN KEY → team_registrations(id) |
| `joined_at` | TIMESTAMP | Fecha de inscripción en el torneo | DEFAULT NOW() |

**Índices:**
- `idx_tournament_teams_tournament_id` en `tournament_id`
- `idx_tournament_teams_team_id` en `team_id`
- UNIQUE (`tournament_id`, `team_id`) - Un equipo no puede inscribirse dos veces en el mismo torneo

---

### 5. **matches** (Partidos)
Almacena los partidos/fixtures de los torneos.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único del partido | PRIMARY KEY |
| `tournament_id` | UUID | ID del torneo | NOT NULL, FOREIGN KEY → tournaments(id) |
| `team1_id` | UUID | ID del primer equipo | NOT NULL, FOREIGN KEY → team_registrations(id) |
| `team2_id` | UUID | ID del segundo equipo | NOT NULL, FOREIGN KEY → team_registrations(id) |
| `match_date` | DATE | Fecha del partido | NOT NULL |
| `match_time` | TIME | Hora del partido | NOT NULL |
| `team1_score` | INTEGER | Marcador equipo 1 | NULL, CHECK (team1_score >= 0) |
| `team2_score` | INTEGER | Marcador equipo 2 | NULL, CHECK (team2_score >= 0) |
| `status` | VARCHAR(20) | Estado del partido | NOT NULL, CHECK (scheduled, completed), DEFAULT 'scheduled' |
| `created_at` | TIMESTAMP | Fecha de creación del registro | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Fecha de última actualización | DEFAULT NOW() |

**Índices:**
- `idx_matches_tournament_id` en `tournament_id`
- `idx_matches_date` en `match_date`
- `idx_matches_status` en `status`

**Restricciones:**
- CHECK (`team1_id` != `team2_id`) - Un equipo no puede jugar contra sí mismo
- CHECK: Si status = 'completed', entonces team1_score y team2_score NO PUEDEN ser NULL

---

## Relaciones entre Entidades

```
tournaments (1) ----< (N) tournament_teams (N) >---- (1) team_registrations
                                                            |
                                                            | (1)
                                                            |
                                                            v
                                                          (N) players

tournaments (1) ----< (N) matches >---- (1) team_registrations (como team1)
                            |
                            +---------- (1) team_registrations (como team2)
```

### Descripción de Relaciones:

1. **tournaments → tournament_teams** (1:N)
   - Un torneo puede tener múltiples equipos inscritos
   - Relación: `tournament_teams.tournament_id` → `tournaments.id`

2. **team_registrations → tournament_teams** (1:N)
   - Un equipo puede participar en múltiples torneos
   - Relación: `tournament_teams.team_id` → `team_registrations.id`

3. **team_registrations → players** (1:N)
   - Un equipo tiene múltiples jugadores (6-11)
   - Relación: `players.team_id` → `team_registrations.id`
   - **Cascada**: Si se elimina un equipo, se eliminan sus jugadores

4. **tournaments → matches** (1:N)
   - Un torneo tiene múltiples partidos
   - Relación: `matches.tournament_id` → `tournaments.id`
   - **Cascada**: Si se elimina un torneo, se eliminan sus partidos

5. **team_registrations → matches** (1:N como team1)
   - Un equipo puede ser el equipo local (team1) en múltiples partidos
   - Relación: `matches.team1_id` → `team_registrations.id`

6. **team_registrations → matches** (1:N como team2)
   - Un equipo puede ser el equipo visitante (team2) en múltiples partidos
   - Relación: `matches.team2_id` → `team_registrations.id`

---

## Vista Calculada: Tabla de Posiciones

**standings** (Vista o consulta calculada)

Esta no es una tabla física, sino que se calcula dinámicamente desde los partidos completados:

| Campo | Cálculo | Descripción |
|-------|---------|-------------|
| `tournament_id` | - | ID del torneo |
| `team_id` | - | ID del equipo |
| `team_name` | - | Nombre del equipo |
| `played` | COUNT | Partidos jugados |
| `won` | COUNT | Partidos ganados |
| `drawn` | COUNT | Partidos empatados |
| `lost` | COUNT | Partidos perdidos |
| `goals_for` | SUM | Goles a favor |
| `goals_against` | SUM | Goles en contra |
| `goal_difference` | goals_for - goals_against | Diferencia de goles |
| `points` | (won × 3) + drawn | Puntos totales |

**Ordenamiento:**
1. `points` DESC
2. `goal_difference` DESC
3. `goals_for` DESC

---

## Reglas de Negocio y Validaciones

### Team Registrations
- ✅ Estado inicial: `pending`
- ✅ Solo equipos con status `approved` pueden unirse a torneos
- ✅ Nombre del equipo debe ser único
- ✅ CI del capitán debe ser único
- ✅ Validación de email válido

### Players
- ✅ Cada equipo debe tener entre 6 y 11 jugadores
- ✅ Un jugador (CI) no puede aparecer duplicado en el mismo equipo
- ✅ Un jugador puede estar en múltiples equipos de diferentes deportes

### Tournament Teams
- ✅ Solo equipos aprobados pueden inscribirse
- ✅ El deporte del equipo debe coincidir con el del torneo
- ✅ Un equipo no puede inscribirse dos veces en el mismo torneo

### Matches
- ✅ Los equipos deben pertenecer al mismo torneo
- ✅ Generación automática de fixtures (round-robin) cuando se inscriben equipos
- ✅ Horarios entre 13:00 y 17:00
- ✅ Marcadores solo válidos si status = 'completed'
- ✅ Marcadores deben ser números >= 0

---

## Triggers Recomendados

### 1. `trg_update_match_status`
- **Tabla**: matches
- **Evento**: BEFORE UPDATE
- **Función**: Si se actualizan team1_score y team2_score (ambos NOT NULL), cambiar status a 'completed'

### 2. `trg_validate_team_player_count`
- **Tabla**: players
- **Evento**: AFTER INSERT, DELETE
- **Función**: Validar que el equipo tenga entre 6 y 11 jugadores

### 3. `trg_validate_tournament_team_sport`
- **Tabla**: tournament_teams
- **Evento**: BEFORE INSERT
- **Función**: Validar que el deporte del equipo coincida con el del torneo

### 4. `trg_regenerate_fixtures`
- **Tabla**: tournament_teams
- **Evento**: AFTER INSERT, DELETE
- **Función**: Regenerar fixtures automáticamente cuando se agregan/eliminan equipos

### 5. `trg_update_timestamps`
- **Tablas**: tournaments, team_registrations, matches
- **Evento**: BEFORE UPDATE
- **Función**: Actualizar automáticamente el campo `updated_at`

---

## Políticas de Seguridad (Row Level Security - RLS)

### Administradores
- **Permisos completos**: SELECT, INSERT, UPDATE, DELETE en todas las tablas

### Usuarios (Capitanes/Estudiantes)
- **team_registrations**: 
  - INSERT (crear su propia solicitud)
  - SELECT (ver solo sus propias solicitudes)
- **players**:
  - INSERT, UPDATE, DELETE (solo de sus propios equipos)
  - SELECT (todos los jugadores son públicos)
- **tournaments**:
  - SELECT (ver todos los torneos)
- **matches**:
  - SELECT (ver todos los partidos)
- **tournament_teams**:
  - SELECT (ver equipos en torneos)

### Público (Sin autenticar)
- **tournaments**: SELECT (ver torneos activos)
- **matches**: SELECT (ver fixtures y resultados)
- **team_registrations**: SELECT (solo equipos aprobados, con campos limitados)

---

## Consultas SQL Útiles

### 1. Obtener Tabla de Posiciones de un Torneo
```sql
SELECT 
  tr.id as team_id,
  tr.team_name,
  COUNT(*) as played,
  SUM(CASE 
    WHEN (m.team1_id = tr.id AND m.team1_score > m.team2_score) 
      OR (m.team2_id = tr.id AND m.team2_score > m.team1_score) 
    THEN 1 ELSE 0 
  END) as won,
  SUM(CASE 
    WHEN m.team1_score = m.team2_score 
    THEN 1 ELSE 0 
  END) as drawn,
  SUM(CASE 
    WHEN (m.team1_id = tr.id AND m.team1_score < m.team2_score) 
      OR (m.team2_id = tr.id AND m.team2_score < m.team1_score) 
    THEN 1 ELSE 0 
  END) as lost,
  SUM(CASE 
    WHEN m.team1_id = tr.id THEN m.team1_score 
    ELSE m.team2_score 
  END) as goals_for,
  SUM(CASE 
    WHEN m.team1_id = tr.id THEN m.team2_score 
    ELSE m.team1_score 
  END) as goals_against,
  SUM(CASE 
    WHEN m.team1_id = tr.id THEN m.team1_score - m.team2_score
    ELSE m.team2_score - m.team1_score
  END) as goal_difference,
  SUM(CASE 
    WHEN (m.team1_id = tr.id AND m.team1_score > m.team2_score) 
      OR (m.team2_id = tr.id AND m.team2_score > m.team1_score) 
    THEN 3
    WHEN m.team1_score = m.team2_score 
    THEN 1
    ELSE 0
  END) as points
FROM team_registrations tr
JOIN tournament_teams tt ON tr.id = tt.team_id
JOIN matches m ON m.tournament_id = tt.tournament_id 
  AND (m.team1_id = tr.id OR m.team2_id = tr.id)
  AND m.status = 'completed'
WHERE tt.tournament_id = :tournament_id
GROUP BY tr.id, tr.team_name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;
```

### 2. Obtener Equipos Pendientes de Aprobación
```sql
SELECT 
  tr.*,
  COUNT(p.id) as player_count
FROM team_registrations tr
LEFT JOIN players p ON p.team_id = tr.id
WHERE tr.status = 'pending'
GROUP BY tr.id
HAVING COUNT(p.id) BETWEEN 6 AND 11
ORDER BY tr.submitted_date ASC;
```

### 3. Obtener Próximos Partidos de un Equipo
```sql
SELECT 
  m.*,
  t.name as tournament_name,
  t1.team_name as team1_name,
  t2.team_name as team2_name
FROM matches m
JOIN tournaments t ON m.tournament_id = t.id
JOIN team_registrations t1 ON m.team1_id = t1.id
JOIN team_registrations t2 ON m.team2_id = t2.id
WHERE (m.team1_id = :team_id OR m.team2_id = :team_id)
  AND m.status = 'scheduled'
  AND m.match_date >= CURRENT_DATE
ORDER BY m.match_date ASC, m.match_time ASC;
```

---

## Diagrama ER (Texto)

```
┌─────────────────────┐
│   TOURNAMENTS       │
│─────────────────────│
│ • id (PK)          │
│   name             │
│   sport            │
│   start_date       │
│   status           │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────┴──────────────┐         N ┌─────────────────────┐
│  TOURNAMENT_TEAMS       │───────────│ TEAM_REGISTRATIONS  │
│─────────────────────────│           │─────────────────────│
│ • id (PK)              │           │ • id (PK)          │
│ • tournament_id (FK)   │           │   team_name        │
│ • team_id (FK)        │           │   sport            │
│   joined_at           │           │   captain_name     │
└─────────────────────────┘           │   captain_ci       │
                                      │   captain_phone    │
           1                          │   captain_email    │
           │                          │   submitted_date   │
           │                          │   status           │
┌──────────┴──────────┐              └──────────┬──────────┘
│     MATCHES         │                         │ 1
│─────────────────────│                         │
│ • id (PK)          │                         │ N
│ • tournament_id (FK)│              ┌──────────┴──────────┐
│ • team1_id (FK) ────┼──────────────│     PLAYERS         │
│ • team2_id (FK) ────┼──────────────│─────────────────────│
│   match_date       │              │ • id (PK)          │
│   match_time       │              │ • team_id (FK)     │
│   team1_score      │              │   name             │
│   team2_score      │              │   ci               │
│   status           │              └─────────────────────┘
└─────────────────────┘
```

---

## Notas de Implementación

1. **UUIDs vs Auto-increment**: Se recomienda usar UUID para mejor escalabilidad y seguridad
2. **Soft Deletes**: Considerar agregar campo `deleted_at` para eliminaciones lógicas
3. **Auditoría**: Agregar campos `created_by`, `updated_by` para rastrear cambios
4. **Versionado**: Para cambios críticos (ej. resultados de partidos), considerar tabla de auditoría
5. **Índices**: Los índices sugeridos mejorarán el rendimiento de consultas frecuentes
6. **Transacciones**: Operaciones como inscripción de equipos + jugadores deben ser atómicas

---

**Última actualización**: 17 de marzo de 2026
**Versión del esquema**: 1.0
