# CLAUDE.md — CDIA Tutor

Contexto operativo para Claude Code. Lee este archivo completo antes de tocar cualquier cosa.
Lee también `SPEC.md` para entender el producto en profundidad.

---

## Qué es este proyecto

**CDIA Tutor** es una webapp de tutoría inteligente con IA para estudiantes del Grado en Ciencia de Datos e Inteligencia Artificial de la UGR. Stack: Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + Supabase (auth + PostgreSQL) + OpenRouter API.

---

## Metodología de trabajo: SDD + TDD

Este proyecto usa **Spec-Driven Development** combinado con **Test-Driven Development**. Esto no es negociable.

**El ciclo obligatorio para cada feature:**

```
1. SPEC    → existe una spec aprobada en SPEC.md antes de escribir código
2. TESTS   → se escriben los tests ANTES del código de producción
3. CÓDIGO  → se implementa lo mínimo para que pasen los tests
4. REVIEW  → se revisa que la implementación cumple la spec
```

**Nunca escribas código de producción sin tests previos.**
**Nunca implementes algo que no esté en la spec sin confirmarlo primero.**

Si en algún momento no tienes claro si algo está en la spec, para y pregunta.

---

## Comandos esenciales

```bash
# Desarrollo
pnpm dev                          # Arranca el servidor de desarrollo

# Testing
pnpm test                         # Vitest en modo watch
pnpm test:run                     # Vitest single run (CI)
pnpm test:coverage                # Cobertura
pnpm test:e2e                     # Playwright E2E
pnpm test:e2e:ui                  # Playwright con UI

# Calidad
pnpm lint                         # ESLint
pnpm typecheck                    # tsc --noEmit
pnpm format                       # Prettier

# Supabase
pnpm supabase:start               # Levanta Supabase local
pnpm supabase:migrate             # Aplica migraciones
pnpm supabase:types               # Genera tipos TypeScript desde el esquema

# Scraping
pnpm scrape                       # Ejecuta scripts/scrape-curriculum.ts
```

---

## Estructura del proyecto

```
cdia-tutor/
├── app/
│   ├── (auth)/                   # Rutas públicas de autenticación
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/                    # Rutas protegidas (requieren sesión)
│       ├── dashboard/page.tsx
│       ├── subject/[id]/page.tsx
│       └── session/[id]/page.tsx
│   └── api/
│       └── chat/route.ts         # Route handler → OpenRouter (streaming)
├── components/
│   ├── ui/                       # Componentes base reutilizables
│   ├── auth/
│   ├── dashboard/
│   ├── subject/
│   ├── session/
│   └── onboarding/               # Summer Mode onboarding
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   ├── server.ts             # createServerClient (cookies)
│   │   └── middleware.ts
│   ├── openrouter/
│   │   └── client.ts
│   ├── prompts/
│   │   └── tutor.ts              # Generación de system prompts
│   └── utils/
│       └── curriculum.ts         # Helpers para leer curriculum.json
├── data/
│   ├── curriculum.json           # Temario oficial UGR 1º CDIA
│   └── curriculum-summer.json    # Temario de nivelación Summer Mode
├── scripts/
│   └── scrape-curriculum.ts
├── types/
│   └── index.ts                  # Tipos globales compartidos
├── tests/
│   ├── unit/                     # Vitest — lógica pura
│   ├── integration/              # Testing Library — componentes
│   └── e2e/                      # Playwright — flujos completos
└── supabase/
    └── migrations/               # Migraciones SQL versionadas
```

---

## Convenciones de código

### TypeScript
- `strict: true` siempre. Sin `any` salvo justificación explícita en comentario.
- Tipos en `types/index.ts` para los compartidos entre capas.
- Inferencia de tipos de Supabase generada con `pnpm supabase:types`, nunca tipada a mano.

### Componentes
- Un componente por archivo.
- Nombre del archivo = nombre del componente en PascalCase.
- Props tipadas con `interface`, nunca `type` para props de componentes.
- Sin lógica de negocio en componentes: los datos llegan por props o desde hooks.

### Server vs Client
- Por defecto, todo es Server Component.
- `'use client'` solo cuando sea estrictamente necesario (interactividad, hooks de browser).
- La comunicación con Supabase desde el servidor usa `lib/supabase/server.ts`.
- La comunicación desde el cliente usa `lib/supabase/client.ts`.

### API Routes
- Solo en `app/api/`. Nunca lógica de negocio directamente en el route handler.
- El route handler de `/api/chat` delega en `lib/openrouter/client.ts`.
- Siempre valida el body de entrada antes de procesar.

### Estilos
- Tailwind CSS v4 únicamente. Sin CSS modules, sin styled-components.
- Sin valores arbitrarios de Tailwind salvo para cosas realmente específicas.
- El sistema de diseño está definido en `DESIGN.md`. Respétalo siempre.

### Base de datos
- Toda interacción con Supabase va a través de las funciones en `lib/supabase/`.
- Las migraciones SQL van en `supabase/migrations/` con nombre `YYYYMMDD_descripcion.sql`.
- Row Level Security (RLS) activado en todas las tablas. Siempre.

---

## Testing

### Unitarios (Vitest)
Ubicación: `tests/unit/`
Qué testear: funciones puras, helpers, utilidades, generación de prompts, cálculo de progreso.

```typescript
// Ejemplo de estructura
import { describe, it, expect } from 'vitest'
import { buildTutorPrompt } from '@/lib/prompts/tutor'

describe('buildTutorPrompt', () => {
  it('incluye el nombre de la asignatura en el prompt', () => {
    const prompt = buildTutorPrompt({ subject: 'Álgebra Lineal', ... })
    expect(prompt).toContain('Álgebra Lineal')
  })
})
```

### Integración (Testing Library)
Ubicación: `tests/integration/`
Qué testear: componentes con interacción, formularios, navegación entre estados.

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { SubjectSelector } from '@/components/subject/SubjectSelector'

it('muestra los temas al seleccionar una asignatura', async () => {
  render(<SubjectSelector subjects={mockSubjects} />)
  fireEvent.click(screen.getByText('Álgebra Lineal'))
  expect(await screen.findByText('Matrices y sistemas de ecuaciones')).toBeInTheDocument()
})
```

### E2E (Playwright)
Ubicación: `tests/e2e/`
Qué testear: flujos completos de usuario de extremo a extremo.

```typescript
test('flujo completo: login → seleccionar tema → iniciar sesión', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@cdia.es')
  await page.fill('[name=password]', 'testpassword')
  await page.click('button[type=submit]')
  await expect(page).toHaveURL('/dashboard')
  // ...
})
```

**Cobertura mínima objetivo: 70% en unitarios e integración.**

---

## Modelo LLM

- Proveedor: OpenRouter
- Modelo: `anthropic/claude-sonnet-4-5`
- Temperatura: `0.7` para explicaciones, `0.4` para evaluación de ejercicios
- Streaming: siempre activado en el chat de tutoría
- El system prompt se genera en `lib/prompts/tutor.ts` y nunca se construye inline en el route handler

---

## Variables de entorno

```bash
# .env.local (nunca commitear)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Solo en servidor, nunca en cliente
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=              # URL base de la app
```

El archivo `.env.example` en el repo muestra las claves necesarias sin valores.

---

## Flujo de autenticación

- Supabase Auth con email/password y Google OAuth
- El middleware en `lib/supabase/middleware.ts` protege todas las rutas bajo `(app)/`
- Las rutas `(auth)/` son públicas
- Tras login exitoso, redirige a `/dashboard`
- El perfil de usuario se crea automáticamente via trigger en Supabase al registrarse

---

## Reglas generales

- Antes de crear un archivo nuevo, comprueba si ya existe algo similar.
- Antes de instalar una dependencia nueva, pregunta si es realmente necesaria.
- Si algo de la spec es ambiguo, para y aclara antes de implementar.
- Los commits siguen Conventional Commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Cada feature en su propia rama: `feature/auth`, `feature/summer-mode`, etc.
- No hagas PR sin que todos los tests pasen.
- El código en español solo en comentarios de negocio. El código en inglés siempre.

---

## Lo que NO hacer

- No usar `any` sin justificación
- No saltarse los tests "para ir más rápido"
- No mezclar lógica de servidor en componentes cliente
- No hardcodear strings de UI (usa constantes o i18n si escala)
- No dejar `console.log` en código de producción
- No modificar migraciones ya aplicadas, crear una nueva
- No commitear `.env.local` ni ninguna clave

---

*Proyecto: CDIA Tutor — TFM Máster en Desarrollo de Software con IA (BIG school)*
*Autor: Álvaro Galet Martín*
