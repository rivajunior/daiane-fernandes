import { content } from '~/content/site'

interface LogoProps {
  variant?: 'dark' | 'light'
}

// The pieces of the artwork the sticky header moves around (see styles/header.css).
const PARTS = ['monogram', 'daiane', 'fernandes', 'subtitle'] as const

export function Logo({ variant = 'dark' }: LogoProps): React.ReactElement {
  const label = `${content.name}, ${content.role}`

  if (variant === 'light') {
    return <img className="logo" src="/logo-light-v2.svg" width="259" height="68" alt={label} />
  }

  return (
    <svg
      className="logo"
      viewBox="42.6 75.3 721.4 190.1"
      width="258"
      height="68"
      role="img"
      aria-label={label}
    >
      <g className="logo__lockup">
        {PARTS.map((part) => (
          <use key={part} className={`logo__${part}`} href={`/logo-parts-v2.svg#${part}`} />
        ))}
      </g>
    </svg>
  )
}
