# DESIGN.md — Sistema de Diseño CDIA Tutor

Referencia de diseño para Claude Code. Todos los componentes y vistas deben cumplir estas especificaciones.

---

## 1. Principios

| Principio | Implementación |
|---|---|
| **Dark mode first** | Fondo base oscuro, modo claro no implementado en v1 |
| **Académico moderno** | Sin gradientes de arco iris ni confetti; claridad visual |
| **Legibilidad matemática** | Tipografía sans-serif de alta legibilidad + KaTeX sin romper layout |
| **Desktop-optimized** | Grid de 12 columnas; sidebar fija en ≥ 1024px |
| **Feedback inmediato** | Estados hover, focus y loading en todo elemento interactivo |

---

## 2. Paleta de colores

### Tokens base (Tailwind v4 — definir en `app/globals.css`)

```css
@import "tailwindcss";

@theme {
  /* ── Fondos ─────────────────────────────── */
  --color-base:     #080B12;   /* cuerpo de página */
  --color-bg:       #0D1117;   /* fondo principal */
  --color-surface:  #141B25;   /* cards, paneles */
  --color-elevated: #1C2537;   /* modales, dropdowns, tooltips */

  /* ── Bordes ─────────────────────────────── */
  --color-border:        #253048;
  --color-border-subtle: #1A2235;

  /* ── Texto ──────────────────────────────── */
  --color-text:         #EBF0FF;   /* texto principal */
  --color-text-muted:   #8A9DBF;   /* texto secundario */
  --color-text-faint:   #4A5970;   /* placeholders, disabled */
  --color-text-inverse: #0D1117;   /* texto sobre fondos claros */

  /* ── Acento primario — Indigo eléctrico ── */
  --color-primary:          #6C8EF4;   /* botones, links activos */
  --color-primary-hover:    #5A7CE8;
  --color-primary-subtle:   #1A2850;   /* fondos de badge, chip */
  --color-primary-glow:     #6C8EF440; /* sombra/halo en focus */

  /* ── Acento secundario — Teal ────────────  */
  --color-secondary:        #4ECDC4;   /* highlights, progreso */
  --color-secondary-hover:  #3DBDB4;
  --color-secondary-subtle: #0E2B2A;

  /* ── Estados semánticos ─────────────────── */
  --color-success:        #4ADE80;
  --color-success-subtle: #0A2E1A;
  --color-warning:        #FCD34D;
  --color-warning-subtle: #2A1F00;
  --color-error:          #F87171;
  --color-error-subtle:   #2E0A0A;

  /* ── Tipografía ─────────────────────────── */
  --font-sans: 'Inter Variable', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* ── Radio de borde ─────────────────────── */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* ── Transiciones ───────────────────────── */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
}
```

### Guía de uso de colores

| Elemento | Token |
|---|---|
| Fondo de página | `bg-bg` |
| Cards / paneles | `bg-surface` |
| Modales | `bg-elevated` |
| Divisores | `border-border` |
| Texto body | `text-text` |
| Texto secundario | `text-text-muted` |
| Placeholder / disabled | `text-text-faint` |
| CTAs principales | `bg-primary text-text-inverse` |
| Links | `text-primary hover:text-primary-hover` |
| Barra de progreso | `bg-secondary` |
| Respuesta correcta | `text-success bg-success-subtle` |
| Error / incorrecto | `text-error bg-error-subtle` |
| Aviso | `text-warning bg-warning-subtle` |

---

## 3. Tipografía

### Familia de fuentes

Cargar desde Google Fonts o self-hosted (añadir en `app/layout.tsx`):

```
Inter Variable — UI principal
JetBrains Mono — código, fórmulas en contexto, bloques de código
KaTeX — renderizado de matemáticas (propio, no configurable)
```

### Escala tipográfica

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `text-xs` | 11px | 400 | Metadatos, timestamps |
| `text-sm` | 13px | 400/500 | Texto secundario, labels |
| `text-base` | 15px | 400 | Cuerpo de chat, párrafos |
| `text-lg` | 17px | 500 | Subtítulos de sección |
| `text-xl` | 20px | 600 | Títulos de card |
| `text-2xl` | 24px | 700 | Nombre de asignatura |
| `text-3xl` | 30px | 700 | Títulos de página |
| `text-4xl` | 36px | 800 | Hero / onboarding |

### Reglas tipográficas

- Interlineado: `leading-relaxed` (1.625) para cuerpo, `leading-snug` (1.375) para títulos
- Ancho máximo de línea para lectura: `max-w-prose` (65 chars)
- KaTeX inline: mismo tamaño que texto circundante, `vertical-align: middle`
- KaTeX bloque: padding `py-4`, fondo `bg-elevated`, `rounded-lg`, centrado

---

## 4. Espaciado

Escala de 4px base (Tailwind default). Puntos de referencia:

| Uso | Clase |
|---|---|
| Separación mínima entre elementos inline | `gap-1` (4px) |
| Padding interno de badge / chip | `px-2 py-0.5` |
| Padding interno de botón | `px-4 py-2` |
| Padding interno de card | `p-4` o `p-6` |
| Separación entre secciones de página | `space-y-8` |
| Margen de contenedor principal | `px-4 md:px-8 lg:px-12` |

---

## 5. Layout

### Grid de página

```
┌─────────────────────────────────────────────────────────┐
│  Topbar (64px fija, full-width)                         │
├───────────────┬─────────────────────────────────────────┤
│  Sidebar      │  Main content                           │
│  240px        │  flex-1, max-w-4xl mx-auto              │
│  (oculta      │                                         │
│  en mobile)   │                                         │
└───────────────┴─────────────────────────────────────────┘
```

- **Mobile (< 1024px):** layout de columna única; sidebar se convierte en bottom nav o drawer
- **Desktop (≥ 1024px):** sidebar fija izquierda + área principal scrollable
- **Chat (session):** sidebar oculta en mobile; área de chat ocupa full height con sticky input

### Contenedor principal

```tsx
<main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
  <div className="max-w-4xl mx-auto">
    {/* contenido */}
  </div>
</main>
```

---

## 6. Componentes base

### Button

Variantes y clases:

```tsx
// Primary — acción principal
"bg-primary text-text-inverse font-medium px-4 py-2 rounded-md
 hover:bg-primary-hover transition-fast
 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg
 disabled:opacity-40 disabled:cursor-not-allowed"

// Secondary / outline
"border border-border text-text-muted bg-transparent px-4 py-2 rounded-md
 hover:bg-surface hover:text-text transition-fast
 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"

// Ghost (sidebar nav links, etc.)
"text-text-muted px-3 py-2 rounded-md
 hover:bg-surface hover:text-text transition-fast"

// Danger
"bg-error text-white px-4 py-2 rounded-md
 hover:bg-red-600 transition-fast"
```

### Input / Textarea

```tsx
"w-full bg-elevated border border-border rounded-md
 px-3 py-2 text-base text-text placeholder:text-text-faint
 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
 transition-fast"
```

### Card

```tsx
// Base
"bg-surface border border-border rounded-xl p-6"

// Clickable (dashboard, subject selector)
"bg-surface border border-border rounded-xl p-6
 cursor-pointer transition-normal
 hover:border-primary hover:bg-elevated"

// Selected / active
"bg-surface border-2 border-primary rounded-xl p-6"
```

### Badge

```tsx
// Modo de sesión
"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"

// Variantes:
"bg-primary-subtle text-primary"       // explain (Explicación)
"bg-secondary-subtle text-secondary"    // exercise (Ejercicio)
"bg-warning-subtle text-warning"        // review (Repaso)
"bg-success-subtle text-success"        // correct
"bg-error-subtle text-error"            // incorrect
```

### Progress bar

```tsx
// Contenedor
"w-full bg-border-subtle rounded-full h-1.5"
// Fill
"h-1.5 rounded-full bg-secondary transition-all duration-500"
// Débil (< 50%)
"h-1.5 rounded-full bg-error transition-all duration-500"
```

### Spinner / Loading

```tsx
"h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin"
```

---

## 7. Navegación

### Topbar

- Alto: 64px, fija, `sticky top-0 z-50`
- Fondo: `bg-base/90 backdrop-blur-sm border-b border-border`
- Contenido: logo izquierda, nav central (desktop), avatar derecha

### Sidebar

```
┌───────────────────────────┐
│ Logo + nombre del grado   │ ← 48px
├───────────────────────────┤
│ [Dashboard]               │ ← nav item activo: bg-surface border-l-2 border-primary
│ [Asignaturas]             │
│ [Summer Mode]             │
│ [Progreso]                │
├───────────────────────────┤
│ ...flex-1 vacío...        │
├───────────────────────────┤
│ Avatar + nombre usuario   │ ← 56px
│ [Cerrar sesión]           │
└───────────────────────────┘
```

Nav item:
```tsx
// Inactivo
"flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-muted hover:bg-surface hover:text-text transition-fast"
// Activo
"flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text bg-surface border-l-2 border-primary"
```

---

## 8. Pantallas específicas

### Dashboard

Layout: grid de cards de asignatura.

```
┌──────────────────────────────────────────┐
│  Bienvenido, {nombre}          S1 · S2   │  ← toggle semestre
├──────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Cálculo  │ │ Álgebra  │ │ Fund.    │ │  ← grid 3 cols desktop
│  │ ▓▓▓░░░  │ │ ▓▓░░░░  │ │ ▓░░░░░  │ │     2 cols tablet
│  │  3/6 T  │ │  2/6 T  │ │  1/5 T  │ │     1 col mobile
│  └──────────┘ └──────────┘ └──────────┘ │
└──────────────────────────────────────────┘
```

Card de asignatura:
- Nombre asignatura (text-xl font-semibold)
- Semestre badge (text-xs, bg-border-subtle)
- Barra de progreso (temas trabajados / total)
- "N temas" en text-sm text-muted
- Si hay temas débiles: badge "⚠ X temas débiles" en warning

### Subject / Selector de tema

```
Asignatura: Cálculo                           ← breadcrumb
──────────────────────────────────────────────
Tema 1: Límites y continuidad        [→ Iniciar]
  Subtemas: Definición formal, Álgebra de ...
  [Explicación] [Ejercicio] [Repaso]          ← pills de modo

Tema 2: Derivación                   [→ Iniciar]
  ...
```

Selector de modo: tres pills; click selecciona uno (solo uno activo).

### Session (Chat)

```
┌──────────────────────────────────────────┐
│ ← Volver  Cálculo · Límites · Explicación│  ← header compacto
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐     │
│  │ 🤖  Mensaje del asistente       │     │  ← burbuja izquierda
│  │     con KaTeX inline: $f(x)$    │     │
│  │     y bloque: $$\lim_{x→0}...$$│     │
│  └─────────────────────────────────┘     │
│                                          │
│          ┌──────────────────────────┐    │
│          │ Mensaje del usuario      │    │  ← burbuja derecha
│          └──────────────────────────┘    │
│                                          │
├──────────────────────────────────────────┤
│ [textarea] [Enviar ↵]  [Finalizar sesión]│  ← input sticky bottom
└──────────────────────────────────────────┘
```

Burbujas:
```tsx
// Asistente (izquierda)
"max-w-[85%] bg-surface border border-border rounded-2xl rounded-tl-sm p-4 text-sm"

// Usuario (derecha)
"max-w-[75%] bg-primary-subtle border border-primary/30 rounded-2xl rounded-tr-sm p-4 text-sm self-end"
```

Cursor de streaming:
```tsx
// Parpadeo mientras llega la respuesta
"inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse"
```

---

## 9. KaTeX

### Instalación

```bash
pnpm add katex react-katex
pnpm add -D @types/katex
```

### Componente wrapper

```tsx
// components/ui/Math.tsx
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

// Uso:
// <Math inline="f(x) = x^2" />
// <Math block="\int_0^1 x\,dx = \frac{1}{2}" />
```

### Estilos KaTeX en contexto oscuro

```css
/* en globals.css — forzar colores correctos sobre fondo oscuro */
.katex { color: var(--color-text); }
.katex-display {
  background: var(--color-elevated);
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}
```

### Parsing de markdown + matemáticas

Usar `react-markdown` + plugin `remark-math` + `rehype-katex`:

```bash
pnpm add react-markdown remark-math rehype-katex
```

```tsx
// components/session/MessageContent.tsx
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
  {content}
</ReactMarkdown>
```

---

## 10. Iconografía

Librería: **Lucide React** (consistente, tree-shakeable).

```bash
pnpm add lucide-react
```

Tamaños estándar:

| Contexto | Tamaño | Clase |
|---|---|---|
| Nav sidebar | 18px | `size-[18px]` |
| Botones con icono | 16px | `size-4` |
| Inline en texto | 14px | `size-3.5` |
| Indicadores grandes | 24px | `size-6` |
| Ilustraciones empty state | 48px | `size-12 text-text-faint` |

Iconos principales del proyecto:

| Icono Lucide | Uso |
|---|---|
| `BookOpen` | Dashboard, asignaturas |
| `MessageSquare` | Sesión de chat |
| `BarChart3` | Progreso |
| `Sun` | Summer Mode |
| `Zap` | Modo ejercicio |
| `Eye` | Modo repaso |
| `Lightbulb` | Modo explicación |
| `ChevronRight` | Navegación, expansión |
| `Check` | Correcto |
| `X` | Incorrecto, cerrar |
| `AlertTriangle` | Tema débil |
| `LogOut` | Cerrar sesión |
| `Loader2` | Spinner (con `animate-spin`) |

---

## 11. Animaciones y transiciones

| Caso de uso | Implementación |
|---|---|
| Hover en botones / cards | `transition-colors duration-150` |
| Aparición de modal | `animate-in fade-in-0 zoom-in-95 duration-200` |
| Entrada de mensaje en chat | `animate-in slide-in-from-bottom-2 duration-200` |
| Progreso de barra | `transition-all duration-500 ease-out` |
| Spinner | `animate-spin` |
| Cursor de streaming | `animate-pulse` |
| Sidebar en mobile | `transition-transform duration-250` |

Respetar `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 12. Estados de UI

### Empty state

```
     [Icono 48px text-text-faint]
     Título descriptivo (text-lg text-text)
     Descripción (text-sm text-text-muted, max-w-xs text-center)
     [Botón de acción primaria]
```

### Error state

```
     [AlertCircle 48px text-error]
     "Algo ha ido mal"
     Mensaje de error en text-sm text-text-muted
     [Reintentar] [Volver]
```

### Loading skeleton

Usar `animate-pulse bg-border-subtle rounded` en lugar de spinners para contenido de página.

```tsx
// Ejemplo skeleton de card
<div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
  <div className="h-4 bg-border-subtle rounded w-3/4 mb-3" />
  <div className="h-2 bg-border-subtle rounded w-full mb-2" />
  <div className="h-2 bg-border-subtle rounded w-5/6" />
</div>
```

---

## 13. Accesibilidad

- Todo elemento interactivo tiene `focus:outline-none focus:ring-2 focus:ring-primary`
- Contraste mínimo AA: texto principal `#EBF0FF` sobre `#0D1117` → ratio > 16:1 ✓
- Contraste mínimo AA: texto muted `#8A9DBF` sobre `#0D1117` → ratio > 5:1 ✓
- Íconos decorativos: `aria-hidden="true"`
- Íconos funcionales: `aria-label` explícito
- Chat: usar `role="log" aria-live="polite"` en el contenedor de mensajes
- Inputs: siempre asociados a `<label>` visible o `aria-label`

---

## 14. Onboarding / Summer Mode

Pantalla de bienvenida post-registro:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   ☀ Summer Mode                                  │
│   Antes de empezar, ¿llevas un tiempo sin        │
│   estudiar matemáticas?                          │
│                                                  │
│   ┌────────────────────────────────────┐         │
│   │ Sí, repasa conmigo los             │ ← card  │
│   │ fundamentos antes del grado        │   hover  │
│   └────────────────────────────────────┘         │
│   ┌────────────────────────────────────┐         │
│   │ No, ir directamente al             │         │
│   │ temario oficial                    │         │
│   └────────────────────────────────────┘         │
│                                                  │
└──────────────────────────────────────────────────┘
```

Cards de selección: `border-2`, `border-border` inactivo → `border-primary` activo.
Efecto hover: `scale-[1.01] transition-transform duration-150`.

---

*Última actualización: julio 2026*
*Referencia para implementación con Claude Code + Tailwind CSS v4*
