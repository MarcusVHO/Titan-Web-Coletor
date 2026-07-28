import { useState, useEffect, useRef } from 'react'
import { supplyApiFetch } from '@/services/api'

export type RefuelingData = {
  id: number
  su: string
  sku: string
  module: string
  quantity: number
}

type RawRefuelingResponse = RefuelingData | { success?: boolean; data?: RefuelingData }

export function useReabastecimento() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [refuelingData, setRefuelingData] = useState<RefuelingData | undefined>()
  const suInputRef = useRef<HTMLInputElement>(null)
  const moduleInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flash, setFlash] = useState<string | undefined>()
  const [successFlash, setSuccessFlash] = useState<string | undefined>()

  const parseRefuelingResponse = (res: unknown): RefuelingData | undefined => {
    if (res && typeof res === 'object') {
      if ('module' in res && typeof (res as RefuelingData).module === 'string') {
        return res as RefuelingData
      }
      if ('data' in res && res.data && typeof res.data === 'object' && res.data !== null) {
        const d = res.data as RefuelingData
        if ('module' in d || 'id' in d) return d
      }
    }
    return undefined
  }

  // Auto focus input based on active step
  useEffect(() => {
    if (!submitting && !loading) {
      if (refuelingData) {
        setTimeout(() => {
          if (moduleInputRef.current) {
            moduleInputRef.current.value = ''
            moduleInputRef.current.focus()
          }
        }, 50)
      } else {
        setTimeout(() => {
          if (suInputRef.current) {
            suInputRef.current.focus()
          }
        }, 50)
      }
    }
  }, [refuelingData, submitting, loading])

  // Step 1: Submit SU to POST /supply/pick-refueling/{su}
  const handleSuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || loading) return

    const inputEl = suInputRef.current
    const value = inputEl?.value?.trim()
    if (!value) return

    setSubmitting(true)
    setLoading(true)
    setError(undefined)
    setFlash(undefined)

    // Clear input immediately to prevent scanner string concatenation
    if (inputEl) inputEl.value = ''

    try {
      const res = await supplyApiFetch<RawRefuelingResponse>(
        `/supply/pick-refueling/${encodeURIComponent(value)}`,
        {
          method: 'POST',
          auth: true,
        },
      )

      const parsed = parseRefuelingResponse(res)
      if (parsed) {
        setRefuelingData(parsed)
      } else {
        setRefuelingData({
          id: 1,
          su: value,
          sku: '---',
          module: '---',
          quantity: 0,
        })
      }

      setSuccessFlash('Palete Carregado!')
      setTimeout(() => setSuccessFlash(undefined), 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar palete para reabastecimento'
      setFlash(msg)
      setTimeout(() => setFlash(undefined), 3000)
      if (inputEl) {
        inputEl.value = value
        inputEl.focus()
        inputEl.select?.()
      }
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }

  // Step 2: Confirm Module
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || loading || !refuelingData) return

    const inputEl = moduleInputRef.current
    const value = inputEl?.value?.trim()
    if (!value) return

    setSubmitting(true)
    setFlash(undefined)

    if (inputEl) inputEl.value = ''

    try {
      await supplyApiFetch<unknown>('/supply/supply-material', {
        method: 'POST',
        auth: true,
        body: {
          id: refuelingData.id,
          module: value,
        },
      })

      setSuccessFlash('Módulo Abastecido!')
      setRefuelingData(undefined) // Reset state immediately for next cycle
      setTimeout(() => setSuccessFlash(undefined), 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao confirmar módulo de abastecimento'
      setFlash(msg)
      setTimeout(() => setFlash(undefined), 3000)
      if (inputEl) {
        inputEl.value = value
        inputEl.focus()
        inputEl.select?.()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const resetRefueling = () => {
    setRefuelingData(undefined)
    setError(undefined)
    setFlash(undefined)
  }

  return {
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
  }
}
