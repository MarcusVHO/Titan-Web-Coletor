import { usePicking } from '@/hooks/usePicking'
import { logout } from '@/services/auth'
import { formatQuantity } from '@/utils/format'

export default function Picking() {
  const {
    loading,
    error,
    claim,
    suInputRef,
    locationInputRef,
    submitting,
    flash,
    successFlash,
    fetchClaim,
    handleSuSubmit,
    handleLocationSubmit,
  } = usePicking()

  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = '/abastecimento'
  }

  const isPickingStatus = claim?.status === 'PICKING'

  return (
    <div className="list__container picking__container">
      <div className="list__header">
        <button className="back__button" onClick={goBack} aria-label="Voltar">
          ← Voltar
        </button>
        <div className="list__title-group">
          <h1 className="list__title">Picking</h1>
        </div>
        <div className="list__actions">
          <button className="logout" onClick={logout} aria-label="Sair">Sair</button>
        </div>
      </div>

      {loading && <div className="list__state">Carregando dados de picking…</div>}

      {error && !loading && (
        <div className="list__alert list__alert--error">
          <p>{error}</p>
          <button className="login__button" style={{ marginTop: '0.8rem' }} onClick={fetchClaim}>
            Tentar Novamente
          </button>
        </div>
      )}

      {flash && (
        <div className="conf__overlay conf__overlay--error" role="alert" aria-live="assertive">
          <div className="conf__overlay-message">{flash}</div>
        </div>
      )}

      {successFlash && (
        <div className="conf__overlay conf__overlay--success" role="alert" aria-live="assertive">
          <div className="conf__overlay-message">
            <div className="conf__overlay-check-icon">✓</div>
            <span>{successFlash}</span>
          </div>
        </div>
      )}

      {!loading && !error && !claim && (
        <div className="list__state picking__empty-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem 1rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', margin: 0 }}>
            Nenhum item disponível
          </p>
          <button
            className="login__button"
            style={{ maxWidth: '200px', padding: '0.7rem 1rem', fontSize: '0.95rem' }}
            onClick={fetchClaim}
          >
            🔄 Atualizar
          </button>
        </div>
      )}

      {!loading && !error && claim && (
        <div className="picking__card">
          {/* Posicao (Destaque Principal) */}
          <div className={`picking__location-box ${isPickingStatus ? 'picking__location-box--picking' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="picking__label">POSIÇÃO DE PICKING</span>
              <span className={`picking__status-pill ${isPickingStatus ? 'picking__status-pill--picking' : 'picking__status-pill--claimed'}`}>
                {claim.status || 'CLAIMED'}
              </span>
            </div>
            <div className="picking__location-badge">{claim.position}</div>
          </div>

          {/* Dados do Material */}
          <div className="picking__grid">
            <div className="picking__info-tile">
              <span className="picking__label">SKU / MATERIAL</span>
              <span className="picking__value">{claim.sku}</span>
            </div>

            <div className="picking__info-tile">
              <span className="picking__label">QUANTIDADE</span>
              <span className="picking__value picking__value--qty">{formatQuantity(claim.quantity)}</span>
            </div>
          </div>

          {/* Codigo SU */}
          <div className="picking__info-tile picking__info-tile--full">
            <span className="picking__label">CÓDIGO SU (STORAGE UNIT)</span>
            <span className="picking__value picking__value--su">{claim.su}</span>
          </div>

          {/* Form de Leitura: Alterna entre SU e Local baseado no status */}
          {isPickingStatus ? (
            <form className="picking__scan-form" onSubmit={handleLocationSubmit}>
              <label htmlFor="location-scan-input" className="picking__scan-label" style={{ color: '#047857' }}>
                📍 LEITURA DO LOCAL / POSIÇÃO (ESCANEAR)
              </label>
              <div className="picking__input-row">
                <input
                  id="location-scan-input"
                  ref={locationInputRef}
                  type="text"
                  className="conf__scan-input"
                  placeholder="Escaneie ou confirme o local..."
                  disabled={submitting}
                  autoComplete="off"
                  inputMode="none"
                  enterKeyHint="done"
                  onBlur={(e) => {
                  if (submitting || loading) return
                  if (e.relatedTarget && (e.relatedTarget.tagName === 'BUTTON' || e.relatedTarget.tagName === 'A')) return
                  if (isPickingStatus) {
                    setTimeout(() => locationInputRef.current?.focus(), 10)
                  }
                }}
                />
                <button
                  type="submit"
                  className="login__button"
                  style={{ width: 'auto', padding: '0 1.2rem', background: 'linear-gradient(135deg, #059669, #10b981)' }}
                  disabled={submitting}
                >
                  Confirmar Local
                </button>
              </div>
            </form>
          ) : (
            <form className="picking__scan-form" onSubmit={handleSuSubmit}>
              <label htmlFor="su-scan-input" className="picking__scan-label">
                📦 LEITURA DO SU (ESCANEAR)
              </label>
              <div className="picking__input-row">
                <input
                  id="su-scan-input"
                  ref={suInputRef}
                  type="text"
                  className="conf__scan-input"
                  placeholder="Escaneie o código SU..."
                  disabled={submitting}
                  autoComplete="off"
                  inputMode="none"
                  enterKeyHint="done"
                  onBlur={(e) => {
                    if (submitting || loading) return
                    if (e.relatedTarget && (e.relatedTarget.tagName === 'BUTTON' || e.relatedTarget.tagName === 'A')) return
                    if (!isPickingStatus) {
                      setTimeout(() => suInputRef.current?.focus(), 10)
                    }
                  }}
                />
                <button
                  type="submit"
                  className="login__button"
                  style={{ width: 'auto', padding: '0 1.2rem' }}
                  disabled={submitting}
                >
                  Confirmar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
