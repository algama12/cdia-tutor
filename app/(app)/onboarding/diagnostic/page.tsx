import type { Metadata } from 'next'
import { DiagnosticQuiz } from '@/components/onboarding/DiagnosticQuiz'
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnostic-questions'

export const metadata: Metadata = {
  title: 'Diagnóstico inicial — CDIA Tutor',
}

export default function DiagnosticPage() {
  return <DiagnosticQuiz questions={DIAGNOSTIC_QUESTIONS} />
}
