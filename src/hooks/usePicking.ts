import { useState, useEffect, useRef } from 'react'
import { supplyApiFetch } from '@/services/api'

export type ClaimData = {
  id: number
  position: string
  su: string
  sku: string
  quantity: number
  status?: 'CLAIMED' | 'PICKING' | 'IN_BUFFER' | string
}

type RawClaimResponse = ClaimData | { success?: boolean; data?: ClaimData | ClaimData[] } | unknown

const normalizeClaim = (obj: unknown): ClaimData | undefined => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined

  const raw = obj as Record<string, unknown>

  // Skip explicit error wrapper objects without claim data
  if (raw.error && !raw.position && !raw.posicao && !raw.su && !raw.sku && !raw.material) return undefined

  // Flexible key resolution for id
  const idRaw =
    raw.id ??
    raw.claimId ??
    raw.materialId ??
    raw.claim_id ??
    raw.material_id ??
    raw.idClaim ??
    raw.idMaterial ??
    raw.id_claim ??
    raw.id_material
  const id = typeof idRaw === 'number' ? idRaw : parseInt(String(idRaw ?? 1), 10) || 1

  // Flexible key resolution for position / location
  const positionRaw =
    raw.position ??
    raw.location ??
    raw.localization ??
    raw.pos ??
    raw.bin ??
    raw.endereco ??
    raw.position_code ??
    raw.positionCode ??
    raw.positionName ??
    raw.locationCode ??
    raw.local ??
    raw.posicao ??
    raw.localizacao ??
    raw.posicao_picking ??
    raw.local_picking ??
    raw.origem ??
    raw.destino ??
    raw.address ??
    raw.binCode ??
    ''
  const position = String(positionRaw ?? '').trim()

  // Flexible key resolution for SU (Storage Unit)
  const suRaw =
    raw.su ??
    raw.suCode ??
    raw.storageUnit ??
    raw.storage_unit ??
    raw.suCollected ??
    raw.barcode ??
    raw.codigoSu ??
    raw.su_code ??
    raw.cod_su ??
    raw.codigo_su ??
    raw.suId ??
    raw.su_id ??
    raw.pallet ??
    raw.palete ??
    raw.codigo_palete ??
    ''
  const su = String(suRaw ?? '').trim()

  // Flexible key resolution for SKU / Material
  const skuRaw =
    raw.sku ??
    raw.skuCode ??
    raw.material ??
    raw.materialSku ??
    raw.materialCode ??
    raw.codigoSku ??
    raw.sku_code ??
    raw.material_id ??
    raw.cod_sku ??
    raw.codigo_sku ??
    raw.cod_material ??
    raw.codigo_material ??
    raw.product ??
    raw.produto ??
    raw.item ??
    ''
  const sku = String(skuRaw ?? '').trim()

  // Flexible key resolution for quantity
  const qtyRaw =
    raw.quantity ??
    raw.qty ??
    raw.quantidade ??
    raw.amount ??
    raw.qtd ??
    raw.quant ??
    raw.qtd_picking ??
    raw.quantityToPick ??
    raw.qtd_solicitada ??
    raw.solicitado
  const quantity = typeof qtyRaw === 'number' ? qtyRaw : parseFloat(String(qtyRaw ?? 0)) || 0

  // Status resolution
  const statusRaw = raw.status ?? raw.state ?? raw.situacao ?? raw.fase ?? raw.etapa
  const status = typeof statusRaw === 'string' ? statusRaw.toUpperCase() : undefined

  // Check if object has at least one identifying data field
  const hasDataFields = Boolean(
    idRaw !== undefined ||
    position !== '' ||
    su !== '' ||
    sku !== '' ||
    qtyRaw !== undefined
  )

  if (!hasDataFields) return undefined

  return {
    id,
    position: position || 'N/A',
    su: su || '---',
    sku: sku || '---',
    quantity: isNaN(quantity) ? 0 : quantity,
    status: status || 'CLAIMED',
  }
}

export const parseClaimResponse = (res: unknown): ClaimData | undefined => {
  if (!res) return undefined

  // 1. Direct object matching
  const direct = normalizeClaim(res)
  if (direct) return direct

  // 2. Direct array matching (e.g. [ { claim } ])
  if (Array.isArray(res) && res.length > 0) {
    const item = normalizeClaim(res[0])
    if (item) return item
  }

  // 3. Wrapped object matching ({ data: ... }, { content: ... }, { item: ... }, { claim: ... }, { result: ... }, { payload: ... })
  if (typeof res === 'object' && res !== null) {
    const raw = res as Record<string, unknown>
    const nested =
      raw.data ??
      raw.content ??
      raw.item ??
      raw.claim ??
      raw.result ??
      raw.payload ??
      raw.items ??
      raw.claims ??
      raw.body ??
      raw.response

    if (Array.isArray(nested) && nested.length > 0) {
      const item = normalizeClaim(nested[0])
      if (item) return item
    } else if (nested && typeof nested === 'object') {
      const item = normalizeClaim(nested)
      if (item) return item
    }
  }

  return undefined
}

export function usePicking() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [claim, setClaim] = useState<ClaimData | undefined>()
  const suInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const [scannedSu, setScannedSu] = useState('')
  const [scannedLocation, setScannedLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [flash, setFlash] = useState<string | undefined>()
  const [successFlash, setSuccessFlash] = useState<string | undefined>()

  const fetchClaim = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await supplyApiFetch<RawClaimResponse>('/supply/claim', {
        method: 'POST',
        auth: true,
        body: {},
      })
      console.log('[/supply/claim raw response]:', res)

      const claimObj = parseClaimResponse(res)
      setClaim(claimObj)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao buscar dados de picking'
      if (/404|nenhum|empty|not found|no item|sem item/i.test(msg)) {
        setClaim(undefined)
        setError(undefined)
      } else {
        setError(msg)
        setClaim(undefined)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaim()
  }, [])

  // Auto focus and clear location input when switching to PICKING status
  useEffect(() => {
    if (!loading && !submitting) {
      if (claim?.status === 'PICKING') {
        if (locationInputRef.current) {
          locationInputRef.current.value = ''
          locationInputRef.current.focus()
        }
      } else {
        if (suInputRef.current) {
          suInputRef.current.focus()
        }
      }
    }
  }, [loading, submitting, claim?.status])

  const handleSuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || loading || !claim) return

    const inputEl = suInputRef.current
    const value = inputEl?.value?.trim()
    if (!value) return

    setSubmitting(true)
    setScannedSu(value)
    setFlash(undefined)

    // Clear input immediately to prevent concatenation
    if (inputEl) inputEl.value = ''

    try {
      const res = await supplyApiFetch<RawClaimResponse>('/supply/picking', {
        method: 'POST',
        auth: true,
        body: {
          materialId: claim.id,
          suCollected: value,
        },
      })

      const updatedClaim = parseClaimResponse(res)

      if (updatedClaim) {
        setClaim(updatedClaim)
      } else {
        setClaim((prev) => (prev ? { ...prev, status: 'PICKING' } : undefined))
      }

      setSuccessFlash('SU Confirmado!')
      setTimeout(() => setSuccessFlash(undefined), 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao confirmar SU'
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

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || loading || !claim) return

    const inputEl = locationInputRef.current
    const value = inputEl?.value?.trim()
    if (!value) return

    setSubmitting(true)
    setScannedLocation(value)
    setFlash(undefined)

    if (inputEl) inputEl.value = ''

    try {
      const res = await supplyApiFetch<RawClaimResponse>('/supply/place-in-buffer', {
        method: 'POST',
        auth: true,
        body: {
          id: claim.id,
          localization: value,
        },
      })

      parseClaimResponse(res)
      setSuccessFlash('Local Confirmado!')
      setTimeout(() => setSuccessFlash(undefined), 1500)

      // Immediately fetch next claim without 1.2s lag
      await fetchClaim()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao confirmar local'
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

  return {
    loading,
    error,
    claim,
    suInputRef,
    locationInputRef,
    scannedSu,
    scannedLocation,
    submitting,
    flash,
    successFlash,
    fetchClaim,
    handleSuSubmit,
    handleLocationSubmit,
  }
}
