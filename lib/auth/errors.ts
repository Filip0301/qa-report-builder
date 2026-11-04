/** Traduce los errores más comunes de Supabase Auth a mensajes claros en español. */
export function translateAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? '');
  const code = (err as { code?: string } | null)?.code ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return 'Correo o contraseña incorrectos.';
  }
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja de entrada.';
  }
  if (code === 'user_already_exists' || /already registered/i.test(message)) {
    return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  }
  if (code === 'weak_password' || /password should be/i.test(message)) {
    return 'La contraseña es muy débil. Usa al menos 8 caracteres.';
  }
  if (code === 'over_email_send_rate_limit' || /rate limit/i.test(message)) {
    return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  }
  if (code === 'signup_disabled' || /signups not allowed/i.test(message)) {
    return 'El registro de nuevas cuentas está deshabilitado. Pide acceso al administrador.';
  }
  if (/fetch|network/i.test(message)) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión.';
  }
  return 'No se pudo completar la operación. Intenta de nuevo.';
}
