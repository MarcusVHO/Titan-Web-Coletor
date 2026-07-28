import { useOrders } from '@/hooks/useOrders'
import { OrderListItem } from '@/components/OrderListItem'
import { logout } from '@/services/auth'

export default function PmdOrders() {
  const {
    loading,
    error,
    orders,
    filter,
    setFilter,
    scanRef,
    scanning,
    flash,
    fetchOrders,
    handleScanSubmit
  } = useOrders()

  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = '/dashboard'
  }

  return (
    <div className="list__container">
      <div className="list__header">
        <button className="back" onClick={goBack} aria-label="Voltar">←</button>
        <h1 className="list__title">Pedidos</h1>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="refresh" onClick={fetchOrders} aria-label="Atualizar" disabled={loading}>
            {loading ? 'Atualizando…' : 'Atualizar'}
          </button>
          <button className="logout" onClick={logout} aria-label="Sair">Sair</button>
        </div>
      </div>
      <form className="list__scan" onSubmit={handleScanSubmit}>
        <input
          ref={scanRef}
          type="text"
          className="conf__scan-input"
          placeholder="Bipe o número da OP"
          aria-label="Leitura de OP"
          inputMode="none"
          enterKeyHint="go"
          readOnly={scanning}
          onBlur={() => {
            setTimeout(() => scanRef.current?.focus(), 0)
          }}
        />
      </form>
      <div className="list__filters" role="tablist" aria-label="Filtrar por status">
        <button
          className={`chip ${filter === 'all' ? 'chip--active' : ''}`}
          onClick={() => setFilter('all')}
          role="tab"
          aria-selected={filter === 'all'}
        >
          Todos
        </button>
        <button
          className={`chip chip--pending ${filter === 'pending' ? 'chip--active' : ''}`}
          onClick={() => setFilter('pending')}
          role="tab"
          aria-selected={filter === 'pending'}
        >
          PENDING
        </button>
        <button
          className={`chip chip--completed ${filter === 'completed' ? 'chip--active' : ''}`}
          onClick={() => setFilter('completed')}
          role="tab"
          aria-selected={filter === 'completed'}
        >
          COMPLETED
        </button>
        <button
          className={`chip chip--canceled ${filter === 'canceled' ? 'chip--active' : ''}`}
          onClick={() => setFilter('canceled')}
          role="tab"
          aria-selected={filter === 'canceled'}
        >
          CANCELED
        </button>
      </div>
      {loading && <div className="list__state">Carregando…</div>}
      {error && !loading && <div className="list__alert">{error}</div>}
      {flash && (
        <div className="conf__overlay conf__overlay--error" role="alert" aria-live="assertive">
          <div className="conf__overlay-message">{flash}</div>
        </div>
      )}
      {!loading && !error && (
        <ul className="list">
          {orders.map((o) => (
            <OrderListItem key={o.order} order={o} />
          ))}
          {orders.length === 0 && (
            <li className="list__state">Nenhum pedido</li>
          )}
        </ul>
      )}
    </div>
  )
}
