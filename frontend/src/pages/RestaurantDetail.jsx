import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function RestaurantDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ reservationDate: '', reservationTime: '', partySize: 2, specialRequests: '' })
  const [reserving, setReserving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get(`/api/restaurants/${id}`),
      axios.get(`/api/menu/restaurant/${id}`)
    ]).then(([resR, resM]) => {
      setRestaurant(resR.data.restaurant)
      setMenuItems(resM.data.menuItems || [])
    }).catch(() => navigate('/restaurants'))
      .finally(() => setLoading(false))
  }, [id])

  const categories = ['Todos', ...new Set(menuItems.map(i => i.category))]
  const filtered = activeCategory === 'Todos' ? menuItems : menuItems.filter(i => i.category === activeCategory)

  const handleReserve = async e => {
    e.preventDefault()
    if (!user) return navigate('/login')
    setReserving(true)
    setMsg(null)
    try {
      await axios.post('/api/reservations', {
        restaurantId: parseInt(id), ...form, partySize: parseInt(form.partySize)
      })
      setMsg({ type: 'success', text: '¡Reserva creada exitosamente! Puedes verla en "Mis Reservas".' })
      setForm({ reservationDate: '', reservationTime: '', partySize: 2, specialRequests: '' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al crear la reserva' })
    } finally {
      setReserving(false)
    }
  }

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <p className="loading-text">Cargando...</p>
    </div>
  )
  if (!restaurant) return null

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* banner del restaurante
          Para agregar imagen: style={{ backgroundImage: "url('/images/banner.jpg')" }} */}
      <div className="img-restaurant-banner detail-banner"
        style={restaurant.image_url ? { backgroundImage: `url('${restaurant.image_url}')` } : undefined}>
        <div className="banner-gradient">
          <div className="banner-info">
            <div className="img-restaurant-logo"
              style={restaurant.logo_url
                ? { backgroundImage: `url('${restaurant.logo_url}')` }
                : { display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }
              }>
              {!restaurant.logo_url && '🍽️'}
            </div>
            <div>
              <h1 className="banner-title">{restaurant.name}</h1>
              <p className="banner-desc">{restaurant.description}</p>
              <div className="banner-meta">
                <span>🍴 {restaurant.cuisine_type}</span>
                <span>📍 {restaurant.city}, {restaurant.state}</span>
                <span>💰 {PRICE_LABELS[restaurant.price_range]}</span>
                <span>📞 {restaurant.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container detail-layout">

        {/* menú */}
        <div>
          <h2 className="section-title-left">Menú</h2>

          {/* filtros de categoría */}
          <div className="filter-bar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`filter-btn ${activeCategory === cat ? 'filter-btn-active' : ''}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="list-stack">
            {filtered.map(item => (
              <div key={item.id} className="card menu-item-card">
                <div className="img-menu-item"
                  style={item.image_url
                    ? { backgroundImage: `url('${item.image_url}')` }
                    : { display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }
                  }>
                  {!item.image_url && '🍴'}
                </div>
                <div className="menu-item-info">
                  <h4 className="menu-item-name">{item.name}</h4>
                  <p className="menu-item-desc">{item.description}</p>
                  <span className="category-tag">{item.category}</span>
                </div>
                <span className="price-tag">${Number(item.price).toFixed(2)}</span>
              </div>
            ))}
            {filtered.length === 0 && <p className="empty-text">No hay platillos en esta categoría.</p>}
          </div>
        </div>

        {/* sidebar de reserva */}
        <div className="reservation-sidebar">
          <div className="form-card">
            <h2 className="form-card-title">Hacer Reserva</h2>

            {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

            <form onSubmit={handleReserve}>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input type="date" value={form.reservationDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, reservationDate: e.target.value })}
                  className="input-field" required />
              </div>
              <div className="form-group">
                <label className="form-label">Hora</label>
                <input type="time" value={form.reservationTime}
                  onChange={e => setForm({ ...form, reservationTime: e.target.value })}
                  className="input-field" required />
              </div>
              <div className="form-group">
                <label className="form-label">Número de personas</label>
                <select value={form.partySize}
                  onChange={e => setForm({ ...form, partySize: e.target.value })}
                  className="input-field">
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Solicitudes especiales</label>
                <textarea value={form.specialRequests}
                  onChange={e => setForm({ ...form, specialRequests: e.target.value })}
                  className="input-field textarea-sm"
                  placeholder="Cumpleaños, alergias, preferencia de mesa..." />
              </div>
              <button type="submit" disabled={reserving} className="btn-primary btn-full">
                {reserving ? 'Reservando...' : user ? 'Confirmar Reserva' : 'Inicia sesión para reservar'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer">© 2026 ReservaYa</footer>
    </div>
  )
}