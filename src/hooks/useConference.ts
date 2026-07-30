import { useState, useEffect, useRef, useMemo } from 'react'
import { apiFetch } from '@/services/api'

export type Item = {
  id: number
  material_code: string
  checked: boolean
  is_fines: boolean
}

export type ConferenceData = {
  id: number
  order: number
  status: string
  items: Item[]
}

type Response = {
  success: boolean
  message: string
  data: ConferenceData
}

export function useConference(orderParam: string | null) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [data, setData] = useState<ConferenceData | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [checking, setChecking] = useState(false)
  const [flash, setFlash] = useState<string | undefined>()
  const [successFlash, setSuccessFlash] = useState<string | undefined>()
  const flashTimer = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (!orderParam) throw new Error('Número da ordem não informado')
        const res = await apiFetch<Response>(
          `/tobacco_conference/get_data_for_conference?order=${encodeURIComponent(
            orderParam,
          )}`,
          { method: 'GET', auth: true },
        )
        if (active) setData(res.data)
      } catch (e) {
        if (active) {
          const msg = e instanceof Error ? e.message : 'Falha ao obter dados da conferência'
          setError(msg)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [orderParam])

  const counts = useMemo(() => {
    const total = data?.items?.length ?? 0
    const checked = data?.items?.filter((i) => i.checked).length ?? 0
    const fines = data?.items?.filter((i) => i.is_fines).length ?? 0
    return { total, checked, pending: total - checked, fines }
  }, [data])

  const nextIndex = useMemo(() => {
    const idx = data?.items?.findIndex((i) => !i.checked)
    return typeof idx === 'number' ? idx : -1
  }, [data])

  useEffect(() => {
    if (nextIndex >= 0) {
      const el = document.querySelector<HTMLElement>(`[data-conf-index="${nextIndex}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [nextIndex])

  useEffect(() => {
    if (data?.status) {
      const s = data.status.toLowerCase()
      if (s === 'completed' || s === 'canceled') {
        setFlash(s === 'completed' ? 'Pedido já concluído' : 'Pedido cancelado')
        const t = window.setTimeout(() => {
          window.location.href = '/pmd'
        }, 1500)
        return () => window.clearTimeout(t)
      }
    }
  }, [data?.status])

  useEffect(() => {
    if (!checking) {
      inputRef.current?.focus()
    }
  }, [checking])

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    }
  }, [])

  const showFlashMessage = (msg: string) => {
    if (flashTimer.current) {
      window.clearTimeout(flashTimer.current)
      flashTimer.current = null
    }
    setFlash(msg)
    flashTimer.current = window.setTimeout(() => {
      setFlash(undefined)
      flashTimer.current = null
    }, 3000)
  }

  const formatCheckTextForBackend = (rawValue: string): string => {
    if (!data?.items) return rawValue
    const matchedItem = data.items.find(
      (item) => item.material_code && rawValue.includes(item.material_code),
    )
    if (matchedItem) {
      const code = matchedItem.material_code
      const remainder = rawValue.replace(code, '')
      if (remainder && !remainder.startsWith('10')) {
        return `${code}10${remainder}`
      }
    }
    return rawValue
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checking || loading) return

    const inputEl = inputRef.current
    const rawValue = inputEl?.value?.trim()
    if (!rawValue || !orderParam) return

    setChecking(true)
    setError(undefined)

    if (inputEl) inputEl.value = ''
    
    const formattedCheckText = formatCheckTextForBackend(rawValue)

    try {
      const res = await apiFetch<Response>(
        `/tobacco_conference/check_item?order=${encodeURIComponent(
          orderParam,
        )}&check_text=${encodeURIComponent(formattedCheckText)}`,
        { method: 'POST', auth: true },
      )
      
      if (res?.data) {
        setData(res.data)
        setSuccessFlash('Item Conferido!')
        setTimeout(() => {
          setSuccessFlash(undefined)
        }, 1000)
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Falha ao conferir item'
      let msg = 'Falha ao conferir item'
      if (/incorrect/i.test(raw)) msg = 'Item incorreto!'
      else if (/checked/i.test(raw)) msg = 'Item já conferido!'
      else if (raw) msg = raw
      showFlashMessage(msg)
      if (inputEl) {
        inputEl.value = rawValue
        inputEl.focus()
        inputEl.select?.()
      }
    } finally {
      setChecking(false)
      inputRef.current?.focus()
    }
  }

  return {
    loading,
    error,
    data,
    counts,
    nextIndex,
    inputRef,
    checking,
    flash,
    successFlash,
    handleItemSubmit
  }
}
