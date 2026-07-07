export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-subtle rounded-xl mb-4">
            <span className="text-primary font-bold text-xl select-none">C</span>
          </div>
          <h1 className="text-2xl font-bold text-text">CDIA Tutor</h1>
          <p className="text-text-muted text-sm mt-1">
            Tutoría inteligente para el Grado en CDIA · UGR
          </p>
        </div>
        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-8">{children}</div>
      </div>
    </div>
  )
}
