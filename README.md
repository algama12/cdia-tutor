# CDIA Tutor

**Tutor inteligente para estudiantes del Grado en Ciencia de Datos e Inteligencia Artificial de la UGR.**

🌐 [cdiatutor.online](https://cdiatutor.online) · 📦 [github.com/algama12/cdia-tutor](https://github.com/algama12/cdia-tutor)

---

## Descripción general

CDIA Tutor es una aplicación web de tutoría con IA diseñada específicamente para los estudiantes de primer curso del Grado en Ciencia de Datos e Inteligencia Artificial de la Universidad de Granada. A diferencia de un chatbot genérico, el agente conoce exactamente el temario oficial de cada asignatura y adapta las explicaciones, ejercicios y repasos al nivel y progreso real del alumno.

El proyecto nació de una necesidad personal: acceder al grado en septiembre de 2026 después de años sin estudiar matemáticas, sin un tutor disponible 24/7 que conozca el plan de estudios exacto.

### Funcionalidades principales

- **Summer Mode** — diagnóstico inicial de nivel (10 preguntas) que genera un plan de nivelación personalizado con 6 módulos de matemáticas previas al grado (álgebra básica, funciones, trigonometría, límites, geometría vectorial, combinatoria)
- **Temario oficial UGR** — 10 asignaturas de 1º CDIA con 56 temas y ~200 subtemas extraídos de las guías docentes oficiales
- **Chat con IA en streaming** — respuestas en tiempo real con renderizado de fórmulas matemáticas mediante KaTeX
- **Tres modos de sesión** — Explicación, Ejercicio y Repaso, cada uno con un system prompt y temperatura distintos
- **Seguimiento de progreso** — historial por tema que alimenta el contexto del agente en cada sesión
- **Autenticación completa** — registro y login con email/contraseña

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS v4 |
| Base de datos y Auth | Supabase (PostgreSQL + Row Level Security) |
| LLM | OpenRouter API → `anthropic/claude-sonnet-4-5` |
| Renderizado matemático | KaTeX + react-markdown + remark-math + rehype-katex |
| Testing unitario e integración | Vitest + Testing Library |
| Testing E2E | Playwright |
| Deploy | Vercel |
| Gestor de paquetes | pnpm |

---

## Instalación y ejecución local

### Requisitos previos

- Node.js 22+
- pnpm
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [OpenRouter](https://openrouter.ai)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/algama12/cdia-tutor.git
cd cdia-tutor

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves (ver sección siguiente)

# 4. Aplicar migraciones en Supabase
# Ejecutar en el SQL Editor de Supabase, en orden:
# supabase/migrations/20260707_001_profiles.sql
# supabase/migrations/20260707_002_summer_mode.sql
# supabase/migrations/20260707_003_fix_summer_mode_fkey.sql
# supabase/migrations/20260707_004_sessions_progress.sql

# 5. Generar el curriculum (opcional, ya incluido en /data)
pnpm scrape

# 6. Arrancar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Estructura del proyecto

```
cdia-tutor/
├── app/
│   ├── (auth)/              # Rutas públicas: login, register, forgot-password
│   ├── (app)/               # Rutas protegidas (requieren sesión)
│   │   ├── dashboard/       # Vista principal con grid de asignaturas
│   │   ├── subject/[id]/    # Selector de tema y modo
│   │   ├── session/[id]/    # Chat de tutoría con IA
│   │   ├── progress/        # Progreso por asignatura y tema
│   │   └── onboarding/      # Summer Mode: diagnóstico y módulos de nivelación
│   └── api/chat/            # Route handler de streaming con OpenRouter
├── components/
│   ├── ui/                  # Button, Input, Label
│   ├── auth/                # LoginForm, RegisterForm, ForgotPasswordForm
│   ├── dashboard/           # SubjectCard, DashboardView
│   ├── subject/             # SubjectTopicSelector
│   ├── session/             # ChatSession, MessageBubble
│   ├── progress/            # ProgressView
│   ├── onboarding/          # OnboardingCard, DiagnosticQuiz, LevelReport, SummerModuleSession
│   └── layout/              # AppShell, Sidebar
├── lib/
│   ├── supabase/            # Clientes browser, server y middleware
│   ├── openrouter/          # Cliente de streaming
│   ├── prompts/             # System prompt del agente tutor
│   └── utils/               # curriculum, summer-mode, routes, cn
├── data/
│   ├── curriculum.json           # Temario oficial 1º CDIA (10 asignaturas, 56 temas)
│   ├── curriculum-summer.json    # Temario Summer Mode (6 módulos, 24 temas)
│   └── diagnostic-questions.ts  # 10 preguntas de diagnóstico
├── scripts/
│   └── scrape-curriculum.ts # Scraper de guías docentes UGR (con fallback hardcodeado)
├── tests/
│   ├── unit/                # Vitest — lógica pura
│   ├── integration/         # Testing Library — componentes
│   └── e2e/                 # Playwright — flujos completos
├── supabase/migrations/     # Migraciones SQL versionadas
├── SPEC.md                  # Especificación completa del proyecto
├── CLAUDE.md                # Contexto y convenciones para Claude Code
└── DESIGN.md                # Sistema de diseño (tokens, componentes, layouts)
```

---

## Metodología de desarrollo

El proyecto se desarrolló aplicando **SDD (Spec-Driven Development) + TDD (Test-Driven Development)**:

1. **SPEC.md** — especificación completa antes de escribir código: features, esquema de BD, system prompts, estrategia de testing
2. **DESIGN.md** — sistema de diseño con tokens de color, tipografía, componentes y layouts definidos antes de implementar
3. **CLAUDE.md** — contexto operativo para Claude Code con convenciones, comandos y reglas de arquitectura
4. **Ciclo por feature** — tests en rojo → implementación → tests en verde → revisión

### Cobertura de tests

```
162 tests en total
├── Unit (Vitest)         — lógica pura, utilidades, prompts, cálculo de progreso
├── Integration (Testing Library) — componentes, formularios, flujos de UI
└── E2E (Playwright)      — flujos completos de autenticación y navegación
```

---

## Base de datos

```sql
profiles            -- Perfil de usuario (extiende auth.users)
summer_mode_progress -- Estado del Summer Mode por usuario
sessions            -- Sesiones de tutoría (asignatura, tema, modo)
messages            -- Mensajes de cada sesión
topic_progress      -- Progreso por tema (intentos, aciertos)
```

Todas las tablas tienen **Row Level Security (RLS)** activado.

---

## Acceso de prueba

| Campo | Valor |
|---|---|
| URL | [https://cdiatutor.online](https://cdiatutor.online) |
| Email | `cdiatest@yopmail.com` |
| Contraseña | `Password123!` |

---

## Autor

**Álvaro Galet Martín**
Backend Developer · Estudiante del Máster en Desarrollo de Software con IA (BIG school)
GitHub: [@algama12](https://github.com/algama12)

---

*TFM — Máster en Desarrollo de Software con IA · BIG school · Julio 2026*