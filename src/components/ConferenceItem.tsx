import type { Item } from '@/hooks/useConference'

type ConferenceItemProps = {
  item: Item
  index: number
  nextIndex: number
}

export function ConferenceItem({ item: it, index, nextIndex }: ConferenceItemProps) {
  const isNext = !it.checked && index === nextIndex

  return (
    <li
      data-conf-index={index}
      className={`list__item conf__item ${it.checked ? 'conf__item--checked' : ''} ${
        isNext ? 'conf__item--next' : ''
      }`}
    >
      <div className="list__row">
        <span className="conf__code">{it.material_code}</span>
        {it.is_fines && <span className="conf__badge conf__badge--fines">FINE</span>}
        {it.checked && <span className="conf__badge conf__badge--checked">CHECKED</span>}
      </div>
    </li>
  )
}
