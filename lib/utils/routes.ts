export const PROTECTED_PREFIXES = ['/dashboard', '/subject', '/session']
export const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p))
}
