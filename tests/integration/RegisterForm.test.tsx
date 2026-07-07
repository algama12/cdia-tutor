import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterForm } from '@/components/auth/RegisterForm'
import * as actions from '@/app/(auth)/register/actions'

vi.mock('@/app/(auth)/register/actions', () => ({
  registerWithEmail: vi.fn().mockResolvedValue(null),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actions.registerWithEmail).mockResolvedValue(null)
  })

  it('renders full name input', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument()
  })

  it('renders confirm password input', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<RegisterForm />)
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('renders link to login', () => {
    render(<RegisterForm />)
    const link = screen.getByRole('link', { name: /iniciar sesión/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/nombre/i), 'Álvaro')
    await user.type(screen.getByLabelText(/email/i), 'test@cdia.es')
    await user.type(screen.getByLabelText(/^contraseña/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'different456')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no coinciden/i)
    expect(vi.mocked(actions.registerWithEmail)).not.toHaveBeenCalled()
  })

  it('shows server error on registration failure', async () => {
    vi.mocked(actions.registerWithEmail).mockResolvedValue({
      error: 'Este email ya está registrado',
    })
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/nombre/i), 'Álvaro')
    await user.type(screen.getByLabelText(/email/i), 'exists@cdia.es')
    await user.type(screen.getByLabelText(/^contraseña/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este email ya está registrado')
  })

  it('shows success message after registration', async () => {
    vi.mocked(actions.registerWithEmail).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/nombre/i), 'Álvaro')
    await user.type(screen.getByLabelText(/email/i), 'new@cdia.es')
    await user.type(screen.getByLabelText(/^contraseña/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/confirma tu email/i)).toBeInTheDocument()
  })

  it('calls registerWithEmail with correct formData', async () => {
    vi.mocked(actions.registerWithEmail).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/nombre/i), 'Álvaro Test')
    await user.type(screen.getByLabelText(/email/i), 'user@cdia.es')
    await user.type(screen.getByLabelText(/^contraseña/i), 'securepass')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'securepass')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(vi.mocked(actions.registerWithEmail)).toHaveBeenCalledOnce()
    const [formData] = vi.mocked(actions.registerWithEmail).mock.calls[0]
    expect(formData.get('email')).toBe('user@cdia.es')
    expect(formData.get('full_name')).toBe('Álvaro Test')
  })
})
