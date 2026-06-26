import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'customer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/auth/register', form)
      login(data.user, data.token)
      navigate(data.user.role === 'restaurant_owner' ? '/owner/dashboard' : '/restaurants')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="auth-wrapper">
        <div className="form-card auth-card auth-card-wide">

          <div className="auth-header">
            <span className="auth-icon">🍽️</span>
            <h1 className="auth-title">Crear cuenta</h1>
            <p className="auth-subtitle">Únete a MesaYa hoy</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Nombre</label>
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  className="input-field" placeholder="María" required />
              </div>
              <div>
                <label className="form-label">Apellido</label>
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  className="input-field" placeholder="García" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="tu@correo.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="input-field" placeholder="81 1234 5678" />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input-field" placeholder="Mínimo 8 caracteres" required />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de cuenta</label>
              <div className="form-grid-2">
                {[
                  { val: 'customer',         icon: '👤', label: 'Cliente' },
                  { val: 'restaurant_owner', icon: '🏪', label: 'Dueño'  }
                ].map(opt => (
                  <label key={opt.val} className={`radio-card ${form.role === opt.val ? 'selected' : ''}`}>
                    <input type="radio" name="role" value={opt.val}
                      checked={form.role === opt.val} onChange={handleChange}
                      className="radio-hidden" />
                    <span className="radio-icon">{opt.icon}</span>
                    <span className="radio-label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-full">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}