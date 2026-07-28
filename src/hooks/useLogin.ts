import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginService } from '@/services/auth'

export type LoginState = {
  oneid: string
  password: string
  error?: string
  loading: boolean
  success?: string
}

export function useLogin() {
  const [state, setState] = useState<LoginState>({
    oneid: '',
    password: '',
    loading: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const setOneid = (oneid: string) => setState((s) => ({ ...s, oneid }))
  const setPassword = (password: string) => setState((s) => ({ ...s, password }))
  const toggleShowPassword = () => setShowPassword((v) => !v)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setState((s) => ({ ...s, loading: true, error: undefined, success: undefined }))
    try {
      if (!state.oneid) throw new Error('Informe seu OneID')
      if (state.oneid.length < 3) throw new Error('OneID muito curto')
      if (!state.password) throw new Error('Informe sua senha')
      if (state.password.length < 6) throw new Error('Senha muito curta')

      await loginService(state.oneid, state.password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar'
      setState((s) => ({ ...s, error: message }))
    } finally {
      setState((s) => ({ ...s, loading: false }))
    }
  }

  return {
    state,
    setOneid,
    setPassword,
    showPassword,
    toggleShowPassword,
    handleLogin,
  }
}
