import { test, expect } from '@playwright/test'

// Credenciales de prueba — configurar en .env.test
const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@cdia.es'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'testpassword123'

test.describe('F1 — Autenticación', () => {
  test.describe('Redirección de rutas protegidas', () => {
    test('redirige /dashboard a /login si no hay sesión', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/login/)
    })

    test('redirige /subject/any a /login si no hay sesión', async ({ page }) => {
      await page.goto('/subject/calculo')
      await expect(page).toHaveURL(/\/login/)
    })

    test('redirige /session/any a /login si no hay sesión', async ({ page }) => {
      await page.goto('/session/abc123')
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Página de login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('muestra el formulario de login', async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/contraseña/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible()
    })

    test('muestra botón de Google OAuth', async ({ page }) => {
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    })

    test('tiene link a registro', async ({ page }) => {
      await expect(page.getByRole('link', { name: /crear cuenta/i })).toBeVisible()
    })

    test('tiene link a recuperar contraseña', async ({ page }) => {
      await expect(page.getByRole('link', { name: /olvidaste/i })).toBeVisible()
    })

    test('muestra error con credenciales incorrectas', async ({ page }) => {
      await page.getByLabel(/email/i).fill('wrong@test.com')
      await page.getByLabel(/contraseña/i).fill('badpassword')
      await page.getByRole('button', { name: /iniciar sesión/i }).click()
      await expect(page.getByRole('alert')).toBeVisible()
    })
  })

  test.describe('Página de registro', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
    })

    test('muestra el formulario de registro', async ({ page }) => {
      await expect(page.getByLabel(/nombre/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/^contraseña/i)).toBeVisible()
      await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible()
    })

    test('valida que las contraseñas coincidan', async ({ page }) => {
      await page.getByLabel(/nombre/i).fill('Test User')
      await page.getByLabel(/email/i).fill('new@cdia.es')
      await page.getByLabel(/^contraseña/i).fill('password123')
      await page.getByLabel(/confirmar contraseña/i).fill('different456')
      await page.getByRole('button', { name: /crear cuenta/i }).click()
      await expect(page.getByRole('alert')).toContainText(/no coinciden/i)
    })

    test('tiene link a login', async ({ page }) => {
      await expect(page.getByRole('link', { name: /iniciar sesión/i })).toBeVisible()
    })
  })

  test.describe('Página de recuperar contraseña', () => {
    test('muestra formulario con campo email', async ({ page }) => {
      await page.goto('/forgot-password')
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible()
    })
  })

  test.describe('Flujo completo de login', () => {
    test('login exitoso redirige al dashboard', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(TEST_EMAIL)
      await page.getByLabel(/contraseña/i).fill(TEST_PASSWORD)
      await page.getByRole('button', { name: /iniciar sesión/i }).click()
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
    })

    test('usuario autenticado en /login redirige a /dashboard', async ({ page, context }) => {
      // Simulate authenticated state (requires actual login first)
      // This test only runs with TEST_EMAIL/TEST_PASSWORD set
      test.skip(!process.env.TEST_EMAIL, 'Requiere credenciales de prueba')
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(TEST_EMAIL)
      await page.getByLabel(/contraseña/i).fill(TEST_PASSWORD)
      await page.getByRole('button', { name: /iniciar sesión/i }).click()
      await expect(page).toHaveURL(/\/dashboard/)

      // Now try to access /login again → should redirect to /dashboard
      await page.goto('/login')
      await expect(page).toHaveURL(/\/dashboard/)
    })
  })
})
