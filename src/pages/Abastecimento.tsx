import { logout } from '@/services/auth'

export default function Abastecimento() {
  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = '/dashboard'
  }

  return (
    <div className="list__container">
      <div className="list__header">
        <button className="back__button" onClick={goBack} aria-label="Voltar">
          ← Voltar
        </button>
        <div className="list__title-group">
          <h1 className="list__title">Abastecimento</h1>
        </div>
        <div className="list__actions">
          <button className="logout" onClick={logout} aria-label="Sair">Sair</button>
        </div>
      </div>
      <ul className="list">
        <li className="list__item">
          <a className="list__link" href="/abastecimento/reabastecimento" aria-label="Reabastecimento">
            <div className="list__row">
              <span className="list__order" style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 20 L32 10 L50 20 L32 30 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M14 20 V40 L32 50 V30 Z" fill="currentColor" fillOpacity="0.1" />
                  <path d="M50 20 V40 L32 50 V30 Z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M32 30 V50" />
                  <path d="M32 5 V20" strokeWidth="4" />
                  <path d="M25 12 L32 5 L39 12" strokeWidth="4" />
                </svg>
                <span>Reabastecimento</span>
              </span>
              <span className="list__status list__status--pending">Acessar</span>
            </div>
          </a>
        </li>
        <li className="list__item">
          <a className="list__link" href="/abastecimento/picking" aria-label="Picking">
            <div className="list__row">
              <span className="list__order" style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 42 H38 V32 C38 28 35 25 31 25 H20 L14 34 H10 Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M20 25 L24 14 H34 V25" />
                  <path d="M42 10 V42" strokeWidth="4" />
                  <path d="M42 42 H58 V46 H42" fill="currentColor" />
                  <rect x="46" y="24" width="12" height="14" rx="2" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
                  <circle cx="18" cy="44" r="5" fill="currentColor" />
                  <circle cx="36" cy="44" r="5" fill="currentColor" />
                </svg>
                <span>Picking</span>
              </span>
              <span className="list__status list__status--pending">Acessar</span>
            </div>
          </a>
        </li>
      </ul>
    </div>
  )
}
