import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/components/auth/LoginForm'
import * as actions from '@/app/(auth)/login/actions'

vi.mock('@/app/(auth)/login/actions', () => ({
  loginWithEmail: vi.fn().mockResolvedValue(null),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actions.loginWithEmail).mockResolvedValue(null)
  })

  it('renders email input', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('renders link to register page', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /crear cuenta/i })
    expect(link).toHaveAttribute('href', '/register')
  })

  it('renders link to forgot password', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /olvidaste/i })
    expect(link).toHaveAttribute('href', '/forgot-password')
  })

  it('shows error message when login fails', async () => {
    vi.mocked(actions.loginWithEmail).mockResolvedValue({ error: 'Credenciales inválidas' })
    const user = userEvent.setup()

    render(<LoginForm />)
    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
  })

  it('calls loginWithEmail with form data on submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@cdia.es')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'mypassword')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(vi.mocked(actions.loginWithEmail)).toHaveBeenCalledOnce()
    const [formData] = vi.mocked(actions.loginWithEmail).mock.calls[0]
    expect(formData.get('email')).toBe('user@cdia.es')
    expect(formData.get('password')).toBe('mypassword')
  })

  it('disables submit button while pending', async () => {
    vi.mocked(actions.loginWithEmail).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(null), 500))
    )
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'pass')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByRole('button', { name: /iniciando/i })).toBeDisabled()
  })
})
