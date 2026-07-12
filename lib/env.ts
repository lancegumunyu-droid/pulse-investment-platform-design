export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
] as const

export const OPTIONAL_ENV_VARS = [
  'AI_GATEWAY_API_KEY',
  'VERCEL_WEB_ANALYTICS_ID',
] as const

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]
    if (!value || value.includes('your_')) {
      missing.push(varName)
    }
  }

  for (const varName of OPTIONAL_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      warnings.push(varName)
    }
  }

  return { missing, warnings, valid: missing.length === 0 }
}

export function getEnvStatus() {
  const { missing, warnings, valid } = validateEnv()
  const status = {
    valid,
    required: REQUIRED_ENV_VARS.length,
    optional: OPTIONAL_ENV_VARS.length,
    missing: missing.length,
    warnings: warnings.length,
    missingVars: missing,
    warningVars: warnings,
  }
  return status
}
