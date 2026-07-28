import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch } from '@/services/api'

export type Order = {
  order: number
  status: string
  type: string
  qtd_materials_checked: number
  qtd_materials: number
  qtd_fines: number
}

type OrdersResponse = {
  success: boolean
  message: string
  data: Order[]
}

export type FilterType = 'all' | 'pending' | 'completed' | 'canceled'

export function useOrders() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<FilterType>('pending')
  const scanRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const [flash, setFlash] = useState<string | undefined>()
  const flashTimer = useRef<number | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await apiFetch<OrdersResponse>('/tobacco/get_orders', {
        method: 'GET',
        auth: true,
      })
      setOrders(res?.data ?? [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao obter pedidos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!scanning) scanRef.current?.focus()
  }, [scanning])

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

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = scanRef.current?.value?.trim()
    if (!val) return
    setScanning(true)

    try {
      const res = await apiFetch<unknown>(
        `/tobacco_conference/get_data_for_conference?order=${encodeURIComponent(val)}`,
        { method: 'GET', auth: true },
      )
      type MaybeRes = { success?: unknown; message?: unknown; data?: unknown }
      const anyRes = res as MaybeRes | undefined
      const isErr =
        anyRes &&
        typeof anyRes === 'object' &&
        'success' in anyRes &&
        anyRes.success === false
      
      if (isErr) {
        const rawMsg = typeof anyRes?.message === 'string' ? (anyRes.message as string) : ''
        const msg = /incorrect/i.test(rawMsg) ? 'Ordem incorreta!' : 'Ordem não encontrada'
        showFlashMessage(msg)
      } else {
        window.location.href = `/conference?order=${encodeURIComponent(val)}`
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Falha ao buscar ordem'
      const msg = /incorrect/i.test(raw) ? 'Ordem incorreta!' : 'Ordem não encontrada'
      showFlashMessage(msg)
    } finally {
      setScanning(false)
      if (scanRef.current) {
        scanRef.current.focus()
      }
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true
    return o.status.toLowerCase() === filter
  })

  return {
    loading,
    error,
    orders: filteredOrders,
    filter,
    setFilter,
    scanRef,
    scanning,
    flash,
    fetchOrders,
    handleScanSubmit
  }
}
