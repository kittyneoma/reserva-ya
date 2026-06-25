import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/auth/login', form)
      login(data.user, data.token)
      navigate(data.user.role === 'restaurant_owner' ? '/owner/dashboard' : '/restaurants')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="auth-wrapper">
        <div className="form-card auth-card">

          <div className="auth-header">
            <span className="auth-icon">🌮</span>
            <h1 className="auth-title">Bienvenido</h1>
            <p className="auth-subtitle">Inicia sesión para continuar</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="tu@correo.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-full">
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-link">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}