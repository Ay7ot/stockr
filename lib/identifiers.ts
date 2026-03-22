import type { IdentifierKind } from '@/types/database'

/** Strip spaces/dashes; IMEI is digits-only (15 typical). */
export function normalizeIdentifier(raw: string, kind: IdentifierKind): string {
  const t = raw.trim()
  if (kind === 'imei') {
    return t.replace(/\D/g, '')
  }
  return t.replace(/\s+/g, ' ')
}

export function isValidImei(normalized: string): boolean {
  return /^\d{14,16}$/.test(normalized)
}
