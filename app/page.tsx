import Link from 'next/link'
import {
  BookOpen,
  MessageSquare,
  BarChart3,
  Sun,
  ChevronRight,
  Sigma,
  Zap,
  Brain,
} from 'lucide-react'

const SUBJECTS = [
  'Cálculo',
  'Álgebra Lineal',
  'Estadística',
  'Lógica y Métodos Discretos',
  'Fundamentos de Programación',
  'Metodología de la Programación',
  'Fundamentos del Software',
  'Tecnología y Organización de Computadores',
  'Fundamentos Físicos y Tecnológicos',
  'Ingeniería, Empresa y Sociedad',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-base/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <Sigma size={20} className="text-primary" aria-hidden="true" />
            <span className="font-semibold text-text">CDIA Tutor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-muted transition-colors duration-150 hover:text-text"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-text-inverse transition-colors duration-150 hover:bg-primary-hover"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — asymmetric two-column */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: copy */}
          <div className="min-w-0 flex-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-subtle px-3 py-1 text-xs font-medium text-primary">
              <Sun size={12} aria-hidden="true" />
              1º Grado CDIA · Universidad de Granada
            </div>
            <h1 className="mb-5 text-4xl font-extrabold leading-snug text-text md:text-5xl">
              El tutor que conoce{' '}
              <span className="text-primary">tu temario exacto</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-text-muted">
              Cálculo, Álgebra, Estadística, Programación y el resto de
              asignaturas de 1º CDIA. Explicaciones, ejercicios y repaso —
              adaptados a lo que entra en{' '}
              <span className="text-text">tus exámenes de la UGR</span>.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-text-inverse transition-colors duration-150 hover:bg-primary-hover"
              >
                Empezar gratis
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-text-muted transition-colors duration-150 hover:border-primary hover:text-text"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Right: decorative code/formula block */}
          <div className="w-full shrink-0 lg:w-[420px]">
            <div className="rounded-xl border border-border bg-surface font-mono text-sm">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="size-3 rounded-full bg-error/60" />
                <span className="size-3 rounded-full bg-warning/60" />
                <span className="size-3 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-text-faint">sesión · Cálculo · Límites</span>
              </div>
              {/* Chat preview */}
              <div className="space-y-4 p-5">
                <div className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-xs text-primary">IA</span>
                  <p className="text-xs leading-relaxed text-text-muted">
                    El límite de una función en un punto{' '}
                    <span className="rounded bg-elevated px-1 text-secondary">
                      x₀
                    </span>{' '}
                    se define formalmente como:
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-elevated px-4 py-3 text-center">
                  <span className="text-sm text-text">
                    lim
                    <sub className="text-text-muted">x→x₀</sub>{' '}
                    f(x) = L
                  </span>
                  <p className="mt-1 text-xs text-text-faint">
                    ∀ε{'>'}&thinsp;0, ∃δ{'>'}&thinsp;0 : 0{'<'}|x−x₀|{'<'}δ ⟹ |f(x)−L|{'<'}ε
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <p className="rounded-lg border border-primary/20 bg-primary-subtle px-3 py-2 text-xs text-text-muted">
                    ¿Puedes darme un ejercicio?
                  </p>
                  <span className="mt-0.5 shrink-0 text-xs text-text-faint">Tú</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-xs text-primary">IA</span>
                  <p className="text-xs leading-relaxed text-text-muted">
                    Claro. Calcula{' '}
                    <span className="text-text">
                      lim<sub>x→2</sub> (x²−4)/(x−2)
                    </span>{' '}
                    paso a paso.
                    <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-primary align-middle" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-text-faint">
            Asignaturas disponibles — 1º CDIA UGR
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-elevated px-3 py-1.5 text-sm text-text-muted"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — list layout */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h2 className="mb-16 text-2xl font-bold text-text">
          Cómo funciona
        </h2>
        <div className="space-y-14">
          <Feature
            icon={<Sun size={28} className="text-warning" aria-hidden="true" />}
            iconBg="bg-warning-subtle"
            number="01"
            title="Empieza con un diagnóstico"
            description="Si llevas tiempo sin estudiar, el Summer Mode evalúa tu nivel con 10 preguntas y genera un plan de nivelación personalizado. Sin eso, directo al temario."
          />
          <Feature
            icon={<BookOpen size={28} className="text-primary" aria-hidden="true" />}
            iconBg="bg-primary-subtle"
            number="02"
            title="Elige asignatura, tema y modo"
            description="El tutor conoce exactamente qué subtemas entran en cada asignatura de 1º CDIA. Escoge entre explicación paso a paso, ejercicio con feedback o repaso rápido."
          />
          <Feature
            icon={<MessageSquare size={28} className="text-secondary" aria-hidden="true" />}
            iconBg="bg-secondary-subtle"
            number="03"
            title="Sesión de chat con IA"
            description="Responde en español, con fórmulas en tiempo real. El agente explica, corrige y adapta el nivel según tus respuestas. No ChatGPT genérico — sabe lo que pide tu profesor."
          />
          <Feature
            icon={<BarChart3 size={28} className="text-success" aria-hidden="true" />}
            iconBg="bg-success-subtle"
            number="04"
            title="Seguimiento real de tu progreso"
            description="Cada sesión actualiza tu progreso por tema. Los puntos débiles se señalan para que repases donde más lo necesitas antes del examen."
          />
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-text">
                Sin excusas para el parcial.
              </h2>
              <p className="text-text-muted">
                Gratis. Sin tarjeta. Listo en dos minutos.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-8 py-3 font-medium text-text-inverse transition-colors duration-150 hover:bg-primary-hover"
            >
              Crear cuenta
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-text-faint md:px-8">
          <div className="flex items-center gap-2">
            <Sigma size={13} aria-hidden="true" />
            <span>CDIA Tutor</span>
          </div>
          <span>Universidad de Granada</span>
        </div>
      </footer>
    </div>
  )
}

interface FeatureProps {
  icon: React.ReactNode
  iconBg: string
  number: string
  title: string
  description: string
}

function Feature({ icon, iconBg, number, title, description }: FeatureProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <div className="flex flex-col items-center gap-3">
        <div className={`rounded-xl p-3 ${iconBg}`}>{icon}</div>
        <span className="text-xs font-mono text-text-faint">{number}</span>
      </div>
      <div className="pt-1 min-w-0">
        <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
        <p className="max-w-xl leading-relaxed text-text-muted">{description}</p>
      </div>
    </div>
  )
}
