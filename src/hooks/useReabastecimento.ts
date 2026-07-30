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

const normalizeRefueling = (obj: unknown): RefuelingData | undefined => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const raw = obj as Record<string, unknown>

  const idRaw = raw.id ?? raw.refuelingId ?? raw.materialId ?? raw.id_refueling ?? raw.id_material
  const id = typeof idRaw === 'number' ? idRaw : parseInt(String(idRaw ?? 1), 10) || 1

  const suRaw =
    raw.su ??
    raw.suCode ??
    raw.storageUnit ??
    raw.storage_unit ??
    raw.barcode ??
    raw.codigoSu ??
    raw.su_code ??
    raw.cod_su ??
    raw.codigo_su ??
    raw.pallet ??
    raw.palete ??
    ''
  const su = String(suRaw ?? '').trim()

  const skuRaw =
    raw.sku ??
    raw.skuCode ??
    raw.material ??
    raw.materialSku ??
    raw.materialCode ??
    raw.codigoSku ??
    raw.sku_code ??
    raw.cod_sku ??
    raw.codigo_sku ??
    raw.cod_material ??
    raw.codigo_material ??
    raw.produto ??
    ''
  const sku = String(skuRaw ?? '').trim()

  const moduleRaw =
    raw.module ??
    raw.modulo ??
    raw.location ??
    raw.moduleCode ??
    raw.codigoModulo ??
    raw.posicao ??
    raw.localizacao ??
    ''
  const moduleName = String(moduleRaw ?? '').trim()

  const qtyRaw = raw.quantity ?? raw.qty ?? raw.quantidade ?? raw.amount ?? raw.qtd ?? 0
  const quantity = typeof qtyRaw === 'number' ? qtyRaw : parseFloat(String(qtyRaw)) || 0

  const hasDataFields = Boolean(
    idRaw !== undefined || moduleName !== '' || su !== '' || sku !== '' || qtyRaw !== undefined
  )

  if (!hasDataFields) return undefined

  return {
    id,
    su: su || '---',
    sku: sku || '---',
    module: moduleName || '---',
    quantity: isNaN(quantity) ? 0 : quantity,
  }
}

export const parseRefuelingResponse = (res: unknown): RefuelingData | undefined => {
  if (!res) return undefined

  const direct = normalizeRefueling(res)
  if (direct) return direct

  if (Array.isArray(res) && res.length > 0) {
    const item = normalizeRefueling(res[0])
    if (item) return item
  }

  if (typeof res === 'object' && res !== null) {
    const raw = res as Record<string, unknown>
    const nested = raw.data ?? raw.content ?? raw.item ?? raw.refueling ?? raw.result ?? raw.payload ?? raw.items

    if (Array.isArray(nested) && nested.length > 0) {
      const item = normalizeRefueling(nested[0])
      if (item) return item
    } else if (nested && typeof nested === 'object') {
      const item = normalizeRefueling(nested)
      if (item) return item
    }
  }

  return undefined
}

export function useReabastecimento() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [refuelingData, setRefuelingData] = useState<RefuelingData | undefined>()
  const suInputRef = useRef<HTMLInputElement>(null)
  const moduleInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flash, setFlash] = useState<string | undefined>()
  const [successFlash, setSuccessFlash] = useState<string | undefined>()

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
        setSuccessFlash('Palete Carregado!')
        setTimeout(() => setSuccessFlash(undefined), 1500)
      } else {
        setRefuelingData(undefined)
        setFlash('Nenhum dado válido retornado para este SU/Palete')
        setTimeout(() => setFlash(undefined), 3000)
      }
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
