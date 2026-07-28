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

type RawClaimResponse = ClaimData | { success?: boolean; data?: ClaimData }

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

  const parseClaimResponse = (res: unknown): ClaimData | undefined => {
    if (res && typeof res === 'object') {
      if ('position' in res && typeof (res as ClaimData).position === 'string') {
        return res as ClaimData
      }
      if ('data' in res && res.data && typeof res.data === 'object' && res.data !== null) {
        const d = res.data as ClaimData
        if ('position' in d || 'id' in d) return d
      }
    }
    return undefined
  }

  const fetchClaim = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await supplyApiFetch<RawClaimResponse>('/supply/claim', {
        method: 'POST',
        auth: true,
      })

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
    const value = suInputRef.current?.value?.trim()
    if (!value || !claim) return
    setSubmitting(true)
    setScannedSu(value)
    setFlash(undefined)

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

      setTimeout(() => {
        setSuccessFlash(undefined)
        if (suInputRef.current) suInputRef.current.value = ''
        if (locationInputRef.current) {
          locationInputRef.current.value = ''
          locationInputRef.current.focus()
        }
      }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao confirmar SU'
      setFlash(msg)
      setTimeout(() => {
        setFlash(undefined)
      }, 2800)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = locationInputRef.current?.value?.trim()
    if (!value || !claim) return
    setSubmitting(true)
    setScannedLocation(value)
    setFlash(undefined)

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

      setTimeout(async () => {
        setSuccessFlash(undefined)
        if (locationInputRef.current) locationInputRef.current.value = ''
        if (suInputRef.current) suInputRef.current.value = ''

        // Return to claim new item for next cycle
        await fetchClaim()
      }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao confirmar local'
      setFlash(msg)
      setTimeout(() => {
        setFlash(undefined)
      }, 2800)
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
