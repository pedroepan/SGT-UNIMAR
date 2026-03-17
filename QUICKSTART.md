# ⚡ Inicio Rápido - SGT-Unimar

Guía de 5 minutos para tener el proyecto corriendo localmente.

## 📋 Pre-requisitos

Asegúrate de tener instalado:
- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **pnpm** ([Instalación](#instalar-pnpm))

### Instalar pnpm

```bash
# Opción 1: Con npm
npm install -g pnpm

# Opción 2: Con script (macOS/Linux)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Opción 3: Con Homebrew (macOS)
brew install pnpm

# Opción 4: Con Chocolatey (Windows)
choco install pnpm
```

Verifica la instalación:
```bash
pnpm --version
```

## 🚀 Instalación (3 pasos)

### 1️⃣ Clonar e instalar dependencias

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sgt-unimar.git
cd sgt-unimar

# Instalar todas las dependencias
pnpm install
```

### 2️⃣ Configurar variables de entorno (Opcional)

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar si es necesario (por ahora no es requerido)
# nano .env
```

### 3️⃣ Iniciar servidor de desarrollo

```bash
pnpm dev
```

¡Listo! 🎉 Abre tu navegador en:
**http://localhost:5173**

## 📱 Vista del Proyecto

Deberías ver tres secciones principales:

1. **Dashboard del Administrador** (`/`)
   - Torneos activos
   - Inscripciones pendientes
   - Crear torneos

2. **Fixtures y Resultados** (`/fixtures`)
   - Partidos programados
   - Tabla de posiciones
   - Registrar resultados

3. **Inscripción de Equipos** (`/inscripcion`)
   - Formulario por pasos
   - Registro de jugadores

## 🛠️ Comandos Útiles

```bash
# Iniciar desarrollo
pnpm dev

# Build de producción
pnpm build

# Vista previa del build
pnpm preview

# Limpiar cache y node_modules
rm -rf node_modules .cache
pnpm install
```

## 🎨 Probar Funcionalidades

### ✅ Crear un Torneo
1. Ve al Dashboard (`/`)
2. Click en "Crear Nuevo Torneo"
3. Llena el formulario
4. Guarda

### ✅ Aprobar un Equipo
1. En Dashboard, ve a "Inscripciones Pendientes"
2. Click en un equipo pendiente
3. Click "Aprobar"
4. Agrégalo a un torneo

### ✅ Registrar un Resultado
1. Ve a Fixtures (`/fixtures`)
2. Selecciona un torneo del dropdown
3. Click "Registrar Resultado" en un partido
4. Ingresa marcadores
5. Ve cómo se actualiza la tabla de posiciones

### ✅ Inscribir un Equipo
1. Ve a Inscripción (`/inscripcion`)
2. Llena datos del equipo
3. Agrega entre 6-11 jugadores
4. Envía el formulario

## 🐛 Problemas Comunes

### Puerto ocupado
```bash
# Cambiar puerto en vite.config.ts
server: {
  port: 3000 // o el que prefieras
}
```

### Errores de instalación
```bash
# Limpiar todo y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Página en blanco
```bash
# Verificar consola del navegador (F12)
# Verificar que pnpm dev esté corriendo
# Verificar puerto correcto (5173)
```

## 📚 Siguiente Paso

Lee la documentación completa:
- **[README.md](./README.md)** - Documentación general
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guía de desarrollo
- **[database-schema.md](./database-schema.md)** - Esquema de base de datos

## ❓ ¿Necesitas Ayuda?

- **Documentación**: Lee los archivos .md en la raíz
- **Issues**: Reporta problemas en GitHub
- **Email**: soporte@unimar.edu.ve

---

**¡Feliz desarrollo!** 🚀
