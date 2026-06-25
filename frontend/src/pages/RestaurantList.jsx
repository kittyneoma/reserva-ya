import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/restaurants')
      .then(res => setRestaurants(res.data.restaurants || []))
      .catch(() => setError('No se pudieron cargar los restaurantes. Verifica que el backend esté activo.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine_type.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* banner superior */}
      <div className="list-banner">
        <h1 className="list-banner-title">Restaurantes disponibles</h1>
        <p className="list-banner-subtitle">Encuentra el lugar perfecto para tu próxima comida</p>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, tipo de cocina o ciudad..."
          className="search-input"
        />
      </div>

      <div className="container section-sm">
        {loading && <p className="loading-text">Cargando restaurantes...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <p className="empty-text">No se encontraron restaurantes.</p>
        )}

        <div className="restaurants-grid">
          {filtered.map(r => (
            <div key={r.id} className="restaurant-card" onClick={() => navigate(`/restaurants/${r.id}`)}>
              <div className="img-restaurant-card"
                style={r.image_url
                  ? { backgroundImage: `url('${r.image_url}')` }
                  : { display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem' }
                }>
                {!r.image_url && '🍽️'}
              </div>
              <div className="restaurant-card-body">
                <div className="card-row-between">
                  <h3 className="restaurant-card-title">{r.name}</h3>
                  <span className="restaurant-card-price">{PRICE_LABELS[r.price_range] || '$'}</span>
                </div>
                <p className="restaurant-card-desc">{r.description}</p>
                <div className="restaurant-card-meta">
                  <span>🍴 {r.cuisine_type}</span>
                  <span>📍 {r.city}</span>
                </div>
                <button className="btn-primary btn-mt">Ver y Reservar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">© 2026 ReservaYa</footer>
    </div>
  )
}