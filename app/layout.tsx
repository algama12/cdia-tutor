import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CDIA Tutor',
  description: 'Tutoría inteligente para estudiantes de CDIA en la UGR',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
