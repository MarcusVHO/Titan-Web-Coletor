import { useLogin } from '@/hooks/useLogin'

export default function Login() {
  const {
    state,
    setOneid,
    setPassword,
    showPassword,
    toggleShowPassword,
    handleLogin,
  } = useLogin()

  return (
    <div className="login__container">
      <form
        className="login__card"
        onSubmit={handleLogin}
        aria-busy={state.loading}
        autoComplete="off"
      >
        <div className="login__brand">
          <div className="login__logo" aria-hidden="true">TC</div>
          <div className="login__brand-text">
            <h1 className="login__title">Titan Conferência</h1>
            <p className="login__subtitle">Acesse sua conta para continuar</p>
          </div>
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="oneid">OneID</label>
          <input
            id="oneid"
            type="text"
            value={state.oneid}
            onChange={(e) => setOneid(e.target.value)}
            placeholder="seu OneID"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="password">Senha</label>
          <div className="login__input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={state.password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <button
              className="login__toggle"
              type="button"
              onClick={toggleShowPassword}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {state.error && <div className="login__alert login__alert--error">{state.error}</div>}
        {state.success && <div className="login__alert login__alert--success">{state.success}</div>}

        <div className="login__actions">
          <button className="login__button" disabled={state.loading}>
            {state.loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
