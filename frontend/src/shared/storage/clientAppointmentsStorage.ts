const PHONE_KEY = 'turnify.client.phone'
const BUSINESSES_KEY = 'turnify.client.businesses'

export type RememberedBusiness = {
  slug: string
  name: string
  timezone?: string
  updatedAt: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getClientPhone(): string {
  try {
    return localStorage.getItem(PHONE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setClientPhone(phone: string): void {
  try {
    localStorage.setItem(PHONE_KEY, phone.trim())
  } catch {
    /* ignore quota */
  }
}

export function listRememberedBusinesses(): RememberedBusiness[] {
  const list = readJson<RememberedBusiness[]>(BUSINESSES_KEY, [])
  if (!Array.isArray(list)) return []
  return list
    .filter((b) => b && typeof b.slug === 'string' && b.slug.trim())
    .map((b) => ({
      slug: b.slug.trim().toLowerCase(),
      name: typeof b.name === 'string' && b.name.trim() ? b.name.trim() : b.slug,
      timezone: typeof b.timezone === 'string' ? b.timezone : undefined,
      updatedAt: typeof b.updatedAt === 'string' ? b.updatedAt : new Date(0).toISOString(),
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function rememberBusiness(input: {
  slug: string
  name?: string
  timezone?: string
}): RememberedBusiness[] {
  const slug = input.slug.trim().toLowerCase()
  if (!slug) return listRememberedBusinesses()

  const next: RememberedBusiness = {
    slug,
    name: input.name?.trim() || slug,
    timezone: input.timezone,
    updatedAt: new Date().toISOString(),
  }

  const others = listRememberedBusinesses().filter((b) => b.slug !== slug)
  const merged = [next, ...others].slice(0, 40)
  try {
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify(merged))
  } catch {
    /* ignore quota */
  }
  return merged
}

/** Migrate per-slug phone keys from the old Mis Citas flow. */
export function migrateLegacyClientPhone(slug?: string): string {
  const current = getClientPhone()
  if (current) return current
  if (!slug) return ''
  try {
    const legacy = localStorage.getItem(`turnify.myAppointments.phone.${slug}`)
    if (legacy?.trim()) {
      setClientPhone(legacy.trim())
      return legacy.trim()
    }
    const bookingPhone = localStorage.getItem(`turnify.phone.${slug}`)
    if (bookingPhone?.trim()) {
      setClientPhone(bookingPhone.trim())
      return bookingPhone.trim()
    }
  } catch {
    /* ignore */
  }
  return ''
}
