import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span style={{ fontSize: '1.8rem' }}>🍽️</span>

        MesaYa
      </Link>

      <div className="navbar-links">
        <Link to="/restaurants" className="navbar-link">Restaurantes</Link>
        {user ? (
          <>
            {user.role === 'restaurant_owner' && (
              <Link to="/owner/dashboard" className="navbar-link">Mi Restaurante</Link>
            )}
            <Link to="/my-reservations" className="navbar-link">Mis Reservas</Link>
            <span className="navbar-link" style={{ color: '#f9f2e6', cursor: 'default' }}>Hola, {user.firstName}</span>
            <button onClick={() => { logout(); navigate('/') }}
              className="btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.85rem', borderColor: '#9a7060', color: '#c8b89a' }}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Iniciar sesión</Link>
            <Link to="/register">
              <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Registrarse</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
