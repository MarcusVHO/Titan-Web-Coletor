import { useSearchParams } from 'react-router-dom'
import { useConference } from '@/hooks/useConference'
import { ConferenceItem } from '@/components/ConferenceItem'
import { logout } from '@/services/auth'

export default function Conference() {
  const [params] = useSearchParams()
  const orderParam = params.get('order')
  
  const {
    loading,
    error,
    data,
    counts,
    nextIndex,
    inputRef,
    flash,
    successFlash,
    handleItemSubmit
  } = useConference(orderParam)

  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = '/pmd'
  }

  return (
    <div className="conf__container">
      <div className="conf__top">
        <div className="conf__header">
          <button className="back" onClick={goBack} aria-label="Voltar">←</button>
          <h1 className="conf__title">
            Conferência {data?.order ? `#${data.order}` : ''}
          </h1>
          {data?.status && (
            <span className={`conf__status conf__status--${data.status.toLowerCase()}`}>
              {data.status}
            </span>
          )}
          <button className="logout" onClick={logout} aria-label="Sair">Sair</button>
        </div>

        <div className="conf__summary">
          <span>Total: {counts.total}</span>
          <span>Conferidos: {counts.checked}</span>
          <span>Pendentes: {counts.pending}</span>
          <span className="conf__fines">Fines: {counts.fines}</span>
        </div>

        <form className="conf__scan" onSubmit={handleItemSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="conf__scan-input"
            placeholder="Bipe o código do material"
            aria-label="Entrada do coletor"
            autoComplete="off"
            inputMode="none"
            enterKeyHint="done"
            onBlur={() => {
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
          />
        </form>
      </div>

      {loading && <div className="list__state">Carregando…</div>}
      {error && !loading && <div className="list__alert">{error}</div>}
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

      {!loading && (
        <ul className="list">
          {data?.items?.map((it, idx) => (
            <ConferenceItem 
              key={it.id} 
              item={it} 
              index={idx} 
              nextIndex={nextIndex} 
            />
          ))}
          {(!data?.items || data.items.length === 0) && (
            <li className="list__state">Nenhum item</li>
          )}
        </ul>
      )}
    </div>
  )
}
