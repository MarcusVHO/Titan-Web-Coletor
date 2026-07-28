import type { Order } from '@/hooks/useOrders'

type OrderListItemProps = {
  order: Order
}

export function OrderListItem({ order: o }: OrderListItemProps) {
  const statusLower = o.status.toLowerCase()
  const disabled = statusLower === 'completed' || statusLower === 'canceled'

  const content = (
    <>
      <div className="list__row">
        <span className="list__order">#{o.order}</span>
        <span className={`list__status list__status--${statusLower}`}>
          {o.status}
        </span>
      </div>
      <div className="list__row">
        <span className="list__type">{o.type}</span>
        <span className="list__count">
          {o.qtd_materials_checked}/{o.qtd_materials}
        </span>
      </div>
      {o.qtd_fines > 0 && (
        <div className="list__row">
          <span className="list__fines list__fines--has">Fines: {o.qtd_fines}</span>
        </div>
      )}
    </>
  )

  return (
    <li className={`list__item ${disabled ? 'list__item--disabled' : ''}`}>
      {disabled ? (
        <div
          className="list__link"
          aria-disabled="true"
          title={statusLower === 'completed' ? 'Pedido concluído' : 'Pedido cancelado'}
        >
          {content}
        </div>
      ) : (
        <a className="list__link" href={`/conference?order=${o.order}`} aria-label={`Conferir pedido #${o.order}`}>
          {content}
        </a>
      )}
    </li>
  )
}
