# 🛠️ Guía de Desarrollo - SGT-Unimar

Esta guía te ayudará a comenzar a desarrollar en el proyecto SGT-Unimar.

## 🚀 Inicio Rápido

### 1. Configuración Inicial

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
pnpm dev
```

El servidor estará corriendo en [http://localhost:5173](http://localhost:5173)

## 📂 Estructura de Archivos

### Directorio `/src/app/components`

Aquí van todos los componentes React:

- **Páginas principales**: `admin-dashboard.tsx`, `fixture.tsx`, `team-registration.tsx`
- **Diálogos**: `*-dialog.tsx` - Modales y popups
- **UI base**: `/ui/*` - Componentes reutilizables de Radix UI
- **Layout**: `layout.tsx` - Estructura general de la app

### Directorio `/src/app/context`

Gestión de estado global con React Context:

- `tournament-context.tsx` - Estado de torneos, equipos, partidos, etc.

### Directorio `/src/styles`

Estilos CSS:

- `index.css` - Estilos globales y reset
- `tailwind.css` - Configuración base de Tailwind
- `theme.css` - Variables CSS y tokens de diseño
- `fonts.css` - Fuentes personalizadas

## 🎨 Sistema de Diseño

### Colores Institucionales

```css
/* Colores principales */
--primary: #0A4C95;      /* Azul Unimar */
--secondary: #10B981;    /* Verde */
--accent: #F97316;       /* Naranja */
```

### Usar colores en Tailwind

```tsx
// Clases de Tailwind
<div className="bg-primary text-white">
<Button className="bg-secondary hover:bg-secondary/90">
<Badge className="bg-accent">
```

### Componentes UI

Todos los componentes base están en `/src/app/components/ui/` y son de Radix UI:

```tsx
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Dialog, DialogContent } from "./components/ui/dialog";
```

## 🔄 Gestión de Estado

### Usar el Context de Torneos

```tsx
import { useTournament } from "../context/tournament-context";

function MyComponent() {
  const {
    tournaments,
    matches,
    addTournament,
    updateMatchResult,
    getTournamentStandings
  } = useTournament();

  // Usar el estado...
}
```

### Funciones Disponibles

| Función | Descripción |
|---------|-------------|
| `addTournament(data)` | Crear un nuevo torneo |
| `addTeamRegistration(data)` | Crear solicitud de equipo |
| `approveTeam(id)` | Aprobar equipo pendiente |
| `rejectTeam(id)` | Rechazar equipo |
| `addTeamToTournament(tournamentId, teamId)` | Agregar equipo a torneo |
| `removeTeamFromTournament(tournamentId, teamId)` | Remover equipo |
| `updateMatchResult(matchId, score1, score2)` | Registrar resultado |
| `getTournamentStandings(tournamentId)` | Obtener tabla de posiciones |

## 🧩 Crear un Nuevo Componente

### 1. Componente de Página

```tsx
// src/app/components/my-page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useTournament } from "../context/tournament-context";

export function MyPage() {
  const { tournaments } = useTournament();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Mi Página</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tu contenido aquí */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Agregar Ruta

Edita `/src/app/routes.ts`:

```tsx
import { MyPage } from "./components/my-page";

{
  path: "/mi-pagina",
  Component: MyPage,
}
```

## 🎯 Buenas Prácticas

### 1. Nombres de Componentes

- **PascalCase** para componentes: `MyComponent.tsx`
- **kebab-case** para archivos de utilidades: `my-utils.ts`
- Nombres descriptivos: `tournament-details-dialog.tsx` mejor que `dialog1.tsx`

### 2. Importaciones

Ordena las importaciones así:

```tsx
// 1. React y librerías externas
import { useState } from "react";
import { toast } from "sonner";

// 2. Componentes UI
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// 3. Contextos y hooks propios
import { useTournament } from "../context/tournament-context";

// 4. Tipos y utilidades
import type { Tournament } from "../context/tournament-context";
```

### 3. TypeScript

Siempre usa tipos:

```tsx
interface MyComponentProps {
  title: string;
  count: number;
  onAction: (id: string) => void;
}

export function MyComponent({ title, count, onAction }: MyComponentProps) {
  // ...
}
```

### 4. Estados y Efectos

```tsx
// ✅ Bueno: nombres descriptivos
const [isLoading, setIsLoading] = useState(false);
const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

// ❌ Malo: nombres genéricos
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
```

### 5. Notificaciones

Usa Sonner para notificaciones:

```tsx
import { toast } from "sonner";

// Éxito
toast.success("Título", {
  description: "Descripción del mensaje"
});

// Error
toast.error("Error", {
  description: "Algo salió mal"
});

// Info
toast.info("Información");
```

## 🔍 Debugging

### React DevTools

Instala la extensión de React DevTools para Chrome/Firefox.

### Inspeccionar Estado

Agrega logs temporales:

```tsx
console.log("Torneos:", tournaments);
console.log("Partidos:", matches);
```

### Vite DevTools

Hot Module Replacement (HMR) está habilitado, los cambios se verán instantáneamente.

## 📝 Convenciones de Código

### Formato

El proyecto usa Prettier (configúralo en tu editor):

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Commits

Usa mensajes descriptivos:

```bash
# ✅ Buenos commits
git commit -m "feat: agregar filtro de torneos en fixtures"
git commit -m "fix: corregir cálculo de diferencia de goles"
git commit -m "docs: actualizar README con instrucciones"

# ❌ Malos commits
git commit -m "fix"
git commit -m "cambios"
git commit -m "wip"
```

Prefijos recomendados:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `style:` - Formato de código
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Tareas de mantenimiento

## 🧪 Testing (Futuro)

Para agregar tests en el futuro:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

## 🐛 Solución de Problemas Comunes

### Error: Cannot find module

```bash
# Reinstalar dependencias
rm -rf node_modules
pnpm install
```

### Puerto 5173 en uso

```bash
# Cambiar puerto en vite.config.ts
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Errores de TypeScript

```bash
# Verificar errores
pnpm exec tsc --noEmit
```

### Cache de Vite corrupto

```bash
# Limpiar cache
rm -rf node_modules/.vite
pnpm dev
```

## 📚 Recursos Útiles

### Documentación

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [React Router](https://reactrouter.com/en/main)
- [Vite](https://vitejs.dev/guide)

### Herramientas

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ES7+ React Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

## 🤝 Contribuir

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feature/mi-funcionalidad
   ```

2. Haz tus cambios y commits

3. Push a tu rama:
   ```bash
   git push origin feature/mi-funcionalidad
   ```

4. Crea un Pull Request

## 💡 Tips y Trucos

### Atajos de Teclado en VSCode

- `Ctrl/Cmd + P` - Buscar archivo
- `Ctrl/Cmd + Shift + F` - Buscar en archivos
- `F12` - Ir a definición
- `Alt + ←/→` - Navegar atrás/adelante
- `Ctrl/Cmd + D` - Seleccionar siguiente ocurrencia

### Snippets Útiles

Con la extensión ES7+ React Snippets:

- `rafce` - React Arrow Function Component Export
- `useState` - Hook useState
- `useEffect` - Hook useEffect

### Live Server

Para ver cambios en tiempo real, asegúrate de que `pnpm dev` esté corriendo.

---

¿Preguntas? Revisa el [README.md](./README.md) o el [esquema de BD](./database-schema.md).
