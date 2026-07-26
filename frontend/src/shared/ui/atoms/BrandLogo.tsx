import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Fluid widths via clamp (min, preferred vw, max).
 * Wrapper constrains size so global `img { max-width:100%; height:auto }` stays safe.
 */
const frameClass: Record<BrandLogoSize, string> = {
  sm: 'w-[clamp(2.1rem,5vw,2.7rem)]',
  md: 'w-[clamp(4rem,8vw,5rem)]',
  lg: 'w-[clamp(3.9rem,15vw,6.6rem)]',
  xl: 'w-[clamp(5.75rem,20vw,9rem)]',
}

/** Turnify mark (`/logoT.webp`) — adaptive / responsive within a size role. */
export function BrandLogo({
  size = 'md',
  className = 'mx-auto',
}: {
  size?: BrandLogoSize
  className?: string
}) {
  const { isAuthenticated, session } = useAuth()
  const to =
    !isAuthenticated
      ? '/'
      : session?.scope === 'platform'
        ? '/platform'
        : '/app'

  return (
    <Link
      to={to}
      aria-label={isAuthenticated ? 'Ir al dashboard' : 'Ir al inicio'}
      className={`inline-flex aspect-square shrink-0 rounded-md transition duration-200 ease-out hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-reduce:hover:scale-100 ${frameClass[size]} ${className}`}
    >
      <img
        src="/logoT.webp"
        alt="Turnify"
        width={128}
        height={128}
        className="h-auto w-full max-w-full rounded-md object-contain"
        decoding="async"
      />
    </Link>
  )
}
