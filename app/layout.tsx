import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CDIA Tutor',
  description: 'Tutoría inteligente para estudiantes de CDIA en la UGR',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  )
}
