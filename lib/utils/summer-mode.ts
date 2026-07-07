import type { DiagnosticAnswer, DiagnosticQuestion, LevelReport, ModuleLevel } from '@/types'

// Canonical order of Summer Mode modules
export const MODULE_ORDER = [
  'aritmetica-algebra-basica',
  'funciones-graficas',
  'trigonometria-esencial',
  'limites-derivadas-intro',
  'geometria-vectorial-basica',
  'combinatoria-logica-basica',
] as const

export type SummerModuleId = (typeof MODULE_ORDER)[number]

export const MODULE_NAMES: Record<SummerModuleId, string> = {
  'aritmetica-algebra-basica': 'Aritmética y Álgebra Básica',
  'funciones-graficas': 'Funciones y Gráficas',
  'trigonometria-esencial': 'Trigonometría Esencial',
  'limites-derivadas-intro': 'Introducción a Límites y Derivadas',
  'geometria-vectorial-basica': 'Geometría Vectorial Básica',
  'combinatoria-logica-basica': 'Combinatoria y Lógica Básica',
}

/** Returns score [0,1] for a given module based on answers */
export function getModuleScore(
  moduleId: string,
  answers: DiagnosticAnswer[],
  questions: DiagnosticQuestion[]
): number {
  const moduleQuestions = questions.filter((q) => q.moduleId === moduleId)
  if (moduleQuestions.length === 0) return 0

  let correct = 0
  for (const q of moduleQuestions) {
    const answer = answers.find((a) => a.questionId === q.id)
    if (answer && answer.selectedIndex === q.correctIndex) {
      correct++
    }
  }
  return correct / moduleQuestions.length
}

/** Builds a level report mapping each module to its level */
export function calculateDiagnosticLevel(
  answers: DiagnosticAnswer[],
  questions: DiagnosticQuestion[]
): LevelReport {
  const moduleIds = [...new Set(questions.map((q) => q.moduleId))]
  const report: LevelReport = {}

  for (const moduleId of moduleIds) {
    const score = getModuleScore(moduleId, answers, questions)
    // strict threshold: must score > 0.5 to be considered ok
    const level: ModuleLevel = score > 0.5 ? 'ok' : 'needs_review'
    report[moduleId] = level
  }

  return report
}

/** Returns module IDs that need review, sorted by canonical MODULE_ORDER */
export function generateLevelingPlan(report: LevelReport): string[] {
  return MODULE_ORDER.filter((id) => report[id] === 'needs_review')
}

/** Returns the first module in the leveling plan (entry point for Summer sessions) */
export function getFirstPlanModule(report: LevelReport): string | null {
  const plan = generateLevelingPlan(report)
  return plan[0] ?? null
}
