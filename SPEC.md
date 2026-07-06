# CDIA Tutor — Especificación del Proyecto (SPEC.md)

> Documento de referencia para el desarrollo con SDD + TDD.  
> Toda feature debe tener su spec aprobada antes de escribir código de producción.

---

## 1. Visión general

**CDIA Tutor** es una webapp de tutoría inteligente para estudiantes del **Grado en Ciencia de Datos e Inteligencia Artificial de la UGR**. Permite al alumno seleccionar una asignatura y un tema concreto del temario oficial, recibir explicaciones adaptativas, resolver ejercicios generados por IA, y hacer seguimiento de su progreso a lo largo del tiempo.

**Problema que resuelve:** los estudiantes de primer año de CDIA se enfrentan a asignaturas matemáticas densas (Álgebra Lineal, Cálculo, Estadística…) sin un tutor disponible 24/7 que conozca exactamente su temario oficial.

**Diferenciador clave:** el temario está extraído directamente de las guías docentes oficiales de la UGR, no es genérico. El agente sabe exactamente qué temas entran en cada asignatura y en qué orden.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS v4 |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Base de datos | Supabase (PostgreSQL) |
| LLM | OpenRouter API → `anthropic/claude-sonnet-4-5` |
| Testing unitario | Vitest + Testing Library |
| Testing E2E | Playwright |
| Temario | JSON estático generado por script de scraping (commitado al repo) |
| Deploy frontend | Vercel |
| Deploy DB/Auth | Supabase (cloud) |
| CI | GitHub Actions |

---

## 3. Arquitectura

```
cdia-tutor/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (app)/                  # Rutas protegidas
│   │   ├── dashboard/          # Vista principal post-login
│   │   ├── subject/[id]/       # Vista de asignatura
│   │   └── session/[id]/       # Sesión de tutoría activa
│   └── api/
│       └── chat/               # Route handler → OpenRouter
├── components/
│   ├── ui/                     # Componentes base (Button, Card, Input…)
│   ├── auth/                   # Formularios de auth
│   ├── dashboard/              # Componentes del dashboard
│   ├── subject/                # Selector de asignatura y tema
│   └── session/                # Interfaz de chat/tutoría
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente browser
│   │   ├── server.ts           # Cliente server (cookies)
│   │   └── middleware.ts       # Auth middleware
│   ├── openrouter/
│   │   └── client.ts           # Wrapper OpenRouter
│   ├── prompts/
│   │   └── tutor.ts            # System prompts del agente tutor
│   └── utils/
│       └── curriculum.ts       # Helpers para leer el JSON de temario
├── data/
│   └── curriculum.json         # Temario oficial UGR (generado por script)
├── scripts/
│   └── scrape-curriculum.ts    # Script de scraping de guías docentes UGR
├── types/
│   └── index.ts                # Tipos globales TypeScript
├── tests/
│   ├── unit/                   # Tests Vitest
│   ├── integration/            # Tests Testing Library
│   └── e2e/                    # Tests Playwright
├── supabase/
│   └── migrations/             # Migraciones SQL
├── CLAUDE.md                   # Convenciones para Claude Code
├── SPEC.md                     # Este documento
└── README.md                   # Documentación pública (entregable TFM)
```

---

## 4. Base de datos (esquema)

```sql
-- Perfil de usuario (extiende auth.users de Supabase)
create table profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  created_at timestamptz default now()
);

-- Sesiones de tutoría
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  subject_id text not null,       -- e.g. "algebra-lineal"
  topic_id text not null,         -- e.g. "matrices-sistemas-ecuaciones"
  mode text not null check (mode in ('explain', 'exercise', 'review')),
  created_at timestamptz default now(),
  ended_at timestamptz
);

-- Mensajes de cada sesión
create table messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Progreso por tema
create table topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  subject_id text not null,
  topic_id text not null,
  exercises_attempted int default 0,
  exercises_correct int default 0,
  last_seen_at timestamptz default now(),
  unique(user_id, subject_id, topic_id)
);
```

---

## 5. Temario (curriculum.json)

Estructura del JSON generado por el script de scraping:

```json
{
  "subjects": [
    {
      "id": "algebra-lineal",
      "name": "Álgebra Lineal 1",
      "semester": 1,
      "year": 1,
      "topics": [
        {
          "id": "matrices-sistemas-ecuaciones",
          "name": "Matrices y sistemas de ecuaciones lineales",
          "subtopics": [
            "Operaciones con matrices",
            "Determinantes",
            "Sistemas de ecuaciones: método de Gauss"
          ]
        },
        {
          "id": "aplicaciones-lineales",
          "name": "Aplicaciones lineales",
          "subtopics": [
            "Definición y ejemplos",
            "Núcleo e imagen",
            "Matriz asociada"
          ]
        }
      ]
    }
  ]
}
```

---

## 6. Funcionalidades (features)

### F0 — Módulo de Nivelación ("Summer Mode")

Pensado para alumnos que van a empezar el grado pero llevan años sin estudiar matemáticas. Es la primera pantalla que ve el usuario tras registrarse, antes de acceder al temario oficial.

**Flujo:**
1. El usuario llega al onboarding y se le presenta el Summer Mode como paso previo recomendado
2. El agente realiza un **diagnóstico inicial**: 8-10 preguntas cortas de nivel (fracciones, ecuaciones, funciones, trigonometría básica, geometría vectorial, límites intuitivos)
3. Según las respuestas, genera un **informe de nivel** con los bloques que necesita repasar
4. El usuario puede acceder al **plan de nivelación personalizado**: sesiones de repaso por bloque, con el mismo flujo de explicación/ejercicio/repaso que el tutor oficial
5. Una vez completado el plan (o en cualquier momento), puede acceder al temario oficial del grado

**Temario Summer Mode** (`curriculum-summer.json`):
- Aritmética y álgebra básica (fracciones, potencias, factorización)
- Funciones y gráficas (dominio, imagen, tipos de funciones)
- Trigonometría esencial (seno, coseno, tangente, identidades básicas)
- Introducción a límites y derivadas (concepto intuitivo, reglas básicas)
- Geometría vectorial básica (vectores, producto escalar, módulo)
- Combinatoria y lógica básica (conjuntos, operaciones, razonamiento)

**Criterios de aceptación:**
- [ ] El onboarding presenta el Summer Mode al usuario nuevo
- [ ] El diagnóstico genera un informe de nivel real basado en las respuestas
- [ ] El plan de nivelación se personaliza según el diagnóstico
- [ ] El progreso del Summer Mode se guarda igual que el del temario oficial
- [ ] El usuario puede saltar el Summer Mode si lo desea
- [ ] Desde el dashboard se puede volver al Summer Mode en cualquier momento

---

### F1 — Autenticación
- Registro con email + contraseña
- Login con email + contraseña
- Login con Google OAuth
- Recuperación de contraseña por email
- Sesión persistente con middleware de Supabase
- Rutas protegidas redirigen a `/login` si no hay sesión

**Criterios de aceptación:**
- [ ] El usuario puede registrarse y recibe email de confirmación
- [ ] El usuario puede hacer login y es redirigido al dashboard
- [ ] El usuario puede hacer login con Google
- [ ] Rutas `/dashboard`, `/subject/*`, `/session/*` son inaccesibles sin sesión
- [ ] El usuario puede cerrar sesión

---

### F2 — Dashboard
- Muestra las asignaturas disponibles (1º curso CDIA UGR)
- Muestra progreso del usuario por asignatura (% de temas trabajados)
- Acceso rápido a la última sesión activa
- Indicador visual de temas "débiles" (ratio ejercicios correctos/intentados < 50%)

**Criterios de aceptación:**
- [ ] Se muestran todas las asignaturas del curriculum.json
- [ ] El progreso se actualiza tras cada sesión
- [ ] Los temas débiles se destacan visualmente

---

### F3 — Selector de asignatura y tema
- El usuario selecciona asignatura → se despliegan los temas
- El usuario selecciona tema → elige modo: Explicación, Ejercicio, Repaso
- Botón "Empezar sesión" crea una sesión en BD y redirige a `/session/[id]`

**Modos:**
- **Explicación**: el agente explica el tema paso a paso y responde preguntas
- **Ejercicio**: el agente propone un ejercicio, evalúa la respuesta y da feedback
- **Repaso**: el agente hace preguntas cortas para verificar comprensión

**Criterios de aceptación:**
- [ ] La selección de asignatura muestra sus temas correctamente
- [ ] Los tres modos están disponibles para cada tema
- [ ] Se crea un registro en `sessions` al iniciar

---

### F4 — Sesión de tutoría (chat con agente IA)
- Interfaz de chat conversacional
- El system prompt incluye: asignatura, tema, subtemas, modo seleccionado y progreso previo del usuario en ese tema
- Los mensajes se persisten en `messages` en tiempo real
- Soporte de markdown en las respuestas (fórmulas matemáticas con KaTeX)
- Botón "Finalizar sesión" actualiza `ended_at` y recalcula `topic_progress`
- Streaming de respuestas del LLM

**Criterios de aceptación:**
- [ ] El agente responde en el contexto correcto (asignatura + tema + modo)
- [ ] Las fórmulas matemáticas se renderizan correctamente con KaTeX
- [ ] Los mensajes se guardan en BD
- [ ] Al finalizar, `topic_progress` se actualiza correctamente
- [ ] El streaming funciona sin cortes visibles

---

### F5 — Progreso y memoria
- Vista de progreso por asignatura: lista de temas con barra de progreso
- El system prompt del agente incluye el historial de temas trabajados previamente
- Los temas con bajo rendimiento se marcan como "para repasar"

**Criterios de aceptación:**
- [ ] El progreso refleja datos reales de `topic_progress`
- [ ] El agente adapta su nivel de dificultad según el historial
- [ ] Los temas débiles aparecen destacados en el dashboard y en el selector

---

## 7. System prompt del agente tutor

```
Eres CDIA Tutor, un asistente especializado en las asignaturas de primer curso 
del Grado en Ciencia de Datos e Inteligencia Artificial de la Universidad de Granada.

Asignatura actual: {subject_name}
Tema actual: {topic_name}
Subtemas del tema: {subtopics}
Modo de sesión: {mode}
Progreso previo del alumno en este tema: {progress}

Reglas de comportamiento:
- Responde siempre en español
- Adapta el nivel de dificultad al progreso del alumno
- En modo "Explicación": explica paso a paso, usa ejemplos concretos, comprueba comprensión
- En modo "Ejercicio": propón UN ejercicio, espera la respuesta, evalúala y da feedback detallado
- En modo "Repaso": haz preguntas cortas, confirma o corrige brevemente
- Usa notación matemática LaTeX cuando sea necesario (delimitada por $ para inline, $$ para bloque)
- NO salgas del temario de la asignatura en curso
- Si el alumno pregunta algo fuera del tema, redirige amablemente
```

---

## 8. Testing strategy

### Unitarios (Vitest)
- `curriculum.ts` helpers: parseo y filtrado del JSON
- `prompts/tutor.ts`: generación correcta del system prompt según parámetros
- Lógica de cálculo de progreso (ratio correcto/intentado)
- Validaciones de tipos y utilidades

### Integración (Testing Library)
- Formulario de login: validación, estados de error, submit
- Selector de asignatura/tema: navegación, selección, activación de modos
- Dashboard: renderizado correcto con datos de progreso mockeados
- Componente de chat: renderizado de mensajes, scroll, input

### E2E (Playwright)
- Flujo completo de registro → login → seleccionar tema → iniciar sesión → enviar mensaje → finalizar
- Flujo de login con email/contraseña
- Redirección a login si no autenticado
- Renderizado de fórmulas KaTeX en chat

---

## 9. Script de scraping

El script `scripts/scrape-curriculum.ts` debe:
1. Acceder a las guías docentes de las asignaturas de 1º de CDIA en la web de la UGR
2. Extraer nombre de asignatura, temario y subtemas
3. Generar `data/curriculum.json` con la estructura definida en la sección 5
4. Ejecutarse con `npx tsx scripts/scrape-curriculum.ts`

URLs objetivo:
- `https://grados.ugr.es/ciencia-datos-ia/docencia/plan-estudios`
- Guías docentes individuales de cada asignatura de 1º

**Fallback:** si el scraping de alguna asignatura falla, usar el contenido del BOUGR (Boletín Oficial de la UGR) como fuente secundaria, que ya tenemos parcialmente en este SPEC.

---

## 10. Entregables del TFM

- [ ] Repo público en GitHub con README completo
- [ ] Deploy en Vercel con dominio personalizado
- [ ] Slides de presentación (Canva o similar)
- [ ] Vídeo de demostración en YouTube/Drive
- [ ] Usuario y contraseña de prueba en README

---

## 11. Diseño visual

El diseño se implementa directamente con Claude Code usando el skill de frontend-design configurado en el entorno. No se usa ninguna herramienta externa de diseño en esta fase. El sistema de diseño se define en `DESIGN.md` en la raíz del repo antes de implementar el primer componente, y Claude Code lo respetará en cada feature.

Principios de diseño para CDIA Tutor:
- Estética académica moderna, no genérica
- Dark mode como default (contexto de estudio nocturno)
- Tipografía con carácter, legible para contenido matemático
- KaTeX integrado sin romper la coherencia visual
- Mobile-first pero optimizado para desktop (donde se estudia)

---

## 12. Orden de desarrollo recomendado

1. Setup del proyecto (Next.js + Supabase + Tailwind + Vitest + Playwright)
2. Scripts de scraping → `curriculum.json` + `curriculum-summer.json`
3. `DESIGN.md` — sistema de diseño base
4. F1 — Auth (con tests)
5. F0 — Summer Mode: onboarding + diagnóstico + plan de nivelación (con tests)
6. F2 — Dashboard (con tests)
7. F3 — Selector de asignatura/tema (con tests)
8. F4 — Sesión de tutoría / chat con IA (con tests)
9. F5 — Progreso y memoria (con tests)
10. Polish visual + responsive
11. Deploy + README + slides + vídeo

---

*Última actualización: julio 2026*
*Autor: Álvaro Galet Martín — TFM Máster en Desarrollo de Software con IA (BIG school)*
