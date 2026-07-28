import { useReabastecimento } from '@/hooks/useReabastecimento'
import { logout } from '@/services/auth'
import { formatQuantity } from '@/utils/format'

export default function Reabastecimento() {
  const {
    loading,
    error,
    refuelingData,
    suInputRef,
    moduleInputRef,
    submitting,
    flash,
    successFlash,
    handleSuSubmit,
    handleModuleSubmit,
    resetRefueling,
  } = useReabastecimento()

  const goBack = () => {
    if (refuelingData) {
      resetRefueling()
    } else if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/abastecimento'
    }
  }

  return (
    <div className="list__container picking__container">
      <div className="list__header">
        <button className="back__button" onClick={goBack} aria-label="Voltar">
          ← Voltar
        </button>
        <div className="list__title-group">
          <h1 className="list__title">Reabastecimento</h1>
        </div>
        <div className="list__actions">
          <button className="logout" onClick={logout} aria-label="Sair">Sair</button>
        </div>
      </div>

      {loading && <div className="list__state">Carregando dados de reabastecimento…</div>}

      {error && !loading && (
        <div className="list__alert list__alert--error">
          <p>{error}</p>
          <button className="login__button" style={{ marginTop: '0.8rem' }} onClick={resetRefueling}>
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

      {/* Passo 1: Informar/Bipar o SU do Palete */}
      {!loading && !refuelingData && (
        <div className="picking__card">
          <div className="picking__location-box">
            <span className="picking__label">BIPAR SU DO PALETE</span>
            <div className="picking__location-badge" style={{ fontSize: '1.4rem' }}>
              REABASTECIMENTO
            </div>
          </div>

          <form className="picking__scan-form" onSubmit={handleSuSubmit} style={{ marginTop: 0, borderTop: 'none' }}>
            <label htmlFor="refueling-su-input" className="picking__scan-label">
              📦 LEITURA DO SU DO PALETE (ESCANEAR)
            </label>
            <div className="picking__input-row">
              <input
                id="refueling-su-input"
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
                  if (!refuelingData) {
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
                Carregar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Passo 2: Confirmar o Módulo Abastecido */}
      {!loading && refuelingData && (
        <div className="picking__card">
          {/* Módulo em Evidência Principal */}
          <div className="picking__location-box picking__location-box--picking">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="picking__label" style={{ color: '#065f46' }}>MÓDULO DE ABASTECIMENTO</span>
              <span className="picking__status-pill picking__status-pill--picking">
                MÓDULO
              </span>
            </div>
            <div className="picking__location-badge" style={{ fontSize: '2.6rem', color: '#047857' }}>
              {refuelingData.module}
            </div>
          </div>

          {/* Dados do Material */}
          <div className="picking__grid">
            <div className="picking__info-tile">
              <span className="picking__label">SKU / MATERIAL</span>
              <span className="picking__value">{refuelingData.sku}</span>
            </div>

            <div className="picking__info-tile">
              <span className="picking__label">QUANTIDADE</span>
              <span className="picking__value picking__value--qty">{formatQuantity(refuelingData.quantity)}</span>
            </div>
          </div>

          {/* Codigo SU */}
          <div className="picking__info-tile picking__info-tile--full">
            <span className="picking__label">SU DO PALETE</span>
            <span className="picking__value picking__value--su">{refuelingData.su}</span>
          </div>

          {/* Form de Leitura do Módulo */}
          <form className="picking__scan-form" onSubmit={handleModuleSubmit}>
            <label htmlFor="module-scan-input" className="picking__scan-label" style={{ color: '#047857' }}>
              🏢 LEITURA DO MÓDULO (ESCANEAR)
            </label>
            <div className="picking__input-row">
              <input
                id="module-scan-input"
                ref={moduleInputRef}
                type="text"
                className="conf__scan-input"
                placeholder="Escaneie ou confirme o módulo..."
                disabled={submitting}
                autoComplete="off"
                inputMode="none"
                enterKeyHint="done"
                onBlur={(e) => {
                  if (submitting || loading) return
                  if (e.relatedTarget && (e.relatedTarget.tagName === 'BUTTON' || e.relatedTarget.tagName === 'A')) return
                  if (refuelingData) {
                    setTimeout(() => moduleInputRef.current?.focus(), 10)
                  }
                }}
              />
              <button
                type="submit"
                className="login__button"
                style={{ width: 'auto', padding: '0 1.2rem', background: 'linear-gradient(135deg, #059669, #10b981)' }}
                disabled={submitting}
              >
                Confirmar Módulo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
