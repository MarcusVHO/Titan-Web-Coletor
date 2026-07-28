import { logout } from '@/services/auth'

export default function Dashboard() {
  return (
    <div className="dash__container">
      <div className="dash__topbar">
        <button className="logout" onClick={logout} aria-label="Sair">Sair</button>
      </div>
      <div className="dash__menu">
        <a className="pmd__button" href="/pmd" aria-label="PMD">
          <svg className="pmd__icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {/* Cabin & Chassis */}
            <path d="M10 42 H38 V32 C38 28 35 25 31 25 H20 L14 34 H10 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M20 25 L24 14 H34 V25" />
            <path d="M28 14 V25" />
            {/* Mast & Forks */}
            <path d="M42 10 V42" strokeWidth="3" />
            <path d="M46 10 V42" strokeWidth="3" />
            <path d="M42 42 H58 V46 H42" fill="currentColor" />
            {/* Box on Forks */}
            <rect x="46" y="24" width="12" height="14" rx="2" fill="currentColor" fillOpacity="0.25" strokeWidth="2" />
            {/* Wheels */}
            <circle cx="18" cy="44" r="5" fill="currentColor" />
            <circle cx="36" cy="44" r="5" fill="currentColor" />
          </svg>
          <span>PMD</span>
        </a>

        <a className="pmd__button" href="/abastecimento" aria-label="Abastecimento">
          <svg className="pmd__icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {/* Pallet / Cargo Box */}
            <path d="M14 20 L32 10 L50 20 L32 30 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M14 20 V40 L32 50 V30 Z" fill="currentColor" fillOpacity="0.1" />
            <path d="M50 20 V40 L32 50 V30 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M32 30 V50" />
            {/* Refill / Arrow Indicator */}
            <path d="M32 5 V20" strokeWidth="3" />
            <path d="M25 12 L32 5 L39 12" strokeWidth="3" />
          </svg>
          <span>Abastecimento</span>
        </a>
      </div>
    </div>
  )
}
