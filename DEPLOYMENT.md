# 🚀 Guía de Despliegue - SGT-Unimar

Esta guía cubre las diferentes opciones para desplegar SGT-Unimar en producción.

## 📦 Build de Producción

Antes de desplegar, siempre genera un build de producción:

```bash
pnpm build
```

Esto creará una carpeta `dist/` con los archivos optimizados.

## ☁️ Opciones de Hosting

### 1. Vercel (Recomendado) ⭐

**Por qué Vercel:**
- Despliegue instantáneo desde Git
- HTTPS automático
- CDN global
- Excelente soporte para Vite
- Preview deployments automáticos
- **GRATIS** para proyectos personales

#### Opción A: Desde el Dashboard Web

1. Ve a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Vite
5. Click "Deploy"

#### Opción B: Con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd sgt-unimar
vercel

# Para producción
vercel --prod
```

**Configuración automática:**
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

---

### 2. Netlify 🌐

**Por qué Netlify:**
- Interfaz amigable
- HTTPS automático
- Forms integrados (útil para contacto)
- Functions serverless
- **GRATIS** con límites generosos

#### Despliegue Manual

1. Crea el build:
```bash
pnpm build
```

2. Ve a [netlify.com](https://netlify.com)
3. Arrastra la carpeta `dist/` al dashboard

#### Despliegue desde Git

1. Conecta tu repositorio en Netlify
2. Configura:
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: `18`

3. Crea `netlify.toml` en la raíz:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### 3. GitHub Pages 📄

**Por qué GitHub Pages:**
- Hosting gratuito directo desde GitHub
- Ideal para proyectos open source
- Fácil configuración

#### Setup

1. Instala el plugin de GitHub Pages:
```bash
pnpm add -D gh-pages
```

2. Agrega scripts a `package.json`:
```json
{
  "scripts": {
    "predeploy": "pnpm build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Actualiza `vite.config.ts`:
```ts
export default defineConfig({
  base: '/sgt-unimar/', // nombre de tu repo
  // ... resto de la config
})
```

4. Despliega:
```bash
pnpm deploy
```

5. En GitHub, ve a Settings > Pages y selecciona la rama `gh-pages`

Tu sitio estará en: `https://tu-usuario.github.io/sgt-unimar`

---

### 4. Firebase Hosting 🔥

**Por qué Firebase:**
- Integración con otros servicios de Firebase
- CLI poderosa
- Hosting + Backend en un lugar
- **GRATIS** hasta ciertos límites

#### Setup

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia sesión:
```bash
firebase login
```

3. Inicializa Firebase:
```bash
firebase init hosting
```

Responde:
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds with GitHub: `No` (o Yes si quieres)

4. Crea el build y despliega:
```bash
pnpm build
firebase deploy
```

---

### 5. Railway 🚂

**Por qué Railway:**
- Deploys desde GitHub automáticos
- Soporte para bases de datos
- Plan gratuito disponible
- Ideal si planeas agregar backend

#### Setup

1. Ve a [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará Vite automáticamente
5. Agrega estas variables de entorno si es necesario:
   ```
   NODE_VERSION=18
   ```

---

### 6. Render 🎨

**Por qué Render:**
- Alternativa moderna a Heroku
- HTTPS automático
- Deploy desde Git
- Plan gratuito disponible

#### Setup

1. Ve a [render.com](https://render.com)
2. New > Static Site
3. Conecta tu repositorio
4. Configura:
   - Build Command: `pnpm build`
   - Publish directory: `dist`

---

## 🔐 Variables de Entorno en Producción

### Para Vercel

```bash
# Desde la terminal
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

O desde el dashboard en Settings > Environment Variables

### Para Netlify

En Site settings > Build & deploy > Environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Para otras plataformas

Busca la sección "Environment Variables" en el dashboard y agrega:
- Nombre: `VITE_SUPABASE_URL`
- Valor: `https://xxx.supabase.co`

**⚠️ Importante:** Las variables deben empezar con `VITE_` para ser expuestas al cliente.

---

## 🔄 Despliegue Continuo (CD)

### GitHub Actions (Ejemplo para Vercel)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## ✅ Checklist Pre-Despliegue

Antes de desplegar a producción:

- [ ] El build local funciona correctamente (`pnpm build` sin errores)
- [ ] Todas las rutas funcionan correctamente
- [ ] Las variables de entorno están configuradas
- [ ] Los errores 404 redirigen correctamente (SPA routing)
- [ ] Las imágenes y assets se cargan correctamente
- [ ] El sitio es responsive en móvil
- [ ] No hay console.logs o debuggers
- [ ] El favicon se muestra correctamente
- [ ] Los meta tags están configurados (SEO)
- [ ] HTTPS está habilitado
- [ ] Comprimir assets si es posible

---

## 🧪 Testing del Build

Antes de desplegar, prueba el build localmente:

```bash
# Crear build
pnpm build

# Servir localmente
pnpm preview
```

Visita `http://localhost:4173` y verifica:
- ✅ Todas las rutas funcionan
- ✅ Las imágenes cargan
- ✅ No hay errores en consola
- ✅ El CSS se aplica correctamente

---

## 📊 Monitoreo Post-Despliegue

### Analytics (Opcional)

#### Google Analytics
```html
<!-- En index.html antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Vercel Analytics
```bash
pnpm add @vercel/analytics
```

```tsx
// En App.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <TournamentProvider>
        <RouterProvider router={router} />
      </TournamentProvider>
      <Analytics />
    </>
  );
}
```

---

## 🐛 Troubleshooting

### Página en blanco después de desplegar

**Problema:** El sitio muestra una página en blanco.

**Solución:**
1. Verifica la consola del navegador (F12)
2. Asegúrate de que `base` en `vite.config.ts` sea correcto
3. Verifica que las rutas del SPA estén configuradas

### 404 en rutas

**Problema:** `/fixtures` retorna 404.

**Solución:** Configura redirects para SPA:

**Netlify:** Ya incluido en `netlify.toml`

**Vercel:** Crea `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Assets no cargan

**Problema:** CSS, imágenes o JS no cargan.

**Solución:**
1. Verifica rutas relativas en imports
2. Verifica `base` en `vite.config.ts`
3. Usa rutas absolutas desde `/`

### Build falla

**Problema:** `pnpm build` falla.

**Solución:**
1. Revisa errores de TypeScript
2. Asegúrate de que todas las dependencias estén instaladas
3. Limpia cache: `rm -rf node_modules/.vite && pnpm build`

---

## 🎯 Recomendación Final

Para SGT-Unimar, **recomendamos Vercel** por:
- ✅ Deploy automático desde Git
- ✅ Preview deployments
- ✅ Excelente performance
- ✅ Configuración cero
- ✅ Plan gratuito generoso
- ✅ Fácil agregar Supabase después

**Comando único:**
```bash
vercel --prod
```

¡Y listo! 🚀

---

**Documentación adicional:**
- [README.md](./README.md) - Documentación general
- [QUICKSTART.md](./QUICKSTART.md) - Inicio rápido
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Desarrollo local
