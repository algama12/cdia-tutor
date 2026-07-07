import type { Metadata } from 'next'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'

export const metadata: Metadata = {
  title: 'Bienvenido — CDIA Tutor',
}

export default function OnboardingPage() {
  return <OnboardingCard />
}
