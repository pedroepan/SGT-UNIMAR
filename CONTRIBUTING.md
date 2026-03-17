# 🤝 Guía de Contribución - SGT-Unimar

¡Gracias por tu interés en contribuir al Sistema de Gestión de Torneos de Unimar!

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Estándares de Código](#estándares-de-código)
- [Estructura de Commits](#estructura-de-commits)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 📜 Código de Conducta

### Nuestro Compromiso

Este proyecto está comprometido a proporcionar un ambiente acogedor y libre de acoso para todos, independientemente de edad, tamaño corporal, discapacidad, etnia, identidad y expresión de género, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o identidad y orientación sexual.

### Comportamiento Esperado

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable

- Uso de lenguaje o imágenes sexualizadas
- Comentarios insultantes o despectivos (trolling)
- Acoso público o privado
- Publicar información privada de otros sin permiso
- Conducta que podría considerarse inapropiada en un entorno profesional

## 🚀 Cómo Contribuir

Hay muchas formas de contribuir:

### 1. Reportar Bugs 🐛
¿Encontraste un error? [Abre un issue](#reportar-bugs)

### 2. Sugerir Mejoras 💡
¿Tienes una idea? [Crea una propuesta](#sugerir-mejoras)

### 3. Mejorar Documentación 📝
La documentación siempre puede mejorar

### 4. Escribir Código 💻
Implementa nuevas funcionalidades o corrige bugs

### 5. Revisar Pull Requests 👀
Ayuda revisando código de otros

## 🛠️ Configuración del Entorno

### Requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Setup Inicial

```bash
# 1. Fork el repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/sgt-unimar.git
cd sgt-unimar

# 3. Agregar el repositorio original como upstream
git remote add upstream https://github.com/USUARIO-ORIGINAL/sgt-unimar.git

# 4. Instalar dependencias
pnpm install

# 5. Crear una rama para tu trabajo
git checkout -b feature/mi-nueva-funcionalidad

# 6. Iniciar servidor de desarrollo
pnpm dev
```

## 🔄 Proceso de Pull Request

### Antes de Empezar

1. **Busca issues existentes** para evitar trabajo duplicado
2. **Abre un issue** para discutir cambios grandes antes de implementar
3. **Sincroniza tu fork** con el repositorio upstream

### Flujo de Trabajo

```bash
# 1. Asegúrate de estar en la rama main
git checkout main

# 2. Obtén los últimos cambios
git pull upstream main

# 3. Crea una nueva rama
git checkout -b feature/mi-funcionalidad
# o
git checkout -b fix/correccion-bug

# 4. Haz tus cambios y commits
git add .
git commit -m "feat: descripción del cambio"

# 5. Sincroniza con upstream antes de hacer push
git pull upstream main --rebase

# 6. Resuelve conflictos si los hay

# 7. Push a tu fork
git push origin feature/mi-funcionalidad

# 8. Abre un Pull Request en GitHub
```

### Checklist para PR

Antes de enviar tu Pull Request, asegúrate de:

- [ ] El código sigue los estándares del proyecto
- [ ] Los commits siguen la convención establecida
- [ ] Has actualizado la documentación si es necesario
- [ ] El build funciona sin errores (`pnpm build`)
- [ ] No hay errores de TypeScript
- [ ] Has probado tu código en diferentes navegadores (si aplica)
- [ ] El código es responsive (móvil, tablet, desktop)
- [ ] Has agregado comentarios en código complejo
- [ ] El PR tiene una descripción clara de los cambios

### Template de Pull Request

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que afecta funcionalidad existente)
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas para verificar tus cambios.

## Screenshots (si aplica)
Agrega capturas de pantalla de los cambios visuales.

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He revisado mi propio código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] No he generado nuevas warnings
- [ ] El build funciona correctamente
```

## 📝 Estándares de Código

### TypeScript

```tsx
// ✅ BUENO: Tipos explícitos
interface TournamentProps {
  id: string;
  name: string;
  onSelect: (id: string) => void;
}

export function Tournament({ id, name, onSelect }: TournamentProps) {
  // ...
}

// ❌ MALO: Sin tipos
export function Tournament({ id, name, onSelect }) {
  // ...
}
```

### Nombres de Variables

```tsx
// ✅ BUENO: Descriptivo y en camelCase
const selectedTournament = tournaments.find(t => t.id === id);
const isLoadingTeams = true;
const teamRegistrationForm = useForm();

// ❌ MALO: Nombres genéricos
const data = tournaments.find(t => t.id === id);
const flag = true;
const form = useForm();
```

### Componentes

```tsx
// ✅ BUENO: Un componente por archivo, export nombrado
// archivo: tournament-card.tsx
export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tournament.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}

// ❌ MALO: Múltiples componentes no relacionados en un archivo
```

### Hooks

```tsx
// ✅ BUENO: Hooks al inicio, dependencias correctas
function MyComponent() {
  const [count, setCount] = useState(0);
  const { tournaments } = useTournament();
  
  useEffect(() => {
    console.log(count);
  }, [count]); // Dependencias explícitas
  
  return <div>{count}</div>;
}

// ❌ MALO: Hooks condicionales, sin dependencias
function MyComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0); // ❌ Condicional
  }
  
  useEffect(() => {
    console.log(count);
  }); // ❌ Sin array de dependencias
}
```

### Imports

```tsx
// ✅ BUENO: Ordenados y agrupados
// 1. React y librerías externas
import { useState, useEffect } from "react";
import { toast } from "sonner";

// 2. Componentes UI
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// 3. Contextos y hooks propios
import { useTournament } from "../context/tournament-context";

// 4. Tipos
import type { Tournament } from "../context/tournament-context";

// ❌ MALO: Desordenados
import { Button } from "./ui/button";
import type { Tournament } from "../context/tournament-context";
import { useState } from "react";
import { useTournament } from "../context/tournament-context";
```

### Tailwind CSS

```tsx
// ✅ BUENO: Clases organizadas, uso de variables CSS
<div className="flex flex-col gap-4 p-6 bg-primary text-white rounded-lg">
  <Button className="bg-secondary hover:bg-secondary/90">
    Click me
  </Button>
</div>

// ❌ MALO: Colores hardcodeados, clases repetidas
<div className="flex flex-col gap-4 p-6 bg-[#0A4C95] text-white rounded-lg rounded-lg">
  <Button className="bg-[#10B981]">
    Click me
  </Button>
</div>
```

## 💬 Estructura de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/).

### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan código)
- **refactor**: Refactorización de código
- **perf**: Mejoras de performance
- **test**: Agregar o corregir tests
- **chore**: Tareas de mantenimiento

### Ejemplos

```bash
# Nueva funcionalidad
git commit -m "feat: agregar filtro de torneos por deporte"

# Corrección de bug
git commit -m "fix: corregir cálculo de diferencia de goles en tabla de posiciones"

# Documentación
git commit -m "docs: actualizar README con instrucciones de despliegue"

# Con scope
git commit -m "feat(fixtures): agregar botón para editar resultados"

# Con cuerpo
git commit -m "feat: implementar sistema de notificaciones

- Agregar toast para acciones exitosas
- Agregar toast para errores
- Usar biblioteca sonner"

# Breaking change
git commit -m "feat!: cambiar estructura de datos de torneos

BREAKING CHANGE: El campo 'teams' ahora es un array de IDs
en lugar de un array de objetos completos"
```

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** en los issues existentes
2. **Actualiza** a la última versión
3. **Verifica** que puedas reproducir el bug

### Template de Issue para Bugs

```markdown
## Descripción del Bug
Descripción clara y concisa del problema.

## Pasos para Reproducir
1. Ve a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado
Descripción de lo que debería pasar.

## Comportamiento Actual
Descripción de lo que realmente pasa.

## Screenshots
Si aplica, agrega screenshots.

## Entorno
- OS: [ej. Windows 10, macOS 12.0, Ubuntu 22.04]
- Navegador: [ej. Chrome 119, Firefox 120, Safari 16]
- Versión del Proyecto: [ej. 1.0.0]
- Node: [ej. 18.17.0]

## Información Adicional
Cualquier otra información relevante.

## Logs de Consola
```javascript
// Pega aquí los errores de la consola
```
```

## 💡 Sugerir Mejoras

### Template de Issue para Mejoras

```markdown
## Resumen de la Mejora
Breve descripción de la mejora propuesta.

## Motivación
¿Por qué es necesaria esta mejora? ¿Qué problema resuelve?

## Propuesta Detallada
Descripción detallada de cómo funcionaría.

## Alternativas Consideradas
Otras formas de lograr lo mismo.

## Impacto
- Usuarios afectados: [todos, administradores, capitanes, etc.]
- Breaking changes: [sí/no]
- Dependencias nuevas: [lista o "ninguna"]

## Mockups/Ejemplos
Si tienes diseños o ejemplos, compártelos aquí.
```

## 🎨 Estándares de UI/UX

### Colores

Usa siempre las variables CSS definidas:

```css
/* ✅ BUENO */
background-color: var(--primary);
color: var(--secondary);

/* ❌ MALO */
background-color: #0A4C95;
color: #10B981;
```

### Responsividad

Prueba en estos breakpoints:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

```tsx
// ✅ BUENO: Mobile-first
<div className="flex flex-col md:flex-row gap-4">
  
// ❌ MALO: Desktop-first
<div className="flex flex-row lg:flex-col gap-4">
```

### Accesibilidad

- Usa elementos semánticos (`<button>`, `<nav>`, etc.)
- Agrega `aria-label` cuando sea necesario
- Asegura contraste de colores adecuado
- Navega tu UI solo con teclado

## 📚 Recursos Útiles

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/es/)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)

## ❓ ¿Preguntas?

Si tienes preguntas sobre cómo contribuir:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un nuevo issue con la etiqueta "question"
4. Contacta al equipo: soporte@unimar.edu.ve

## 🙏 Agradecimientos

Gracias por contribuir a SGT-Unimar y ayudar a mejorar la gestión de torneos deportivos en la Universidad de Margarita.

---

**¡Happy coding!** 💻✨
